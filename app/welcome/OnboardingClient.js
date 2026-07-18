'use client';

// Onboarding — writes the user's gc_profiles row (the social keystone)
// then sends them to their new page at /u/<handle>. A guided three-box
// flow, phantom.land-style: all-white type, frosted numbered lines
// grouped into boxes, floating on a cursor image-trail of Global Ceilidh
// photos. A circular arrow (left) advances box→box and turns like a screw
// as the cursor nears it; the X close does the same. Bilingual; only
// handle + name are required.

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import LanguagePill from '../../components/LanguagePill';
import ImageTrail from '../../components/ImageTrail';

const INTEREST_OPTIONS = [
  ['Music', 'Ceòl'], ['Language', 'Cànan'], ['Genealogy', 'Sloinntearachd'],
  ['Song', 'Òran'], ['Dance', 'Dannsa'], ['History', 'Eachdraidh'],
  ['Piping', 'Pìobaireachd'], ['Literature', 'Litreachas'],
  ['Cooking', 'Còcaireachd'], ['Sport', 'Spòrs'],
  ['Culture', 'Cultar'], ['Education', 'Foghlam'],
];

// "We're all learners at whatever level." No native/none — just where you
// are on the road.
const LEVELS = [
  ['beginner', 'Beginner', 'Neach-tòiseachaidh'],
  ['intermediate', 'Intermediate', 'Meadhanach'],
  ['fluent', 'Fluent', 'Fileanta'],
  ['advanced', 'Advanced', 'Adhartach'],
];

export default function OnboardingClient({ defaults }) {
  const { language } = useLanguage();
  const L = (en, gd) => (language === 'gd' ? gd : en);

  const [handle, setHandle] = useState(defaults.handle || '');
  const [displayName, setDisplayName] = useState(defaults.display_name || '');
  const [email, setEmail] = useState(defaults.email || '');
  const [region, setRegion] = useState('');
  const [level, setLevel] = useState('');
  const [gaidhligNote, setGaidhligNote] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState([]);
  const [ancestralPlaces, setAncestralPlaces] = useState('');
  const [clanNames, setClanNames] = useState('');
  const [locationPublic, setLocationPublic] = useState(false);

  const [handleState, setHandleState] = useState({ status: 'idle', reason: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Stepper: 3 boxes. maxStep gates which are revealed; step is the one in
  // focus. Advancing reveals the next and scrolls it into view.
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const slideRefs = [useRef(null), useRef(null), useRef(null)];

  function advance() {
    const next = Math.min(step + 1, 2);
    if (next === step) return;
    setMaxStep((m) => Math.max(m, next));
    setStep(next);
  }

  useEffect(() => {
    if (step === 0) return;
    const el = slideRefs[step].current;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [handle, language]); // eslint-disable-line react-hooks/exhaustive-deps

  // The X close and the advance arrow turn like screws as the cursor nears.
  const xRef = useRef(null);
  const arrowRef = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const RADIUS = 240;
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        for (const ref of [xRef, arrowRef]) {
          const el = ref.current;
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0) continue; // unmounted/hidden (fixed els have null offsetParent)
          const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
          const prox = Math.max(0, Math.min(1, 1 - dist / RADIUS));
          el.style.transform = `rotate(${(45 * prox).toFixed(1)}deg)`;
        }
      });
    };
    const reset = () => { [xRef, arrowRef].forEach((r) => { if (r.current) r.current.style.transform = 'rotate(0deg)'; }); };
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
      setError(L('Choose an available handle (box one).', 'Tagh ainm-cleachdaidh (a’ chiad bhogsa).'));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle, display_name: displayName, email, avatar_url: defaults.avatar_url || '',
          region, gaidhlig_level: level || null, gaidhlig_note: gaidhligNote, bio, interests,
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

      <a ref={xRef} href="/home" className="gc-x" style={closeX} aria-label={L('Close', 'Dùin')}>×</a>

      {/* Advance arrow — hidden on the last box. */}
      {step < 2 && (
        <button ref={arrowRef} type="button" onClick={advance} className="gc-arrow" style={arrowBtn}
          aria-label={L('Next', 'Air adhart')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      )}

      <form onSubmit={submit} style={content}>
        {/* ── Box 1 ─────────────────────────────────────────────── */}
        <div className="gc-slide" ref={slideRefs[0]}>
          <div className="gc-box">
            <div className="gc-box-header">
              <p style={eyebrow}>○ {L('Welcome', 'Fàilte')}</p>
              <h1 className="gc-box-title">{L('Fàilte! Let’s make your page.', 'Fàilte! Dèan do dhuilleag.')}</h1>
              <p style={sub}>
                {L('Your corner of the Global Ceilidh — your Cèilidh. A minute now; change any of it later.',
                   'An oisean agad den Chèilidh Chruinneil — do Chèilidh fhèin. Mionaid an-dràsta; atharraich uair sam bith.')}
              </p>
            </div>

            <Line n="01" label={L('Your name', 'D’ainm')} required>
              <input className="gc-input" value={displayName} maxLength={80}
                onChange={(e) => setDisplayName(e.target.value)} placeholder={L('Enter your name', 'Cuir a-steach d’ainm')} />
            </Line>

            <Line n="02" label={L('Handle', 'Ainm-cleachdaidh')} required hint={handleHint}
              note={`globalceilidh.com/u/${handle || L('your_handle', 'd’ainm')}`}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.55)', marginRight: 4 }}>@</span>
                <input className="gc-input" value={handle} maxLength={30}
                  autoCapitalize="none" autoCorrect="off" spellCheck={false}
                  onChange={(e) => setHandle(e.target.value.replace(/^@+/, '').toLowerCase())} placeholder="mairi_nicleoid" />
              </div>
            </Line>

            <Line n="03" label={L('Email address', 'Post-d')}>
              <input className="gc-input" type="email" value={email} maxLength={200}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </Line>

            <Line n="04" label={L('Where you are', 'Càite a bheil thu')}
              note={L('Kept coarse — never your exact address.', 'Cumar seo farsaing.')}>
              <input className="gc-input" value={region} maxLength={120}
                onChange={(e) => setRegion(e.target.value)} placeholder={L('e.g. Cape Breton, NS', 'm.e. Ceap Breatainn')} />
            </Line>

            <Line n="05" label={L('Show on the map', 'Seall air a’ mhapa')}>
              <label style={checkRow}>
                <input type="checkbox" checked={locationPublic} onChange={(e) => setLocationPublic(e.target.checked)} />
                <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.45 }}>
                  {L('Appear on the Global Ceilidh map (you can turn this off any time).',
                     'Nochd air mapa na Cèilidh Cruinneil (’s urrainn dhut a chur dheth uair sam bith).')}
                </span>
              </label>
            </Line>
          </div>
        </div>

        {/* ── Box 2 ─────────────────────────────────────────────── */}
        {maxStep >= 1 && (
          <div className="gc-slide" ref={slideRefs[1]}>
            <div className="gc-box">
              <Line n="06" label={L('A wee introduction', 'Beagan mu do dheidhinn')}>
                <textarea className="gc-textarea" value={bio} maxLength={600}
                  onChange={(e) => setBio(e.target.value)} placeholder={L('What brings you to the ceilidh?', 'Dè thug don chèilidh thu?')} />
              </Line>

              <Line n="07" label={L('Your Gàidhlig', 'A’ Ghàidhlig agad')}
                note={L('We’re all learners — wherever you are is welcome.', 'Tha sinn uile ag ionnsachadh — ge bith càite a bheil thu, tha fàilte ort.')}>
                <div style={chipRow}>
                  {LEVELS.map(([val, en, gd]) => (
                    <button type="button" key={val} onClick={() => setLevel(level === val ? '' : val)}
                      style={chip(level === val)}>{L(en, gd)}</button>
                  ))}
                </div>
                <textarea className="gc-textarea" value={gaidhligNote} maxLength={400}
                  onChange={(e) => setGaidhligNote(e.target.value)} style={{ marginTop: 12 }}
                  placeholder={L('Tell us about your Gàidhlig — how you learned, where you’re headed…',
                                 'Innis dhuinn mun Ghàidhlig agad — mar a dh’ionnsaich thu, càit a bheil thu a’ dol…')} />
              </Line>

              <Line n="08" label={L('Interests', 'Ùidhean')}>
                <div style={chipRow}>
                  {INTEREST_OPTIONS.map(([en, gd]) => (
                    <button type="button" key={en} onClick={() => toggleInterest(en)}
                      style={chip(interests.includes(en))}>{L(en, gd)}</button>
                  ))}
                </div>
              </Line>
            </div>
          </div>
        )}

        {/* ── Box 3 ─────────────────────────────────────────────── */}
        {maxStep >= 2 && (
          <div className="gc-slide" ref={slideRefs[2]}>
            <div className="gc-box">
              <Line n="09" label={L('Ancestral places', 'Àiteachan nan sinnsear')}>
                <input className="gc-input" value={ancestralPlaces} maxLength={200}
                  onChange={(e) => setAncestralPlaces(e.target.value)} placeholder={L('Isle of Lewis, Tiree… (comma separated)', 'Eilean Leòdhais, Tiriodh…')} />
              </Line>

              <Line n="10" label={L('Clan / family names', 'Ainmean cinnidh')}>
                <input className="gc-input" value={clanNames} maxLength={200}
                  onChange={(e) => setClanNames(e.target.value)} placeholder={L('MacLeod, Morrison… (comma separated)', 'MacLeòid, Moireasdan…')} />
              </Line>

              <div style={{ padding: '18px 4px 6px' }}>
                <p style={{ ...sub, marginBottom: 16 }}>
                  {L('That’s everything — scroll up to check anything, then create your page.',
                     'Sin e uile — sgrolaich suas gus rud sam bith a dhearbhadh, an uair sin cruthaich do dhuilleag.')}
                </p>
                {error && <p style={errText}>{error}</p>}
                <button type="submit" style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }} disabled={busy}>
                  {busy ? L('Creating…', 'A’ cruthachadh…') : L('Create my page', 'Cruthaich mo dhuilleag')}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Errors before the last box surface at the arrow, not the button. */}
      {error && maxStep < 2 && (
        <p style={{ ...errText, position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 6 }}>{error}</p>
      )}

      <LanguagePill position="bottom-right" variant="dark" layout="toggle" fixed offsetBottom={20} offsetRight={20} />

      <style>{`
        .gc-onb .gc-input, .gc-onb .gc-textarea {
          width:100%; background:transparent; border:none; outline:none; color:#F4F1EA;
          font-family:var(--font-ibm-plex-sans),"IBM Plex Sans",system-ui,sans-serif; font-size:15px; padding:2px 0;
        }
        .gc-onb .gc-textarea { resize:vertical; min-height:60px; }
        .gc-onb .gc-input::placeholder, .gc-onb .gc-textarea::placeholder { color:rgba(255,255,255,0.3); }
        .gc-onb .gc-slide {
          min-height:100dvh; display:flex; flex-direction:column;
          align-items:center; justify-content:center; padding:56px 24px;
        }
        .gc-onb .gc-box {
          width:100%; max-width:720px;
          background:rgba(255,255,255,0.055); border:1px solid rgba(255,255,255,0.1);
          border-radius:16px; padding:6px 28px 20px;
          backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
        }
        .gc-onb .gc-box-header { padding:24px 4px 20px; }
        .gc-onb .gc-box-title {
          font-family:var(--font-ibm-plex-sans),"IBM Plex Sans",system-ui,sans-serif;
          font-weight:700; font-size:clamp(28px,4.5vw,46px); letter-spacing:-0.02em; line-height:1.06;
          color:#F7F4EC; margin:0 0 12px;
        }
        .gc-onb .gc-line {
          display:flex; gap:20px; align-items:flex-start;
          padding:18px 4px; border-top:1px solid rgba(255,255,255,0.09);
        }
        .gc-onb .gc-num {
          font-family:"IBM Plex Mono",Menlo,monospace; font-size:19px; letter-spacing:1px;
          color:rgba(255,255,255,0.5); min-width:32px; padding-top:2px;
        }
        .gc-onb .gc-linebody { flex:1; display:flex; gap:20px; align-items:flex-start; min-width:0; }
        .gc-onb .gc-label { width:190px; flex-shrink:0; color:#F4F1EA; font-size:15px; padding-top:2px; line-height:1.35; }
        .gc-onb .gc-control { flex:1; min-width:0; }
        .gc-onb .gc-x:hover, .gc-onb .gc-arrow:hover { background:rgba(255,255,255,0.12); }
        @media (max-width:720px){
          .gc-onb .gc-linebody { flex-direction:column; gap:8px; }
          .gc-onb .gc-label { width:auto; }
          .gc-onb .gc-arrow { left:50% !important; right:auto !important; top:auto !important; bottom:20px !important; transform:translateX(-50%); }
        }
      `}</style>
    </main>
  );
}

// ── one numbered line inside a box ────────────────────────────────────

function Line({ n, label, required, hint, note, children }) {
  return (
    <div className="gc-line">
      <div className="gc-num">{n}</div>
      <div className="gc-linebody">
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
  position: 'relative', minHeight: '100dvh',
  background: 'radial-gradient(ellipse 120% 90% at 50% 18%, #0b1220 0%, #05070d 55%, #000000 100%)',
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
    'radial-gradient(1px 1px at 92% 86%, rgba(255,255,255,0.45), transparent)',
  ].join(', '),
};
const scrim = {
  position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
  background: 'radial-gradient(ellipse at 50% 40%, rgba(3,5,10,0.2) 0%, rgba(3,5,10,0.45) 70%, rgba(3,5,10,0.68) 100%)',
};
const closeX = {
  position: 'fixed', top: 22, right: 24, zIndex: 5,
  width: 46, height: 46, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#F4F1EA', fontSize: 28, lineHeight: 1, textDecoration: 'none',
  background: 'rgba(255,255,255,0.04)', transition: 'transform 220ms ease-out, background 180ms ease',
};
const arrowBtn = {
  position: 'fixed', top: '50%', left: 28, zIndex: 5, marginTop: -28,
  width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#F4F1EA', background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
  transition: 'transform 220ms ease-out, background 180ms ease',
};
const content = { position: 'relative', zIndex: 3, width: '100%' };
const eyebrow = {
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, letterSpacing: 3,
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: '0 0 12px',
};
const sub = { color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.5, margin: 0, maxWidth: 540 };
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
const errText = { color: '#E88A82', fontSize: 14, margin: '4px 2px 12px' };
const primaryBtn = {
  background: '#FFFFFF', color: '#0A0D14', border: 'none', padding: '14px 34px',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontSize: 19, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 999,
};
