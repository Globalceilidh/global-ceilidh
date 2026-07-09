'use client'

// The marble scene.
//
// Layers, back-to-front:
//   1. Vortex canvas (Three.js) — the sea. Reuses the shader from
//      /AnTonn/preview/components/VortexBackground.js. Mouse steers
//      the flow direction, unchanged.
//   2. Marble aesthetic — a large circular vignette + rim highlight
//      centred on viewport. This is the "you're inside a plexiglass
//      sphere" cue. No Three.js sphere — a CSS overlay is enough to
//      read as "curved lens over the vortex" and it doesn't fight the
//      pills for legibility.
//   3. Outer sea vignette — the corners of the viewport read darker
//      than the marble interior so the eye lands on the pills.
//   4. Four pill-buttons in a 2×2 grid, centred. Each pill is a large
//      white capsule with its label cut out as a hole (SVG <mask>).
//      Through the letter-shaped holes you see the vortex. This is the
//      signature move — the vortex breathing through the type.
//   5. Wordmark top-centre.

import { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import VortexBackground from '../preview/components/VortexBackground'

const PILLS = [
  { id: 'ceol',          label: 'Ceòl' },
  { id: 'bhidio',        label: 'Bhidio' },
  { id: 'podcraoladh',   label: 'Pod-chraoladh' },
  { id: 'leabhraichean', label: 'Leabhraichean' },
]

export default function MarbleClient() {
  const [mouseUv, setMouseUv] = useState({ x: 0.5, y: 0.5 })
  const [reduceMotion, setReduceMotion] = useState(false)
  const [docHidden, setDocHidden] = useState(false)
  const [viewport, setViewport] = useState({ w: 1920, h: 1080 })
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const handler = (e) => setReduceMotion(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  useEffect(() => {
    const handler = () => setDocHidden(document.hidden)
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  const onPointerMove = (e) => {
    if (viewport.w && viewport.h) {
      setMouseUv({ x: e.clientX / viewport.w, y: e.clientY / viewport.h })
    }
  }

  const intensity = hovered ? 0.55 : 0.28

  // Marble diameter — 82% of the smaller viewport dimension. Fits pills
  // with breathing room on desktop; scales down cleanly on phones.
  const marbleSize = Math.min(viewport.w, viewport.h) * 0.82

  const onPillClick = (pill) => {
    // Placeholder — the click-through-vortex transition + second-chamber
    // build comes after the steady-state read is approved.
    // eslint-disable-next-line no-console
    console.log('[marble]', pill.id, 'clicked — chamber transition not built yet')
  }

  return (
    <div style={containerStyle} onPointerMove={onPointerMove}>
      {/* 1. Vortex canvas — the sea */}
      <div style={canvasLayerStyle}>
        <Canvas
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 0.01], fov: 90, near: 0.01, far: 100 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <VortexBackground
            intensity={intensity}
            mouseUv={mouseUv}
            paused={docHidden || reduceMotion}
          />
        </Canvas>
      </div>

      {/* 2. Marble aesthetic — circular "you're inside a bubble" cue */}
      <div
        style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: marbleSize, height: marbleSize,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at 32% 28%,
              rgba(255,255,255,0.08) 0%,
              rgba(255,255,255,0.03) 26%,
              rgba(255,255,255,0.00) 52%)
          `,
          boxShadow: `
            inset 0 0 80px rgba(255,255,255,0.06),
            inset -30px -35px 140px rgba(0,10,30,0.60),
            inset 30px 30px 100px rgba(200,220,255,0.09),
            0 0 100px rgba(120,180,255,0.14)
          `,
          border: '1px solid rgba(200,220,255,0.10)',
          zIndex: 4,
        }}
      />

      {/* 3. Outer sea vignette — makes the corners read as deeper water */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse at center,
              rgba(2,4,9,0) 42%,
              rgba(2,4,9,0.72) 88%)
          `,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* 4. Four pill-buttons — vortex through the letterforms */}
      <div style={pillGridStyle}>
        {PILLS.map((pill) => (
          <Pill
            key={pill.id}
            label={pill.label}
            hovered={hovered === pill.id}
            onEnter={() => setHovered(pill.id)}
            onLeave={() => setHovered((h) => (h === pill.id ? null : h))}
            onClick={() => onPillClick(pill)}
          />
        ))}
      </div>

      {/* 5. Wordmark */}
      <div style={topWordmarkStyle}>
        <div style={{
          fontFamily: 'Cinzel, Georgia, serif',
          fontSize: 15, letterSpacing: 6, fontWeight: 600,
        }}>AN TONN</div>
        <div style={{
          fontFamily: '"IBM Plex Mono", Menlo, monospace',
          fontSize: 9, letterSpacing: 2, opacity: 0.55, marginTop: 4,
        }}>THE ENTERTAINMENT WING · GLOBAL CÈILIDH</div>
      </div>

      <div style={helpStyle}>Move your cursor — the vortex follows</div>
    </div>
  )
}

// A single pill. The SVG mask trick: the pill is a white rounded rect.
// A <mask> is drawn where white = "show", black = "cut out". We draw
// the pill body in white and the text in black inside the mask, so the
// rendered rect has letter-shaped holes. The vortex canvas sits behind
// everything, so those holes reveal the vortex through the type.
function Pill({ label, hovered, onEnter, onLeave, onClick }) {
  // Stable ID per label so multiple pills' masks don't collide.
  const maskId = useMemo(
    () => `pill-mask-${label.replace(/[^a-z0-9]/gi, '').toLowerCase()}`,
    [label]
  )

  const W = 340
  const H = 96
  const R = 48

  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onClick}
      aria-label={label}
      style={{
        border: 'none', background: 'transparent', padding: 0,
        cursor: 'pointer', display: 'block',
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
        transition: 'transform 260ms ease, filter 260ms ease',
        filter: hovered
          ? 'drop-shadow(0 0 22px rgba(255,255,255,0.55)) drop-shadow(0 8px 18px rgba(0,0,0,0.35))'
          : 'drop-shadow(0 6px 22px rgba(0,0,0,0.45))',
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width={W} height={H} rx={R} ry={R} fill="white" />
            <text
              x="50%" y="50%"
              textAnchor="middle" dominantBaseline="central"
              fontFamily="Cinzel, Georgia, serif"
              fontSize="36"
              fontWeight="700"
              letterSpacing="4"
              fill="black"
            >
              {label.toUpperCase()}
            </text>
          </mask>
        </defs>
        <rect
          x="0" y="0" width={W} height={H} rx={R} ry={R}
          fill="rgba(255,255,255,0.96)"
          mask={`url(#${maskId})`}
        />
      </svg>
    </button>
  )
}

const containerStyle = {
  position: 'fixed', inset: 0,
  background: '#020409',
  overflow: 'hidden',
  cursor: 'default',
  touchAction: 'none',
}
const canvasLayerStyle = { position: 'absolute', inset: 0, zIndex: 0 }
const pillGridStyle = {
  position: 'absolute',
  left: '50%', top: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'grid',
  gridTemplateColumns: 'repeat(2, auto)',
  gap: '28px 34px',
  zIndex: 20,
}
const topWordmarkStyle = {
  position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)',
  color: '#F2ECDC', textAlign: 'center', zIndex: 15, pointerEvents: 'none',
}
const helpStyle = {
  position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)',
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10, letterSpacing: 1.5,
  color: 'rgba(242,236,220,0.42)',
  pointerEvents: 'none', zIndex: 15,
}
