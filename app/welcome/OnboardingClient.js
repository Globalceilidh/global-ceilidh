'use client';

// Onboarding form — writes the user's gc_profiles row (the social
// keystone) then sends them to their new page at /u/<handle>. Bilingual,
// warm first-run tone. Only handle + display name are required; everything
// else is invitation, not obligation.

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

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
        if (seq !== checkSeq.current) return; // a newer keystroke won
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
    handleState.status === 'checking' ? { text: L('Checking…', 'A’ sgrùdadh…'), color: '#8B6914' }
    : handleState.status === 'ok' ? { text: L('Available', 'Ri fhaighinn'), color: '#2E7D32' }
    : handleState.status === 'bad' ? { text: handleState.reason, color: '#B83232' }
    : null;

  return (
    <main style={wrap}>
      <div style={card}>
        <p style={eyebrow}>Global Ceilidh · {L('Welcome', 'Fàilte')}</p>
        <h1 style={h1}>{L('Make your page', 'Dèan do dhuilleag')}</h1>
        <p style={{ ...muted, maxWidth: 460, textAlign: 'center', marginBottom: 26 }}>
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
                placeholder={L('Mairi NicLeòid', 'Màiri NicLeòid')} />
            </Field>

            <Field label={L('Handle', 'Ainm-cleachdaidh')} required
              hint={handleHint}>
              <div style={handleWrap}>
                <span style={at}>@</span>
                <input style={{ ...input, paddingLeft: 26 }} value={handle} maxLength={30}
                  autoCapitalize="none" autoCorrect="off" spellCheck={false}
                  onChange={(e) => setHandle(e.target.value.replace(/^@+/, '').toLowerCase())}
                  placeholder="mairi_nicleoid" />
              </div>
              <span style={subhint}>{L('globalceilidh.com/u/your_handle', 'globalceilidh.com/u/d’ainm')}</span>
            </Field>
          </Section>

          <Section title={L('About you', 'Mud dheidhinn')}>
            <Field label={L('Where you are', 'Càite a bheil thu')}>
              <input style={input} value={region} maxLength={120}
                onChange={(e) => setRegion(e.target.value)}
                placeholder={L('Town / region — e.g. Cape Breton, NS', 'Baile / sgìre — m.e. Ceap Breatainn')} />
              <span style={subhint}>{L('Kept coarse — never your exact address.', 'Cumar seo farsaing — cha bhi an seòladh mionaideach agad ann.')}</span>
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
            <span style={{ ...muted, fontSize: 14 }}>
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
        <span style={fieldLabel}>{label}{required && <span style={{ color: '#B83232' }}> *</span>}</span>
        {hint && <span style={{ fontSize: 12, fontWeight: 600, color: hint.color }}>{hint.text}</span>}
      </span>
      {children}
    </label>
  );
}

// ── styles (mirrors the /contribute form house style) ─────────────────

const wrap = {
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '48px 20px',
  background: '#F5F0E8',
  fontFamily: 'Georgia, serif',
};
const card = {
  width: '100%',
  maxWidth: 560,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: '#FFFFFF',
  borderRadius: 10,
  padding: '38px 30px 34px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  boxSizing: 'border-box',
};
const eyebrow = {
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
  color: '#6B4E1F', margin: '0 0 10px',
};
const h1 = {
  fontFamily: '"Fraunces", "EB Garamond", Georgia, serif',
  fontStyle: 'italic', fontWeight: 700, fontSize: 32,
  color: '#1A3A2A', margin: '0 0 8px', textAlign: 'center',
};
const muted = { color: '#4A4A4A', fontSize: 15, lineHeight: 1.5, margin: 0 };
const form = { width: '100%', display: 'flex', flexDirection: 'column', gap: 22, marginTop: 4 };
const sectionWrap = {
  border: '1px solid #E7DEC9', borderRadius: 8, padding: '14px 16px 18px',
  display: 'flex', flexDirection: 'column', gap: 16, margin: 0,
};
const sectionTitle = {
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
  color: '#1A3A2A', padding: '0 6px',
};
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: 6 };
const fieldLabelRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 };
const fieldLabel = {
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: '#3A2A0C',
};
const input = {
  width: '100%', padding: '10px 12px', border: '1px solid #D8CDB8', borderRadius: 5,
  fontSize: 15, fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  color: '#1A1A1A', background: '#FFFDF9', boxSizing: 'border-box',
};
const handleWrap = { position: 'relative', display: 'flex', alignItems: 'center' };
const at = {
  position: 'absolute', left: 12, color: '#8B6914', fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 15,
};
const subhint = { fontSize: 12, color: '#8B6914', fontFamily: '"IBM Plex Sans", system-ui, sans-serif' };
const chipRow = { display: 'flex', flexWrap: 'wrap', gap: 8 };
function chip(active) {
  return {
    padding: '7px 14px', borderRadius: 999,
    border: `1px solid ${active ? '#1A3A2A' : '#D8CDB8'}`,
    background: active ? '#1A3A2A' : '#FFFFFF',
    color: active ? '#FFFFFF' : '#3A2A0C',
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    fontSize: 13, cursor: 'pointer', transition: 'all 160ms ease',
  };
}
const checkRow = { display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' };
const errText = { color: '#B83232', fontSize: 14, fontFamily: '"IBM Plex Sans", system-ui, sans-serif', margin: 0 };
const primaryBtn = {
  marginTop: 2, background: '#1A3A2A', color: '#FFFFFF', border: 'none',
  padding: '14px 28px', fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontSize: 18, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 6,
};
