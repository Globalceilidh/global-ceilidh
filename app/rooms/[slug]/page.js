// /rooms/[slug] — Ceilidh Room entry page.
//
// Server component:
//   - Requires Clerk sign-in (middleware lets the path through the
//     pre-launch cookie gate; auth() below enforces sign-in).
//   - Loads the room metadata so we can show the room name + a friendly
//     "this room is X tier" message before the WebRTC negotiation
//     starts. Final access check still happens in the token route.
//   - Hands off to <RoomClient/> which calls the token endpoint and
//     mounts the LiveKit React components.
//
// The page itself is intentionally outside (main) so it renders without
// the Navigation/Footer chrome — rooms are meant to be near-fullscreen.

import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import RoomClient from './RoomClient';

export const dynamic = 'force-dynamic';  // never cache — room state is live

async function loadRoom(slug) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from('gc_rooms')
    .select('slug, name, description, access_tier, status, max_participants, livekit_room_name')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export default async function RoomPage({ params }) {
  const { slug } = await params;
  // Auth is checked client-side in RoomClient.js — see comment in
  // middleware.js for why we don't gate server-side here.

  const room = await loadRoom(slug);
  if (!room) notFound();
  if (room.status === 'ended' || room.status === 'cancelled') {
    return (
      <main style={pageStyle}>
        <h1 style={titleStyle}>{room.name}</h1>
        <p style={bodyStyle}>
          This room is <strong>{room.status}</strong>. Come back another time.
        </p>
      </main>
    );
  }

  return <RoomClient room={room} />;
}


const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 24px',
  fontFamily: 'Georgia, serif',
  color: '#1A3A2A',
  background: '#F5F0E8',
};

const titleStyle = {
  fontSize: 32,
  fontWeight: 700,
  margin: '0 0 12px',
};

const bodyStyle = {
  fontSize: 16,
  color: '#222',
  textAlign: 'center',
  maxWidth: 520,
};
