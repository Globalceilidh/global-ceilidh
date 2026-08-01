'use client';

// app/duilleag/Duilleag.js
// Panel 1 — the Duilleag-cèilidh itself. Three columns floating on the
// inside of the glass:
//
//   left    static. Sniomh + the ordinary link tree every app has, ending
//           in settings. Deliberately ordinary: this is the part people
//           shouldn't have to think about.
//   middle  quick jumps, then the feed — what the people you have a
//           ceangal with are saying, filtered server-side by the tier
//           each author chose.
//   right   the personal globe, then connections and requests.
//
// No profile picture and no cover photo anywhere on this surface. The
// backdrop is the cover photo, and you know what you look like.

import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import PersonalGlobe from './PersonalGlobe';
import Composer from './Composer';
import Connections from './Connections';
import FindPeople from './FindPeople';
import PostCard from './PostCard';
import { NAV_ITEMS, QUICK_JUMPS } from './stubs';

export default function Duilleag({ profile, initialPosts, isMobile }) {
  const { language } = useLanguage();
  const gd = language === 'gd';
  const t = (o) => (gd ? o.gd : o.en);

  const [feed, setFeed] = useState([]);
  const [own, setOwn] = useState(initialPosts);
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loaded, setLoaded] = useState(false);
  // The globe lives at the head of the right column, but its expand tab
  // opens it big in the centre column (below the quick-jump icons). On a
  // phone the columns are stacked, so it just grows in place.
  const [globeExpanded, setGlobeExpanded] = useState(false);

  const loadConnections = useCallback(async () => {
    try {
      const res = await fetch('/api/connections');
      const json = await res.json();
      if (json.ok) {
        setConnections(json.connections || []);
        setPending(json.pending || []);
        setOutgoing(json.outgoing || []);
      }
    } catch { /* the column simply stays as it was */ }
  }, []);

  const loadFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/feed');
      const json = await res.json();
      if (json.ok) setFeed(json.posts || []);
    } catch { /* ditto */ } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { loadConnections(); loadFeed(); }, [loadConnections, loadFeed]);

  const colMobile = isMobile ? s.colMobile : null;

  // One globe instance. On desktop it sits in the centre column when expanded
  // and the right column otherwise; on mobile it stays in the right fragment
  // and just grows.
  const globeInMiddle = globeExpanded && !isMobile;
  const globe = (
    <PersonalGlobe
      profile={profile}
      expanded={globeExpanded}
      onToggleExpanded={() => setGlobeExpanded((v) => !v)}
    />
  );

  const left = (
    <aside style={{ ...s.col, ...s.left, ...colMobile }} data-no-drag>
      <a href="/" style={s.logoLink}>
        <img src="/duilleag/gc-logo.webp" alt="Global Ceilidh" style={s.logo} />
      </a>

      <nav style={s.nav}>
        {pending.length > 0 && (
          <button
            style={{ ...s.navItem, ...s.navReq }}
            onClick={() => document.getElementById('gc-requests')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            data-no-drag
          >
            <span style={s.navIcon} aria-hidden="true">☍</span>
            <span>{gd ? 'Iarrtasan' : 'Requests'}</span>
            <span style={s.navBadge}>{pending.length}</span>
          </button>
        )}
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
  );

  const middle = (
    <section style={{ ...s.col, ...s.middle, ...colMobile }} data-no-drag>
      <div style={s.quickRow}>
        {QUICK_JUMPS.map((q) => (
          <a key={q.href} href={q.href} style={s.quickIconLink} title={t(q.label)} aria-label={t(q.label)}>
            {q.iconImg ? (
              <img src={q.iconImg} alt={t(q.label)} style={s.quickIconImg} />
            ) : (
              <span style={s.quickIcon} aria-hidden="true">{q.icon}</span>
            )}
          </a>
        ))}
      </div>

      {globeInMiddle && globe}

      <Composer
        gd={gd}
        connections={connections}
        onPosted={(post) => setOwn((o) => [post, ...o])}
      />

      <div style={s.feed}>
        {feed.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            gd={gd}
            isOwner={p.author?.handle === profile.handle}
            onDeleted={(id) => setFeed((f) => f.filter((x) => x.id !== id))}
          />
        ))}

        {loaded && feed.length === 0 && (
          <p style={s.quiet}>
            {gd
              ? 'Tha e sàmhach an seo. Nuair a bhios ceanglaichean agad, nochdaidh na tha iad ag ràdh an seo.'
              : 'It’s quiet here. Once you have connections, what they post will appear in this column.'}
          </p>
        )}

        {own.length > 0 && (
          <>
            <p style={s.divider}>{gd ? 'Na phostaich thu fhèin' : 'Your own posts'}</p>
            {own.map((p) => (
              <PostCard
                key={p.id}
                post={{ ...p, author: { handle: profile.handle, displayName: profile.displayName } }}
                gd={gd}
                isOwner
                onDeleted={(id) => setOwn((o) => o.filter((x) => x.id !== id))}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );

  const right = (
    <aside style={{ ...s.col, ...s.right, ...colMobile }} data-no-drag>
      {!globeInMiddle && globe}
      <FindPeople
        gd={gd}
        outgoing={outgoing}
        onChanged={() => { loadConnections(); }}
      />
      <Connections
        gd={gd}
        connections={connections}
        pending={pending}
        onChanged={() => { loadConnections(); loadFeed(); }}
      />
    </aside>
  );

  // On a phone the three-column grid can't fit — its hard min-widths add up
  // to more than the viewport, so the two glass columns blanket the whole
  // screen and the backdrop photo disappears behind 22px of blur. Stack to
  // one scrolling column instead, feed first, with room at the top for the
  // place to read behind the glass. Desktop keeps the revolving-door grid.
  return (
    <div style={isMobile ? s.gridMobile : s.grid}>
      {isMobile ? (
        <>{middle}{right}{left}</>
      ) : (
        <>{left}{middle}{right}</>
      )}
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────────

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
    // Bind the row to the pane's own height. Without this the single
    // implicit row grows to its tallest content and overflows the pane,
    // so the columns' overflowY:auto has no fixed height to scroll inside
    // and the whole feed just runs off the bottom. minmax(0,·) lets the
    // children actually shrink so their inner scroll can take over.
    gridTemplateRows: 'minmax(0, 1fr)',
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
  // One scrolling column. The big top pad is deliberate: it lets the
  // backdrop photo show above the fold before any glass covers it, which
  // is the whole point of the surface and exactly what the desktop grid
  // was stealing on a phone.
  gridMobile: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 14,
    paddingTop: '20vh',
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  col: { minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 },
  // Full-width, natural height, no inner scroll — the page scrolls as one.
  colMobile: { width: '100%', minHeight: 'auto', overflow: 'visible', flex: '0 0 auto' },
  left: { ...glass, padding: 16, overflow: 'hidden' },
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
  // The requests badge sits above the ordinary link tree, only when there
  // is something waiting. A button, not a link — it scrolls the pending
  // card into view rather than navigating away.
  navReq: {
    width: '100%', background: 'rgba(201,160,71,0.10)', border: `1px solid #C9A04755`,
    cursor: 'pointer', color: '#FFFFFF', marginBottom: 4,
  },
  navBadge: {
    marginLeft: 'auto', background: '#C9A047', color: '#1A1206', borderRadius: 999,
    padding: '1px 8px', fontSize: 11, fontWeight: 700,
  },

  // A black bar across the top of the strip, same shape as the composer
  // ("Write something…"), with the emblems set inside it. The emblems are
  // white-on-black art flattened onto pure black, so on a #000 bar they
  // merge in with no seam and read as marks floating in the bar.
  quickRow: {
    display: 'flex', alignItems: 'center', gap: 22, flexShrink: 0,
    background: '#000', border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    padding: '16px 22px',
  },
  quickIconLink: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none',
  },
  quickIconImg: { height: 80, width: 'auto', objectFit: 'contain', display: 'block' },
  // Fallback for any jump defined with a text glyph rather than an image.
  quickIcon: { fontSize: 24, opacity: 0.9, color: '#FFFFFF' },

  feed: { display: 'flex', flexDirection: 'column', gap: 12 },
  // Post rendering now lives in PostCard.js.
  divider: {
    fontFamily: SANS, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.40)', margin: '10px 0 0',
  },
  quiet: {
    ...glass, padding: '16px 18px', margin: 0,
    fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)',
  },
};
