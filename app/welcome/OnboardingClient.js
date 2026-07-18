'use client';

// Onboarding — writes the user's gc_profiles row (the social keystone)
// then sends them to their new page at /u/<handle>. One tall form read as
// three tight boxes (2 and 3 hidden until reached) inside a centred
// scroll column — the scrollbar runs down the right of the boxes, not the
// page. Phantom.land-style: all-white type, frosted numbered lines,
// floating on a cursor image-trail of Global Ceilidh photos. A circular
// arrow sits just outside each box (top-left) and advances box→box,
// turning a snappy quarter to point straight down as the cursor nears; the
// X close rests as a "+" and screws into "×". Bilingual; only handle +
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

  // Age gate — shown before the profile form until the 13+ check passes.
  const [verified, setVerified] = useState(defaults.age_verified || false);

  const [handleState, setHandleState] = useState({ status: 'idle', reason: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Stepper: 3 boxes. maxStep gates which are revealed; step is the one in
  // focus. Advancing reveals a box and scrolls it up (previous box's bottom
  // stays in view above it — see scroll-margin-top on .gc-boxwrap).
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const boxRefs = [useRef(null), useRef(null), useRef(null)];

  function advanceTo(target) {
    setMaxStep((m) => Math.max(m, target));
    setStep(target);
  }

  useEffect(() => {
    if (step === 0) return;
    const el = boxRefs[step].current;
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

  // Screw turn: every .gc-screw (the X + each advance arrow) rotates toward
  // its data-screw angle as the cursor nears — snappy, reaching full turn
  // before the cursor is on it. Desktop only.
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const RADIUS = 210;
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        document.querySelectorAll('.gc-onb .gc-screw').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0) return;
          const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
          const prox = Math.max(0, Math.min(1, (1 - dist / RADIUS) * 1.8));
          const maxDeg = Number(el.dataset.screw) || 45;
          el.style.transform = `rotate(${(maxDeg * prox).toFixed(1)}deg)`;
        });
      });
    };
    const reset = () => {
      document.querySelectorAll('.gc-onb .gc-screw').forEach((el) => { el.style.transform = 'rotate(0deg)'; });
    };
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

  // Box 1 (name + an available handle) must be complete before the flow
  // opens up past it.
  const box1Complete = displayName.trim().length > 0 && handleState.status === 'ok';

  // One static signpost arrow. Points RIGHT while box 1 is being filled,
  // DOWN once it's ready to advance, UP at the last box (back to the top).
  const canAdvance = step < 2 && (step === 0 ? box1Complete : true);
  const arrowDir = step === 2 ? 'up' : canAdvance ? 'down' : 'right';
  const arrowDeg = arrowDir === 'up' ? -90 : arrowDir === 'down' ? 90 : 0;

  function handleArrow() {
    if (step === 2) {
      document.querySelector('.gc-scroller')?.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(0);
      return;
    }
    if (step === 0 && !box1Complete) {
      setError(L('Add your name and pick a handle first.', 'Cuir a-steach d’ainm agus tagh ainm-cleachdaidh an toiseach.'));
      return;
    }
    setError(null);
    advanceTo(step + 1);
  }

  return (
    <main className="gc-onb" style={wrap}>
      <div style={stars} aria-hidden />
      <ImageTrail />
      <div style={scrim} aria-hidden />

      {/* Rests as a "+"; the 45° screw turns it into an "×" only as the
          cursor nears — the exit stays quietly hidden until sought. */}
      <a href="/home" className="gc-x gc-screw" data-screw="45" style={closeX} aria-label={L('Close', 'Dùin')}>+</a>

      {!verified && <AgeGate L={L} onVerified={() => setVerified(true)} />}

      {verified && (
        <>
      {/* One static signpost arrow — right → down → up depending on where
          you are in the flow. */}
      <button type="button" onClick={handleArrow} className="gc-arrow"
        aria-label={arrowDir === 'up' ? L('Back to top', 'Suas') : arrowDir === 'down' ? L('Next', 'Air adhart') : L('Start here', 'Tòisich an seo')}
        style={{ ...arrowBtn, transform: `rotate(${arrowDeg}deg)` }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </button>

      <div className="gc-scroller">
        <form onSubmit={submit} className="gc-stack">
          {/* ── Box 1 ───────────────────────────────────────────── */}
          <div className="gc-boxwrap" ref={boxRefs[0]}>
            <div className="gc-box">
              <div className="gc-box-header">
                <p style={eyebrow}>○ {L('Welcome', 'Fàilte')}</p>
                <h1 className="gc-box-title">{L('Fàilte! Let’s make your Duilleag-cèilidh.', 'Fàilte! Dèan do dhuilleag-cèilidh.')}</h1>
                <p style={sub}>
                  {L('Your Duilleag-cèilidh — your ceilidh page, your corner of the Global Ceilidh. A minute now; change any of it later.',
                     'Do dhuilleag-cèilidh fhèin — an oisean agad den Chèilidh Chruinneil. Mionaid an-dràsta; atharraich uair sam bith.')}
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

          {/* ── Box 2 ───────────────────────────────────────────── */}
          {maxStep >= 1 && (
            <div className="gc-boxwrap" ref={boxRefs[1]}>
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

          {/* ── Box 3 ───────────────────────────────────────────── */}
          {maxStep >= 2 && (
            <div className="gc-boxwrap" ref={boxRefs[2]}>
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
                    {L('That’s everything — scroll up to check anything, then create your Duilleag-cèilidh.',
                       'Sin e uile — sgrolaich suas gus rud sam bith a dhearbhadh, an uair sin cruthaich do dhuilleag-cèilidh.')}
                  </p>
                  {error && <p style={errText}>{error}</p>}
                  <button type="submit" style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }} disabled={busy}>
                    {busy ? L('Creating…', 'A’ cruthachadh…') : L('Create my Duilleag-cèilidh', 'Cruthaich mo dhuilleag-cèilidh')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Errors before the last box surface centred at the bottom. */}
      {error && maxStep < 2 && (
        <p style={{ ...errText, position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 6 }}>{error}</p>
      )}
        </>
      )}

      <LanguagePill position="bottom-right" variant="white" layout="toggle" fixed offsetBottom={56} offsetRight={30} />

      <style>{`
        .gc-onb .gc-input, .gc-onb .gc-textarea {
          width:100%; background:transparent; border:none; outline:none; color:#F4F1EA;
          font-family:var(--font-ibm-plex-sans),"IBM Plex Sans",system-ui,sans-serif; font-size:15px; padding:2px 0;
        }
        .gc-onb .gc-textarea { resize:vertical; min-height:60px; }
        .gc-onb .gc-input::placeholder, .gc-onb .gc-textarea::placeholder { color:rgba(255,255,255,0.3); }
        .gc-onb .gc-scroller {
          position:relative; z-index:3; height:100dvh; max-width:680px; margin:0 auto;
          overflow-y:auto; overflow-x:hidden;
          scrollbar-width:none;
        }
        .gc-onb .gc-scroller::-webkit-scrollbar { display:none; }
        .gc-onb .gc-stack {
          display:flex; flex-direction:column; gap:22px; padding:12vh 0 10vh 0;
        }
        .gc-onb .gc-boxwrap { position:relative; width:100%; scroll-margin-top:100px; }
        .gc-onb .gc-box {
          width:100%;
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
          .gc-onb .gc-scroller { max-width:none; }
          .gc-onb .gc-stack { padding:8vh 16px 10vh; }
          .gc-onb .gc-linebody { flex-direction:column; gap:8px; }
          .gc-onb .gc-label { width:auto; }
          .gc-onb .gc-arrow { left:calc(50% - 28px) !important; top:auto !important; bottom:18px !important; margin-top:0 !important; }
        }
      `}</style>
    </main>
  );
}

// ── age gate (13+) — shown before the profile form ───────────────────

function AgeGate({ L, onVerified }) {
  const [year, setYear] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [blocked, setBlocked] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    const y = parseInt(year, 10);
    const now = new Date().getFullYear();
    if (!y || y < 1900 || y > now) {
      setError(L('Enter the year you were born.', 'Cuir a-steach a’ bhliadhna a rugadh tu.'));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/onboarding/age', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth_year: y }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403 && data.error === 'under_age') { setBlocked(true); setBusy(false); return; }
      if (!res.ok || !data.ok) throw new Error(data.error || `http_${res.status}`);
      onVerified();
    } catch (err) {
      const code = err?.message;
      setError(code === 'db_error'
        ? L('Couldn’t save — the age columns aren’t migrated yet (run migration 031).', 'Cha b’ urrainn a shàbhaladh — ruith imrich 031.')
        : L('Something went wrong. Please try again.', 'Chaidh rudeigin ceàrr. Feuch a-rithist.') + (code ? ` (${code})` : ''));
      setBusy(false);
    }
  }

  if (blocked) {
    return (
      <div style={gateWrap}>
        <div className="gc-box" style={gateBox}>
          <p style={eyebrow}>○ {L('Sorry', 'Duilich')}</p>
          <h1 className="gc-box-title">{L('You need to be 13 to join.', 'Feumaidh tu a bhith 13.')}</h1>
          <p style={sub}>
            {L('Global Ceilidh is for ages 13 and up. Come back when you’re a wee bit older — we’ll be here.',
               'Tha Cèilidh na Cruinne do dhaoine 13 bliadhna is nas sine. Till nuair a bhios tu beagan nas sine — bidh sinn an seo.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={gateWrap}>
      <form onSubmit={submit} className="gc-box" style={gateBox}>
        <p style={eyebrow}>○ {L('Welcome', 'Fàilte')}</p>
        <h1 className="gc-box-title">{L('First, a wee question.', 'An toiseach, ceist bheag.')}</h1>
        <p style={{ ...sub, marginBottom: 20 }}>
          {L('What year were you born? You need to be 13 to join Global Ceilidh.',
             'Dè a’ bhliadhna a rugadh tu? Feumaidh tu a bhith 13 gus ballrachd fhaighinn.')}
        </p>
        <input className="gc-input" inputMode="numeric" value={year} maxLength={4}
          onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))} placeholder="1990" style={gateInput} />
        {error && <p style={errText}>{error}</p>}
        <button type="submit" style={{ ...primaryBtn, marginTop: 18, opacity: busy ? 0.6 : 1 }} disabled={busy}>
          {busy ? L('One moment…', 'Mionaid…') : L('Continue', 'Lean air adhart')}
        </button>
      </form>
    </div>
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
  position: 'relative', height: '100dvh', overflow: 'hidden',
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
  background: 'rgba(255,255,255,0.04)', transition: 'transform 80ms linear, background 180ms ease',
};
const arrowBtn = {
  // Static signpost, fixed at the top-left, just outside the box column
  // (aligned with the first box's header).
  position: 'fixed', top: '12vh', left: 'max(16px, calc(50% - 412px))', zIndex: 5,
  width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#F4F1EA', background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
  transition: 'transform 260ms cubic-bezier(0.22,1,0.36,1), background 180ms ease',
};
const gateWrap = {
  position: 'relative', zIndex: 3, minHeight: '100dvh',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
};
const gateBox = { maxWidth: 480, padding: '32px 30px 34px', display: 'flex', flexDirection: 'column' };
const gateInput = {
  border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
  padding: '12px 14px', fontSize: 22, letterSpacing: '0.15em', textAlign: 'center', maxWidth: 170,
};
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
