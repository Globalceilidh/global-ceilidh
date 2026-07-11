'use client'

// Shared sandbox surface for the four AnTonn vertical test pages
// (Ceòl, Bhidio, Leabhraichean, Pod-chraoladh). Same chrome as the
// parent /AnTonn/test — Sniomh homepage icon top-left, Let's Talk pill
// top-right, EN/GD slider bottom-right — plus the wave shader in the
// background, with per-vertical tonal palette.
//
// Props:
//   background — any CSS colour string used as the page bg fallback.
//   waveBase   — hex string for the wave's still-water colour. Set
//                this to the same value as `background` so the wave
//                surface and page bg read as one continuous colour.
//   waveMod    — hex string for the wave's ripple accent colour.
//                Ripples brighten toward this shade — usually a lighter
//                complementary tone of the same palette.

import Link from 'next/link'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import LanguagePill from '../../../components/LanguagePill'
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
      />

      {/* Top-left brand strip: Sniomh (GlobalCeilidh home link) — dash —
          An Tonn wordmark (links back to the /AnTonn/test parent surface
          where all four vertical entrances live). Both icons at the same
          180x180 footprint. Assets reused from /AnTonn/test so we ship
          one copy of each. */}
      <div style={topLeftGroupStyle}>
        <Link href="/" style={iconLinkStyle} aria-label="GlobalCeilidh home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/AnTonn/test/sniomh.png"
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

      {/* EN ⇄ GD slider — bottom-right, mirroring the top-right pill. */}
      <LanguagePill
        position="bottom-right"
        layout="toggle"
        variant="white"
        offsetBottom={56}
        offsetRight={30}
      />
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
  gap: 14,
  zIndex: 30,
}

// Each icon (sniomh, An Tonn wordmark) sits in a fixed 180x180 box
// so they read as peers of the same visual weight.
const iconLinkStyle = {
  display: 'block',
  width: 180,
  height: 180,
  lineHeight: 0,
}

const iconImgStyle = {
  width: '100%',
  height: '100%',
  display: 'block',
  userSelect: 'none',
}

// Small dash between the two icons. Bebas Neue-ish weight, cream
// colour so it stays readable on every vertical's tonal background.
const dashStyle = {
  color: 'rgba(242, 236, 220, 0.72)',
  fontFamily:
    'var(--font-bebas-neue), "Bebas Neue", Impact, "Arial Black", sans-serif',
  fontSize: 40,
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
