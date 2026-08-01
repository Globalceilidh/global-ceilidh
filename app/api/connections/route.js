// app/api/connections/route.js
// ============================================================
// Ceanglaichean — the connection graph (gc_follows).
//
// GET   → everything the signed-in user needs for their right column:
//         { ok, connections, pending, outgoing }
//           connections — accepted followers, i.e. people who can be
//                         addressed by an audience tier
//           pending     — requests awaiting MY approval
//           outgoing    — requests I have sent that aren't answered yet
//
// POST  { handle } → ask for a ceangal with that person. Always lands as
//         status='pending' with no category: a ceangal grants nothing
//         until the other person accepts and files it.
//
// Server-side only, service-role client. The Clerk session is the sole
// authority on who the caller is — the client never names the follower.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { getProfileByClerkId, getProfileByHandle, getFollowersOf, publicProfile } from '../../../lib/social';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    // Two directions to a ceangal, and BOTH make a connection:
    //   inbound  — they asked me, I accepted and filed them (I hold the tier)
    //   outbound — I asked them, they accepted and filed me (they hold the
    //              tier; I have no label on them)
    // The list used to show only the inbound half, so a request you SENT
    // that was accepted (you follow them) showed nowhere at all. Merge both.
    const inbound = await getFollowersOf(me.id);

    const { data: outbound, error } = await supabaseAdmin
      .from('gc_follows')
      .select('id, status, created_at, followee:gc_profiles!gc_follows_followee_id_fkey(id, handle, display_name, avatar_url)')
      .eq('follower_id', me.id);
    if (error) throw error;

    // Dedup by person: an inbound edge (which carries MY category) wins over
    // an outbound one for the same person.
    const conns = new Map();
    for (const r of inbound) {
      if (r.status !== 'accepted') continue;
      conns.set(r.follower.id, { id: r.id, category: r.category, person: publicProfile(r.follower) });
    }
    for (const r of outbound || []) {
      if (r.status !== 'accepted') continue;
      const pid = r.followee?.id;
      if (!pid || conns.has(pid)) continue;
      // I follow them; the tier is theirs to set, not mine — show neutral.
      conns.set(pid, { id: r.id, category: null, person: publicProfile(r.followee) });
    }

    return Response.json({
      ok: true,
      connections: [...conns.values()],
      pending: inbound
        .filter((r) => r.status === 'pending')
        .map((r) => ({ id: r.id, person: publicProfile(r.follower), askedAt: r.created_at })),
      outgoing: (outbound || [])
        .filter((r) => r.status !== 'accepted')
        .map((r) => ({ id: r.id, status: r.status, person: publicProfile(r.followee) })),
    });
  } catch (err) {
    console.error('Connections list failed:', err);
    return Response.json({ ok: false, error: 'list_failed' }, { status: 500 });
  }
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  let payload;
  try { payload = await req.json(); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }

  const handle = String(payload.handle || '').trim().toLowerCase();
  if (!handle) return Response.json({ ok: false, error: 'handle_required' }, { status: 400 });

  try {
    const me = await getProfileByClerkId(userId);
    if (!me || !me.onboarded_at) {
      return Response.json({ ok: false, error: 'no_profile', reason: 'Finish your profile first.' }, { status: 403 });
    }

    const them = await getProfileByHandle(handle);
    if (!them || !them.onboarded_at) {
      return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    if (them.id === me.id) {
      return Response.json({ ok: false, error: 'self' , reason: 'You are already here.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('gc_follows')
      .insert({ follower_id: me.id, followee_id: them.id, status: 'pending' })
      .select('id, status')
      .single();

    if (error) {
      // The unique edge constraint is the "already asked" case, and it is
      // not an error worth showing anyone.
      if (error.code === '23505') {
        return Response.json({ ok: true, already: true });
      }
      throw error;
    }

    return Response.json({ ok: true, request: { id: data.id, status: data.status } });
  } catch (err) {
    console.error('Connection request failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
