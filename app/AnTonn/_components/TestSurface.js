'use client'

// Shared sandbox surface for the four AnTonn vertical test pages
// (Ceòl, Bhidio, Leabhraichean, Pod-chraoladh). Same chrome as the
// parent /AnTonn/test — Coingeal homepage icon top-left, Let's Talk pill
// top-right, EN/GD slider bottom-right — plus the wave shader in the
// background, with per-vertical tonal palette.
//
// Props:
//   background     — any CSS colour string used as the page bg fallback.
//   waveBase       — hex string for the wave's still-water colour. Set
//                    this to the same value as `background` so the wave
//                    surface and page bg read as one continuous colour.
//   waveMod        — hex string for the wave's ripple accent colour.
//                    Ripples brighten toward this shade — usually a
//                    lighter complementary tone of the same palette.
//   waveIntensity  — scales the wave brightness. Default 0.4 keeps the
//                    coloured vertical surfaces from reading too loud;
//                    the AnTonn/test parent page bypasses TestSurface
//                    and gets the full 1.0 shader.

import Link from 'next/link'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import LanguagePill from '../../../components/LanguagePill'
import RadioBot from '../../../components/RadioBot'
import { useLanguage } from '../../../context/LanguageContext'

// SSR-off — the canvas uses WebGL which needs `window`. Also lazy-loads
// the R3F bundle so it doesn't block first paint.
const WaveBackground = dynamic(
  () => import('../test/WaveBackground'),
  { ssr: false },
)

export default function TestSurface({
  background = '#000000',
  waveBase,
  waveMod = '#242830',
  waveIntensity = 0.4,
  wordmarkSrc,
  wordmarkAlt = '',
  wordmarkText,
  children,
}) {
  const { t } = useLanguage()

  // Cursor position ref, mutated on every pointermove. WaveBackground
  // reads this each frame; no React state = no re-renders on mousemove.
  const mouseRef = useRef({ x: -1, y: -1 })
  const onPointerMove = (e) => {
    mouseRef.current.x = e.clientX
    mouseRef.current.y = e.clientY
  }

  // Default waveBase to the page bg so the still-water colour blends
  // seamlessly with the fallback bg on any browser without WebGL.
  const resolvedWaveBase = waveBase || background

  return (
    <div style={{ ...pageStyle, background }} onPointerMove={onPointerMove}>
      <WaveBackground
        mouseRef={mouseRef}
        baseColor={resolvedWaveBase}
        modColor={waveMod}
        intensityScale={waveIntensity}
      />

      {/* Top-left brand strip: Coingeal (GlobalCeilidh home link) — dash —
          An Tonn wordmark (links back to the /AnTonn/test parent surface
          where all four vertical entrances live). Both icons at the same
          180x180 footprint. Assets reused from /AnTonn/test so we ship
          one copy of each. */}
      <div style={topLeftGroupStyle}>
        <Link href="/" style={iconLinkStyle} aria-label="GlobalCeilidh home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/AnTonn/test/coingeal.png"
            alt="GlobalCeilidh — home"
            style={iconImgStyle}
            draggable={false}
          />
        </Link>
        <span style={dashStyle} aria-hidden="true">—</span>
        <Link href="/AnTonn/test" style={iconLinkStyle} aria-label="An Tonn">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/AnTonn/test/antonn-wordmark.png"
            alt="An Tonn"
            style={iconImgStyle}
            draggable={false}
          />
        </Link>
      </div>

      {/* Let's Talk pill — matches /AnTonn/radio, /AnTonn/marble,
          /AnTonn/test. */}
      <a href="/contact" style={letsTalkStyle}>{t('common.lets_talk')}</a>

      {/* Optional centred vertical wordmark (Bhidio, Ceòl, etc.) —
          alpha-keyed PNG, hangs at the top of the surface between the
          two top-corner pills, above the page content. */}
      {wordmarkSrc && (
        <div style={wordmarkWrapStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={wordmarkSrc}
            alt={wordmarkAlt}
            style={wordmarkImgStyle}
            draggable={false}
          />
        </div>
      )}

      {/* Text-only wordmark fallback for verticals that don't yet
          have a designed image. Bebas Neue centred at the top. */}
      {!wordmarkSrc && wordmarkText && (
        <div style={wordmarkTextStyle}>{wordmarkText}</div>
      )}

      {/* Page-specific content slot. Sits between the chrome
          (brand strip, pills, wave) as the middle of the surface. */}
      {children}

      {/* EN ⇄ GD slider — bottom-right, mirroring the top-right pill. */}
      <LanguagePill
        position="bottom-right"
        layout="toggle"
        variant="white"
        offsetBottom={56}
        offsetRight={30}
      />

      {/* Reidio bot — persistent radio control, bottom-left. Reads
          state from RadioProvider at the app root, so playback
          survives navigation to another test page. */}
      <RadioBot />
    </div>
  )
}

const pageStyle = {
  position: 'fixed',
  inset: 0,
  overflow: 'hidden',
}

// Flex row anchoring the two brand icons in the top-left corner.
const topLeftGroupStyle = {
  position: 'absolute',
  top: 30,
  left: 30,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  zIndex: 30,
}

// Each icon (coingeal, An Tonn wordmark) sits in a fixed 90x90 box —
// halved from the previous 180x180 so the chrome takes less of the
// page real estate now that the verticals carry their own content.
const iconLinkStyle = {
  display: 'block',
  width: 90,
  height: 90,
  lineHeight: 0,
}

const iconImgStyle = {
  width: '100%',
  height: '100%',
  display: 'block',
  userSelect: 'none',
}

// Centred wordmark (Bhidio marquee, etc.). The source PNGs are square
// canvases with the wordmark occupying the middle band, so a negative
// top pulls the visible art toward the top of the viewport while the
// transparent padding sits above the viewport line. Sized generously
// so wordmarks that include decorative frames (like the Bhidio cinema
// marquee) read at real size.
const wordmarkWrapStyle = {
  position: 'absolute',
  top: -95,
  left: 0,
  right: 0,
  margin: '0 auto',
  width: 'min(32vw, 350px)',
  lineHeight: 0,
  pointerEvents: 'none',
  zIndex: 20,
}
const wordmarkImgStyle = {
  width: '100%',
  height: 'auto',
  display: 'block',
  userSelect: 'none',
}

// Text-only wordmark for verticals still awaiting a designed image.
const wordmarkTextStyle = {
  position: 'absolute',
  top: 40,
  left: 0,
  right: 0,
  textAlign: 'center',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, "Arial Black", sans-serif',
  fontWeight: 400,
  fontSize: 'clamp(36px, 5vw, 60px)',
  letterSpacing: '0.12em',
  color: 'rgba(242, 236, 220, 0.94)',
  textShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
  pointerEvents: 'none',
  zIndex: 20,
  userSelect: 'none',
}

// Small dash between the two icons. Bebas Neue-ish weight, cream
// colour so it stays readable on every vertical's tonal background.
const dashStyle = {
  color: 'rgba(242, 236, 220, 0.72)',
  fontFamily:
    'var(--font-bebas-neue), "Bebas Neue", Impact, "Arial Black", sans-serif',
  fontSize: 24,
  fontWeight: 400,
  lineHeight: 1,
  userSelect: 'none',
  pointerEvents: 'none',
}

// White pill matching every other AnTonn corner pill.
const letsTalkStyle = {
  position: 'absolute',
  top: 56,
  right: 30,
  padding: '11px 26px',
  borderRadius: 999,
  background: '#FFFFFF',
  color: '#0A0D14',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif',
  fontWeight: 400,
  fontSize: 18,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  zIndex: 30,
  transition: 'transform 220ms ease, box-shadow 220ms ease',
}
