'use client'

// CylinderGallery — v17. Genuine cylinder (no longer a sphere with a
// pinched equatorial band). 11 columns wrap horizontally, 11 rows scroll
// vertically with wraparound. The wall is the only thing that moves;
// the camera at the centre is fixed.
//
// Layout:
//   • Cell width  = 2πR / COLS                 (arc length at the cylinder)
//   • Cell height = cell width                 (square in world units at the wall)
//   • Total height = ROWS × cell height        (wraps vertically via per-cell modulo)
//
// Latin-rectangle selection guarantees no image repeats in the same row
// or the same column, regardless of source pool size (provided pool ≥ 11).

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import CylinderCell from './CylinderTile'

const RADIUS = 6.0
const COLS = 11
const ROWS = 11
const PHI_SPAN = (2 * Math.PI) / COLS
const Y_SPAN = (2 * Math.PI * RADIUS) / COLS  // square cells at the wall
const TOTAL_HEIGHT = Y_SPAN * ROWS

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

// (r + c) mod N — distinct images within any row of ≤N and any column
// of ≤N. With N = 25 and grid 11×11 we never collide.
function buildGrid(pool) {
  if (pool.length === 0) return []
  const N = pool.length
  const out = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const src = pool[(r + c) % N]
      out.push({
        ...src,
        _row: r,
        _col: c,
        id: `${src.id}__r${r}c${c}`,
      })
    }
  }
  return out
}

export default function CylinderGallery({
  issue,
  focusedId,
  onTileSelect,
  rotation = 0,
  yOffset = 0,
}) {
  const groupRef = useRef(null)
  const smoothedYRef = useRef(0)

  useFrame(() => {
    smoothedYRef.current += (yOffset - smoothedYRef.current) * 0.12
    if (groupRef.current) {
      groupRef.current.rotation.y += (rotation - groupRef.current.rotation.y) * 0.12
    }
  })

  const cells = useMemo(() => {
    const pool = buildSourcePool(issue)
    if (pool.length === 0) return []
    const items = buildGrid(pool)
    const result = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c
        const item = items[idx]
        if (!item) continue
        result.push({
          key: `${r}-${c}`,
          item,
          vertical: item._vertical,
          phiCenter: c * PHI_SPAN + PHI_SPAN / 2,
          baseY: -TOTAL_HEIGHT / 2 + (r + 0.5) * Y_SPAN,
        })
      }
    }
    return result
  }, [issue])

  if (cells.length === 0) return null

  return (
    <group ref={groupRef}>
      {cells.map(({ key, item, vertical, phiCenter, baseY }) => (
        <CylinderCell
          key={key}
          item={item}
          vertical={vertical}
          radius={RADIUS}
          phiCenter={phiCenter}
          phiSpan={PHI_SPAN}
          baseY={baseY}
          ySpan={Y_SPAN}
          totalHeight={TOTAL_HEIGHT}
          smoothedYRef={smoothedYRef}
          focused={focusedId === item.id}
          onSelect={onTileSelect}
        />
      ))}
    </group>
  )
}
