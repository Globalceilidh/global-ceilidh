'use client'

// DomeGallery (file still called CylinderGallery so imports don't move) — v18.
//
// Geometry: a single conceptual sphere of radius R with the camera at its
// centre. Cells are NOT placed at fixed lat/lon — they live in a view-space
// 11×11 angular grid, and each cell's spherical position is recomputed
// every frame from (gridR, gridC) + the drag offset.
//
// Key consequence: there are no poles. The grid is finite (11×11) and
// wraps modulo grid size in both axes, so scrolling the wall in any
// direction cycles through the source pool with the same off-screen
// buffer on every side. No empty squares ever appear.
//
// Pool stride (7,1) over a 25-item music+podcast pool guarantees no
// duplicate image inside any 7×3 viewport-sized window — see
// pickItem() for the math.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import DomeTile from './CylinderTile'

const COLS = 11
const ROWS = 11
const RADIUS = 3.0           // closer = more contact-lens curvature feel
const STEP = 0.30            // radians per cell, ≈ 17.2°; with FOV 115° → ~6–7 cells horizontal
const ROW_STRIDE = 7         // pick stride; 7 rows × 1 col guarantees 21 distinct items per 7×3 window
const COL_STRIDE = 1

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

function pickItem(pool, r, c) {
  if (pool.length === 0) return null
  const n = pool.length
  return pool[((r * ROW_STRIDE + c * COL_STRIDE) % n + n) % n]
}

export default function CylinderGallery({
  issue,
  focusedId,
  onTileSelect,
  rotation = 0,
  yOffset = 0,
}) {
  const groupRef = useRef(null)
  // Drag accumulators are in radians (one cell ≈ STEP rad). Smooth them
  // to a ref so 121 child cells can read without re-rendering.
  const smoothedURef = useRef(0)
  const smoothedVRef = useRef(0)

  useFrame(() => {
    smoothedURef.current += (rotation - smoothedURef.current) * 0.12
    smoothedVRef.current += (yOffset  - smoothedVRef.current) * 0.12
  })

  const cellList = useMemo(() => {
    const pool = buildSourcePool(issue)
    if (pool.length === 0) return []
    const list = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const item = pickItem(pool, r, c)
        if (!item) continue
        list.push({
          key: `${r}-${c}`,
          // Make each instance's id unique so React keys + focus tracking don't collide
          item: { ...item, id: `${item.id}__r${r}c${c}` },
          // Recenter grid around 0 so wrap math is symmetric
          gridR: r - (ROWS - 1) / 2,
          gridC: c - (COLS - 1) / 2,
        })
      }
    }
    return list
  }, [issue])

  if (cellList.length === 0) return null

  return (
    <group ref={groupRef}>
      {cellList.map(({ key, item, gridR, gridC }) => (
        <DomeTile
          key={key}
          item={item}
          gridR={gridR}
          gridC={gridC}
          radius={RADIUS}
          step={STEP}
          rows={ROWS}
          cols={COLS}
          smoothedURef={smoothedURef}
          smoothedVRef={smoothedVRef}
          focused={focusedId === item.id}
          onSelect={onTileSelect}
        />
      ))}
    </group>
  )
}
