'use client'

// Video wall for /AnTonn/bhidio/test — full-viewport-width flex layout.
//
// Six category columns fill the width edge to edge. Each column has a
// sticky category header at the top and scrolls its own list of video
// cards independently — vertical wheel/touch on a column moves only
// that column, so users can browse deep down one category while the
// others sit still. "Free floating" per Whitey's brief.
//
// A subtle rotateY per column gives a gentle curve — not a cylinder,
// just a slight bend toward the viewer at the edges. No overlap,
// no cylinder-projection math.
//
// Card click → the whole wall replaces itself with a large video
// player that takes up the same footprint. Close returns to the grid.

import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'

const CATEGORIES = [
  { slug: 'music',       en: 'Music',        gd: 'Ceòl' },
  { slug: 'educational', en: 'Educational',  gd: 'Foghlam' },
  { slug: 'comedy',      en: 'Comedy',       gd: 'Èibhinn' },
  { slug: 'drama',       en: 'Drama',        gd: 'Dràma' },
  { slug: 'documentary', en: 'Documentary',  gd: 'Aithriseachail' },
  { slug: 'live',        en: 'Live Sessions', gd: 'Seiseanan Beò' },
]

// Placeholder card set. Each category gets 12 for now so the columns
// have real vertical content to scroll. Titles include the category
// slug so debugging is obvious. Real content comes from the video
// source pipeline later.
function generateCards(slug) {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `${slug}-${String(i + 1).padStart(2, '0')}`,
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} · Nº ${String(i + 1).padStart(2, '0')}`,
    duration: `${Math.floor(2 + Math.random() * 8)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
  }))
}

// Inner-bend curve tuning. Wall curves TOWARD the viewer: the outer
// columns sit near the front, the middle columns recede — same shape
// as a wraparound cinema screen wrapping around the audience.
//
// Every column gets both a rotateY (tilt so it faces the viewer's
// centre) AND a translateZ (position along the depth axis). Both
// scale with distance from the row's centre:
//
//   TILT_PER_UNIT   — degrees of tilt per unit of distance from centre.
//                     Sign is inverted so outer columns face inward
//                     (right column tilts left, left column tilts right).
//   DEPTH_PER_UNIT² — px of depth per unit-distance SQUARED. Quadratic
//                     so the middle recedes smoothly rather than
//                     stepping; edges stay near Z=0.
//
// With 6 columns (index 0..5, centre at 2.5), MAX_OFFSET² = 6.25:
//   col 0 : dist 2.5 → tilt +10°, depth ~0px    (near the viewer)
//   col 1 : dist 1.5 → tilt  +6°, depth ~60px   behind
//   col 2 : dist 0.5 → tilt  +2°, depth ~90px   behind
//   col 3 : dist 0.5 → tilt  -2°, depth ~90px   behind
//   col 4 : dist 1.5 → tilt  -6°, depth ~60px   behind
//   col 5 : dist 2.5 → tilt -10°, depth ~0px    (near the viewer)
const TILT_PER_UNIT = 4
const DEPTH_PER_UNIT2 = 15

export default function VideoWallCurved() {
  const { language } = useLanguage()
  const [selected, setSelected] = useState(null)

  if (selected) {
    return <VideoPlayer video={selected} onClose={() => setSelected(null)} />
  }

  const centre = (CATEGORIES.length - 1) / 2
  const maxOffset2 = centre * centre

  return (
    <div style={wallStyle}>
      {CATEGORIES.map((cat, i) => {
        const offset = i - centre
        // Negative sign so left columns tilt right (positive rotateY)
        // and right columns tilt left — both facing inward toward the
        // viewer's centre.
        const tilt = -offset * TILT_PER_UNIT
        // Middle columns get the most depth; edges near Z=0. Same
        // quadratic ramp, just inverted around max² so the ramp
        // curves the middle back instead of the edges.
        const depth = (maxOffset2 - offset * offset) * DEPTH_PER_UNIT2
        return (
          <div
            key={cat.slug}
            style={{
              ...columnStyle,
              transform: `translateZ(${-depth}px) rotateY(${tilt}deg)`,
            }}
          >
            <div style={headerStyle}>
              {language === 'gd' ? cat.gd : cat.en}
            </div>
            <div style={cardsWrapStyle}>
              {generateCards(cat.slug).map((card) => (
                <VideoCard key={card.id} {...card} onSelect={() => setSelected(card)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function VideoCard({ title, duration, onSelect }) {
  return (
    <button type="button" onClick={onSelect} style={cardStyle}>
      <div style={thumbStyle}>
        <span style={durationStyle}>{duration}</span>
      </div>
      <div style={titleStyle}>{title}</div>
    </button>
  )
}

// Full-viewport video player that replaces the wall on card select.
// Placeholder body for now — swap to a YouTube <iframe> or <video>
// element when real video IDs arrive.
function VideoPlayer({ video, onClose }) {
  return (
    <div style={playerStyle}>
      <button type="button" onClick={onClose} style={closeButtonStyle}>
        ← Back to wall
      </button>
      <div style={playerScreenStyle}>
        <div style={playerPlaceholderStyle}>
          <p style={playerLabelStyle}>Now playing</p>
          <h2 style={playerTitleStyle}>{video.title}</h2>
          <p style={playerDurationStyle}>{video.duration}</p>
        </div>
      </div>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────

// The wall fills the viewport. Top and bottom padding leave room for
// the wordmark header + brand strip on top and the language pill on
// bottom. Horizontal padding is minimal — Whitey wants edge-to-edge.
const wallStyle = {
  position: 'fixed',
  top: 203,
  bottom: 90,
  left: 12,
  right: 12,
  display: 'flex',
  gap: 12,
  // Perspective tighter now that outer columns actually recede on Z —
  // 1600 gives a visible ~6% shrink at the deepest columns without
  // fish-eyeing the middle.
  perspective: '1600px',
  perspectiveOrigin: '50% 45%',
  zIndex: 2,
  pointerEvents: 'none',
}

// Each column: equal flex share, own scroll container with sticky
// header inside. rotateY comes in per-column so we can vary it.
const columnStyle = {
  flex: '1 1 0',
  minWidth: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  transformOrigin: 'center 40%',
  background: 'rgba(46, 8, 18, 0.28)',
  border: '1px solid rgba(242, 236, 220, 0.06)',
  borderRadius: 6,
  boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(242,236,220,0.18) transparent',
  pointerEvents: 'auto',
}

// Sticky header keeps the category name pinned at the top of its
// column even as the card list scrolls beneath it.
const headerStyle = {
  position: 'sticky',
  top: 0,
  padding: '12px 8px',
  fontFamily: 'var(--font-bebas-neue), Impact, sans-serif',
  fontSize: 16,
  fontWeight: 400,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(242, 236, 220, 0.94)',
  textAlign: 'center',
  background: 'rgba(20, 4, 10, 0.82)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderBottom: '1px solid rgba(242, 236, 220, 0.14)',
  zIndex: 2,
}

const cardsWrapStyle = {
  padding: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const cardStyle = {
  display: 'block',
  width: '100%',
  padding: 0,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  color: 'inherit',
}

const thumbStyle = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  background:
    'linear-gradient(160deg, rgba(70, 12, 24, 0.85), rgba(20, 4, 10, 0.95))',
  border: '1px solid rgba(242, 236, 220, 0.10)',
  borderRadius: 4,
  boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
  overflow: 'hidden',
}

const durationStyle = {
  position: 'absolute',
  right: 6,
  bottom: 6,
  padding: '2px 6px',
  background: 'rgba(0, 0, 0, 0.6)',
  color: 'rgba(242, 236, 220, 0.9)',
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  letterSpacing: 0.5,
  borderRadius: 2,
}

const titleStyle = {
  marginTop: 5,
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 12,
  color: 'rgba(242, 236, 220, 0.78)',
  lineHeight: 1.35,
  textAlign: 'center',
}

// ── Player (post-click) styles ───────────────────────────────────────

const playerStyle = {
  position: 'fixed',
  top: 170,
  bottom: 90,
  left: 12,
  right: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  zIndex: 3,
}

const closeButtonStyle = {
  alignSelf: 'flex-start',
  padding: '8px 16px',
  background: 'rgba(46, 8, 18, 0.7)',
  border: '1px solid rgba(242, 236, 220, 0.18)',
  borderRadius: 4,
  color: 'rgba(242, 236, 220, 0.94)',
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 12,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
}

// The screen that replaces the wall — spans the same footprint the
// grid did, so the transition reads as "the wall becomes the screen".
const playerScreenStyle = {
  flex: '1 1 auto',
  background: 'linear-gradient(180deg, rgba(46, 8, 18, 0.5), rgba(10, 2, 6, 0.85))',
  border: '1px solid rgba(242, 236, 220, 0.10)',
  borderRadius: 6,
  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const playerPlaceholderStyle = {
  textAlign: 'center',
  color: 'rgba(242, 236, 220, 0.9)',
}

const playerLabelStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 11,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  color: 'rgba(242, 236, 220, 0.55)',
  margin: '0 0 8px',
}

const playerTitleStyle = {
  fontFamily: 'var(--font-bebas-neue), Impact, sans-serif',
  fontSize: 42,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: '0 0 12px',
  color: 'rgba(242, 236, 220, 0.98)',
}

const playerDurationStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 12,
  letterSpacing: '0.16em',
  color: 'rgba(242, 236, 220, 0.6)',
  margin: 0,
}
