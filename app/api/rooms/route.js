// app/api/rooms/route.js
// Ceilidh Rooms — list + create.
//
// GET  → the rooms to show on the Duilleag Rooms panel: every public room
//        that's live or scheduled, plus every room the caller hosts (so they
//        can find and share the ones they made). Invite codes are returned
//        ONLY for rooms the caller hosts.
//
// POST → create/schedule a room with the caller as host. Access tiers are
//        limited to 'public' and 'invite_only' here — 'paid' needs the
//        Stripe build and 'group_members_free' needs a group_id, neither of
//        which this quick-create flow handles. An invite_only room gets a
//        generated invite code; a public room is walk-in for any member.
//
// Server-side only, service-role client (RLS bypass); the host is always the
// signed-in Clerk user — the client can't name someone else as host.

import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIERS = new Set(['public', 'invite_only']);
const OPEN_STATUSES = ['scheduled', 'live'];

// name → url-safe slug, plus a short random suffix so two "Friday Ceilidh"s
// never collide. Reserved-ish words don't matter here (rooms live under
// /rooms/<slug>, their own namespace).
function slugify(name) {
  const base = String(name || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // strip accents (cèilidh → ceilidh)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'seomar';
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

// Friendly-ish invite code: two 4-char groups, no ambiguous 0/O/1/I/L.
function inviteCode() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const group = () => Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `${group()}-${group()}`;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('gc_rooms')
    .select('slug, name, description, access_tier, status, scheduled_at, host_user_id, invite_code')
    .in('status', OPEN_STATUSES)
    .order('scheduled_at', { ascending: true, nullsFirst: true });

  if (error) {
    console.error('Rooms list failed:', error);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  const rooms = (data || [])
    .filter((r) => r.access_tier === 'public' || r.host_user_id === userId)
    .map((r) => {
      const isHost = r.host_user_id === userId;
      return {
        slug: r.slug,
        name: r.name,
        description: r.description || null,
        accessTier: r.access_tier,
        status: r.status,
        scheduledAt: r.scheduled_at || null,
        isHost,
        // Only the host ever sees the code — it's how they invite people.
        inviteCode: isHost ? (r.invite_code || null) : null,
      };
    })
    // Live rooms first, then scheduled by soonest.
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'live' ? -1 : 1;
      return String(a.scheduledAt || '').localeCompare(String(b.scheduledAt || ''));
    });

  return Response.json({ ok: true, rooms });
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }

  const name = String(body.name || '').trim().slice(0, 80);
  if (!name) return Response.json({ ok: false, error: 'name_required', reason: 'Give the room a name.' }, { status: 400 });

  const accessTier = TIERS.has(body.access_tier) ? body.access_tier : 'invite_only';

  // Optional schedule. A valid future time → 'scheduled'; anything else (no
  // time, or a time already past) → 'live', i.e. open right now.
  let scheduledAt = null;
  let status = 'live';
  if (body.scheduled_at) {
    const t = new Date(body.scheduled_at);
    if (!Number.isNaN(t.getTime())) {
      scheduledAt = t.toISOString();
      if (t.getTime() > Date.now()) status = 'scheduled';
    }
  }

  const slug = slugify(name);
  const row = {
    slug,
    name,
    description: String(body.description || '').trim().slice(0, 280) || null,
    host_user_id: userId,
    group_id: null,
    access_tier: accessTier,
    price_cents: 0,
    currency: 'usd',
    livekit_room_name: slug,
    max_participants: 20,
    scheduled_at: scheduledAt,
    status,
    invite_code: accessTier === 'invite_only' ? inviteCode() : null,
  };

  const { data, error } = await supabaseAdmin
    .from('gc_rooms')
    .insert(row)
    .select('slug, name, access_tier, status, scheduled_at, invite_code')
    .single();

  if (error) {
    // 23505 = slug collision (astronomically unlikely with the suffix).
    if (error.code === '23505') {
      return Response.json({ ok: false, error: 'slug_taken', reason: 'Name clash — try again.' }, { status: 409 });
    }
    console.error('Room create failed:', error);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  return Response.json({
    ok: true,
    room: {
      slug: data.slug,
      name: data.name,
      accessTier: data.access_tier,
      status: data.status,
      scheduledAt: data.scheduled_at || null,
      inviteCode: data.invite_code || null,
    },
  });
}
