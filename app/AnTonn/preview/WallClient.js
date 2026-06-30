'use client'

// Flat CSS-perspective wall (replaces the v1-v18 3D geometry track —
// see git log). The vortex shader stays exactly as it was; only the
// tile presentation is being collapsed back to a flat grid with subtle
// CSS perspective + mouseX-driven rotateY lean.

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import VortexBackground from './components/VortexBackground'
import DetailPanel from './components/DetailPanel'
import AirAnTonnOverlay from './components/AirAnTonnOverlay'
import FilterPanel, { FILTER_GROUPS } from './components/FilterPanel'
import { ListView } from './components/ListView'
import { issue as week2 } from './data/week-2026-06-23'

// Grid sizing
const TILE_W = 280
const TILE_H = 380
const GAP_DESKTOP = 12
const GAP_MOBILE = 8
const ROWS = 18
const COLS_DESKTOP = 4
const COLS_TABLET = 3
const COLS_MOBILE = 2

// Drag / perspective tuning
const RUBBER_FACTOR = 0.3
const MOMENTUM_FRICTION = 0.94
const MOMENTUM_MIN_VELOCITY = 0.4
const ROTATE_MAX_DEG = 8
const DRAG_THRESHOLD_PX = 5

const EMPTY_FILTERS = () => Object.fromEntries(FILTER_GROUPS.map((g) => [g.id, new Set()]))

const VERTICALS = ['music', 'books', 'podcasts', 'film', 'radio']

const initialViewport = () => ({
  w: typeof window !== 'undefined' ? window.innerWidth : 1920,
  h: typeof window !== 'undefined' ? window.innerHeight : 1080,
})

export default function WallClient() {
  // Mouse position (normalised 0..1) — feeds both vortex shader and rotateY lean
  const [mouseUv, setMouseUv] = useState({ x: 0.5, y: 0.5 })

  // Overlays
  const [focusedTile, setFocusedTile] = useState(null)
  const [focusedVertical, setFocusedVertical] = useState(null)
  const [airOpen, setAirOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  // Drag state — translate(x, y) applied to the grid container
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  // Environment
  const [reduceMotion, setReduceMotion] = useState(false)
  const [docHidden, setDocHidden] = useState(false)
  const [listMode, setListMode] = useState(false)
  const [viewport, setViewport] = useState(initialViewport)

  // Mutable refs
  const dragStart = useRef(null)
  const wasDraggingRef = useRef(false)
  const velSamples = useRef([])
  const momentumRaf = useRef(null)

  // prefers-reduced-motion → auto-flip to list
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

  // Tab-hidden — pause vortex shader for battery
  useEffect(() => {
    const handler = () => setDocHidden(document.hidden)
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  // Track viewport size
  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Cleanup any in-flight momentum on unmount
  useEffect(() => {
    return () => {
      if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current)
    }
  }, [])

  // Responsive column / gap
  const { cols, gap } = useMemo(() => {
    if (viewport.w < 768) return { cols: COLS_MOBILE, gap: GAP_MOBILE }
    if (viewport.w < 1280) return { cols: COLS_TABLET, gap: GAP_DESKTOP }
    return { cols: COLS_DESKTOP, gap: GAP_DESKTOP }
  }, [viewport.w])

  const gridWidth = cols * TILE_W + (cols - 1) * gap
  const gridHeight = ROWS * TILE_H + (ROWS - 1) * gap

  // Clamp range — wall is centered, can drag ±half the overflow in each axis
  const clampX = useMemo(() => {
    if (gridWidth <= viewport.w) return { min: 0, max: 0 }
    const half = (gridWidth - viewport.w) / 2 + 32
    return { min: -half, max: half }
  }, [gridWidth, viewport.w])

  const clampY = useMemo(() => {
    if (gridHeight <= viewport.h) return { min: 0, max: 0 }
    const half = (gridHeight - viewport.h) / 2 + 32
    return { min: -half, max: half }
  }, [gridHeight, viewport.h])

  // Lifted from CylinderClient: filter-application logic. Returns a Set of
  // matched item IDs (null = no filter active → everything matches). The
  // grid renderer dims tiles whose id isn't in the set.
  const matchedIds = useMemo(() => {
    const verticalSet = filters.vertical
    const regionSet = filters.region
    const languageSet = filters.language
    const freshnessSet = filters.freshness

    const anyFilter = verticalSet.size || regionSet.size || languageSet.size || freshnessSet.size
    if (!anyFilter) return null

    const verticalsToInclude = verticalSet.size
      ? VERTICALS.filter((v) => verticalSet.has(v))
      : VERTICALS

    const matched = new Set()
    for (const v of verticalsToInclude) {
      for (const item of week2[v] || []) {
        if (regionSet.size) {
          const itemRegions = (item.tags || []).map((t) => t.toLowerCase())
          const ok = [...regionSet].some((r) => {
            if (r === 'alba') return itemRegions.some((t) => /alba|scotland|hebrides|highland|skye|lewis|harris/i.test(t))
            if (r === 'cape-breton') return itemRegions.some((t) => /cape breton/i.test(t))
            if (r === 'nova-scotia') return itemRegions.some((t) => /nova scotia/i.test(t)) || itemRegions.includes('cape breton')
            if (r === 'diaspora') return itemRegions.some((t) => /diaspora/i.test(t)) || !itemRegions.some((t) => /alba|scotland/i.test(t))
            return false
          })
          if (!ok) continue
        }
        if (languageSet.size) {
          const tags = (item.tags || []).map((t) => t.toLowerCase())
          const isGaidhlig = tags.some((t) => /gàidhlig|gaidhlig|gaelic/i.test(t))
          if (languageSet.has('gaidhlig-only') && !isGaidhlig) continue
          if (languageSet.has('bilingual') && !isGaidhlig) continue
        }
        matched.add(item.id)
      }
    }
    return matched
  }, [filters])

  // Pool of tiles that actually have cover art (20 music + 5 podcasts = 25).
  // Cycled to fill the wall cells.
  const tilePool = useMemo(() => {
    const all = []
    for (const v of VERTICALS) {
      for (const item of week2[v] || []) {
        if (item.cover_url) all.push({ ...item, _vertical: v })
      }
    }
    return all
  }, [])

  const totalCells = ROWS * cols

  // Lifted from CylinderClient: vortex intensity driver. Pulses on
  // drag and overlay-open; calms when reading a focused tile.
  const intensity = useMemo(() => {
    if (focusedTile) return 0.08
    if (airOpen || filterOpen) return 0.65
    if (isDragging) return 0.42
    return 0.18
  }, [isDragging, focusedTile, airOpen, filterOpen])

  // mouseX → rotateY lean. Cursor at viewport-left → +8deg (left edge
  // tilts toward viewer); cursor center → 0deg; right → -8deg.
  const rotateY = reduceMotion ? 0 : (0.5 - mouseUv.x) * (ROTATE_MAX_DEG * 2)

  const rubberClamp = useCallback((v, { min, max }) => {
    if (v < min) return min - (min - v) * RUBBER_FACTOR
    if (v > max) return max + (v - max) * RUBBER_FACTOR
    return v
  }, [])

  const cancelMomentum = useCallback(() => {
    if (momentumRaf.current) {
      cancelAnimationFrame(momentumRaf.current)
      momentumRaf.current = null
    }
  }, [])

  const snapBackToClamp = useCallback(() => {
    setDragOffset((prev) => {
      const targetX = Math.min(Math.max(prev.x, clampX.min), clampX.max)
      const targetY = Math.min(Math.max(prev.y, clampY.min), clampY.max)
      if (Math.abs(targetX - prev.x) < 0.5 && Math.abs(targetY - prev.y) < 0.5) {
        return { x: targetX, y: targetY }
      }
      let curX = prev.x
      let curY = prev.y
      const step = () => {
        curX += (targetX - curX) * 0.18
        curY += (targetY - curY) * 0.18
        if (Math.abs(targetX - curX) < 0.3 && Math.abs(targetY - curY) < 0.3) {
          setDragOffset({ x: targetX, y: targetY })
          momentumRaf.current = null
        } else {
          setDragOffset({ x: curX, y: curY })
          momentumRaf.current = requestAnimationFrame(step)
        }
      }
      momentumRaf.current = requestAnimationFrame(step)
      return prev
    })
  }, [clampX, clampY])

  const startMomentum = useCallback((vx, vy) => {
    let curVx = vx
    let curVy = vy
    const tick = () => {
      let stopped = false
      setDragOffset((prev) => {
        let nx = prev.x + curVx
        let ny = prev.y + curVy
        nx = rubberClamp(nx, clampX)
        ny = rubberClamp(ny, clampY)
        return { x: nx, y: ny }
      })
      curVx *= MOMENTUM_FRICTION
      curVy *= MOMENTUM_FRICTION
      if (Math.abs(curVx) < MOMENTUM_MIN_VELOCITY && Math.abs(curVy) < MOMENTUM_MIN_VELOCITY) {
        stopped = true
      }
      if (stopped) {
        momentumRaf.current = null
        snapBackToClamp()
      } else {
        momentumRaf.current = requestAnimationFrame(tick)
      }
    }
    momentumRaf.current = requestAnimationFrame(tick)
  }, [clampX, clampY, rubberClamp, snapBackToClamp])

  // ── Pointer handlers ───────────────────────────────────────────
  const onPointerDown = (e) => {
    // Update mouseUv on the very first frame too (in case it was stale)
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
      ox: dragOffset.x, oy: dragOffset.y,
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
    const nx = rubberClamp(dragStart.current.ox + dx, clampX)
    const ny = rubberClamp(dragStart.current.oy + dy, clampY)
    setDragOffset({ x: nx, y: ny })

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
      const vx = ((last.x - first.x) / dt) * 16
      const vy = ((last.y - first.y) / dt) * 16
      if (Math.abs(vx) >= MOMENTUM_MIN_VELOCITY || Math.abs(vy) >= MOMENTUM_MIN_VELOCITY) {
        startMomentum(vx, vy)
        return
      }
    }
    snapBackToClamp()
  }

  // ── Tile click (suppressed if a drag just happened) ────────────
  const onTileClick = (tile) => {
    if (wasDraggingRef.current) return
    setFocusedVertical(tile._vertical)
    setFocusedTile(tile)
  }

  const anyOverlayOpen = airOpen || filterOpen || !!focusedTile

  // Reduced-motion or user-toggled list view replaces the whole surface
  if (listMode) {
    return (
      <>
        <ListView
          issue={week2}
          onClose={reduceMotion ? () => {} : () => setListMode(false)}
          onTileSelect={(item, vertical) => {
            setFocusedVertical(vertical)
            setFocusedTile(item)
          }}
        />
        {focusedTile && (
          <DetailPanel
            tile={focusedTile}
            vertical={focusedVertical}
            onClose={() => { setFocusedTile(null); setFocusedVertical(null) }}
          />
        )}
      </>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Hover styles for tiles — scoped via a fixed class name */}
      <style>{TILE_CSS}</style>

      {/* Vortex shader — stays exactly as it was */}
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

      {/* The wall — CSS perspective + drag */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          ...wallLayerStyle,
          perspective: '1200px',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: gridWidth,
            transform: `translate3d(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px), 0) rotateY(${rotateY}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 80ms linear',
            willChange: 'transform',
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${TILE_W}px)`,
            gap: `${gap}px`,
          }}
        >
          {Array.from({ length: totalCells }, (_, i) => {
            const tile = tilePool[i % tilePool.length]
            const matched = matchedIds === null || matchedIds.has(tile.id)
            return (
              <TileCard
                key={i}
                tile={tile}
                dimmed={!matched}
                onClick={() => onTileClick(tile)}
              />
            )
          })}
        </div>
      </div>

      {/* Top-left meta */}
      <div style={topLeftStyle}>
        <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontWeight: 600, letterSpacing: 4, fontSize: 14 }}>
          AN TONN
        </div>
        <div style={{ fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 10, opacity: 0.6, marginTop: 2, letterSpacing: 1.5 }}>
          THE CHRONICLE OF THE GÀIDHLIG CURRENT
        </div>
      </div>

      {/* Top-right dateline */}
      <div style={topRightStyle}>
        <div style={{ fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 10, opacity: 0.6, letterSpacing: 2 }}>
          ISSUE Nº {String(week2.number).padStart(3, '0')}
        </div>
        <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 13, marginTop: 4, letterSpacing: 1 }}>
          {week2.date_gd.toUpperCase()}
        </div>
        <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 11, opacity: 0.55, marginTop: 1, letterSpacing: 1 }}>
          {week2.date_en}
        </div>
      </div>

      {/* Bottom-center pills */}
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

      {/* Filter (bottom-right) */}
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

      {/* Help text */}
      {!anyOverlayOpen && (
        <div style={helpStyle}>
          Drag in any direction · Move mouse to lean the wall
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

function TileCard({ tile, dimmed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="antonn-tile"
      style={{
        width: TILE_W,
        height: TILE_H,
        padding: 0,
        background: '#0a0d14',
        border: 'none',
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: dimmed ? 0.2 : 1,
        pointerEvents: dimmed ? 'none' : 'auto',
        position: 'relative',
        display: 'block',
      }}
    >
      <img
        src={tile.cover_url}
        alt={tile.title}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      <div className="antonn-tile-overlay">
        <div style={{
          fontFamily: 'Cinzel, Georgia, serif',
          fontSize: 15, fontWeight: 600,
          color: '#F2ECDC',
          marginBottom: 2,
          lineHeight: 1.2,
        }}>
          {tile.title}
        </div>
        <div style={{
          fontFamily: '"IBM Plex Mono", Menlo, monospace',
          fontSize: 10, letterSpacing: 1.2,
          color: 'rgba(242, 236, 220, 0.75)',
        }}>
          {tile.creator}
        </div>
      </div>
    </button>
  )
}

// ── CSS ─────────────────────────────────────────────────────────────────

const TILE_CSS = `
  .antonn-tile {
    transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms ease;
  }
  .antonn-tile:hover {
    transform: scale(1.03);
    z-index: 1;
  }
  .antonn-tile-overlay {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 48px 14px 14px;
    background: linear-gradient(to top, rgba(0,0,0,0.88) 30%, rgba(0,0,0,0));
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 240ms ease, transform 240ms ease;
    pointer-events: none;
  }
  .antonn-tile:hover .antonn-tile-overlay {
    opacity: 1;
    transform: translateY(0);
  }
`

// ── Styles ─────────────────────────────────────────────────────────────

const containerStyle = {
  position: 'fixed',
  inset: 0,
  background: '#020409',
  overflow: 'hidden',
}

const canvasLayerStyle = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
}

const wallLayerStyle = {
  position: 'absolute',
  inset: 0,
  zIndex: 10,
  touchAction: 'none',
  userSelect: 'none',
}

const topLeftStyle = {
  position: 'absolute', top: 24, left: 28, zIndex: 15,
  color: '#F2ECDC', pointerEvents: 'none',
}

const topRightStyle = {
  position: 'absolute', top: 24, right: 28, zIndex: 15,
  color: '#F2ECDC', textAlign: 'right', pointerEvents: 'none',
}

const bottomNavStyle = {
  position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
  display: 'flex', gap: 10, zIndex: 20,
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
  position: 'absolute', bottom: 28, right: 28, zIndex: 20,
}

const listViewBtnStyle = {
  ...pillStyle,
  position: 'absolute', bottom: 28, left: 28, zIndex: 20,
  width: 40, height: 40, padding: 0,
  fontSize: 18, lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const helpStyle = {
  position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
  fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 10,
  color: 'rgba(242, 236, 220, 0.4)', letterSpacing: 1.5,
  pointerEvents: 'none', zIndex: 15,
}
