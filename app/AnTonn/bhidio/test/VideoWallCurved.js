'use client'

// Deep-cylindrical video wall for /AnTonn/bhidio/test.
//
// Six category columns arranged on the inside of a cylinder around the
// viewer — Music, Educational, Comedy, Drama, Documentary, Live Sessions.
// Each column stacks a category header + 4 rectangular video cards
// (16:9). Cards are placeholders for now — real content wires in later
// when we start sourcing YouTube video IDs (thumbnails come free from
// https://img.youtube.com/vi/{ID}/hqdefault.jpg).
//
// Geometry:
//   - 18° per column, 6 columns → 90° total arc across the viewer's field.
//   - Radius R = 820px (each column sits that distance behind the
//     perspective plane, on the wall of the cylinder).
//   - Perspective = 1200px (moderately deep — not fish-eye, not flat).
//
// Layout is CSS 3D only; no external libs. Reduced-motion users get a
// flat row (no curve) so they don't need to parse 3D perspective.

import { useLanguage } from '../../../../context/LanguageContext'

const CATEGORIES = [
  { slug: 'music',       en: 'Music',        gd: 'Ceòl' },
  { slug: 'educational', en: 'Educational',  gd: 'Foghlam' },
  { slug: 'comedy',      en: 'Comedy',       gd: 'Èibhinn' },
  { slug: 'drama',       en: 'Drama',        gd: 'Dràma' },
  { slug: 'documentary', en: 'Documentary',  gd: 'Aithriseachail' },
  { slug: 'live',        en: 'Live Sessions', gd: 'Seiseanan Beò' },
]

const STEP_DEG = 18
// RADIUS + perspective set the apparent scale of the wall. Pulling the
// radius in from 820 → 620 and stretching the perspective from 1200 →
// 1600 brings the whole wall closer and cuts back the foreshortening,
// so cards read much bigger without changing the curve depth.
const RADIUS_PX = 620
const COL_W = 340
const COL_H = 820

// Four placeholder cards per column, common across all categories for
// now. Titles + durations are stand-ins; real values arrive with the
// video source data.
const PLACEHOLDER_CARDS = [
  { title: 'Sruth · Nº 01', duration: '4:12' },
  { title: 'Sruth · Nº 02', duration: '2:56' },
  { title: 'Sruth · Nº 03', duration: '5:03' },
  { title: 'Sruth · Nº 04', duration: '3:24' },
]

export default function VideoWallCurved() {
  const { language } = useLanguage()

  return (
    <div style={perspectiveStyle}>
      {CATEGORIES.map((cat, i) => {
        const angle = (i - (CATEGORIES.length - 1) / 2) * STEP_DEG
        return (
          <div
            key={cat.slug}
            style={{
              ...columnStyle,
              transform: `rotateY(${angle}deg) translateZ(-${RADIUS_PX}px)`,
            }}
          >
            <div style={headerStyle}>
              {language === 'gd' ? cat.gd : cat.en}
            </div>
            {PLACEHOLDER_CARDS.map((card, j) => (
              <VideoCard key={j} {...card} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function VideoCard({ title, duration }) {
  return (
    <div style={cardStyle}>
      <div style={thumbStyle}>
        <span style={durationStyle}>{duration}</span>
      </div>
      <div style={titleStyle}>{title}</div>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────

// Fills the viewport, establishes perspective + preserve-3d for the
// columns. z-index: 2 explicitly stacks the wall ABOVE the wave canvas
// — without it, the wave's GPU-composited canvas (position:fixed, no
// z-index) can end up compositing on top of the wall on some browsers,
// which is what caused the "flash then disappear" bug: the wall painted
// for a frame at its layout position, then the wave layer covered it.
// position:fixed keeps the wall and the wave in the same coordinate
// space so there's no ambiguity about which one is on top.
const perspectiveStyle = {
  position: 'fixed',
  inset: 0,
  perspective: '1600px',
  perspectiveOrigin: '50% 50%',
  transformStyle: 'preserve-3d',
  pointerEvents: 'none',
  zIndex: 2,
}

// One category column: fixed COL_W x COL_H box positioned via calc so
// its centre sits exactly on the viewport centre before the 3D transform
// rotates it out onto the cylinder wall. Fixed dims (no auto sizing)
// keep the layout deterministic — auto-sized 3D-transformed elements
// were the source of the earlier "flash then disappear" bug where the
// column briefly rendered at top-left then jumped off-screen.
const columnStyle = {
  position: 'absolute',
  top: `calc(50% - ${COL_H / 2}px)`,
  left: `calc(50% - ${COL_W / 2}px)`,
  width: COL_W,
  height: COL_H,
  transformOrigin: 'center center',
  transformStyle: 'preserve-3d',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  pointerEvents: 'auto',
}

const headerStyle = {
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontSize: 18,
  fontWeight: 400,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(242, 236, 220, 0.92)',
  paddingBottom: 8,
  borderBottom: '1px solid rgba(242, 236, 220, 0.18)',
  textAlign: 'center',
}

const cardStyle = {
  cursor: 'pointer',
  transition: 'transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1), box-shadow 220ms ease',
}

const thumbStyle = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  background:
    'linear-gradient(160deg, rgba(70, 12, 24, 0.85), rgba(20, 4, 10, 0.95))',
  border: '1px solid rgba(242, 236, 220, 0.10)',
  borderRadius: 4,
  boxShadow: '0 10px 28px rgba(0,0,0,0.55)',
  overflow: 'hidden',
}

const durationStyle = {
  position: 'absolute',
  right: 8,
  bottom: 8,
  padding: '2px 6px',
  background: 'rgba(0, 0, 0, 0.6)',
  color: 'rgba(242, 236, 220, 0.9)',
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  letterSpacing: 0.5,
  borderRadius: 2,
}

const titleStyle = {
  marginTop: 6,
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 13,
  color: 'rgba(242, 236, 220, 0.78)',
  lineHeight: 1.35,
  textAlign: 'center',
}
