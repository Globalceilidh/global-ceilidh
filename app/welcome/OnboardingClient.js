'use client';

// Onboarding — writes the user's gc_profiles row (the social keystone)
// then sends them to their new page at /u/<handle>. Phantom.land-style:
// all-white type on a dark space overlay, numbered frosted-glass rows
// (the coordinate look that echoes the /saoghal diaspora clock), floating
// on a cursor image-trail of Global Ceilidh photos. The X close button
// turns like a screw as the cursor approaches. Bilingual; only handle +
// name are required.

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import LanguagePill from '../../components/LanguagePill';
import ImageTrail from '../../components/ImageTrail';

const INTEREST_OPTIONS = [
  ['Music', 'Ceòl'], ['Language', 'Cànan'], ['Genealogy', 'Sloinntearachd'],
  ['Song', 'Òran'], ['Dance', 'Dannsa'], ['History', 'Eachdraidh'],
  ['Piping', 'Pìobaireachd'], ['Literature', 'Litreachas'],
  ['Cooking', 'Còcaireachd'], ['Sport', 'Spòrs'],
];

const LEVELS = [
  ['none', 'Not yet', 'Chan eil fhathast'],
  ['learner', 'Learner', 'Neach-ionnsachaidh'],
  ['intermediate', 'Intermediate', 'Meadhanach'],
  ['fluent', 'Fluent', 'Fileanta'],
  ['native', 'Native', 'Dùthchasach'],
];

export default function OnboardingClient({ defaults }) {
  const { language } = useLanguage();
  const L = (en, gd) => (language === 'gd' ? gd : en);

  const [handle, setHandle] = useState(defaults.handle || '');
  const [displayName, setDisplayName] = useState(defaults.display_name || '');
  const [region, setRegion] = useState('');
  const [level, setLevel] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState([]);
  const [ancestralPlaces, setAncestralPlaces] = useState('');
  const [clanNames, setClanNames] = useState('');
  const [locationPublic, setLocationPublic] = useState(false);

  const [handleState, setHandleState] = useState({ status: 'idle', reason: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Live handle availability check (debounced).
  const checkSeq = useRef(0);
  useEffect(() => {
    const h = handle.trim().replace(/^@+/, '').toLowerCase();
    if (!h) { setHandleState({ status: 'idle', reason: null }); return; }
    setHandleState({ status: 'checking', reason: null });
    const seq = ++checkSeq.current;
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/onboarding?handle=${encodeURIComponent(h)}`);
        const data = await res.json();
        if (seq !== checkSeq.current) return;
        if (data.valid && data.available) setHandleState({ status: 'ok', reason: null });
        else setHandleState({ status: 'bad', reason: data.reason || L('Not available.', 'Chan eil e ri fhaighinn.') });
      } catch {
        if (seq === checkSeq.current) setHandleState({ status: 'idle', reason: null });
      }
    }, 450);
    return () => clearTimeout(id);
  }, [handle, language]);

  // The X close button turns like a screw as the cursor nears it.
  const xRef = useRef(null);
  useEffect(() => {
    const el = xRef.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // touch: no cursor
    let raf = 0;
    const RADIUS = 240;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        const prox = Math.max(0, Math.min(1, 1 - dist / RADIUS));
        el.style.transform = `rotate(${(45 * prox).toFixed(1)}deg)`;
      });
    };
    const reset = () => { el.style.transform = 'rotate(0deg)'; };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', reset);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', reset);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const toggleInterest = (val) =>
    setInterests((cur) => (cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val]));
  const splitList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) { setError(L('Add your name.', 'Cuir a-steach d’ainm.')); return; }
    if (handleState.status !== 'ok') {
      setError(L('Choose an available handle.', 'Tagh ainm-cleachdaidh a tha ri fhaighinn.'));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle, display_name: displayName, avatar_url: defaults.avatar_url || '',
          region, gaidhlig_level: level || null, bio, interests,
          ancestral_places: splitList(ancestralPlaces),
          clan_family_names: splitList(clanNames),
          location_public: locationPublic,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.reason || L('Something went wrong. Please try again.', 'Chaidh rudeigin ceàrr. Feuch a-rithist.'));
      }
      window.location.assign(`/u/${data.handle}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const handleHint =
    handleState.status === 'checking' ? { text: L('Checking…', 'A’ sgrùdadh…'), color: 'rgba(255,255,255,0.55)' }
    : handleState.status === 'ok' ? { text: L('Available', 'Ri fhaighinn'), color: '#8FE0A0' }
    : handleState.status === 'bad' ? { text: handleState.reason, color: '#E88A82' }
    : null;

  return (
    <main className="gc-onb" style={wrap}>
      <div style={stars} aria-hidden />
      <ImageTrail />
      <div style={scrim} aria-hidden />

      <a ref={xRef} href="/home" className="gc-x" style={closeX} aria-label={L('Close', 'Dùin')}>
        <span style={{ display: 'block', lineHeight: 1 }}>×</span>
      </a>

      <form onSubmit={submit} style={content}>
        {/* 01 — the greeting */}
        <div className="gc-row gc-hero">
          <div className="gc-num">01</div>
          <div className="gc-hero-body">
            <p style={eyebrow}>○ {L('Welcome', 'Fàilte')}</p>
            <h1 className="gc-hero-title">{L('Fàilte! Let’s make your page.', 'Fàilte! Dèan do dhuilleag.')}</h1>
            <p style={sub}>
              {L('This is your corner of the Global Ceilidh — your Cèilidh. A minute now; change any of it later.',
                 'Seo an oisean agad den Chèilidh Chruinneil — do Chèilidh fhèin. Mionaid an-dràsta; atharraich uair sam bith.')}
            </p>
          </div>
        </div>

        <Row n="02" label={L('Your name', 'D’ainm')} required>
          <input className="gc-input" value={displayName} maxLength={80}
            onChange={(e) => setDisplayName(e.target.value)} placeholder={L('Enter your name', 'Cuir a-steach d’ainm')} />
        </Row>

        <Row n="03" label={L('Handle', 'Ainm-cleachdaidh')} required hint={handleHint}
          note={`globalceilidh.com/u/${handle || L('your_handle', 'd’ainm')}`}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.55)', marginRight: 4 }}>@</span>
            <input className="gc-input" value={handle} maxLength={30}
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              onChange={(e) => setHandle(e.target.value.replace(/^@+/, '').toLowerCase())}
              placeholder="mairi_nicleoid" />
          </div>
        </Row>

        <Row n="04" label={L('Your Gàidhlig', 'A’ Ghàidhlig agad')}>
          <div style={chipRow}>
            {LEVELS.map(([val, en, gd]) => (
              <button type="button" key={val} onClick={() => setLevel(level === val ? '' : val)}
                style={chip(level === val)}>{L(en, gd)}</button>
            ))}
          </div>
        </Row>

        <Row n="05" label={L('Where you are', 'Càite a bheil thu')}
          note={L('Kept coarse — never your exact address.', 'Cumar seo farsaing.')}>
          <input className="gc-input" value={region} maxLength={120}
            onChange={(e) => setRegion(e.target.value)} placeholder={L('e.g. Cape Breton, NS', 'm.e. Ceap Breatainn')} />
        </Row>

        <Row n="06" label={L('A wee introduction', 'Beagan mu do dheidhinn')}>
          <textarea className="gc-textarea" value={bio} maxLength={600}
            onChange={(e) => setBio(e.target.value)} placeholder={L('What brings you to the ceilidh?', 'Dè thug don chèilidh thu?')} />
        </Row>

        <Row n="07" label={L('Interests', 'Ùidhean')}>
          <div style={chipRow}>
            {INTEREST_OPTIONS.map(([en, gd]) => (
              <button type="button" key={en} onClick={() => toggleInterest(en)}
                style={chip(interests.includes(en))}>{L(en, gd)}</button>
            ))}
          </div>
        </Row>

        <Row n="08" label={L('Ancestral places', 'Àiteachan nan sinnsear')}>
          <input className="gc-input" value={ancestralPlaces} maxLength={200}
            onChange={(e) => setAncestralPlaces(e.target.value)} placeholder={L('Isle of Lewis, Tiree… (comma separated)', 'Eilean Leòdhais, Tiriodh…')} />
        </Row>

        <Row n="09" label={L('Clan / family names', 'Ainmean cinnidh')}>
          <input className="gc-input" value={clanNames} maxLength={200}
            onChange={(e) => setClanNames(e.target.value)} placeholder={L('MacLeod, Morrison… (comma separated)', 'MacLeòid, Moireasdan…')} />
        </Row>

        <Row n="10" label={L('Show on the map', 'Seall air a’ mhapa')}>
          <label style={checkRow}>
            <input type="checkbox" checked={locationPublic} onChange={(e) => setLocationPublic(e.target.checked)} />
            <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.45 }}>
              {L('Appear on the Global Ceilidh map (you can turn this off any time).',
                 'Nochd air mapa na Cèilidh Cruinneil (’s urrainn dhut a chur dheth uair sam bith).')}
            </span>
          </label>
        </Row>

        {error && <p style={errText}>{error}</p>}

        <button type="submit" style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }} disabled={busy}>
          {busy ? L('Creating…', 'A’ cruthachadh…') : L('Create my page', 'Cruthaich mo dhuilleag')}
        </button>
      </form>

      <LanguagePill position="bottom-right" variant="dark" layout="toggle" fixed offsetBottom={20} offsetRight={20} />

      <style>{`
        .gc-onb .gc-input, .gc-onb .gc-textarea {
          width:100%; background:transparent; border:none; outline:none; color:#F4F1EA;
          font-family:var(--font-ibm-plex-sans),"IBM Plex Sans",system-ui,sans-serif; font-size:15px; padding:2px 0;
        }
        .gc-onb .gc-textarea { resize:vertical; min-height:64px; }
        .gc-onb .gc-input::placeholder, .gc-onb .gc-textarea::placeholder { color:rgba(255,255,255,0.3); }
        .gc-onb .gc-row {
          display:flex; gap:18px; align-items:flex-start;
          background:rgba(255,255,255,0.055); border:1px solid rgba(255,255,255,0.1);
          border-radius:12px; padding:16px 20px;
          backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
        }
        .gc-onb .gc-num {
          font-family:"IBM Plex Mono",Menlo,monospace; font-size:19px; letter-spacing:1px;
          color:rgba(255,255,255,0.5); min-width:32px; padding-top:2px;
        }
        .gc-onb .gc-body { flex:1; display:flex; gap:20px; align-items:flex-start; min-width:0; }
        .gc-onb .gc-label { width:200px; flex-shrink:0; color:#F4F1EA; font-size:15px; padding-top:2px; line-height:1.35; }
        .gc-onb .gc-control { flex:1; min-width:0; }
        .gc-onb .gc-hero-body { flex:1; min-width:0; }
        .gc-onb .gc-hero-title {
          font-family:var(--font-ibm-plex-sans),"IBM Plex Sans",system-ui,sans-serif;
          font-weight:700; font-size:clamp(30px,5vw,52px); letter-spacing:-0.02em; line-height:1.05;
          color:#F7F4EC; margin:0 0 12px;
        }
        .gc-onb .gc-x:hover { background:rgba(255,255,255,0.12); }
        @media (max-width:720px){
          .gc-onb .gc-body { flex-direction:column; gap:8px; }
          .gc-onb .gc-label { width:auto; }
        }
      `}</style>
    </main>
  );
}

// ── numbered glass row ────────────────────────────────────────────────

function Row({ n, label, required, hint, note, children }) {
  return (
    <div className="gc-row">
      <div className="gc-num">{n}</div>
      <div className="gc-body">
        <div className="gc-label">
          {label}{required && <span style={{ color: '#E88A82' }}>*</span>}
          {hint && <div style={{ fontSize: 12, fontWeight: 600, color: hint.color, marginTop: 4 }}>{hint.text}</div>}
          {note && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{note}</div>}
        </div>
        <div className="gc-control">{children}</div>
      </div>
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────────

const wrap = {
  position: 'relative', minHeight: '100dvh', padding: '58px 24px 64px',
  background: 'radial-gradient(ellipse 120% 90% at 50% 18%, #0b1220 0%, #05070d 55%, #000000 100%)',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
};
const stars = {
  position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
  backgroundImage: [
    'radial-gradient(1.5px 1.5px at 15% 22%, rgba(255,255,255,0.7), transparent)',
    'radial-gradient(1px 1px at 42% 14%, rgba(255,255,255,0.5), transparent)',
    'radial-gradient(1px 1px at 68% 30%, rgba(255,255,255,0.55), transparent)',
    'radial-gradient(1.5px 1.5px at 85% 17%, rgba(255,255,255,0.6), transparent)',
    'radial-gradient(1px 1px at 25% 55%, rgba(255,255,255,0.4), transparent)',
    'radial-gradient(1px 1px at 78% 68%, rgba(255,255,255,0.5), transparent)',
    'radial-gradient(1.5px 1.5px at 55% 82%, rgba(255,255,255,0.5), transparent)',
    'radial-gradient(1px 1px at 8% 74%, rgba(255,255,255,0.4), transparent)',
    'radial-gradient(1px 1px at 92% 86%, rgba(255,255,255,0.45), transparent)',
  ].join(', '),
};
// Gentle dim so the trail stays vivid; the frosted rows handle text contrast.
const scrim = {
  position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
  background: 'radial-gradient(ellipse at 50% 40%, rgba(3,5,10,0.2) 0%, rgba(3,5,10,0.45) 70%, rgba(3,5,10,0.68) 100%)',
};
const closeX = {
  position: 'fixed', top: 22, right: 24, zIndex: 5,
  width: 46, height: 46, borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#F4F1EA', fontSize: 28, textDecoration: 'none',
  background: 'rgba(255,255,255,0.04)',
  transition: 'transform 220ms ease-out, background 180ms ease',
};
const content = {
  position: 'relative', zIndex: 3, width: '100%', maxWidth: 720,
  display: 'flex', flexDirection: 'column', gap: 12,
};
const eyebrow = {
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, letterSpacing: 3,
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: '0 0 12px',
};
const sub = { color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.5, margin: 0, maxWidth: 540 };
const chipRow = { display: 'flex', flexWrap: 'wrap', gap: 8 };
function chip(active) {
  return {
    padding: '7px 15px', borderRadius: 999,
    border: `1px solid ${active ? '#FFFFFF' : 'rgba(255,255,255,0.22)'}`,
    background: active ? '#FFFFFF' : 'transparent',
    color: active ? '#0A0D14' : 'rgba(255,255,255,0.85)',
    fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 160ms ease',
  };
}
const checkRow = { display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' };
const errText = { color: '#E88A82', fontSize: 14, margin: '4px 2px 0' };
const primaryBtn = {
  marginTop: 8, alignSelf: 'flex-start',
  background: '#FFFFFF', color: '#0A0D14', border: 'none', padding: '14px 34px',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontSize: 19, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 999,
};
