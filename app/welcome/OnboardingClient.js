'use client';

// Onboarding — writes the user's gc_profiles row (the social keystone)
// then sends them to their new page at /u/<handle>. Phantom.land-style
// dark overlay: big white heading, glass-panel form sections, floating on
// a cursor image-trail of Global Ceilidh photos. Bilingual, warm first-run
// tone. Only handle + display name are required.

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import LanguagePill from '../../components/LanguagePill';
import ImageTrail from '../../components/ImageTrail';

const INTEREST_OPTIONS = [
  ['Music', 'Ceòl'],
  ['Language', 'Cànan'],
  ['Genealogy', 'Sloinntearachd'],
  ['Song', 'Òran'],
  ['Dance', 'Dannsa'],
  ['History', 'Eachdraidh'],
  ['Piping', 'Pìobaireachd'],
  ['Literature', 'Litreachas'],
  ['Cooking', 'Còcaireachd'],
  ['Sport', 'Spòrs'],
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

  const [handleState, setHandleState] = useState({ status: 'idle', reason: null }); // idle|checking|ok|bad
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
          handle,
          display_name: displayName,
          avatar_url: defaults.avatar_url || '',
          region,
          gaidhlig_level: level || null,
          bio,
          interests,
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
    handleState.status === 'checking' ? { text: L('Checking…', 'A’ sgrùdadh…'), color: '#C9A047' }
    : handleState.status === 'ok' ? { text: L('Available', 'Ri fhaighinn'), color: '#7FD68A' }
    : handleState.status === 'bad' ? { text: handleState.reason, color: '#E5736B' }
    : null;

  return (
    <main className="gc-onb" style={wrap}>
      <div style={stars} aria-hidden />
      <ImageTrail />
      <div style={scrim} aria-hidden />

      <a href="/home" style={closeX} aria-label={L('Close', 'Dùin')}>×</a>

      <div style={content}>
        <p style={eyebrow}>○ {L('Welcome', 'Fàilte')}</p>
        <h1 style={h1}>{L('Fàilte! Let’s make your page.', 'Fàilte! Dèan do dhuilleag.')}</h1>
        <p style={sub}>
          {L(
            'This is your corner of the Global Ceilidh — your Cèilidh. A minute now; you can change any of it later.',
            'Seo an oisean agad den Chèilidh Chruinneil — do Chèilidh fhèin. Mionaid an-dràsta; ’s urrainn dhut atharrachadh uair sam bith.'
          )}
        </p>

        <form onSubmit={submit} style={form}>
          <Section title={L('Who you are', 'Cò thu')}>
            <Field label={L('Your name', 'D’ainm')} required>
              <input style={input} value={displayName} maxLength={80}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={L('Màiri NicLeòid', 'Màiri NicLeòid')} />
            </Field>

            <Field label={L('Handle', 'Ainm-cleachdaidh')} required hint={handleHint}>
              <div style={handleWrap}>
                <span style={at}>@</span>
                <input style={{ ...input, paddingLeft: 28 }} value={handle} maxLength={30}
                  autoCapitalize="none" autoCorrect="off" spellCheck={false}
                  onChange={(e) => setHandle(e.target.value.replace(/^@+/, '').toLowerCase())}
                  placeholder="mairi_nicleoid" />
              </div>
              <span style={subhint}>globalceilidh.com/u/{handle || L('your_handle', 'd’ainm')}</span>
            </Field>
          </Section>

          <Section title={L('About you', 'Mud dheidhinn')}>
            <Field label={L('Where you are', 'Càite a bheil thu')}>
              <input style={input} value={region} maxLength={120}
                onChange={(e) => setRegion(e.target.value)}
                placeholder={L('Town / region — e.g. Cape Breton, NS', 'Baile / sgìre — m.e. Ceap Breatainn')} />
              <span style={subhint}>{L('Kept coarse — never your exact address.', 'Cumar seo farsaing — chan eil an seòladh mionaideach agad ann.')}</span>
            </Field>

            <Field label={L('Your Gàidhlig', 'A’ Ghàidhlig agad')}>
              <div style={chipRow}>
                {LEVELS.map(([val, en, gd]) => (
                  <button type="button" key={val}
                    onClick={() => setLevel(level === val ? '' : val)}
                    style={chip(level === val)}>
                    {L(en, gd)}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={L('A wee introduction', 'Beagan mu do dheidhinn')}>
              <textarea style={{ ...input, minHeight: 84, resize: 'vertical' }} value={bio} maxLength={600}
                onChange={(e) => setBio(e.target.value)}
                placeholder={L('What brings you to the ceilidh?', 'Dè thug don chèilidh thu?')} />
            </Field>
          </Section>

          <Section title={L('Your roots', 'Do fhreumhan')}>
            <Field label={L('Interests', 'Ùidhean')}>
              <div style={chipRow}>
                {INTEREST_OPTIONS.map(([en, gd]) => (
                  <button type="button" key={en}
                    onClick={() => toggleInterest(en)}
                    style={chip(interests.includes(en))}>
                    {L(en, gd)}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={L('Ancestral places', 'Àiteachan nan sinnsear')}>
              <input style={input} value={ancestralPlaces} maxLength={200}
                onChange={(e) => setAncestralPlaces(e.target.value)}
                placeholder={L('Isle of Lewis, Tiree… (comma separated)', 'Eilean Leòdhais, Tiriodh… (le cromagan)')} />
            </Field>

            <Field label={L('Clan / family names', 'Ainmean cinnidh / teaghlaich')}>
              <input style={input} value={clanNames} maxLength={200}
                onChange={(e) => setClanNames(e.target.value)}
                placeholder={L('MacLeod, Morrison… (comma separated)', 'MacLeòid, Moireasdan… (le cromagan)')} />
            </Field>
          </Section>

          <label style={checkRow}>
            <input type="checkbox" checked={locationPublic}
              onChange={(e) => setLocationPublic(e.target.checked)} />
            <span style={{ color: 'rgba(242,236,220,0.75)', fontSize: 14, lineHeight: 1.45 }}>
              {L('Show me on the Global Ceilidh map (you can turn this off any time).',
                 'Seall mi air mapa na Cèilidh Cruinneil (’s urrainn dhut seo a chur dheth uair sam bith).')}
            </span>
          </label>

          {error && <p style={errText}>{error}</p>}

          <button type="submit" style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }} disabled={busy}>
            {busy ? L('Creating…', 'A’ cruthachadh…') : L('Create my page', 'Cruthaich mo dhuilleag')}
          </button>
        </form>
      </div>

      <LanguagePill
        position="bottom-right"
        variant="dark"
        layout="toggle"
        fixed
        offsetBottom={20}
        offsetRight={20}
      />

      <style>{`
        .gc-onb input::placeholder,
        .gc-onb textarea::placeholder { color: rgba(242,236,220,0.32); }
        .gc-onb input:focus,
        .gc-onb textarea:focus { border-color: rgba(201,160,71,0.75); outline: none; }
        .gc-onb a[aria-label]:hover { background: rgba(255,255,255,0.12); }
      `}</style>
    </main>
  );
}

// ── little presentational helpers ─────────────────────────────────────

function Section({ title, children }) {
  return (
    <fieldset style={sectionWrap}>
      <legend style={sectionTitle}>{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label style={fieldWrap}>
      <span style={fieldLabelRow}>
        <span style={fieldLabel}>{label}{required && <span style={{ color: '#E5736B' }}> *</span>}</span>
        {hint && <span style={{ fontSize: 12, fontWeight: 600, color: hint.color }}>{hint.text}</span>}
      </span>
      {children}
    </label>
  );
}

// ── styles (phantom.land dark overlay) ────────────────────────────────

const wrap = {
  position: 'relative',
  minHeight: '100dvh',
  padding: '64px 24px 64px',
  background: 'radial-gradient(ellipse 120% 90% at 50% 18%, #0b1220 0%, #05070d 55%, #000000 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
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
// Dims the image trail so white text stays readable, lighter in the
// centre so photos still glow through.
const scrim = {
  position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
  background: 'radial-gradient(ellipse at 50% 35%, rgba(3,5,10,0.32) 0%, rgba(3,5,10,0.6) 68%, rgba(3,5,10,0.8) 100%)',
};
const closeX = {
  position: 'fixed', top: 22, right: 24, zIndex: 5,
  width: 44, height: 44, borderRadius: '50%',
  border: '1px solid rgba(242,236,220,0.35)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#F2ECDC', fontSize: 26, lineHeight: 1, textDecoration: 'none',
  background: 'rgba(255,255,255,0.04)',
  transition: 'background 180ms ease',
};
const content = { position: 'relative', zIndex: 3, width: '100%', maxWidth: 660 };
const eyebrow = {
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
  color: 'rgba(242,236,220,0.6)', margin: '0 0 14px',
};
const h1 = {
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontWeight: 700, fontSize: 'clamp(34px, 6vw, 58px)', letterSpacing: '-0.02em',
  lineHeight: 1.04, color: '#F7F4EC', margin: '0 0 14px',
};
const sub = {
  color: 'rgba(242,236,220,0.62)', fontSize: 16, lineHeight: 1.5,
  margin: '0 0 30px', maxWidth: 520,
};
const form = { width: '100%', display: 'flex', flexDirection: 'column', gap: 20 };
const sectionWrap = {
  border: '1px solid rgba(242,236,220,0.12)', borderRadius: 14,
  padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 16,
  margin: 0, background: 'rgba(255,255,255,0.025)',
};
const sectionTitle = {
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
  color: '#C9A047', padding: '0 6px',
};
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: 7 };
const fieldLabelRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 };
const fieldLabel = {
  fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
  color: 'rgba(242,236,220,0.6)',
};
const input = {
  width: '100%', padding: '11px 13px',
  border: '1px solid rgba(242,236,220,0.18)', borderRadius: 8,
  fontSize: 15, fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  color: '#F4F1EA', background: 'rgba(255,255,255,0.055)', boxSizing: 'border-box',
};
const handleWrap = { position: 'relative', display: 'flex', alignItems: 'center' };
const at = { position: 'absolute', left: 13, color: '#C9A047', fontSize: 15 };
const subhint = { fontSize: 12, color: 'rgba(242,236,220,0.42)' };
const chipRow = { display: 'flex', flexWrap: 'wrap', gap: 8 };
function chip(active) {
  return {
    padding: '7px 15px', borderRadius: 999,
    border: `1px solid ${active ? '#C9A047' : 'rgba(242,236,220,0.2)'}`,
    background: active ? '#C9A047' : 'rgba(255,255,255,0.04)',
    color: active ? '#0A0D14' : 'rgba(242,236,220,0.85)',
    fontSize: 13, fontWeight: active ? 600 : 400,
    cursor: 'pointer', transition: 'all 160ms ease',
  };
}
const checkRow = { display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' };
const errText = { color: '#E5736B', fontSize: 14, margin: 0 };
const primaryBtn = {
  marginTop: 2, alignSelf: 'flex-start',
  background: '#FFFFFF', color: '#0A0D14', border: 'none',
  padding: '14px 34px',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontSize: 19, letterSpacing: '0.1em', textTransform: 'uppercase',
  cursor: 'pointer', borderRadius: 999,
};
