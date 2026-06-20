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

import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

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

export async function POST(_request, { params }) {
  const { slug } = await params;

  // 1. Auth gate
  const { userId } = await auth();
  if (!userId) return jerr(401, 'unauthorized', 'Sign in to join a room.');

  const apiKey    = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return jerr(500, 'livekit_not_configured',
      'LiveKit credentials missing on the server.');
  }

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

  // 3. Access tier gate — host is always allowed regardless of tier
  const isHost = room.host_user_id === userId;
  if (!isHost) {
    if (room.access_tier === 'public') {
      // any signed-in user passes
    } else if (room.access_tier === 'group_members_free') {
      const ok = await userHasGroupMembership(supabase, room.group_id, userId);
      if (!ok) return jerr(403, 'not_a_member',
        'This room is for group members only.');
    } else if (room.access_tier === 'paid') {
      const ok = await userHasActiveGrant(supabase, room.id, userId);
      if (!ok) return jerr(402, 'payment_required',
        'This room requires payment. Buy a ticket to join.');
    } else {
      return jerr(500, 'unknown_access_tier',
        `Room access_tier "${room.access_tier}" is not recognised.`);
    }
  }

  // 4. Display name from Clerk (falls back to anonymous if profile sparse)
  const user = await currentUser();
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
    'Guest';

  // 5. Mint the LiveKit token
  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
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
