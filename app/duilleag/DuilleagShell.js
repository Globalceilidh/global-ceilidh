'use client';

// app/duilleag/DuilleagShell.js
// The revolving door. Five glass panes around the user, wrapping both
// ways, opening always on the Duilleag-cèilidh.
//
// Motion model (Whitey's brief): it should feel like you're moving the
// door, not paging a carousel. Drag it a little and it snaps back to the
// pane you were on; flick it hard and it spins through several. So the
// release is judged on VELOCITY first and distance second — a slow drag
// most of the way across still commits, but a fast flick commits from
// almost nowhere, and a very fast one carries multiple panes.
//
// Two things the naive version gets wrong, both handled here:
//   * Arrow keys must move the text caret when you're typing, not spin
//     the door. Key handling bails out on form fields.
//   * On a phone the feed scrolls vertically inside a pane that swipes
//     horizontally. Without an axis lock, every diagonal gesture does a
//     bit of both and the whole thing feels drunk. The first ~8px of a
//     touch decides which axis owns the gesture; the other is ignored
//     for the rest of it.
//
// Only the live pane and its two neighbours mount. Five backdrops, a
// MapLibre globe and a live feed all at once is a lot to hold, and the
// panes you can't see don't need to exist.

import { useCallback, useEffect, useRef, useState } from 'react';
import { PANELS, wrapIndex } from './panels';
import { useLanguage } from '../../context/LanguageContext';
import Duilleag from './Duilleag';

// Release thresholds.
const FLICK_VELOCITY = 0.45;   // px/ms — above this, commit regardless of distance
const COMMIT_FRACTION = 0.28;  // or drag this far across the pane
const MAX_FLING = 4;           // panes a single hard flick can carry
const AXIS_LOCK_PX = 8;        // travel before a touch commits to an axis
const SNAP_MS = 520;

export default function DuilleagShell({ profile, initialPosts }) {
  const { language } = useLanguage();
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [width, setWidth] = useState(0);

  const rootRef = useRef(null);
  const gesture = useRef(null);
  const snapTimer = useRef(null);

  // Pane width drives every distance in here, so it has to track resize.
  useEffect(() => {
    const measure = () => setWidth(rootRef.current?.offsetWidth || window.innerWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const goTo = useCallback((next) => {
    setAnimating(true);
    setIndex(next);
    setDrag(0);
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => setAnimating(false), SNAP_MS);
  }, []);

  const step = useCallback((delta) => goTo(index + delta), [goTo, index]);

  // ── keyboard ────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Never steal the caret. Typing in the composer wins.
      const el = e.target;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;

      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  // ── drag ────────────────────────────────────────────────────────────
  const onPointerDown = (e) => {
    // Let the composer, links and buttons have their own gestures.
    if (e.target.closest('[data-no-drag]')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    clearTimeout(snapTimer.current);
    setAnimating(false);
    gesture.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastT: e.timeStamp,
      velocity: 0,
      // Mouse drags are unambiguous; touch has to earn the horizontal axis.
      axis: e.pointerType === 'mouse' ? 'x' : null,
    };
  };

  const onPointerMove = (e) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    if (g.axis === null) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (g.axis === 'y') return; // the pane's own scroll owns this gesture

    // Velocity over the last move only — a running average lags the flick.
    const dt = e.timeStamp - g.lastT;
    if (dt > 0) g.velocity = (e.clientX - g.lastX) / dt;
    g.lastX = e.clientX;
    g.lastT = e.timeStamp;

    setDrag(dx);
  };

  const endGesture = (e) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    if (g.axis !== 'x') return;

    const dx = e.clientX - g.startX;
    const v = g.velocity;
    const w = width || 1;

    let steps = 0;
    if (Math.abs(v) >= FLICK_VELOCITY) {
      // Hard flick: carry more panes the faster it was thrown.
      steps = Math.min(MAX_FLING, Math.max(1, Math.round(Math.abs(v) / FLICK_VELOCITY)));
      steps *= v < 0 ? 1 : -1;
    } else if (Math.abs(dx) > w * COMMIT_FRACTION) {
      steps = dx < 0 ? 1 : -1;
    }

    goTo(index + steps);
  };

  // ── which panes exist ───────────────────────────────────────────────
  const live = [index - 1, index, index + 1];
  const offset = -index * width + drag;

  return (
    <main
      ref={rootRef}
      style={styles.root}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
    >
      {live.map((v) => {
        const panel = PANELS[wrapIndex(v)];
        // Distance of this pane from the viewport centre, in px.
        const local = v * width + offset;
        return (
          <section
            key={v}
            style={{
              ...styles.pane,
              transform: `translate3d(${local}px,0,0)`,
              transition: animating ? `transform ${SNAP_MS}ms cubic-bezier(.22,.61,.36,1)` : 'none',
            }}
            aria-hidden={v !== index}
          >
            {/* Backdrop drifts slower than the pane — the parallax is what
                sells glass moving past a room rather than sliding divs. */}
            <div
              style={{
                ...styles.bg,
                backgroundImage: `url(${panel.bg})`,
                backgroundPosition: panel.bgPosition,
                transform: `translate3d(${-local * 0.28}px,0,0) scale(1.14)`,
                transition: animating ? `transform ${SNAP_MS}ms cubic-bezier(.22,.61,.36,1)` : 'none',
              }}
            />
            <div style={styles.veil} />

            <div style={styles.paneInner}>
              {panel.kind === 'duilleag' ? (
                <Duilleag profile={profile} initialPosts={initialPosts} />
              ) : (
                <Placeholder panel={panel} language={language} />
              )}
            </div>
          </section>
        );
      })}

      {/* Door handles. Hidden on touch, where the swipe is the control. */}
      <button aria-label="Previous" data-no-drag style={{ ...styles.arrow, left: 14 }} onClick={() => step(-1)}>‹</button>
      <button aria-label="Next" data-no-drag style={{ ...styles.arrow, right: 14 }} onClick={() => step(1)}>›</button>

      <nav style={styles.dots} data-no-drag aria-label="Panels">
        {PANELS.map((p, i) => (
          <button
            key={p.slug}
            onClick={() => step(i - wrapIndex(index))}
            aria-label={p.place.en}
            aria-current={wrapIndex(index) === i}
            style={{ ...styles.dot, ...(wrapIndex(index) === i ? styles.dotOn : null) }}
          />
        ))}
      </nav>
    </main>
  );
}

// A pane whose purpose isn't decided yet: its place, and nothing else.
function Placeholder({ panel, language }) {
  return (
    <div style={styles.placeholder}>
      <p style={styles.placeEyebrow}>{language === 'gd' ? 'Ri thighinn' : 'To come'}</p>
      <h2 style={styles.placeTitle}>{language === 'gd' ? panel.place.gd : panel.place.en}</h2>
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────────

const GOLD = '#C9A047';

const styles = {
  root: {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    background: '#07100C',
    touchAction: 'pan-y',       // vertical scroll stays native; we own horizontal
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  pane: {
    position: 'absolute',
    inset: 0,
    willChange: 'transform',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    willChange: 'transform',
  },
  // Darkened at the edges where the columns sit, easing off toward the
  // middle so the photograph still reads.
  veil: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(120% 90% at 50% 45%, rgba(4,10,8,0.10) 0%, rgba(4,10,8,0.42) 55%, rgba(4,10,8,0.74) 100%),' +
      'linear-gradient(to bottom, rgba(4,10,8,0.55) 0%, rgba(4,10,8,0.12) 22%, rgba(4,10,8,0.20) 100%)',
  },
  paneInner: { position: 'absolute', inset: 0, display: 'flex' },

  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 20,
    width: 40,
    height: 64,
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(8,16,12,0.42)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    color: 'rgba(255,255,255,0.78)',
    fontSize: 26,
    lineHeight: 1,
    cursor: 'pointer',
  },
  dots: {
    position: 'absolute',
    bottom: 18,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 20,
    display: 'flex',
    gap: 9,
  },
  dot: {
    width: 7, height: 7, padding: 0, borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.45)',
    background: 'transparent', cursor: 'pointer',
  },
  dotOn: { background: GOLD, borderColor: GOLD },

  placeholder: {
    margin: 'auto',
    textAlign: 'center',
    padding: 24,
  },
  placeEyebrow: {
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)', margin: 0,
  },
  placeTitle: {
    fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
    fontSize: 'clamp(34px, 6vw, 64px)', letterSpacing: '0.06em',
    color: '#FFFFFF', margin: '8px 0 0', textShadow: '0 2px 24px rgba(0,0,0,0.6)',
  },
};
