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
// The token's identity is the Clerk user id so server-side participant
// moderation and analytics tie cleanly back to our user table.

import { createClient } from '@supabase/supabase-js';
import { auth, currentUser, verifyToken } from '@clerk/nextjs/server';
import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

// Resolve the signed-in Clerk user id without depending on the __session
// cookie, which doesn't reliably reach the server across this Clerk
// setup's subdomains. The client sends its session token as
// `Authorization: Bearer <jwt>` (see RoomClient.js); we verify that JWT
// directly with the Clerk secret key and read `sub` as the user id.
// Falls back to cookie-based auth() if no header is present.
async function resolveUserId(request) {
  // The client sends its Clerk session token as `Authorization: Bearer
  // <jwt>` (see RoomClient.js); we verify it directly with the secret key
  // and read `sub`. This avoids the __session cookie, which doesn't
  // reliably reach the server across this Clerk setup's subdomains. The
  // secret is trimmed defensively — a BOM/whitespace-corrupted env value
  // would otherwise fail verification with `secret-key-invalid`.
  const secretKey = (process.env.CLERK_SECRET_KEY || '').replace(/^﻿/, '').trim();
  const authz = request.headers.get('authorization') || '';
  if (authz.startsWith('Bearer ')) {
    const token = authz.slice(7).trim();
    if (token) {
      try {
        const claims = await verifyToken(token, { secretKey });
        if (claims?.sub) return claims.sub;
      } catch {
        // fall through to cookie auth below
      }
    }
  }
  const { userId } = await auth();
  return userId || null;
}

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

  // 1. Clerk auth — verify the Bearer session token directly (cookie
  //    __session isn't reliable across this setup's subdomains).
  const userId = await resolveUserId(request);
  if (!userId) {
    return jerr(401, 'not_signed_in',
      'Sign in to Global Ceilidh to join this room.');
  }

  // Display name comes from the client body; if missing we look it up
  // from Clerk. Clients pass it explicitly so the room can render
  // participant labels before the token round-trip completes.
  let displayName = null;
  let providedInviteCode = null;
  try {
    const body = await request.json();
    if (body?.displayName) displayName = String(body.displayName).slice(0, 60);
    if (body?.inviteCode) providedInviteCode = String(body.inviteCode).slice(0, 64);
  } catch { /* empty body ok */ }
  if (!displayName) {
    const user = await currentUser();
    displayName =
      user?.fullName ||
      user?.firstName ||
      user?.username ||
      user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
      'Ceilidh Guest';
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

  // 3. Access tier gate — Clerk is back in, so the group_members and
  //    paid tiers are live again. Host bypasses every check.
  const isHost = room.host_user_id && room.host_user_id === userId;
  if (!isHost) {
    if (room.access_tier === 'group_members_free') {
      const ok = await userHasGroupMembership(supabase, room.group_id, userId);
      if (!ok) {
        return jerr(403, 'not_a_group_member',
          'This room is for members of its group only.');
      }
    } else if (room.access_tier === 'paid') {
      const ok = await userHasActiveGrant(supabase, room.id, userId);
      if (!ok) {
        return jerr(403, 'no_active_grant',
          'This room requires a paid access grant. Purchase one to join.');
      }
    } else if (room.access_tier === 'invite_only') {
      // Per-meeting invite gate. Already-granted attendees pass straight
      // through; a first-timer presenting the room's current invite code
      // self-claims a standing 'invited' grant (so they never need the code
      // again — the grant rows become the meeting's attendee list).
      const hasGrant = await userHasActiveGrant(supabase, room.id, userId);
      if (!hasGrant) {
        const code = (providedInviteCode || '').trim();
        const roomCode = (room.invite_code || '').trim();
        if (roomCode && code && code === roomCode) {
          const { error: grantErr } = await supabase
            .from('gc_room_access_grants')
            .upsert(
              { room_id: room.id, user_id: userId, tier: 'invited', granted_by: 'invite_code' },
              { onConflict: 'room_id,user_id,tier' },
            );
          if (grantErr) return jerr(500, 'grant_failed', grantErr.message);
        } else {
          return jerr(403, 'invite_required',
            'This meeting is invite-only. Enter your invite code to join.');
        }
      }
    }
    // 'public' tier: any signed-in user passes.
  }

  // 4. Mint the LiveKit token. Identity = Clerk user id so moderation
  //    and analytics tie to the real user record; name is display-only.
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
