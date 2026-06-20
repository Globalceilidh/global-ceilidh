// POST /api/rooms/[slug]/token
//
// Mints a short-lived LiveKit access token for a signed-in user wanting
// to join a specific room. The access gate runs entirely server-side
// before any token leaves the building:
//
//   1. Must be signed in via Clerk           → 401
//   2. Room must exist and not be 'ended'    → 404 / 410
//   3. Access tier must clear:
//        public               → any signed-in user
//        group_members_free   → must be in gc_group_members for room.group_id
//        paid                 → must have an active row in gc_room_access_grants
//                               (host is always allowed regardless of tier)
//
// On pass, returns a LiveKit JWT scoped to this user + this room only.
// The browser SDK uses this token to negotiate WebRTC with LiveKit
// Cloud. The token's identity is the Clerk user id so server-side
// participant moderation and analytics tie cleanly back to our user
// table.

import { createClient } from '@supabase/supabase-js';
import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

function jerr(status, code, message) {
  return NextResponse.json({ error: code, message }, { status });
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function userHasGroupMembership(supabase, groupId, userId) {
  if (!groupId) return false;
  const { data, error } = await supabase
    .from('gc_group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

async function userHasActiveGrant(supabase, roomId, userId) {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('gc_room_access_grants')
    .select('id, expires_at')
    .eq('room_id', roomId)
    .eq('user_id', userId);
  if (error || !data) return false;
  return data.some(g => !g.expires_at || g.expires_at > nowIso);
}

export async function POST(request, { params }) {
  const { slug } = await params;

  const apiKey    = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return jerr(500, 'livekit_not_configured',
      'LiveKit credentials missing on the server.');
  }

  // 1. Display name from the client (MVP: prompt, not Clerk profile)
  let displayName = 'Guest';
  try {
    const body = await request.json();
    if (body?.displayName) displayName = String(body.displayName).slice(0, 60);
  } catch { /* empty body OK; fall through to Guest */ }

  const supabase = db();

  // 2. Load room
  const { data: room, error: roomErr } = await supabase
    .from('gc_rooms')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (roomErr) return jerr(500, 'room_lookup_failed', roomErr.message);
  if (!room)   return jerr(404, 'room_not_found', `No room with slug "${slug}".`);
  if (room.status === 'ended' || room.status === 'cancelled') {
    return jerr(410, 'room_closed', `Room "${slug}" is ${room.status}.`);
  }

  // 3. Access tier gate — MVP: only 'public' rooms supported until Clerk
  // is wired back in. The other tiers return 403 instead of unsafely
  // letting anyone through.
  if (room.access_tier !== 'public') {
    return jerr(403, 'auth_required_for_tier',
      `Access tier "${room.access_tier}" is not yet available — Clerk auth is being re-wired. Try a public room.`);
  }

  // 4. Mint the LiveKit token with a per-tab random identity
  const identity = `guest_${crypto.randomBytes(6).toString('hex')}`;
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: displayName,
    ttl: '2h',
  });
  at.addGrant({
    room: room.livekit_room_name,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({
    token,
    url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    room: {
      slug: room.slug,
      name: room.name,
      description: room.description,
      max_participants: room.max_participants,
      livekit_room_name: room.livekit_room_name,
    },
  });
}
