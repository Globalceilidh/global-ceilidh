'use client';

// app/duilleag/Duilleag.js
// Panel 1 — the Duilleag-cèilidh itself. Three columns floating on the
// inside of the glass:
//
//   left    static. Sniomh + the ordinary link tree every app has, ending
//           in settings. Deliberately ordinary: this is the part people
//           shouldn't have to think about.
//   middle  quick jumps, then the feed — what connections, groups and a
//           sampling of like-minded folk are posting.
//   right   the personal globe, then connections.
//
// No profile picture and no cover photo anywhere on this surface. The
// backdrop is the cover photo, and you know what you look like.
//
// The composer is folded shut by default. An open box saying "what's on
// your mind" makes the first thing you owe the room a performance;
// landing in a room should feel like arriving, not going on stage.

import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import PersonalGlobe from './PersonalGlobe';
import { NAV_ITEMS, QUICK_JUMPS, PLACEHOLDER_FEED, PLACEHOLDER_CONNECTIONS } from './stubs';

export default function Duilleag({ profile, initialPosts }) {
  const { language } = useLanguage();
  const gd = language === 'gd';
  const t = (o) => (gd ? o.gd : o.en);

  return (
    <div style={s.grid}>
      <aside style={{ ...s.col, ...s.left }} data-no-drag>
        <a href="/" style={s.logoLink}>
          <img src="/duilleag/gc-logo.webp" alt="Global Ceilidh" style={s.logo} />
        </a>

        <nav style={s.nav}>
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} style={s.navItem}>
              <span style={s.navIcon} aria-hidden="true">{item.icon}</span>
              <span>{t(item.label)}</span>
            </a>
          ))}
        </nav>

        <div style={s.navFoot}>
          <a href="/duilleag/settings" style={{ ...s.navItem, ...s.navSettings }}>
            <span style={s.navIcon} aria-hidden="true">⚙</span>
            <span>{gd ? 'Roghainnean' : 'Settings'}</span>
          </a>
        </div>
      </aside>

      <section style={{ ...s.col, ...s.middle }} data-no-drag>
        <div style={s.quickRow}>
          {QUICK_JUMPS.map((q) => (
            <a key={q.href} href={q.href} style={s.quick}>
              <span style={s.quickIcon} aria-hidden="true">{q.icon}</span>
              <span style={s.quickLabel}>{t(q.label)}</span>
            </a>
          ))}
        </div>

        <Composer gd={gd} />

        <div style={s.feed}>
          {PLACEHOLDER_FEED.map((p) => (
            <article key={p.id} style={s.post}>
              <header style={s.postHead}>
                <span style={s.postAuthor}>{p.author}</span>
                <span style={s.postMeta}>{p.when}</span>
              </header>
              <p style={s.postBody}>{p.body}</p>
            </article>
          ))}

          {initialPosts.length > 0 && (
            <>
              <p style={s.feedDivider}>{gd ? 'Na phostaich thu fhèin' : 'Your own posts'}</p>
              {initialPosts.map((p) => (
                <article key={p.id} style={s.post}>
                  <header style={s.postHead}>
                    <span style={s.postAuthor}>{profile.displayName}</span>
                    <span style={s.postMeta}>{p.visibility}</span>
                  </header>
                  <p style={s.postBody}>{p.body}</p>
                </article>
              ))}
            </>
          )}
        </div>
      </section>

      <aside style={{ ...s.col, ...s.right }} data-no-drag>
        <PersonalGlobe profile={profile} />

        <div style={s.connWrap}>
          <h2 style={s.colLabel}>{gd ? 'Ceanglaichean' : 'Connections'}</h2>
          <ul style={s.connList}>
            {PLACEHOLDER_CONNECTIONS.map((c) => (
              <li key={c.id} style={s.conn}>
                <span style={s.connAvatar} aria-hidden="true">{c.initials}</span>
                <span style={s.connName}>{c.name}</span>
                <span
                  style={{ ...s.connDot, background: c.online ? '#4ADE80' : 'rgba(255,255,255,0.22)' }}
                  title={c.online ? (gd ? 'Air-loidhne' : 'Online') : (gd ? 'Far-loidhne' : 'Offline')}
                />
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

// Folded shut until you actually want to say something.
function Composer({ gd }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');

  if (!open) {
    return (
      <button style={s.composerShut} onClick={() => setOpen(true)}>
        {gd ? 'Sgrìobh rudeigin…' : 'Write something…'}
      </button>
    );
  }
  return (
    <div style={s.composerOpen}>
      <textarea
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={gd ? 'Dè tha a’ dol?' : 'What’s on your mind?'}
        style={s.composerInput}
      />
      <div style={s.composerBar}>
        {/* Audience picker lands with gc_follows — 034/035 define the tiers. */}
        <span style={s.audienceStub}>{gd ? 'Ceanglaichean' : 'Connections'} ▾</span>
        <div style={{ flex: 1 }} />
        <button style={s.composerCancel} onClick={() => { setOpen(false); setBody(''); }}>
          {gd ? 'Sguir dheth' : 'Cancel'}
        </button>
        <button style={s.composerPost} disabled={!body.trim()}>
          {gd ? 'Postaich' : 'Post'}
        </button>
      </div>
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────────

const GOLD = '#C9A047';
const SANS = '"IBM Plex Sans", system-ui, sans-serif';
// Lean on blur, not opacity. At 0.46 the panels stopped being glass and
// became grey slabs sitting on the picture; the place behind them has to
// stay legible or the whole backdrop idea is pointless.
const glass = {
  background: 'rgba(12,20,16,0.30)',
  backdropFilter: 'blur(22px) saturate(135%)',
  WebkitBackdropFilter: 'blur(22px) saturate(135%)',
  border: '1px solid rgba(255,255,255,0.13)',
  borderRadius: 14,
  boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
};

const s = {
  grid: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(190px, 232px) minmax(0, 1fr) minmax(240px, 320px)',
    gap: 18,
    padding: 18,
    boxSizing: 'border-box',
    // Cap the WHOLE shell and centre it, rather than capping the feed
    // inside a track that stays full width. Capping the feed alone put
    // the slack between the columns; capping the shell puts it outside
    // them, where the backdrop can use it. (left/right:0 + a max-width +
    // auto margins is what centres an absolutely-positioned box.)
    maxWidth: 1320,
    margin: '0 auto',
  },
  col: { minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 },
  left: { ...glass, padding: 16, overflow: 'hidden' },
  // Fills its track now that the shell itself is capped — at a 1320
  // shell this lands the feed around 700px, which is the readable range
  // anyway, with no gutter of its own.
  middle: { overflowY: 'auto', overflowX: 'hidden', paddingRight: 4 },
  right: { overflowY: 'auto', overflowX: 'hidden' },

  logoLink: { display: 'block', marginBottom: 4 },
  logo: { width: '100%', height: 'auto', display: 'block' },

  nav: { display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 11,
    fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.86)',
    textDecoration: 'none', padding: '9px 10px', borderRadius: 8,
  },
  navIcon: { width: 18, textAlign: 'center', opacity: 0.8, fontSize: 15 },
  navFoot: { marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.10)' },
  navSettings: { color: 'rgba(255,255,255,0.66)' },

  // Jumps, not billboards. The first pass gave each one a full-height
  // tile and they dominated the column above the feed.
  quickRow: { display: 'flex', gap: 8, flexShrink: 0 },
  quick: {
    ...glass, flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 7, padding: '9px 10px',
    textDecoration: 'none', borderRadius: 999,
  },
  quickIcon: { fontSize: 14, opacity: 0.75 },
  quickLabel: {
    fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
    fontSize: 14, letterSpacing: '0.09em', textTransform: 'uppercase',
    color: '#FFFFFF',
  },

  composerShut: {
    ...glass, width: '100%', textAlign: 'left', padding: '13px 16px',
    fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.52)', cursor: 'pointer',
  },
  composerOpen: { ...glass, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 },
  composerInput: {
    width: '100%', minHeight: 84, resize: 'vertical', boxSizing: 'border-box',
    background: 'rgba(0,0,0,0.24)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 9, padding: 11, color: '#FFFFFF', fontFamily: SANS, fontSize: 14,
  },
  composerBar: { display: 'flex', alignItems: 'center', gap: 9 },
  audienceStub: {
    fontFamily: SANS, fontSize: 12, color: GOLD,
    border: `1px solid ${GOLD}55`, borderRadius: 999, padding: '4px 11px',
  },
  composerCancel: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.55)',
  },
  composerPost: {
    background: GOLD, border: 'none', borderRadius: 999, padding: '7px 18px',
    fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
    fontSize: 15, letterSpacing: '0.08em', color: '#1A1206', cursor: 'pointer',
  },

  feed: { display: 'flex', flexDirection: 'column', gap: 12 },
  post: { ...glass, padding: '14px 16px' },
  postHead: { display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 6 },
  postAuthor: {
    fontFamily: '"Fraunces", "EB Garamond", Georgia, serif', fontStyle: 'italic',
    fontWeight: 700, fontSize: 15, color: '#FFFFFF',
  },
  postMeta: { fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.42)' },
  postBody: {
    margin: 0, fontFamily: SANS, fontSize: 14, lineHeight: 1.6,
    color: 'rgba(255,255,255,0.88)',
  },
  feedDivider: {
    fontFamily: SANS, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.40)', margin: '10px 0 0',
  },

  connWrap: { ...glass, padding: 14 },
  colLabel: {
    fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1.4,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: '0 0 10px',
  },
  connList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 },
  conn: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px' },
  connAvatar: {
    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.80)',
  },
  connName: { flex: 1, fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.86)' },
  connDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
};
