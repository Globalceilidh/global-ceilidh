'use client'

// The cylindrical interior gallery — five horizontal rows of tiles wrapped
// around a vertical-axis cylinder. Camera sits at (0,0,0) facing the
// inside of the cylinder wall. User drags to rotate the cylinder group;
// the camera doesn't move (so the vortex shader stays anchored to the
// viewport while the tiles rotate past).
//
// Layout per row:
//   - row 0 (top):    Music     ~10 tiles
//   - row 1:          Books     ~6 tiles
//   - row 2 (middle): Podcasts  ~8 tiles
//   - row 3:          Film & TV ~6 tiles
//   - row 4 (bottom): Radio     ~4 tiles
// Tours render as a slow ticker on the very top/bottom edge (handled in
// the parent shell, not here — they're DOM-overlaid for legibility).
//
// Tile angular spacing within a row: evenly distributed across 2π. Rows
// with fewer tiles take up more arc per tile, so the bottom Radio row
// has bigger tiles than the top Music row. We compensate with per-row
// scale to keep visual rhythm balanced.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import Tile from './Tile'

const RADIUS = 8.0          // distance from camera (0,0,0) to tile surface
const ROW_VERTICAL_GAP = 2.0 // vertical distance between row centres
const ROWS = ['music', 'books', 'podcasts', 'film', 'radio']

export default function CylinderGallery({ issue, focusedId, onTileSelect, rotation = 0 }) {
  const groupRef = useRef(null)

  // Smooth rotation toward the externally-driven target (set by parent's
  // drag handler). Lerp gives momentum-feel without us writing a physics
  // sim.
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += (rotation - groupRef.current.rotation.y) * 0.12
  })

  // Build the tile data per row from the issue payload.
  const rowsWithPositions = useMemo(() => {
    if (!issue) return []
    const rowsCount = ROWS.length
    const centreOffset = (rowsCount - 1) / 2 // so rows are centred on Y=0

    return ROWS.map((vertical, rowIdx) => {
      const items = (issue[vertical] || []).slice(0, 12) // soft cap per row
      const n = items.length || 1
      const y = (centreOffset - rowIdx) * ROW_VERTICAL_GAP

      return items.map((item, colIdx) => {
        // Distribute tiles around full circle. Stagger small rotation per
        // row so neighbouring rows don't perfectly align (more interesting
        // to look at).
        const angle = (colIdx / n) * Math.PI * 2 + (rowIdx % 2 ? Math.PI / n : 0)
        const x = Math.sin(angle) * RADIUS
        const z = Math.cos(angle) * RADIUS

        // Tile faces inward (toward camera at origin)
        const yaw = angle + Math.PI

        return {
          key: `${vertical}-${item.id || colIdx}`,
          item,
          vertical,
          position: [x, y, z],
          rotation: [0, yaw, 0],
        }
      })
    }).flat()
  }, [issue])

  if (!issue) return null

  return (
    <group ref={groupRef}>
      {rowsWithPositions.map(({ key, item, vertical, position, rotation }) => (
        <Tile
          key={key}
          item={item}
          vertical={vertical}
          position={position}
          rotation={rotation}
          focused={focusedId === item.id}
          onSelect={onTileSelect}
        />
      ))}
    </group>
  )
}
