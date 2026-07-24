'use client';

// app/duilleag/Rooms.js
// Panel 2 of the revolving door — Ceilidh Rooms (Teanta-cèilidh). Lists the
// rooms you can walk into (public + the ones you host, from GET /api/rooms)
// and lets you create/schedule a new one (POST /api/rooms). Each room is an
// entry to a live CeilidhStage; a host also gets the invite code + a share
// link for invite-only rooms.
//
// NOTE: the Gàidhlig copy here is provisional — flag for Lewis/Joe before it
// counts as shipped (native sign-off gates new Gàidhlig UI text).

import { useCallback, useEffect, useState } from 'react';

export default function Rooms({ language }) {
  const gd = language === 'gd';
  const L = (en, gaelic) => (gd ? gaelic : en);

  const [rooms, setRooms] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      const json = await res.json();
      if (json.ok) setRooms(json.rooms || []);
    } catch { /* keep whatever we had */ } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={s.wrap} data-no-drag>
      <p style={s.eyebrow}>{L('Ceilidh Rooms', 'Teanta-cèilidh')}</p>
      <h2 style={s.title}>{L('Come away in', 'Thig a-steach')}</h2>
      <p style={s.sub}>
        {L('Live rooms round the fire — join the ceilidh, or start one of your own.',
           'Seòmraichean beò mun teine — gabh pàirt, no tòisich fear agad fhèin.')}
      </p>

      <div style={s.list}>
        {rooms.map((r) => <RoomCard key={r.slug} room={r} L={L} />)}
        {loaded && rooms.length === 0 && (
          <p style={s.empty}>
            {L('No open rooms just now. Start one below.',
               'Chan eil seòmar fosgailte an-dràsta. Tòisich fear gu h-ìosal.')}
          </p>
        )}
      </div>

      {creating ? (
        <CreateForm
          L={L}
          onCancel={() => setCreating(false)}
          onCreated={() => { setCreating(false); load(); }}
        />
      ) : (
        <button style={s.createBtn} onClick={() => setCreating(true)}>
          + {L('Create a room', 'Cruthaich seòmar')}
        </button>
      )}
    </div>
  );
}

function RoomCard({ room, L }) {
  const [copied, setCopied] = useState(false);
  const isLive = room.status === 'live';
  const when = room.scheduledAt
    ? new Date(room.scheduledAt).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  const shareLink = room.inviteCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/rooms/${room.slug}?code=${room.inviteCode}`
    : null;

  const copy = async () => {
    if (!shareLink) return;
    try { await navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked */ }
  };

  return (
    <div style={s.card}>
      <div style={s.cardTop}>
        <span style={s.cardMain}>
          <span style={s.cardName}>{room.name}</span>
          {room.description && <span style={s.cardBlurb}>{room.description}</span>}
          <span style={s.metaRow}>
            <span style={{ ...s.chip, ...(isLive ? s.chipLive : s.chipSoon) }}>
              {isLive ? L('Live', 'Beò') : (when || L('Scheduled', 'Clàraichte'))}
            </span>
            <span style={s.tierChip}>
              {room.accessTier === 'public' ? L('Public', 'Poblach') : L('Invite-only', 'Le cuireadh')}
            </span>
          </span>
        </span>
        <a href={`/rooms/${room.slug}`} style={s.enter}>{L('Enter', 'A-steach')} →</a>
      </div>

      {room.isHost && room.inviteCode && (
        <div style={s.hostRow}>
          <span style={s.codeLabel}>{L('Invite code', 'Còd cuiridh')}</span>
          <code style={s.code}>{room.inviteCode}</code>
          <button style={s.copyBtn} onClick={copy}>
            {copied ? L('Copied', 'Lethbhreac') : L('Copy link', 'Dèan lethbhreac')}
          </button>
        </div>
      )}
    </div>
  );
}

function CreateForm({ L, onCancel, onCreated }) {
  const [name, setName] = useState('');
  const [when, setWhen] = useState('');       // datetime-local; empty = start now
  const [tier, setTier] = useState('invite_only');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    if (!name.trim() || busy) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          access_tier: tier,
          scheduled_at: when ? new Date(when).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (!json.ok) { setError(json.reason || L('Couldn’t create the room.', 'Cha b’ urrainn an seòmar a chruthachadh.')); return; }
      onCreated(json.room);
    } catch {
      setError(L('That didn’t work — try again.', 'Cha do dh’obraich sin — feuch a-rithist.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={s.form}>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={L('Room name (e.g. Friday Ceilidh)', 'Ainm an t-seòmair (m.e. Cèilidh Dihaoine)')}
        maxLength={80}
        style={s.input}
      />

      <label style={s.fieldLabel}>{L('When (leave empty to open now)', 'Cuin (fàg bàn airson fhosgladh a-nis)')}</label>
      <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} style={s.input} />

      <div style={s.tierRow}>
        {[['invite_only', L('Invite-only', 'Le cuireadh')], ['public', L('Public', 'Poblach')]].map(([val, label]) => (
          <button key={val} type="button" onClick={() => setTier(val)} style={{ ...s.tierOpt, ...(tier === val ? s.tierOptOn : null) }}>
            {label}
          </button>
        ))}
      </div>

      {error && <p style={s.error}>{error}</p>}

      <div style={s.formActions}>
        <button style={s.submit} onClick={submit} disabled={!name.trim() || busy}>
          {busy ? L('Creating…', 'A’ cruthachadh…') : L('Create', 'Cruthaich')}
        </button>
        <button style={s.cancel} onClick={onCancel}>{L('Cancel', 'Sguir dheth')}</button>
      </div>
    </div>
  );
}

const SANS = '"IBM Plex Sans", system-ui, sans-serif';
const glass = {
  background: 'rgba(12,20,16,0.34)',
  backdropFilter: 'blur(22px) saturate(135%)',
  WebkitBackdropFilter: 'blur(22px) saturate(135%)',
  border: '1px solid rgba(255,255,255,0.13)',
  borderRadius: 14,
  boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
};

const s = {
  wrap: { margin: 'auto', width: 'min(520px, 92%)', maxHeight: '86%', overflowY: 'auto', ...glass, padding: '28px 28px 30px' },
  eyebrow: {
    fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: 2.5,
    textTransform: 'uppercase', color: '#C9A047', margin: '0 0 10px',
  },
  title: {
    fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
    fontSize: 'clamp(32px, 5vw, 50px)', letterSpacing: '0.05em',
    color: '#FFFFFF', margin: '0 0 8px', textShadow: '0 2px 24px rgba(0,0,0,0.6)',
  },
  sub: { fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' },

  list: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 },
  empty: { fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.55)', margin: 0, fontStyle: 'italic' },

  card: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 12, padding: '13px 15px',
  },
  cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 },
  cardMain: { display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 },
  cardName: {
    fontFamily: '"Fraunces", "EB Garamond", Georgia, serif', fontStyle: 'italic',
    fontWeight: 700, fontSize: 16.5, color: '#FFFFFF',
  },
  cardBlurb: { fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  chip: {
    fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4,
    padding: '2px 8px', borderRadius: 999,
  },
  chipLive: { background: '#E01B24', color: '#fff' },
  chipSoon: { background: 'rgba(201,160,71,0.22)', color: '#E9C879' },
  tierChip: {
    fontFamily: SANS, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.3,
    padding: '2px 8px', borderRadius: 999,
    background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.72)',
  },
  enter: { flexShrink: 0, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#C9A047', whiteSpace: 'nowrap', textDecoration: 'none' },

  hostRow: {
    display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap',
    marginTop: 11, paddingTop: 11, borderTop: '1px solid rgba(255,255,255,0.10)',
  },
  codeLabel: { fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  code: {
    fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, letterSpacing: 1,
    color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: 6,
  },
  copyBtn: {
    marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: 999, padding: '4px 12px', color: 'rgba(255,255,255,0.85)',
    fontFamily: SANS, fontSize: 12, cursor: 'pointer',
  },

  createBtn: {
    width: '100%', background: 'rgba(201,160,71,0.16)', border: '1px solid rgba(201,160,71,0.5)',
    borderRadius: 12, padding: '12px', color: '#E9C879', fontFamily: SANS, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },

  form: { ...glass, background: 'rgba(255,255,255,0.05)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  fieldLabel: { fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  input: {
    width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.26)',
    border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '9px 11px',
    color: '#F4F1EA', fontFamily: SANS, fontSize: 14, outline: 'none',
  },
  tierRow: { display: 'flex', gap: 8 },
  tierOpt: {
    flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: 999, padding: '7px 0', color: 'rgba(255,255,255,0.82)',
    fontFamily: SANS, fontSize: 13, cursor: 'pointer',
  },
  tierOptOn: { background: '#FFFFFF', color: '#0A0D14', borderColor: '#FFFFFF', fontWeight: 600 },
  error: { color: '#E88A82', fontFamily: SANS, fontSize: 12.5, margin: 0 },
  formActions: { display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 },
  submit: {
    background: '#C9A047', border: 'none', borderRadius: 999, padding: '9px 20px',
    fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#1A1206', cursor: 'pointer',
  },
  cancel: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontFamily: SANS, fontSize: 13, cursor: 'pointer' },
};
