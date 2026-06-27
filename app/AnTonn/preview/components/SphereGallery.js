'use client'

// SphereGallery — Fibonacci-distributed tiles plastered on the inside of
// a sphere. The viewer is at the centre (camera at origin); every tile
// orients to face the camera. Drag-to-look in all directions: horizontal
// drag yaws the whole sphere; vertical drag pitches the camera through
// the full 360° (no clamp).
//
// Why Fibonacci sphere distribution:
//   Even spacing across the surface, no clustering at poles, no obvious
//   row/column structure. It's the same algorithm sunflowers use for
//   seed packing — visually balanced from any angle.
//
// Padding logic:
//   The real week's data is uneven across verticals (Music ~20 candidates,
//   Books ~5, Podcasts ~5, Film ~3, Radio ~2). We don't want big empty
//   patches on the sphere. We pad to TARGET_TILE_COUNT by duplicating
//   from the largest pool (Music), tagged so the duplicates can be styled
//   subtly different if we ever want to ("more from this artist" hover, etc).

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import Tile from './Tile'

const RADIUS = 8.0
const TARGET_TILE_COUNT = 80
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))  // ≈ 2.39996

// Build a single flat list of tiles from the issue, tagged with their
// vertical so the renderer can colour-code them. Pads with duplicates
// of the largest pool (typically Music) until we hit the target count
// so the sphere is always visually full.
function buildTileList(issue) {
  if (!issue) return []

  const verticals = ['music', 'books', 'podcasts', 'film', 'radio']
  const real = []
  for (const v of verticals) {
    for (const item of issue[v] || []) {
      real.push({ ...item, _vertical: v, _isFiller: false })
    }
  }

  // Find the deepest pool to draw fillers from. Music is the standard
  // candidate; fall back to whichever pool has the most items if Music
  // is unusually thin.
  const poolSize = (v) => (issue[v] || []).length
  const sortedByPool = [...verticals].sort((a, b) => poolSize(b) - poolSize(a))
  const fillerPool = (issue[sortedByPool[0]] || [])

  const out = [...real]
  let fillerIdx = 0
  while (out.length < TARGET_TILE_COUNT && fillerPool.length > 0) {
    const src = fillerPool[fillerIdx % fillerPool.length]
    out.push({
      ...src,
      _vertical: sortedByPool[0],
      _isFiller: true,
      // Distinct id so React keys don't collide
      id: `${src.id}__filler_${fillerIdx}`,
    })
    fillerIdx++
  }
  return out
}

// Fibonacci sphere — returns (x, y, z) for each tile so points are evenly
// distributed across the sphere surface. Output coordinates are on a unit
// sphere; we scale by RADIUS in the caller.
function fibonacciPoint(i, total) {
  const y = 1 - (i / (total - 1)) * 2      // y in [1, -1]
  const r = Math.sqrt(1 - y * y)            // radius at this y slice
  const theta = GOLDEN_ANGLE * i
  return {
    x: Math.cos(theta) * r,
    y,
    z: Math.sin(theta) * r,
  }
}

export default function SphereGallery({ issue, focusedId, onTileSelect, rotation = 0 }) {
  const groupRef = useRef(null)

  // Smooth rotation toward the parent-driven target (yaw via mouse drag)
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += (rotation - groupRef.current.rotation.y) * 0.12
  })

  const tiles = useMemo(() => {
    const items = buildTileList(issue)
    if (items.length === 0) return []
    return items.map((item, i) => {
      const p = fibonacciPoint(i, items.length)
      const position = [p.x * RADIUS, p.y * RADIUS, p.z * RADIUS]
      // Orient tile to face the origin (camera at centre)
      // The tile's "front" face is its +Z normal; we want that normal to
      // point INWARD toward origin, i.e. opposite of the position vector.
      // lookAt-style yaw + pitch from position back to origin:
      const yaw = Math.atan2(p.x, p.z)             // around Y axis
      const pitch = -Math.asin(p.y)                // around X axis
      return {
        key: `${item._vertical}-${item.id}`,
        item,
        vertical: item._vertical,
        isFiller: item._isFiller,
        position,
        rotation: [pitch, yaw, 0],
      }
    })
  }, [issue])

  if (tiles.length === 0) return null

  return (
    <group ref={groupRef}>
      {tiles.map(({ key, item, vertical, isFiller, position, rotation }) => (
        <Tile
          key={key}
          item={item}
          vertical={vertical}
          position={position}
          rotation={rotation}
          focused={focusedId === item.id}
          dimmed={isFiller}
          onSelect={onTileSelect}
        />
      ))}
    </group>
  )
}
