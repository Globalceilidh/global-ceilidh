'use client';

// app/saoghal/sgeulachdan/page.js
// Sgeulachdan — the index of stories told over the globe.
//
// Reachable from the Duilleag-cèilidh nav, so someone who has already
// been through the origins story once can go back to it deliberately
// instead of meeting it again every time they arrive at the site.

import { useLanguage } from '../../../context/LanguageContext';
import LanguagePill from '../../../components/LanguagePill';
import { STORIES, storyHref } from '../stories';

export default function SgeulachdanPage() {
  const { language } = useLanguage();
  const gd = language === 'gd';
  const t = (o) => (gd ? o.gd : o.en);

  return (
    <main style={s.wrap}>
      <LanguagePill position="top-right" variant="white" />

      <header style={s.head}>
        <a href="/duilleag" style={s.back}>← {gd ? 'An duilleag agad' : 'Your page'}</a>
        <h1 style={s.h1}>{gd ? 'Sgeulachdan' : 'Stories'}</h1>
        <p style={s.sub}>
          {gd
            ? 'Sgeulachdan air an innse thairis air a’ chruinne.'
            : 'Stories told across the globe.'}
        </p>
      </header>

      <ul style={s.list}>
        {STORIES.map((story) => {
          const live = story.status === 'live';
          return (
            <li key={story.id} style={{ ...s.card, ...(live ? null : s.cardSoon) }}>
              <div style={s.cardHead}>
                <h2 style={s.title}>{t(story.title)}</h2>
                <span style={s.era}>{t(story.era)}</span>
              </div>
              <p style={s.blurb}>{t(story.blurb)}</p>
              {live ? (
                <a href={storyHref(story.id)} style={s.play}>
                  {gd ? 'Coimhead' : 'Watch'} {story.beats ? `· ${story.beats}` : ''}
                </a>
              ) : (
                <span style={s.soon}>{gd ? 'Ri thighinn' : 'To come'}</span>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

const SANS = '"IBM Plex Sans", system-ui, sans-serif';
const GOLD = '#C9A047';

const s = {
  wrap: {
    minHeight: '100dvh', background: '#07100C', color: '#FFFFFF',
    padding: '56px 22px 72px', boxSizing: 'border-box',
  },
  head: { maxWidth: 760, margin: '0 auto 30px' },
  back: {
    fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none',
  },
  h1: {
    fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
    fontSize: 'clamp(38px, 7vw, 66px)', letterSpacing: '0.05em',
    margin: '14px 0 0',
  },
  sub: {
    fontFamily: '"Fraunces", "EB Garamond", Georgia, serif', fontStyle: 'italic',
    fontSize: 17, color: 'rgba(255,255,255,0.62)', margin: '6px 0 0',
  },
  list: {
    listStyle: 'none', margin: '0 auto', padding: 0,
    maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 14,
  },
  card: {
    border: '1px solid rgba(255,255,255,0.13)', borderRadius: 14,
    background: 'rgba(255,255,255,0.04)', padding: '18px 20px',
  },
  cardSoon: { opacity: 0.55 },
  cardHead: { display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' },
  title: {
    fontFamily: '"Fraunces", "EB Garamond", Georgia, serif', fontStyle: 'italic',
    fontWeight: 700, fontSize: 21, margin: 0,
  },
  era: { fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.42)' },
  blurb: {
    fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6,
    color: 'rgba(255,255,255,0.78)', margin: '9px 0 14px',
  },
  play: {
    display: 'inline-block', background: GOLD, color: '#1A1206',
    fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
    fontSize: 16, letterSpacing: '0.08em', textDecoration: 'none',
    borderRadius: 999, padding: '7px 20px',
  },
  soon: {
    fontFamily: SANS, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.42)',
  },
};
