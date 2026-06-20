'use client';

// Browser-side LiveKit room. MVP build: Clerk auth disabled so the
// vertical slice works while we fix Clerk's cross-subdomain setup in
// a follow-up. Public rooms (the only kind right now) just need a
// display name. We'll re-add the Clerk gate in the next PR once the
// __session cookie reliably reaches globalceilidh.com.
//
// Flow:
//   1. Prompt for a display name on first mount.
//   2. POST /api/rooms/[slug]/token with the name in the body.
//   3. Hand the returned LiveKit JWT to <LiveKitRoom/>.

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function RoomClient({ room }) {
  const [name, setName] = useState('');
  const [submittedName, setSubmittedName] = useState(null);

  if (!submittedName) {
    return (
      <main style={msgWrap}>
        <h1 style={msgTitle}>{room.name}</h1>
        <p style={{ marginTop: 8, marginBottom: 16, maxWidth: 420, textAlign: 'center' }}>
          {room.description}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = name.trim();
            if (trimmed) setSubmittedName(trimmed);
          }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <label style={{ fontSize: 13, color: '#6B4E1F', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Your name (visible in the room)
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Scott"
            autoFocus
            style={{
              padding: '10px 12px',
              fontSize: 16,
              fontFamily: 'Georgia, serif',
              border: '1px solid #D6CFC0',
              borderRadius: 4,
              minWidth: 280,
            }}
          />
          <button
            type="submit"
            disabled={!name.trim()}
            style={{ ...signInButton, opacity: name.trim() ? 1 : 0.5 }}
          >
            Join the room
          </button>
        </form>
      </main>
    );
  }

  return <RoomConnector room={room} displayName={submittedName} />;
}


function RoomConnector({ room, displayName }) {
  const [token, setToken] = useState(null);
  const [url, setUrl]     = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/rooms/${room.slug}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName }),
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
  }, [room.slug, displayName]);

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
