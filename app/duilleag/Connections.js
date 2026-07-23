'use client';

// app/duilleag/Connections.js
// The right column below the globe: who you're connected to, and who is
// asking.
//
// Accepting IS filing. There is no "accept now, sort later" — the tier
// you choose at that moment is what that person will and won't see from
// then on, so the choice is the accept button rather than a setting
// buried afterwards. Three buttons instead of one is the honest cost of
// making the decision visible.
//
// Categories are private to you. The other person is told they were
// accepted, never which circle they landed in.

import { useState } from 'react';

const CATEGORY_LABEL = {
  connection: { en: 'Connection', gd: 'Ceangal' },
  close: { en: 'Close', gd: 'Dlùth' },
  family: { en: 'Family', gd: 'Teaghlach' },
};

export default function Connections({ gd, connections, pending, onChanged }) {
  const [busyId, setBusyId] = useState(null);
  const t = (o) => (gd ? o.gd : o.en);

  async function respond(id, category) {
    setBusyId(id);
    try {
      await fetch(`/api/connections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', category }),
      });
      onChanged?.();
    } finally {
      setBusyId(null);
    }
  }

  async function block(id) {
    setBusyId(id);
    try {
      await fetch(`/api/connections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block' }),
      });
      onChanged?.();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {pending.length > 0 && (
        <div style={s.wrap}>
          <h2 style={s.label}>
            {gd ? 'Iarrtasan' : 'Requests'} <span style={s.count}>{pending.length}</span>
          </h2>
          {pending.map((p) => (
            <div key={p.id} style={s.request}>
              <div style={s.requestHead}>
                <span style={s.avatar}>{initials(p.person.displayName)}</span>
                <span style={s.name}>{p.person.displayName}</span>
              </div>
              <p style={s.askText}>
                {gd ? 'Gabh ris mar…' : 'Accept as…'}
              </p>
              <div style={s.actions}>
                {['connection', 'close', 'family'].map((cat) => (
                  <button
                    key={cat}
                    style={s.action}
                    disabled={busyId === p.id}
                    onClick={() => respond(p.id, cat)}
                  >
                    {t(CATEGORY_LABEL[cat])}
                  </button>
                ))}
                <button
                  style={{ ...s.action, ...s.blockBtn }}
                  disabled={busyId === p.id}
                  onClick={() => block(p.id)}
                >
                  {gd ? 'Diùlt' : 'Decline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={s.wrap}>
        <h2 style={s.label}>{gd ? 'Ceanglaichean' : 'Connections'}</h2>
        {connections.length === 0 ? (
          <p style={s.empty}>
            {gd
              ? 'Chan eil ceangal agad fhathast.'
              : 'No connections yet.'}
          </p>
        ) : (
          <ul style={s.list}>
            {connections.map((c) => (
              <li key={c.id} style={s.row}>
                <span style={s.avatar}>{initials(c.person.displayName)}</span>
                <span style={s.rowName}>
                  {c.person.displayName}
                  <span style={s.tier}>{t(CATEGORY_LABEL[c.category] || CATEGORY_LABEL.connection)}</span>
                </span>
                <a
                  href={`/duilleag/messages?to=${encodeURIComponent(c.person.handle)}`}
                  style={s.msgBtn}
                  title={gd ? 'Cuir teachdaireachd' : 'Message'}
                  aria-label={gd ? 'Cuir teachdaireachd' : 'Message'}
                >
                  ✉
                </a>
                {/* Presence is not built yet — Supabase Realtime lands with
                    the next step. Everyone reads offline rather than
                    faking a green dot that means nothing. */}
                <span style={s.dot} title={gd ? 'Far-loidhne' : 'Offline'} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function initials(name) {
  return String(name || '?')
    .replace(/^@/, '')
    .split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

const GOLD = '#C9A047';
const SANS = '"IBM Plex Sans", system-ui, sans-serif';

const s = {
  wrap: {
    background: 'rgba(12,20,16,0.30)',
    backdropFilter: 'blur(22px) saturate(135%)',
    WebkitBackdropFilter: 'blur(22px) saturate(135%)',
    border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: 14,
    boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    padding: 14,
    flexShrink: 0,
  },
  label: {
    display: 'flex', alignItems: 'center', gap: 7,
    fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1.4,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: '0 0 10px',
  },
  count: {
    background: GOLD, color: '#1A1206', borderRadius: 999,
    padding: '1px 7px', fontSize: 10, letterSpacing: 0,
  },
  request: { paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' },
  requestHead: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 },
  askText: { margin: '0 0 6px', fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.45)' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: 5 },
  action: {
    fontFamily: SANS, fontSize: 11.5, cursor: 'pointer',
    background: 'rgba(201,160,71,0.14)', border: `1px solid ${GOLD}55`,
    borderRadius: 999, padding: '4px 10px', color: '#FFFFFF',
  },
  blockBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.6)' },

  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 2px' },
  avatar: {
    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.80)',
  },
  name: { fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.90)' },
  rowName: {
    flex: 1, display: 'flex', flexDirection: 'column',
    fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.86)',
  },
  tier: { fontSize: 10.5, color: 'rgba(255,255,255,0.38)' },
  msgBtn: {
    flexShrink: 0, textDecoration: 'none', fontSize: 13, lineHeight: 1,
    color: 'rgba(255,255,255,0.5)', padding: '4px 6px', borderRadius: 7,
    border: '1px solid rgba(255,255,255,0.12)',
  },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.22)' },
  empty: { margin: 0, fontFamily: SANS, fontSize: 12.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.45)' },
};
