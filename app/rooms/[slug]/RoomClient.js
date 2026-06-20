'use client';

// Browser-side LiveKit room. Auth is checked HERE (not in middleware /
// not in the server page) because Clerk's cross-subdomain cookie
// handshake doesn't work in this Account Portal setup — the server
// can't see __session on globalceilidh.com, only on accounts.*.
// Clerk's client SDK reads session state independently of that cookie
// and gives us getToken() which we send as a Bearer to the API.
//
// Flow:
//   1. If signed out → show sign-in button.
//   2. If signed in → call useAuth().getToken() to mint a Bearer JWT.
//   3. POST /api/rooms/[slug]/token with Authorization: Bearer <jwt>.
//      The server's auth() reads the Bearer and the access-tier check
//      proceeds as if the cookie were present.
//   4. Hand the LiveKit JWT to <LiveKitRoom/> and render <VideoConference/>.

import { useEffect, useState } from 'react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function RoomClient({ room }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <main style={msgWrap}>
        <h1 style={msgTitle}>{room.name}</h1>
        <p style={{ marginTop: 8, fontStyle: 'italic', color: '#8B6914' }}>Loading…</p>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main style={msgWrap}>
        <h1 style={msgTitle}>{room.name}</h1>
        <p style={{ marginTop: 8 }}>Sign in to join the room.</p>
        <div style={{ marginTop: 16 }}>
          <SignInButton mode="modal">
            <button style={signInButton}>Sign in</button>
          </SignInButton>
        </div>
      </main>
    );
  }

  return <RoomConnector room={room} />;
}


function RoomConnector({ room }) {
  const { getToken, isLoaded } = useAuth();
  const [token, setToken] = useState(null);
  const [url, setUrl]     = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const bearer = await getToken();
        if (!bearer) throw new Error('Could not obtain session token from Clerk.');
        const res = await fetch(`/api/rooms/${room.slug}/token`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${bearer}` },
        });
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
  }, [room.slug, getToken, isLoaded]);

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

const signInButton = {
  background: '#1A3A2A',
  color: '#F0E6CC',
  border: 'none',
  padding: '12px 24px',
  fontFamily: 'Georgia, serif',
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: 0.5,
  cursor: 'pointer',
};
