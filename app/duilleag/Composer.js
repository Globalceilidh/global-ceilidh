'use client';

// app/duilleag/Composer.js
// Writing something, and choosing who it's for.
//
// Folded shut by default. An open box asking what's on your mind makes
// the first thing you owe the room a performance; arriving somewhere
// shouldn't feel like going on stage.
//
// The audience picker defaults to 'connections', never 'global'. A
// composer that defaults to broadcasting is how people publish things
// they meant to keep close, and the cost of the two mistakes isn't
// symmetric: posting too narrowly is a small disappointment, posting too
// widely can't be taken back.

import { useRef, useState } from 'react';

export const AUDIENCES = [
  { value: 'global', label: { en: 'Global Ceilidh', gd: 'An Cèilidh Cruinneil' }, note: { en: 'Anyone on Global Ceilidh', gd: 'Duine sam bith' } },
  { value: 'connections', label: { en: 'Connections', gd: 'Ceanglaichean' }, note: { en: 'Everyone you have accepted', gd: 'A h-uile ceangal' } },
  { value: 'close', label: { en: 'Close connections', gd: 'Dlùth-cheanglaichean' }, note: { en: 'Close and family', gd: 'Dlùth is teaghlach' } },
  { value: 'family', label: { en: 'Family', gd: 'Teaghlach' }, note: { en: 'Family only', gd: 'An teaghlach a-mhàin' } },
  { value: 'custom', label: { en: 'Specific people', gd: 'Daoine àraidh' }, note: { en: 'Only who you name', gd: 'Dìreach an fheadhainn a thaghas tu' } },
];

export default function Composer({ gd, connections, onPosted }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState('connections');
  const [picking, setPicking] = useState(false);
  const [chosen, setChosen] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [media, setMedia] = useState([]);        // [{ url }]
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const t = (o) => (gd ? o.gd : o.en);
  const current = AUDIENCES.find((a) => a.value === visibility) || AUDIENCES[1];
  const canSend = (body.trim() || media.length > 0) && !busy && !uploading;

  const reset = () => {
    setOpen(false); setBody(''); setVisibility('connections');
    setChosen([]); setPicking(false); setError(null);
    setMedia([]); setUploading(false);
  };

  const toggle = (id) =>
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be re-picked after a remove
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.ok) setMedia((m) => [...m, { url: json.url }]);
      else setError(json.reason || (gd ? 'Cha b’ urrainn an dealbh a luchdadh.' : 'Could not upload that image.'));
    } catch {
      setError(gd ? 'Cha b’ urrainn an dealbh a luchdadh.' : 'Could not upload that image.');
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!canSend) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: body.trim(),
          visibility,
          audience: visibility === 'custom' ? chosen : undefined,
          media: media.length ? media : undefined,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.reason || (gd ? 'Cha do dh’obraich sin.' : 'That didn’t work.'));
        return;
      }
      onPosted?.(json.post);
      reset();
    } catch {
      setError(gd ? 'Cha do dh’obraich sin.' : 'That didn’t work.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button style={s.shut} onClick={() => setOpen(true)}>
        {gd ? 'Sgrìobh rudeigin…' : 'Write something…'}
      </button>
    );
  }

  return (
    <div style={s.open}>
      <textarea
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={gd ? 'Dè tha a’ dol?' : 'What’s on your mind?'}
        style={s.input}
      />

      {(media.length > 0 || uploading) && (
        <div style={s.thumbs}>
          {media.map((m, i) => (
            <div key={i} style={s.thumb}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" style={s.thumbImg} />
              <button
                style={s.thumbX}
                onClick={() => setMedia((arr) => arr.filter((_, j) => j !== i))}
                aria-label={gd ? 'Thoir air falbh' : 'Remove'}
              >×</button>
            </div>
          ))}
          {uploading && <div style={s.thumbLoad}>{gd ? '…' : '…'}</div>}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={onPickFile}
        style={{ display: 'none' }}
      />

      <div style={s.bar}>
        <button
          style={s.attach}
          onClick={() => fileRef.current?.click()}
          disabled={media.length >= 4 || uploading}
          title={gd ? 'Cuir dealbh ris' : 'Add an image'}
          aria-label={gd ? 'Cuir dealbh ris' : 'Add an image'}
        >🖼</button>
        <div style={{ position: 'relative' }}>
          <button style={s.audience} onClick={() => setPicking((p) => !p)}>
            {t(current.label)} ▾
          </button>
          {picking && (
            <div style={s.menu}>
              {AUDIENCES.map((a) => (
                <button
                  key={a.value}
                  style={{ ...s.menuItem, ...(a.value === visibility ? s.menuItemOn : null) }}
                  onClick={() => {
                    setVisibility(a.value);
                    setPicking(false);
                  }}
                >
                  <span style={s.menuLabel}>{t(a.label)}</span>
                  <span style={s.menuNote}>{t(a.note)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <button style={s.cancel} onClick={reset}>{gd ? 'Sguir dheth' : 'Cancel'}</button>
        <button
          style={{ ...s.post, opacity: canSend ? 1 : 0.45 }}
          onClick={submit}
          disabled={!canSend}
        >
          {busy ? (gd ? 'A’ postadh…' : 'Posting…') : (gd ? 'Postaich' : 'Post')}
        </button>
      </div>

      {visibility === 'custom' && (
        <div style={s.people}>
          {connections.length === 0 ? (
            <p style={s.noneYet}>
              {gd ? 'Chan eil ceanglaichean agad fhathast.' : 'No connections yet.'}
            </p>
          ) : connections.map((c) => (
            <button
              key={c.person.id}
              onClick={() => toggle(c.person.id)}
              style={{ ...s.person, ...(chosen.includes(c.person.id) ? s.personOn : null) }}
            >
              {c.person.displayName}
            </button>
          ))}
        </div>
      )}

      {error && <p style={s.error}>{error}</p>}
    </div>
  );
}

const GOLD = '#C9A047';
const SANS = '"IBM Plex Sans", system-ui, sans-serif';
const glass = {
  background: 'rgba(12,20,16,0.30)',
  backdropFilter: 'blur(22px) saturate(135%)',
  WebkitBackdropFilter: 'blur(22px) saturate(135%)',
  border: '1px solid rgba(255,255,255,0.13)',
  borderRadius: 14,
  boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
};

const s = {
  shut: {
    ...glass, width: '100%', textAlign: 'left', padding: '13px 16px',
    fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.52)', cursor: 'pointer',
  },
  open: { ...glass, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 },
  input: {
    width: '100%', minHeight: 84, resize: 'vertical', boxSizing: 'border-box',
    background: 'rgba(0,0,0,0.24)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 9, padding: 11, color: '#FFFFFF', fontFamily: SANS, fontSize: 14,
  },
  bar: { display: 'flex', alignItems: 'center', gap: 9 },
  attach: {
    flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 999, width: 30, height: 28, cursor: 'pointer', fontSize: 15, lineHeight: 1,
    color: 'rgba(255,255,255,0.75)', padding: 0,
  },
  thumbs: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  thumb: { position: 'relative', width: 66, height: 66, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  thumbX: {
    position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%',
    background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer',
    fontSize: 12, lineHeight: 1, padding: 0,
  },
  thumbLoad: {
    width: 66, height: 66, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(255,255,255,0.5)', fontSize: 20,
  },
  audience: {
    fontFamily: SANS, fontSize: 12, color: GOLD, cursor: 'pointer',
    background: 'rgba(201,160,71,0.10)', border: `1px solid ${GOLD}55`,
    borderRadius: 999, padding: '5px 12px',
  },
  menu: {
    position: 'absolute', bottom: 'calc(100% + 7px)', left: 0, zIndex: 40,
    width: 232, padding: 5, borderRadius: 11,
    background: 'rgba(10,16,13,0.94)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.14)',
    boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
  },
  menuItem: {
    display: 'flex', flexDirection: 'column', gap: 1, width: '100%',
    textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
    padding: '8px 10px', borderRadius: 7,
  },
  menuItemOn: { background: 'rgba(201,160,71,0.16)' },
  menuLabel: { fontFamily: SANS, fontSize: 13, color: '#FFFFFF' },
  menuNote: { fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.45)' },
  cancel: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.55)',
  },
  post: {
    background: GOLD, border: 'none', borderRadius: 999, padding: '7px 18px',
    fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
    fontSize: 15, letterSpacing: '0.08em', color: '#1A1206', cursor: 'pointer',
  },
  people: { display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 2 },
  person: {
    fontFamily: SANS, fontSize: 12, cursor: 'pointer',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 999, padding: '5px 11px', color: 'rgba(255,255,255,0.80)',
  },
  personOn: { background: 'rgba(201,160,71,0.22)', borderColor: GOLD, color: '#FFFFFF' },
  noneYet: { margin: 0, fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  error: { margin: 0, fontFamily: SANS, fontSize: 12, color: '#E88' },
};
