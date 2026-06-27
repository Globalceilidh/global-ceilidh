'use client'

// Client shell for the An Tonn cylinder prototype. Mounts the R3F Canvas
// at full viewport, places the vortex background behind a cylinder gallery
// of tiles, and bridges DOM-level drag input to the Three.js scene.
//
// Kept as a single client component for the v1 prototype so the
// vortex/cylinder/control wiring is all in one file and easy to iterate on.
// Will split out detail panel, filter panel, and Air an Tonn overlay as
// they're added in subsequent commits.

import { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import VortexBackground from './components/VortexBackground'
import CylinderGallery from './components/CylinderGallery'
import { useCylinderControls } from './hooks/useCylinderControls'
import { issue as week2 } from './data/week-2026-06-23'

export default function CylinderClient() {
  const { rotation, mouseUv, isDragging, bind } = useCylinderControls()
  const [focusedTile, setFocusedTile] = useState(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [docHidden, setDocHidden] = useState(false)

  // Honour prefers-reduced-motion — falls back to a flat gradient (no
  // shader, no canvas animation). For v1 we just dim everything down; the
  // proper list-view fallback ships in a later commit.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const handler = (e) => setReduceMotion(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  // Pause shader animation when tab is hidden — saves battery on mobile.
  useEffect(() => {
    const handler = () => setDocHidden(document.hidden)
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  // Intensity drives the vortex compression/speed. v1 prototype: ramp up
  // slightly while user is dragging, ramp down when a tile is focused.
  const intensity = useMemo(() => {
    if (focusedTile) return 0.1   // dim and slow when reading a detail
    if (isDragging) return 0.45   // accelerate while user interacts
    return 0.2                    // gentle idle
  }, [isDragging, focusedTile])

  // Compose the issue payload — the cylinder reads `issue.music`,
  // `issue.books`, etc. directly.
  const issuePayload = week2

  return (
    <div
      {...bind}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#020409',
        overflow: 'hidden',
      }}
    >
      {/* Top-left meta */}
      <div style={topLeftStyle}>
        <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontWeight: 600, letterSpacing: 4, fontSize: 14 }}>
          AN TONN
        </div>
        <div style={{ fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 10, opacity: 0.6, marginTop: 2, letterSpacing: 1.5 }}>
          THE CHRONICLE OF THE GÀIDHLIG CURRENT
        </div>
      </div>

      {/* Top-right issue dateline */}
      <div style={topRightStyle}>
        <div style={{ fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 10, opacity: 0.6, letterSpacing: 2 }}>
          ISSUE Nº {String(issuePayload.number).padStart(3, '0')}
        </div>
        <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 13, marginTop: 4, letterSpacing: 1 }}>
          {issuePayload.date_gd.toUpperCase()}
        </div>
        <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 11, opacity: 0.55, marginTop: 1, letterSpacing: 1 }}>
          {issuePayload.date_en}
        </div>
      </div>

      {/* The Canvas */}
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 0.01], fov: 75, near: 0.01, far: 100 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <VortexBackground
          intensity={intensity}
          mouseUv={mouseUv}
          paused={docHidden || reduceMotion}
        />
        <CylinderGallery
          issue={issuePayload}
          rotation={rotation}
          focusedId={focusedTile?.id}
          onTileSelect={setFocusedTile}
        />
      </Canvas>

      {/* Bottom-center nav placeholder — full overlay panels ship in later commits */}
      <div style={bottomNavStyle}>
        <button style={pillStyle} onClick={() => alert('Methodology panel — coming next commit')}>METHODOLOGY</button>
        <button style={pillStyle} onClick={() => alert('Vote panel — coming next commit')}>VOTE</button>
      </div>

      {/* Filter button placeholder (bottom-right) */}
      <button style={filterBtnStyle} onClick={() => alert('Filter panel — coming next commit')}>
        Filter
      </button>

      {/* Focused tile detail — placeholder full-screen overlay until the proper
          detail panel ships in the next commit */}
      {focusedTile && (
        <div style={detailOverlayStyle} onClick={() => setFocusedTile(null)}>
          <div style={detailCardStyle} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtnStyle} onClick={() => setFocusedTile(null)}>×</button>
            <div style={{ fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 10, opacity: 0.5, letterSpacing: 2 }}>
              {(focusedTile.tags || []).join(' · ').toUpperCase()}
            </div>
            <h2 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 36, fontWeight: 600, margin: '12px 0 4px', color: '#F2ECDC' }}>
              {focusedTile.title}
            </h2>
            <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 16, opacity: 0.7, marginBottom: 20, color: '#C9A047' }}>
              {focusedTile.creator}{focusedTile.year ? ` · ${focusedTile.year}` : ''}
            </div>
            <p style={{ fontFamily: 'EB Garamond, Georgia, serif', fontSize: 16, lineHeight: 1.6, color: '#E8DCC8', marginBottom: 24 }}>
              {focusedTile.blurb}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.entries(focusedTile.links || {}).map(([kind, url]) => (
                <a key={kind} href={url} target="_blank" rel="noreferrer" style={linkPillStyle}>
                  {kind.toUpperCase()} →
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help text — temporary while interactions are still being added */}
      <div style={helpStyle}>
        Drag to rotate · Tap a tile to read · v1 prototype
      </div>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────

const topLeftStyle = {
  position: 'absolute', top: 24, left: 28, zIndex: 10,
  color: '#F2ECDC', pointerEvents: 'none',
}

const topRightStyle = {
  position: 'absolute', top: 24, right: 28, zIndex: 10,
  color: '#F2ECDC', textAlign: 'right', pointerEvents: 'none',
}

const bottomNavStyle = {
  position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
  display: 'flex', gap: 12, zIndex: 10,
}

const pillStyle = {
  padding: '10px 22px', borderRadius: 999,
  background: 'rgba(20, 25, 40, 0.55)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(242, 236, 220, 0.18)',
  color: '#F2ECDC',
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
  cursor: 'pointer',
}

const filterBtnStyle = {
  ...pillStyle,
  position: 'absolute', bottom: 28, right: 28, zIndex: 10,
}

const detailOverlayStyle = {
  position: 'absolute', inset: 0, zIndex: 20,
  background: 'rgba(2, 4, 9, 0.55)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 32,
}

const detailCardStyle = {
  position: 'relative',
  maxWidth: 600, width: '100%',
  background: 'rgba(15, 20, 30, 0.78)',
  border: '1px solid rgba(242, 236, 220, 0.15)',
  borderRadius: 8,
  padding: '40px 36px',
  color: '#F2ECDC',
}

const closeBtnStyle = {
  position: 'absolute', top: 14, right: 14,
  width: 36, height: 36, borderRadius: '50%',
  background: 'transparent',
  border: '1px solid rgba(242, 236, 220, 0.4)',
  color: '#F2ECDC',
  fontSize: 20, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
}

const linkPillStyle = {
  padding: '8px 14px', borderRadius: 4,
  background: 'rgba(201, 160, 71, 0.18)',
  border: '1px solid rgba(201, 160, 71, 0.5)',
  color: '#C9A047',
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10, letterSpacing: 1.5,
  textDecoration: 'none',
}

const helpStyle = {
  position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
  fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 10,
  color: 'rgba(242, 236, 220, 0.4)', letterSpacing: 1.5,
  pointerEvents: 'none',
}
