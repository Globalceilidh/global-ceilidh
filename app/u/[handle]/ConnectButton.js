'use client';

// app/u/[handle]/ConnectButton.js
// Asking for a ceangal. This is the only entry point into the graph —
// /duilleag is private and has no way to reach another person, so if
// this button isn't here, nobody can ever connect to anybody.
//
// It deliberately says "asked", not "connected". The request grants
// nothing until the other person accepts and files it, and implying
// otherwise would misrepresent what just happened.

import { useState } from 'react';

export default function ConnectButton({ handle, initialState }) {
  const [state, setState] = useState(initialState); // none | pending | accepted
  const [busy, setBusy] = useState(false);

  async function ask() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle }),
      });
      const json = await res.json();
      if (json.ok) setState('pending');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'accepted') {
    return <span style={{ ...base, ...quiet }}>Ceangailte · Connected</span>;
  }
  if (state === 'pending') {
    return <span style={{ ...base, ...quiet }}>Air iarraidh · Requested</span>;
  }
  return (
    <button style={{ ...base, ...active, opacity: busy ? 0.6 : 1 }} onClick={ask} disabled={busy}>
      {busy ? 'Ag iarraidh…' : 'Ceangail · Connect'}
    </button>
  );
}

const base = {
  display: 'inline-block',
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: 0.3,
  borderRadius: 999,
  padding: '8px 18px',
  marginTop: 16,
};
const active = {
  background: '#1A3A2A', color: '#F2ECDC', border: '1px solid #1A3A2A', cursor: 'pointer',
};
const quiet = {
  background: '#F5F0E8', color: '#6B4E1F', border: '1px solid #E7DEC9',
};
