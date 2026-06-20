'use client';

// Browser-side LiveKit room. Mounted by /rooms/[slug]/page.js once
// Clerk auth and the room lookup succeed server-side. The flow:
//
//   1. On mount, POST /api/rooms/[slug]/token to fetch a scoped JWT.
//      The server re-checks the access tier there — see route.js. The
//      page-level check is just to fail fast with a nicer message.
//   2. Hand the token + LiveKit URL to <LiveKitRoom/>. The SDK
//      negotiates WebRTC against LiveKit Cloud and renders the
//      <VideoConference/> grid (camera + mic controls, participant
//      tiles, screen share, leave button — all batteries included
//      for the MVP; custom chrome comes later).
//   3. <RoomAudioRenderer/> handles the audio mixing element React
//      expects when there are multiple participants.
//
// Notes:
//   * @livekit/components-styles ships the prebuilt CSS. We import it
//     once here — Next picks it up via the global CSS path.
//   * The room name shown to the user is the friendly name from
//     gc_rooms; LiveKit's internal room name is always
//     room.livekit_room_name (kept separate so we can rename the human
//     label without losing the in-flight session).

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function RoomClient({ room }) {
  const [token, setToken] = useState(null);
  const [url, setUrl]     = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/rooms/${room.slug}/token`, { method: 'POST' });
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.message || `Token request failed (${res.status})`);
        }
        if (!cancelled) {
          setToken(body.token);
          setUrl(body.url);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [room.slug]);

  if (error) {
    return (
      <main style={msgWrap}>
        <h1 style={msgTitle}>{room.name}</h1>
        <p style={{ color: '#B83232', marginTop: 8 }}>{error}</p>
        <a href="/home" style={msgLink}>← back to GlobalCeilidh</a>
      </main>
    );
  }

  if (!token || !url) {
    return (
      <main style={msgWrap}>
        <h1 style={msgTitle}>{room.name}</h1>
        <p style={{ marginTop: 8, fontStyle: 'italic', color: '#8B6914' }}>
          Joining the room…
        </p>
      </main>
    );
  }

  return (
    <div data-lk-theme="default" style={{ height: '100vh' }}>
      <LiveKitRoom
        token={token}
        serverUrl={url}
        connect={true}
        audio={true}
        video={true}
        style={{ height: '100%' }}
        onDisconnected={() => { window.location.href = '/home'; }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}


const msgWrap = {
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

const msgTitle = {
  fontSize: 28,
  fontWeight: 700,
  margin: 0,
};

const msgLink = {
  marginTop: 16,
  fontSize: 13,
  color: '#6B4E1F',
  textDecoration: 'none',
};
