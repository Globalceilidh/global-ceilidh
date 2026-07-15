'use client';

// Browser-side LiveKit room, Clerk-gated. The old guest-name form is
// gone — with embedded sign-in on the app domain, __session lands on
// globalceilidh.com and both server-side auth() (in the token route)
// and client-side useUser() (here) see the signed-in user cleanly.
//
// Flow:
//   1. Clerk not loaded yet → spinner.
//   2. Signed out → "Sign in to join" button linking to
//      /sign-in?redirect_url=/rooms/<slug>, which brings the user back
//      here right after Clerk finishes.
//   3. Signed in → POST /api/rooms/[slug]/token; server-side check
//      re-validates the Clerk session before minting a LiveKit JWT.
//   4. Handoff to <LiveKitRoom/>.

import { useEffect, useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function RoomClient({ room }) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <main style={msgWrap}>
        <h1 style={msgTitle}>{room.name}</h1>
        <p style={{ marginTop: 8, fontStyle: 'italic', color: '#8B6914' }}>
          Checking your Global Ceilidh account…
        </p>
      </main>
    );
  }

  if (!isSignedIn) {
    const redirectUrl = `/rooms/${room.slug}`;
    return (
      <main style={msgWrap}>
        <h1 style={msgTitle}>{room.name}</h1>
        {room.description && (
          <p style={{ marginTop: 8, marginBottom: 20, maxWidth: 420, textAlign: 'center' }}>
            {room.description}
          </p>
        )}
        <p style={{ marginBottom: 16, color: '#3A2A0C', textAlign: 'center', maxWidth: 420 }}>
          Sign in to your Global Ceilidh account to join this room.
        </p>
        <SignInButton mode="redirect" forceRedirectUrl={redirectUrl} signUpForceRedirectUrl={redirectUrl}>
          <button type="button" style={signInButton}>Sign in to join</button>
        </SignInButton>
        <a
          href={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
          style={secondaryLink}
        >
          New here? Create an account
        </a>
      </main>
    );
  }

  const displayName =
    user.fullName ||
    user.firstName ||
    user.username ||
    user.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    'Ceilidh Guest';

  return <RoomConnector room={room} displayName={displayName} />;
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
  color: '#FFFFFF',
  border: 'none',
  padding: '12px 26px',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontSize: 16,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  borderRadius: 4,
};

const secondaryLink = {
  marginTop: 14,
  fontSize: 12,
  color: '#6B4E1F',
  textDecoration: 'underline',
  fontFamily: '"IBM Plex Mono", monospace',
  letterSpacing: 0.5,
};
