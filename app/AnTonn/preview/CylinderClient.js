'use client'

// Client shell for the An Tonn cylinder prototype. Mounts the R3F Canvas
// at full viewport, places the vortex background behind a cylinder gallery
// of tiles, and bridges DOM-level drag input to the Three.js scene.
//
// v2: detail panel, Air an Tonn overlay, filter panel, spinning-X close
// button all wired up. Filter selections dim non-matching tiles in the
// cylinder; the vortex compresses when any overlay is open.

import { useState, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import VortexBackground from './components/VortexBackground'
import CylinderGallery from './components/CylinderGallery'
import DetailPanel from './components/DetailPanel'
import AirAnTonnOverlay from './components/AirAnTonnOverlay'
import FilterPanel, { FILTER_GROUPS } from './components/FilterPanel'
import { ListView, SEOMirror } from './components/ListView'
import { useCylinderControls } from './hooks/useCylinderControls'
import { issue as week2 } from './data/week-2026-06-23'

// Small Three.js controller — pitches the camera up/down based on the
// `pitch` prop driven by vertical drag in useCylinderControls. Lerped
// for smoothness so the camera coasts after a flick instead of snapping.
function CameraPitch({ pitch }) {
  const { camera } = useThree()
  useFrame(() => {
    camera.rotation.x += (pitch - camera.rotation.x) * 0.12
  })
  return null
}

const EMPTY_FILTERS = () => Object.fromEntries(FILTER_GROUPS.map((g) => [g.id, new Set()]))

export default function CylinderClient() {
  const { rotationY, pitch, mouseUv, isDragging, bind } = useCylinderControls()
  const [focusedTile, setFocusedTile] = useState(null)
  const [focusedVertical, setFocusedVertical] = useState(null)
  const [airOpen, setAirOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [docHidden, setDocHidden] = useState(false)
  const [listMode, setListMode] = useState(false)

  // prefers-reduced-motion — auto-flip to list view for these users so
  // they're not stuck with motion they don't want.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    if (mq.matches) setListMode(true)
    const handler = (e) => {
      setReduceMotion(e.matches)
      if (e.matches) setListMode(true)
    }
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  // Pause when tab hidden — battery on mobile
  useEffect(() => {
    const handler = () => setDocHidden(document.hidden)
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  const issuePayload = week2
  const anyOverlayOpen = airOpen || filterOpen || focusedTile

  // Intensity drives the vortex compression/speed
  const intensity = useMemo(() => {
    if (focusedTile) return 0.08     // focused reading — calm
    if (airOpen || filterOpen) return 0.65  // overlay open — vortex pulls in
    if (isDragging) return 0.42      // active drag — accelerate
    return 0.18                      // idle — gentle
  }, [isDragging, focusedTile, airOpen, filterOpen])

  // Apply filters: tiles matching any selected option in a group pass
  // that group; tiles must pass every active group to remain bright.
  const filteredIssue = useMemo(() => {
    const verticalSet = filters.vertical
    const regionSet = filters.region
    const languageSet = filters.language
    const freshnessSet = filters.freshness

    // Vertical filter: if any vertical selected, only those rows render
    const verticalsToRender = verticalSet.size
      ? ['music', 'books', 'podcasts', 'film', 'radio', 'tours'].filter((v) => verticalSet.has(v))
      : ['music', 'books', 'podcasts', 'film', 'radio']

    const out = {
      ...issuePayload,
      music: [], books: [], podcasts: [], film: [], radio: [],
    }
    for (const v of verticalsToRender) {
      if (v === 'tours') continue
      out[v] = (issuePayload[v] || []).filter((item) => {
        // Region — match against tags
        if (regionSet.size) {
          const itemRegions = (item.tags || []).map((t) => t.toLowerCase())
          const ok = [...regionSet].some((r) => {
            if (r === 'alba') return itemRegions.some((t) => /alba|scotland|hebrides|highland|skye|lewis|harris/i.test(t))
            if (r === 'cape-breton') return itemRegions.some((t) => /cape breton/i.test(t))
            if (r === 'nova-scotia') return itemRegions.some((t) => /nova scotia/i.test(t)) || itemRegions.includes('cape breton')
            if (r === 'diaspora') return itemRegions.some((t) => /diaspora/i.test(t)) || !itemRegions.some((t) => /alba|scotland/i.test(t))
            return false
          })
          if (!ok) return false
        }
        // Language — match against tags
        if (languageSet.size) {
          const tags = (item.tags || []).map((t) => t.toLowerCase())
          const isGaidhlig = tags.some((t) => /gàidhlig|gaidhlig|gaelic/i.test(t))
          if (languageSet.has('gaidhlig-only') && !isGaidhlig) return false
          if (languageSet.has('bilingual') && !isGaidhlig) return false
          // 'english' option is permissive
        }
        // Freshness — placeholder: this-week passes everything in the
        // current issue; other options would query past issues in real impl.
        if (freshnessSet.size && !freshnessSet.has('this-week') && !freshnessSet.has('all')) {
          // four-weeks: pass for now (would need real cross-issue data)
        }
        return true
      })
    }
    return out
  }, [issuePayload, filters])

  return (
    <div
      {...bind}
      style={{
        position: 'fixed', inset: 0,
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

      {/* The Canvas — FOV bumped to 110° so tiles at the edges of view
          genuinely stretch outward like inside a wide-angle bubble.
          Combined with the closed SphereGeometry wall in
          (cylinder)Gallery, the polygon facets are gone and the
          gyrosphere fisheye distortion is pronounced. */}
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
        <CameraPitch pitch={pitch} />
        <CylinderGallery
          issue={filteredIssue}
          rotation={rotationY}
          focusedId={focusedTile?.id}
          onTileSelect={(item) => {
            // Look up which vertical contains this item so the panel
            // can colour-accent appropriately
            for (const v of ['music', 'books', 'podcasts', 'film', 'radio']) {
              if (issuePayload[v]?.some((t) => t.id === item.id)) {
                setFocusedVertical(v)
                break
              }
            }
            setFocusedTile(item)
          }}
        />
      </Canvas>

      {/* Bottom-center nav */}
      <div style={bottomNavStyle}>
        <button style={pillPrimaryStyle} onClick={() => setAirOpen(true)}>
          Air an Tonn
        </button>
        <button style={pillStyle} onClick={() => alert('Methodology coming soon')}>
          METHODOLOGY
        </button>
        <button style={pillStyle} onClick={() => alert('Vote coming soon')}>
          VOTE
        </button>
      </div>

      {/* Filter button (bottom-right) */}
      <button style={filterBtnStyle} onClick={() => setFilterOpen(true)}>
        Filter
      </button>

      {/* List view toggle (bottom-left) */}
      <button
        style={listViewBtnStyle}
        onClick={() => setListMode(true)}
        aria-label="Switch to list view"
        title="List view (better for screen readers and low-end devices)"
      >
        ⊞
      </button>

      {/* Off-screen SEO + a11y mirror — always present in the DOM */}
      <SEOMirror issue={issuePayload} />

      {/* List view — overrides everything else when active */}
      {listMode && (
        <ListView
          issue={filteredIssue}
          onClose={() => setListMode(false)}
          onTileSelect={(item, vertical) => {
            setFocusedTile(item)
            setFocusedVertical(vertical)
          }}
        />
      )}

      {/* Help text — temporary while interactions are still being added */}
      {!anyOverlayOpen && (
        <div style={helpStyle}>
          Drag horizontally for full 360° · Drag vertically to look up/down · Move mouse to pull the wave
        </div>
      )}

      {/* Overlays */}
      {focusedTile && (
        <DetailPanel
          tile={focusedTile}
          vertical={focusedVertical}
          onClose={() => { setFocusedTile(null); setFocusedVertical(null) }}
        />
      )}
      <AirAnTonnOverlay open={airOpen} onClose={() => setAirOpen(false)} />
      <FilterPanel
        open={filterOpen}
        filters={filters}
        onChange={setFilters}
        onClose={() => setFilterOpen(false)}
      />
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
  display: 'flex', gap: 10, zIndex: 10,
  flexWrap: 'wrap', justifyContent: 'center', maxWidth: '90vw',
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
  transition: 'background 200ms ease, border-color 200ms ease',
}

const pillPrimaryStyle = {
  ...pillStyle,
  padding: '12px 28px',
  background: 'rgba(201, 160, 71, 0.18)',
  border: '1px solid rgba(201, 160, 71, 0.7)',
  color: '#C9A047',
  fontFamily: 'Cinzel, Georgia, serif',
  fontSize: 14, letterSpacing: 2,
  textTransform: 'none',
}

const filterBtnStyle = {
  ...pillStyle,
  position: 'absolute', bottom: 28, right: 28, zIndex: 10,
}

const listViewBtnStyle = {
  ...pillStyle,
  position: 'absolute', bottom: 28, left: 28, zIndex: 10,
  width: 40, height: 40, padding: 0,
  fontSize: 18, lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const helpStyle = {
  position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
  fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 10,
  color: 'rgba(242, 236, 220, 0.4)', letterSpacing: 1.5,
  pointerEvents: 'none',
}
