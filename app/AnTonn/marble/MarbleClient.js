'use client'

// The marble scene — invisible sphere edition.
//
// Mental model:
//   The camera is at the exact center of an invisible sphere. The user
//   IS the camera. Four pill-buttons — stacked vertically, close
//   together — sit on the inside surface of that sphere directly in
//   front of the camera. Drag anywhere on screen to rotate the SPHERE
//   around the camera (yaw + pitch, both free, both wrap). The pills
//   move as a rigid group along the interior of the sphere.
//
// The marble itself is never drawn. The illusion of "you are inside
// something curved" comes entirely from how the pill stack foreshortens
// and tilts as it approaches the screen edges — CSS 3D perspective
// does the geometry.
//
// Layer stack (back to front):
//   0. Vortex canvas — the sea. Always visible everywhere the pills
//      aren't. Mouse steers the flow (unchanged from /preview).
//   10. 3D perspective stage. Camera at center of an invisible sphere
//       of radius R. The pill stack is placed at translateZ(-R) inside
//       a rotator; drag updates rotator's rotateY/rotateX. All four
//       pills orbit the sphere together as one plane, foreshortening
//       correctly at any angle.
//   15. Wordmark + help text.
//
// Each pill uses the SVG-mask trick: its label is a hole cut through
// the white capsule, so wherever the pill is on-screen, the vortex
// behind it shows through the letters.

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import VortexBackground from '../preview/components/VortexBackground'

const PILLS = [
  { id: 'ceol',          label: 'Ceòl' },
  { id: 'bhidio',        label: 'Bhidio' },
  { id: 'podcraoladh',   label: 'Pod-chraoladh' },
  { id: 'leabhraichean', label: 'Leabhraichean' },
]

// Sphere geometry (all in px)
const R = 900              // radius of the invisible sphere
const PERSPECTIVE = 1200   // CSS perspective distance
// Screen displacement per radian ≈ P·R / (P+R) ≈ 514px, so drag→pill
// motion feels ~1:1 at 1/514 rad/px. Nudged slightly up so the sphere
// feels responsive without being twitchy.
const DRAG_RAD_PER_PX = 0.0022
const MOMENTUM_FRICTION = 0.945
const MOMENTUM_MIN = 0.00015
const DRAG_THRESHOLD_PX = 5

const PILL_W = 380
const PILL_H = 92
const PILL_GAP = 14

export default function MarbleClient() {
  const [mouseUv, setMouseUv] = useState({ x: 0.5, y: 0.5 })
  const [reduceMotion, setReduceMotion] = useState(false)
  const [docHidden, setDocHidden] = useState(false)
  const [viewport, setViewport] = useState({ w: 1920, h: 1080 })
  const [hovered, setHovered] = useState(null)
  const [yaw, setYaw] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const dragStart = useRef(null)
  const wasDraggingRef = useRef(false)
  const velSamples = useRef([])
  const momentumRaf = useRef(null)

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

  useEffect(() => {
    return () => {
      if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current)
    }
  }, [])

  const cancelMomentum = useCallback(() => {
    if (momentumRaf.current) {
      cancelAnimationFrame(momentumRaf.current)
      momentumRaf.current = null
    }
  }, [])

  const startMomentum = useCallback((vYaw, vPitch) => {
    let curYaw = vYaw
    let curPitch = vPitch
    const tick = () => {
      setYaw((y) => y + curYaw)
      setPitch((p) => p + curPitch)
      curYaw *= MOMENTUM_FRICTION
      curPitch *= MOMENTUM_FRICTION
      if (Math.abs(curYaw) < MOMENTUM_MIN && Math.abs(curPitch) < MOMENTUM_MIN) {
        momentumRaf.current = null
        return
      }
      momentumRaf.current = requestAnimationFrame(tick)
    }
    momentumRaf.current = requestAnimationFrame(tick)
  }, [])

  const onPointerDown = (e) => {
    if (viewport.w && viewport.h) {
      setMouseUv({ x: e.clientX / viewport.w, y: e.clientY / viewport.h })
    }
    if (reduceMotion) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    cancelMomentum()
    setIsDragging(true)
    wasDraggingRef.current = false
    dragStart.current = {
      px: e.clientX, py: e.clientY,
      yaw, pitch,
    }
    velSamples.current = [{ t: performance.now(), x: e.clientX, y: e.clientY }]
  }

  const onPointerMove = (e) => {
    if (viewport.w && viewport.h) {
      setMouseUv({ x: e.clientX / viewport.w, y: e.clientY / viewport.h })
    }
    if (!isDragging || !dragStart.current) return
    const dx = e.clientX - dragStart.current.px
    const dy = e.clientY - dragStart.current.py
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
      wasDraggingRef.current = true
    }
    setYaw(dragStart.current.yaw + dx * DRAG_RAD_PER_PX)
    // Negative dy → pitch up. Positive dy (drag down) → sphere rotates
    // so pills fall toward the bottom. Equivalent: pitch decreases.
    setPitch(dragStart.current.pitch - dy * DRAG_RAD_PER_PX)
    const now = performance.now()
    velSamples.current.push({ t: now, x: e.clientX, y: e.clientY })
    velSamples.current = velSamples.current.filter((s) => now - s.t < 80)
  }

  const onPointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    setIsDragging(false)
    dragStart.current = null
    if (reduceMotion) return
    const samples = velSamples.current
    if (samples.length >= 2 && wasDraggingRef.current) {
      const first = samples[0]
      const last = samples[samples.length - 1]
      const dt = Math.max(last.t - first.t, 1)
      // px/ms → rad/frame (×16ms/frame × rad/px)
      const vYaw = ((last.x - first.x) / dt) * 16 * DRAG_RAD_PER_PX
      const vPitch = -((last.y - first.y) / dt) * 16 * DRAG_RAD_PER_PX
      if (Math.abs(vYaw) >= MOMENTUM_MIN || Math.abs(vPitch) >= MOMENTUM_MIN) {
        startMomentum(vYaw, vPitch)
      }
    }
  }

  const intensity = hovered ? 0.55 : (isDragging ? 0.42 : 0.28)

  const onPillClick = (pill) => {
    if (wasDraggingRef.current) return
    // eslint-disable-next-line no-console
    console.log('[marble]', pill.id, 'clicked — chamber transition not built yet')
  }

  return (
    <div
      style={{ ...containerStyle, cursor: isDragging ? 'grabbing' : 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Vortex canvas — the sea (always visible as background) */}
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

      {/* 3D stage — camera at center of invisible sphere of radius R */}
      <div style={stageStyle}>
        <div style={cameraStyle}>
          <div
            style={{
              position: 'absolute',
              transformStyle: 'preserve-3d',
              transform: `rotateX(${-pitch}rad) rotateY(${yaw}rad) translateZ(-${R}px)`,
              willChange: 'transform',
            }}
          >
            <div style={pillStackStyle}>
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
          </div>
        </div>
      </div>

      {/* Wordmark */}
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

      <div style={helpStyle}>Drag anywhere — the sphere rotates around you</div>
    </div>
  )
}

function Pill({ label, hovered, onEnter, onLeave, onClick }) {
  const maskId = useMemo(
    () => `pill-mask-${label.replace(/[^a-z0-9]/gi, '').toLowerCase()}`,
    [label]
  )
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
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        transformOrigin: 'center',
        transition: 'transform 260ms ease, filter 260ms ease',
        filter: hovered
          ? 'drop-shadow(0 0 22px rgba(255,255,255,0.55))'
          : 'drop-shadow(0 6px 22px rgba(0,0,0,0.42))',
      }}
    >
      <svg
        width={PILL_W} height={PILL_H}
        viewBox={`0 0 ${PILL_W} ${PILL_H}`}
        style={{ display: 'block' }}
      >
        <defs>
          <mask id={maskId}>
            <rect
              x="0" y="0" width={PILL_W} height={PILL_H}
              rx={PILL_H / 2} ry={PILL_H / 2}
              fill="white"
            />
            <text
              x="50%" y="50%"
              textAnchor="middle" dominantBaseline="central"
              fontFamily="Cinzel, Georgia, serif"
              fontSize="36" fontWeight="700" letterSpacing="4"
              fill="black"
            >
              {label.toUpperCase()}
            </text>
          </mask>
        </defs>
        <rect
          x="0" y="0" width={PILL_W} height={PILL_H}
          rx={PILL_H / 2} ry={PILL_H / 2}
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
  touchAction: 'none',
  userSelect: 'none',
}
const canvasLayerStyle = { position: 'absolute', inset: 0, zIndex: 0 }
const stageStyle = {
  position: 'absolute', inset: 0,
  perspective: `${PERSPECTIVE}px`,
  perspectiveOrigin: '50% 50%',
  zIndex: 10,
  // pointerEvents auto so pill clicks land; container's pointer handlers
  // still fire because events bubble from children to the container.
}
const cameraStyle = {
  position: 'absolute',
  left: '50%', top: '50%',
  transformStyle: 'preserve-3d',
}
const pillStackStyle = {
  transform: 'translate(-50%, -50%)',
  display: 'flex', flexDirection: 'column', gap: `${PILL_GAP}px`,
  transformStyle: 'preserve-3d',
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
