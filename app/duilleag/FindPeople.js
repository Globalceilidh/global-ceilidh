'use client';

// app/duilleag/FindPeople.js
// The way in to the graph, sitting above your existing connections: search
// members by name or handle and ask for a ceangal. A sent request lands as
// 'pending' and grants nothing until the other person accepts and files it
// — so the button here just becomes "Requested" and the rest happens on
// their side.
//
// With the box empty it shows a few recent members, so "who is even here?"
// has an answer before you know anyone's name.

import { useCallback, useEffect, useRef, useState } from 'react';

export default function FindPeople({ gd, outgoing = [], onChanged }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // Local override of a person's state after you click Connect, so the
  // button flips immediately without waiting for a refetch.
  const [sent, setSent] = useState({});
  const timer = useRef(null);

  const search = useCallback(async (query) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/people?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.ok) setResults(json.people || []);
    } catch { /* leave the last results up */ } finally {
      setLoading(false);
    }
  }, []);

  // Debounce keystrokes; only search once the panel is open.
  useEffect(() => {
    if (!open) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(q), 280);
    return () => clearTimeout(timer.current);
  }, [q, open, search]);

  async function connect(person) {
    setSent((m) => ({ ...m, [person.id]: 'requested' }));
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: person.handle }),
      });
      const json = await res.json();
      if (!json.ok) setSent((m) => ({ ...m, [person.id]: 'error' }));
      else onChanged?.();
    } catch {
      setSent((m) => ({ ...m, [person.id]: 'error' }));
    }
  }

  const stateOf = (p) => sent[p.id] || p.rel;

  return (
    <div style={s.wrap}>
      <h2 style={s.label}>{gd ? 'Lorg daoine' : 'Find people'}</h2>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => { setOpen(true); if (results.length === 0) search(''); }}
        placeholder={gd ? 'Ainm no @làmh-sgrìobhaidh…' : 'Name or @handle…'}
        style={s.input}
        data-no-drag
      />

      {open && (
        <div style={s.results}>
          {loading && results.length === 0 && (
            <p style={s.hint}>{gd ? 'A’ sireadh…' : 'Searching…'}</p>
          )}
          {!loading && results.length === 0 && (
            <p style={s.hint}>{gd ? 'Cha do lorg sinn duine.' : 'No one found.'}</p>
          )}
          {results.map((p) => {
            const st = stateOf(p);
            return (
              <div key={p.id} style={s.row}>
                {p.avatarUrl
                  ? <img src={p.avatarUrl} alt="" style={s.avatarImg} />
                  : <span style={s.avatar}>{initials(p.displayName)}</span>}
                <div style={s.who}>
                  <a href={`/u/${p.handle}`} style={s.name}>{p.displayName}</a>
                  <span style={s.sub}>@{p.handle}{p.region ? ` · ${p.region}` : ''}</span>
                </div>
                <ConnectBtn state={st} gd={gd} onClick={() => connect(p)} />
              </div>
            );
          })}
        </div>
      )}

      {outgoing.length > 0 && (
        <div style={s.outgoing}>
          <p style={s.outLabel}>{gd ? 'Air iarraidh' : 'Requested'}</p>
          {outgoing.map((o) => (
            <div key={o.id} style={s.outRow}>
              <span style={s.avatarSm}>{initials(o.person.displayName)}</span>
              <span style={s.outName}>{o.person.displayName}</span>
              <span style={s.outWait}>{gd ? 'a’ feitheamh' : 'pending'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConnectBtn({ state, gd, onClick }) {
  if (state === 'connected') return <span style={{ ...s.btn, ...s.btnDone }}>{gd ? 'Ceangailte' : 'Connected'}</span>;
  if (state === 'requested') return <span style={{ ...s.btn, ...s.btnMuted }}>{gd ? 'Air iarraidh' : 'Requested'}</span>;
  if (state === 'incoming') return <span style={{ ...s.btn, ...s.btnMuted }}>{gd ? 'Dh’iarr iad ort' : 'Asked you'}</span>;
  if (state === 'error') return <span style={{ ...s.btn, ...s.btnMuted }}>{gd ? 'Feuch a-rithist' : 'Try again'}</span>;
  return (
    <button style={{ ...s.btn, ...s.btnGo }} onClick={onClick} data-no-drag>
      {gd ? 'Ceangail' : 'Connect'}
    </button>
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
    borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    padding: 14, flexShrink: 0,
  },
  label: {
    fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1.4,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: '0 0 10px',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(0,0,0,0.26)', border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8, padding: '8px 10px', color: '#FFFFFF', fontFamily: SANS, fontSize: 13,
  },
  results: { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 2 },
  hint: { margin: '4px 2px', fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.42)' },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 2px' },
  avatar: {
    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.80)',
  },
  avatarImg: {
    width: 30, height: 30, borderRadius: '50%', flexShrink: 0, objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.16)',
  },
  who: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  name: {
    fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.90)', textDecoration: 'none',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  sub: {
    fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.42)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  btn: {
    flexShrink: 0, fontFamily: SANS, fontSize: 11.5, borderRadius: 999,
    padding: '4px 12px', border: '1px solid transparent',
  },
  btnGo: { cursor: 'pointer', background: GOLD, color: '#1A1206', fontWeight: 600 },
  btnMuted: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.55)' },
  btnDone: { background: 'rgba(201,160,71,0.14)', border: `1px solid ${GOLD}55`, color: 'rgba(255,255,255,0.7)' },

  outgoing: { marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' },
  outLabel: {
    fontFamily: SANS, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.40)', margin: '0 0 6px',
  },
  outRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '3px 2px' },
  avatarSm: {
    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: SANS, fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
  },
  outName: { flex: 1, fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.72)' },
  outWait: { fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)' },
};
