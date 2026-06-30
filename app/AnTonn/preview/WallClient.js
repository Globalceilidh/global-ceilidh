'use client'

// Flat CSS-perspective wall (replaces the v1-v18 3D geometry track —
// see git log). The vortex shader stays exactly as it was; only the
// tile presentation is a flat 11×11 grid that wraps infinitely in
// every direction. No clamp, no rubber-band — drag any direction,
// natural inertia, content tiles seamlessly.

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import VortexBackground from './components/VortexBackground'
import DetailPanel from './components/DetailPanel'
import AirAnTonnOverlay from './components/AirAnTonnOverlay'
import FilterPanel, { FILTER_GROUPS } from './components/FilterPanel'
import { ListView } from './components/ListView'
import { issue as week2 } from './data/week-2026-06-23'

// Logical grid is 11×11 (121 cells, wraps both axes). We render a 3×3
// mosaic (33×33 = 1089 cells) so the surface always covers the viewport
// no matter where drag has scrolled it; modulo on the wrap period keeps
// the surface from drifting off forever, and because every 11-cell
// stretch is identical, the wrap is invisible.
const COLS = 11
const ROWS = 11
const MOSAIC = 3
const RENDER_COLS = COLS * MOSAIC
const RENDER_ROWS = ROWS * MOSAIC

const TILE_W = 240
const TILE_H = 320
const GAP = 36

// Drag tuning
const MOMENTUM_FRICTION = 0.95
const MOMENTUM_MIN_VELOCITY = 0.3
const ROTATE_MAX_DEG = 8          // mouseX → rotateY lean
const PERSPECTIVE_PX = 1100
const DRAG_THRESHOLD_PX = 5

const EMPTY_FILTERS = () => Object.fromEntries(FILTER_GROUPS.map((g) => [g.id, new Set()]))
const VERTICALS = ['music', 'books', 'podcasts', 'film', 'radio']

const initialViewport = () => ({
  w: typeof window !== 'undefined' ? window.innerWidth : 1920,
  h: typeof window !== 'undefined' ? window.innerHeight : 1080,
})

// Modulo-wrap that returns a value centered around 0
function modWrap(v, period) {
  const r = ((v % period) + period) % period
  return r > period / 2 ? r - period : r
}

export default function WallClient() {
  const [mouseUv, setMouseUv] = useState({ x: 0.5, y: 0.5 })

  const [focusedTile, setFocusedTile] = useState(null)
  const [focusedVertical, setFocusedVertical] = useState(null)
  const [airOpen, setAirOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const [reduceMotion, setReduceMotion] = useState(false)
  const [docHidden, setDocHidden] = useState(false)
  const [listMode, setListMode] = useState(false)
  const [viewport, setViewport] = useState(initialViewport)

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

  useEffect(() => {
    const handler = () => setDocHidden(document.hidden)
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    return () => {
      if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current)
    }
  }, [])

  // Wrap period: 11 cells worth of (tile + gap). Moving by this exact
  // amount slides the mosaic by one full grid copy — content looks
  // identical so the modulo jump is invisible.
  const periodX = COLS * (TILE_W + GAP)
  const periodY = ROWS * (TILE_H + GAP)

  // Filter matching — produces a Set of matched IDs (null = no filter)
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

  // Pool of tiles with cover art (20 music + 5 podcast = 25)
  const tilePool = useMemo(() => {
    const all = []
    for (const v of VERTICALS) {
      for (const item of week2[v] || []) {
        if (item.cover_url) all.push({ ...item, _vertical: v })
      }
    }
    return all
  }, [])

  const poolSize = tilePool.length || 1

  // Vortex intensity driver
  const intensity = useMemo(() => {
    if (focusedTile) return 0.08
    if (airOpen || filterOpen) return 0.65
    if (isDragging) return 0.42
    return 0.18
  }, [isDragging, focusedTile, airOpen, filterOpen])

  // mouseX → rotateY lean
  const rotateY = reduceMotion ? 0 : (0.5 - mouseUv.x) * (ROTATE_MAX_DEG * 2)

  const cancelMomentum = useCallback(() => {
    if (momentumRaf.current) {
      cancelAnimationFrame(momentumRaf.current)
      momentumRaf.current = null
    }
  }, [])

  const startMomentum = useCallback((vx, vy) => {
    let curVx = vx
    let curVy = vy
    const tick = () => {
      setDragOffset((prev) => ({ x: prev.x + curVx, y: prev.y + curVy }))
      curVx *= MOMENTUM_FRICTION
      curVy *= MOMENTUM_FRICTION
      if (Math.abs(curVx) < MOMENTUM_MIN_VELOCITY && Math.abs(curVy) < MOMENTUM_MIN_VELOCITY) {
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
    setDragOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy })

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
      }
    }
  }

  const onTileClick = (tile) => {
    if (wasDraggingRef.current) return
    setFocusedVertical(tile._vertical)
    setFocusedTile(tile)
  }

  const anyOverlayOpen = airOpen || filterOpen || !!focusedTile

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

  // Modulo-wrapped displayed offset. Surface drifts by exactly one grid
  // period when this snaps back across zero — invisible because every
  // 11-stretch of tiles is identical.
  const visX = modWrap(dragOffset.x, periodX)
  const visY = modWrap(dragOffset.y, periodY)

  return (
    <div style={containerStyle}>
      <style>{TILE_CSS}</style>

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

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          ...wallLayerStyle,
          perspective: `${PERSPECTIVE_PX}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate3d(-50%, -50%, 0) translate3d(${visX}px, ${visY}px, 0) rotateY(${rotateY}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 60ms linear',
            willChange: 'transform',
            display: 'grid',
            gridTemplateColumns: `repeat(${RENDER_COLS}, ${TILE_W}px)`,
            gridAutoRows: `${TILE_H}px`,
            gap: `${GAP}px`,
          }}
        >
          {Array.from({ length: RENDER_COLS * RENDER_ROWS }, (_, i) => {
            const xi = i % RENDER_COLS
            const yi = Math.floor(i / RENDER_COLS)
            const tileIdx = (((yi % ROWS) * COLS + (xi % COLS)) % poolSize + poolSize) % poolSize
            const tile = tilePool[tileIdx]
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

      <div style={topLeftStyle}>
        <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontWeight: 600, letterSpacing: 4, fontSize: 14 }}>
          AN TONN
        </div>
        <div style={{ fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 10, opacity: 0.6, marginTop: 2, letterSpacing: 1.5 }}>
          THE CHRONICLE OF THE GÀIDHLIG CURRENT
        </div>
      </div>

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

      <button style={filterBtnStyle} onClick={() => setFilterOpen(true)}>
        Filter
      </button>

      <button
        style={listViewBtnStyle}
        onClick={() => setListMode(true)}
        aria-label="Switch to list view"
        title="List view (better for screen readers and low-end devices)"
      >
        ⊞
      </button>

      {!anyOverlayOpen && (
        <div style={helpStyle}>
          Drag in any direction · The wall wraps forever
        </div>
      )}

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
        loading="lazy"
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
          fontSize: 14, fontWeight: 600,
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

const containerStyle = {
  position: 'fixed', inset: 0,
  background: '#020409',
  overflow: 'hidden',
}
const canvasLayerStyle = { position: 'absolute', inset: 0, zIndex: 0 }
const wallLayerStyle = {
  position: 'absolute', inset: 0, zIndex: 10,
  touchAction: 'none', userSelect: 'none',
}
const topLeftStyle = { position: 'absolute', top: 24, left: 28, zIndex: 15, color: '#F2ECDC', pointerEvents: 'none' }
const topRightStyle = { position: 'absolute', top: 24, right: 28, zIndex: 15, color: '#F2ECDC', textAlign: 'right', pointerEvents: 'none' }
const bottomNavStyle = {
  position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
  display: 'flex', gap: 10, zIndex: 20,
  flexWrap: 'wrap', justifyContent: 'center', maxWidth: '90vw',
}
const pillStyle = {
  padding: '10px 22px', borderRadius: 999,
  background: 'rgba(20, 25, 40, 0.55)',
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
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
const filterBtnStyle = { ...pillStyle, position: 'absolute', bottom: 28, right: 28, zIndex: 20 }
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
