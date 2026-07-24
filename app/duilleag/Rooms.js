'use client';

// app/duilleag/Rooms.js
// Panel 2 of the revolving door — Ceilidh Rooms (Teanta-cèilidh). A focused
// surface floating on the glass: the standing rooms you can walk into, each
// an entry to a live CeilidhStage. (Per-meeting invite rooms still open from
// their own ?code= links; these are the always-there doors.)
//
// NOTE: the Gàidhlig copy here is provisional — flag for Lewis/Joe before it
// counts as shipped (native sign-off gates new Gàidhlig UI text).

const ROOMS = [
  {
    slug: 'an-cidsin',
    name: { en: 'The Kitchen', gd: 'An Cidsin' },
    blurb: {
      en: 'The heart of the house — pull up a chair by the fire.',
      gd: 'Cridhe an taighe — tarraing cathair chun na teine.',
    },
  },
  {
    slug: 'coinneamh-a-bhuird',
    name: { en: 'The Boardroom', gd: 'Seòmar a’ Bhùird' },
    blurb: {
      en: 'Council and meetings round the table.',
      gd: 'Comhairle is coinneamhan mun bhòrd.',
    },
  },
];

export default function Rooms({ language }) {
  const gd = language === 'gd';
  const t = (o) => (gd ? o.gd : o.en);

  return (
    <div style={s.wrap} data-no-drag>
      <p style={s.eyebrow}>{gd ? 'Teanta-cèilidh' : 'Ceilidh Rooms'}</p>
      <h2 style={s.title}>{gd ? 'Thig a-steach' : 'Come away in'}</h2>
      <p style={s.sub}>
        {gd
          ? 'Seòmraichean beò mun teine — gabh pàirt sa chèilidh, no dèan suidhe greis.'
          : 'Live rooms round the fire — join the ceilidh, or just sit a while.'}
      </p>

      <div style={s.list}>
        {ROOMS.map((r) => (
          <a key={r.slug} href={`/rooms/${r.slug}`} style={s.card}>
            <span style={s.cardMain}>
              <span style={s.cardName}>{t(r.name)}</span>
              <span style={s.cardBlurb}>{t(r.blurb)}</span>
            </span>
            <span style={s.enter}>{gd ? 'A-steach →' : 'Enter →'}</span>
          </a>
        ))}
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
  wrap: {
    margin: 'auto',
    width: 'min(520px, 92%)',
    ...glass,
    padding: '30px 30px 32px',
  },
  eyebrow: {
    fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: 2.5,
    textTransform: 'uppercase', color: '#C9A047', margin: '0 0 10px',
  },
  title: {
    fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
    fontSize: 'clamp(34px, 5vw, 52px)', letterSpacing: '0.05em',
    color: '#FFFFFF', margin: '0 0 8px', textShadow: '0 2px 24px rgba(0,0,0,0.6)',
  },
  sub: {
    fontFamily: SANS, fontSize: 14.5, lineHeight: 1.55,
    color: 'rgba(255,255,255,0.7)', margin: '0 0 22px',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
    textDecoration: 'none',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 12, padding: '14px 16px',
  },
  cardMain: { display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
  cardName: {
    fontFamily: '"Fraunces", "EB Garamond", Georgia, serif', fontStyle: 'italic',
    fontWeight: 700, fontSize: 17, color: '#FFFFFF',
  },
  cardBlurb: { fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  enter: {
    flexShrink: 0, fontFamily: SANS, fontSize: 13, fontWeight: 600,
    color: '#C9A047', whiteSpace: 'nowrap',
  },
};
