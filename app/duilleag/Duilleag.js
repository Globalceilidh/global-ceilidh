'use client';

// app/duilleag/Duilleag.js
// Panel 1 — the Duilleag-cèilidh itself. Three columns floating on the
// inside of the glass:
//
//   left    static. Cuairt-shruth + the ordinary link tree every app has, ending
//           in settings. Deliberately ordinary: this is the part people
//           shouldn't have to think about.
//   middle  quick jumps, then the feed — what the people you have a
//           ceangal with are saying, filtered server-side by the tier
//           each author chose.
//   right   the personal globe, then connections and requests.
//
// Layout has two modes, chosen by the shell:
//   * Desktop (fragment === null) — all three columns at once in the
//     three-column grid.
//   * Mobile / tablet (fragment === 'left' | 'middle' | 'right') — this
//     component renders ONE column, full-pane, to be its own swipe pane.
//     The shell flattens the panel into three door-stops and lands on
//     'middle' (see DuilleagShell); swiping right reveals 'left', left
//     reveals 'right'.
//
// State (feed / connections / globe) is shared via DuilleagDataProvider so
// the three split panes stay in sync.
//
// No profile picture and no cover photo anywhere on this surface. The
// backdrop is the cover photo, and you know what you look like.

import { useLanguage } from '../../context/LanguageContext';
import { useDuilleagData } from './DuilleagData';
import PersonalGlobe from './PersonalGlobe';
import Composer from './Composer';
import Connections from './Connections';
import FindPeople from './FindPeople';
import PostCard from './PostCard';
import { NAV_ITEMS, QUICK_JUMPS } from './stubs';

export default function Duilleag({ profile, fragment = null, isFlat = false }) {
  const { language } = useLanguage();
  const gd = language === 'gd';
  const t = (o) => (gd ? o.gd : o.en);

  const {
    feed, own, connections, pending, outgoing, loaded, globeExpanded,
    refreshConnections, refreshFeed, addOwnPost, removeOwnPost, removeFeedPost, toggleGlobe,
  } = useDuilleagData();

  // Column style: on a flat (mobile/tablet) pane each column fills the pane
  // at natural height and the pane wrapper owns the scroll; on desktop it
  // keeps its grid-track height and inner scroll.
  const cs = (base) => (isFlat ? { ...s.col, ...base, ...s.colFlat } : { ...s.col, ...base });

  // On desktop the whole column is `data-no-drag` so a stray click-drag can't
  // spin the door. On a flat pane the pane MUST be swipeable, so we don't tag
  // the column — only the composer stays protected so typing/selection works.
  const colNoDrag = isFlat ? {} : { 'data-no-drag': 'true' };

  // One globe instance. On desktop it sits in the centre column when expanded
  // and the right column otherwise; on a flat pane it stays in the right
  // fragment and just grows in place.
  const globeInMiddle = globeExpanded && !isFlat;
  const globe = (
    <PersonalGlobe
      profile={profile}
      expanded={globeExpanded}
      onToggleExpanded={toggleGlobe}
    />
  );

  const left = (
    <aside style={cs(s.left)} {...colNoDrag}>
      <a href="/" style={s.logoLink}>
        <img src="/duilleag/gc-logo.webp" alt="Global Ceilidh" style={s.logo} />
      </a>

      <nav style={s.nav}>
        {pending.length > 0 && (
          <button
            style={{ ...s.navItem, ...s.navReq }}
            onClick={() => document.getElementById('gc-requests')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            data-no-drag="true"
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
    <section style={cs(s.middle)} {...colNoDrag}>
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

      {/* Keep the writing area protected from the door swipe even on a flat
          pane, so typing and text-selection work; swipe elsewhere on the pane. */}
      <div data-no-drag="true">
        <Composer
          gd={gd}
          connections={connections}
          onPosted={addOwnPost}
        />
      </div>

      <div style={s.feed}>
        {feed.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            gd={gd}
            isOwner={p.author?.handle === profile.handle}
            onDeleted={removeFeedPost}
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
                onDeleted={removeOwnPost}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );

  const right = (
    <aside style={cs(s.right)} {...colNoDrag}>
      {!globeInMiddle && globe}
      <FindPeople
        gd={gd}
        outgoing={outgoing}
        onChanged={() => { refreshConnections(); }}
      />
      <Connections
        gd={gd}
        connections={connections}
        pending={pending}
        onChanged={() => { refreshConnections(); refreshFeed(); }}
      />
    </aside>
  );

  // Flat (mobile / tablet): this instance is ONE swipe pane — render only the
  // requested column, wrapped in a full-pane scroller.
  if (isFlat) {
    const only = fragment === 'left' ? left : fragment === 'right' ? right : middle;
    return <div style={s.fragment}>{only}</div>;
  }

  // Desktop: all three columns in the revolving-door grid.
  return (
    <div style={s.grid}>{left}{middle}{right}</div>
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
    // inside a track that stays full width.
    maxWidth: 1320,
    margin: '0 auto',
  },

  // A single flat column occupying the whole pane. The pane wrapper owns the
  // vertical scroll (the shell's axis-lock hands vertical gestures to it and
  // keeps horizontal for the door). Top pad clears the fixed corner chrome;
  // it's a real page top now, not the old 20vh backdrop-reveal hack that made
  // PD "load low" — each column starts at the top of its own pane.
  fragment: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '58px 14px 24px',
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'hidden',
    // Own the horizontal gesture. Without this the scroll container keeps the
    // default touch-action, so the browser claims a rightward swipe for its
    // back-navigation gesture (leftward has no forward history so it slips
    // through — which is why only one swipe direction worked). pan-y allows
    // vertical scroll and hands every horizontal swipe to the door.
    touchAction: 'pan-y',
    overscrollBehavior: 'contain',
  },

  col: { minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14, touchAction: 'pan-y' },
  // On a flat pane the column is full-width, natural height, no inner scroll —
  // the pane wrapper scrolls as one.
  colFlat: { width: '100%', minHeight: 'auto', overflow: 'visible', flex: '0 0 auto' },
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
