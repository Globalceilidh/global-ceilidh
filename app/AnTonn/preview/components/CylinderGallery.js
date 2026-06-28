'use client'

// SphereGallery — v14. Genuine sphere this time, with images facing
// inward (BackSide + UV flip). NO accent borders. Every cell filled.
// Source pool restricted to music covers + podcasts only.
//
// Grid: 12 columns × 8 latitude rings = 96 cells.
// Latitudes span theta ∈ [0.18π, 0.82π] so the polar caps are
// excluded — that's where sphere-segment distortion gets ugly. The
// remaining band is most of the visible interior.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import SphereTileSegment from './CylinderTile'

// v16 — donut-band, not sphere. The viewer is at the center of a tube
// (think: standing inside a donut hole), so cells only exist in a
// narrow latitudinal band around the equator. No poles, no convergence
// points — vertical drag is locked, the camera only yaws.
const RADIUS = 6.0
const COLS = 16
const ROWS = 6

// Equator is at theta = π/2. We allocate a ±32° band around it so the
// top and bottom of the visible viewport land in empty space (the void
// behind the wall) rather than at polar convergence points.
const THETA_START = Math.PI * 0.32
const THETA_END   = Math.PI * 0.68
const THETA_SPAN  = (THETA_END - THETA_START) / ROWS
const PHI_SPAN    = (Math.PI * 2) / COLS

function buildSourcePool(issue) {
  if (!issue) return []
  const pool = []
  for (const v of ['music', 'podcasts']) {
    for (const item of issue[v] || []) {
      pool.push({ ...item, _vertical: v })
    }
  }
  return pool
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }
function chooseCoprime(n, hint) {
  for (let delta = 0; delta < n; delta++) {
    for (const sign of [1, -1]) {
      const cand = hint + delta * sign
      if (cand > 0 && cand < n && gcd(cand, n) === 1) return cand
    }
  }
  return 1
}

function buildGrid(pool, totalCells, cols) {
  if (pool.length === 0) return []
  const stride = chooseCoprime(pool.length, cols)
  const out = []
  for (let i = 0; i < totalCells; i++) {
    const src = pool[(i * stride) % pool.length]
    out.push({ ...src, _instance: i, id: `${src.id}__${i}` })
  }
  // No-adjacent-duplicate swap pass — left and up neighbours
  const baseId = (x) => x.id.split('__')[0]
  for (let pos = 0; pos < out.length; pos++) {
    const row = Math.floor(pos / cols)
    const col = pos % cols
    const leftBase = col > 0 ? baseId(out[pos - 1]) : null
    const upBase = row > 0 ? baseId(out[pos - cols]) : null
    const myBase = baseId(out[pos])
    if ((leftBase && myBase === leftBase) || (upBase && myBase === upBase)) {
      for (let swap = pos + 1; swap < out.length; swap++) {
        const sb = baseId(out[swap])
        if (sb !== leftBase && sb !== upBase) {
          ;[out[pos], out[swap]] = [out[swap], out[pos]]
          break
        }
      }
    }
  }
  return out
}

export default function CylinderGallery({ issue, focusedId, onTileSelect, rotation = 0 }) {
  const groupRef = useRef(null)

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += (rotation - groupRef.current.rotation.y) * 0.12
  })

  const cells = useMemo(() => {
    const pool = buildSourcePool(issue)
    if (pool.length === 0) return []
    const total = ROWS * COLS
    const items = buildGrid(pool, total, COLS)

    const result = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const idx = row * COLS + col
        const item = items[idx]
        if (!item) continue

        const phiCenter = col * PHI_SPAN + PHI_SPAN / 2
        const thetaCenter = THETA_START + row * THETA_SPAN + THETA_SPAN / 2

        result.push({
          key: `${row}-${col}-${item.id}`,
          item,
          vertical: item._vertical,
          phiCenter,
          thetaCenter,
          phiSpan: PHI_SPAN,
          thetaSpan: THETA_SPAN,
        })
      }
    }
    return result
  }, [issue])

  if (cells.length === 0) return null

  return (
    <group ref={groupRef}>
      {cells.map(({ key, item, vertical, phiCenter, thetaCenter, phiSpan, thetaSpan }) => (
        <SphereTileSegment
          key={key}
          item={item}
          vertical={vertical}
          radius={RADIUS}
          phiCenter={phiCenter}
          thetaCenter={thetaCenter}
          phiSpan={phiSpan}
          thetaSpan={thetaSpan}
          focused={focusedId === item.id}
          onSelect={onTileSelect}
        />
      ))}
    </group>
  )
}
