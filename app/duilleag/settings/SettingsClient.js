'use client';

// app/duilleag/settings/SettingsClient.js
// Location & map-visibility settings. Talks to /api/profile/location — the
// same endpoint the personal globe uses — so a change here and a change on
// the globe are the one truth.
//
// Two controls:
//   • Change location — type a place, it geocodes, lat/lng update.
//   • Show on the map — the opt-out. location_public gates your dot on
//     /saoghal and on other people's globes; it never hides you from your
//     own globe. This is the "hide yourself" home Whitey asked for.

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';

export default function SettingsClient({ profile }) {
  const { language } = useLanguage();
  const L = (en, gd) => (language === 'gd' ? gd : en);

  const [region, setRegion] = useState(profile.region || '');
  const [hasCoords, setHasCoords] = useState(
    Number.isFinite(profile.lat) && Number.isFinite(profile.lng)
  );
  const [locationPublic, setLocationPublic] = useState(profile.locationPublic);

  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  async function changeLocation() {
    if (!query.trim() || busy) return;
    setBusy(true); setError(null); setSaved(false);
    try {
      const res = await fetch('/api/profile/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.reason || L('Couldn’t find that place.', 'Cha do lorg sinn an t-àite sin.'));
        return;
      }
      setRegion(json.location.region);
      setHasCoords(Number.isFinite(json.location.lat) && Number.isFinite(json.location.lng));
      setQuery('');
      setSaved(true);
    } catch {
      setError(L('That didn’t work — try again.', 'Cha do dh’obraich sin — feuch a-rithist.'));
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisibility() {
    const next = !locationPublic;
    setLocationPublic(next); // optimistic
    setError(null); setSaved(false);
    try {
      const res = await fetch('/api/profile/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_public: next }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error();
      setSaved(true);
    } catch {
      setLocationPublic(!next); // roll back
      setError(L('Couldn’t save that — try again.', 'Cha b’ urrainn a shàbhaladh — feuch a-rithist.'));
    }
  }

  return (
    <main style={s.page}>
      <div style={s.column}>
        <header style={s.header}>
          <Link href="/duilleag" style={s.back}>← {L('Back to your Duilleag', 'Air ais dhan Duilleag')}</Link>
          <h1 style={s.title}>{L('Settings', 'Roghainnean')}</h1>
          <p style={s.sub}>{L('Signed in as', 'Air do chlàradh a-steach mar')} @{profile.handle}</p>
        </header>

        <section style={s.card}>
          <h2 style={s.cardTitle}>{L('Location & map', 'Àite is mapa')}</h2>
          <p style={s.cardNote}>
            {region
              ? <>{L('You’re shown as', 'Tha thu air do shealltainn mar')} <strong style={{ color: '#F4F1EA' }}>{region}</strong>{hasCoords ? '' : ` — ${L('not yet placed on the map', 'gun a bhith air a’ mhapa fhathast')}`}.</>
              : L('You haven’t set a location yet.', 'Cha do shuidhich thu àite fhathast.')}
          </p>

          {/* Change location */}
          <div style={s.field}>
            <label style={s.label}>{L('Change your location', 'Atharraich d’àite')}</label>
            <div style={s.row}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') changeLocation(); }}
                placeholder={region || L('e.g. Cape Breton, NS', 'm.e. Ceap Breatainn')}
                style={s.input}
              />
              <button onClick={changeLocation} disabled={!query.trim() || busy} style={s.save}>
                {busy ? '…' : L('Save', 'Sàbhail')}
              </button>
            </div>
            <p style={s.hint}>{L('Kept coarse (~1km) — never your exact address.', 'Cumar seo farsaing (~1km) — chan e an dearbh sheòladh agad a-riamh.')}</p>
          </div>

          {/* Visibility toggle — the opt-out */}
          <div style={{ ...s.field, ...s.toggleRow }}>
            <div>
              <label style={s.label}>{L('Show me on the map', 'Seall mi air a’ mhapa')}</label>
              <p style={s.hint}>
                {locationPublic
                  ? L('Others can see your dot on the Global Ceilidh map.', 'Chì càch do dhotag air mapa na Cèilidh Cruinneil.')
                  : L('You’re hidden from the map. You still see yourself on your own globe.', 'Tha thu falaichte bhon mhapa. Chì thu fhathast thu fhèin air do chruinne fhèin.')}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={locationPublic}
              onClick={toggleVisibility}
              style={{ ...s.switch, ...(locationPublic ? s.switchOn : {}) }}
            >
              <span style={{ ...s.knob, ...(locationPublic ? s.knobOn : {}) }} />
            </button>
          </div>

          {error && <p style={s.error}>{error}</p>}
          {saved && !error && <p style={s.savedMsg}>{L('Saved.', 'Air a shàbhaladh.')}</p>}
        </section>
      </div>
    </main>
  );
}

const SANS = '"IBM Plex Sans", system-ui, sans-serif';

const s = {
  page: {
    minHeight: '100dvh',
    background: 'radial-gradient(ellipse 120% 90% at 50% 12%, #0b1220 0%, #05070d 55%, #000000 100%)',
    fontFamily: SANS,
    padding: '6vh 20px 12vh',
  },
  column: { maxWidth: 620, margin: '0 auto' },
  header: { marginBottom: 28 },
  back: {
    fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
  },
  title: {
    fontFamily: '"Fraunces", "EB Garamond", Georgia, serif',
    fontWeight: 700, fontSize: 'clamp(30px,5vw,44px)', color: '#F7F4EC',
    margin: '14px 0 4px',
  },
  sub: { color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 },
  card: {
    background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16, padding: '24px 26px 26px',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  },
  cardTitle: {
    fontFamily: SANS, fontWeight: 700, fontSize: 19, color: '#F7F4EC', margin: '0 0 6px',
  },
  cardNote: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.55, margin: '0 0 22px' },
  field: { paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.09)', marginTop: 18 },
  label: { display: 'block', color: '#F4F1EA', fontSize: 14, fontWeight: 600, marginBottom: 8 },
  row: { display: 'flex', gap: 10, alignItems: 'center' },
  input: {
    flex: 1, minWidth: 0, background: 'rgba(0,0,0,0.26)',
    border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8,
    padding: '9px 11px', color: '#F4F1EA', fontFamily: SANS, fontSize: 14, outline: 'none',
  },
  save: {
    background: '#C9A047', border: 'none', borderRadius: 999, padding: '9px 18px',
    fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#1A1206', cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  hint: { color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5, margin: '8px 0 0' },
  toggleRow: { display: 'flex', gap: 18, alignItems: 'flex-start', justifyContent: 'space-between' },
  switch: {
    flexShrink: 0, width: 46, height: 27, borderRadius: 999, border: 'none',
    background: 'rgba(255,255,255,0.16)', cursor: 'pointer', position: 'relative',
    padding: 0, transition: 'background 180ms ease', marginTop: 2,
  },
  switchOn: { background: '#4CA96A' },
  knob: {
    position: 'absolute', top: 3, left: 3, width: 21, height: 21, borderRadius: '50%',
    background: '#FFFFFF', transition: 'transform 180ms ease',
  },
  knobOn: { transform: 'translateX(19px)' },
  error: { color: '#E88A82', fontSize: 13, margin: '18px 0 0' },
  savedMsg: { color: '#8FE0A0', fontSize: 13, margin: '18px 0 0' },
};
