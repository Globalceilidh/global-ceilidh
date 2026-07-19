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
import { useUser, useAuth, SignInButton } from '@clerk/nextjs';
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
  const { getToken } = useAuth();
  const [token, setToken] = useState(null);
  const [url, setUrl]     = useState(null);
  const [error, setError] = useState(null);

  // Invite-only rooms: seed the code from the shared link (?code=XXXX) so an
  // invitee following it joins with no extra step. If the code is missing or
  // wrong the server 403s 'invite_required' and we show a code box.
  const [code, setCode] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('code') || '';
  });
  const [attempt, setAttempt] = useState(0);
  const [needsCode, setNeedsCode] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        // Send the Clerk session token explicitly as a Bearer header.
        // The __session cookie doesn't reliably reach the server across
        // this Clerk setup's subdomains, so server-side auth() sees null
        // and 401s even when the client is signed in. Handing the token
        // to the route directly sidesteps the cookie entirely.
        const sessionToken = await getToken();
        const res = await fetch(`/api/rooms/${room.slug}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
          },
          body: JSON.stringify({ displayName, inviteCode: code || undefined }),
        });
        const body = await res.json();
        if (res.status === 403 && body?.error === 'invite_required') {
          if (!cancelled) {
            setNeedsCode(true);
            setCodeError(code ? 'That invite code didn’t match.' : null);
            setSubmitting(false);
          }
          return;
        }
        if (!res.ok) {
          throw new Error(body?.message || `Token request failed (${res.status})`);
        }
        if (!cancelled) {
          setToken(body.token);
          setUrl(body.url);
          setNeedsCode(false);
          setSubmitting(false);
        }
      } catch (e) {
        if (!cancelled) { setError(e.message || String(e)); setSubmitting(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [room.slug, displayName, getToken, code, attempt]);

  function submitCode(e) {
    e.preventDefault();
    const v = String(e.target.code.value || '').trim();
    if (!v) return;
    setSubmitting(true);
    setCode(v);
    setAttempt((a) => a + 1); // force a retry even if the value is unchanged
  }

  if (needsCode && !token) {
    return (
      <main style={msgWrap}>
        <h1 style={msgTitle}>{room.name}</h1>
        <p style={{ marginTop: 8, marginBottom: 18, maxWidth: 420, textAlign: 'center', color: '#3A2A0C' }}>
          This meeting is invite-only. Enter your invite code to join.
        </p>
        <form onSubmit={submitCode} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <input
            name="code"
            defaultValue=""
            placeholder="Invite code"
            autoFocus
            autoComplete="off"
            style={codeInput}
          />
          <button type="submit" style={signInButton} disabled={submitting}>
            {submitting ? 'Checking…' : 'Join'}
          </button>
        </form>
        {codeError && <p style={{ marginTop: 14, color: '#B83232', fontSize: 13 }}>{codeError}</p>}
      </main>
    );
  }

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

const codeInput = {
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 18,
  letterSpacing: '0.18em',
  textAlign: 'center',
  textTransform: 'uppercase',
  padding: '12px 18px',
  width: 240,
  border: '1px solid #C6BCA5',
  borderRadius: 6,
  background: '#FFFFFF',
  color: '#1A3A2A',
  outline: 'none',
};
