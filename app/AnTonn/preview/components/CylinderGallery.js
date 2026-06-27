'use client'

// CylinderGallery — Phantom-style 11×11 grid wallpaper on the inside of
// a vertical cylinder.
//
// Geometry math:
//   • COLS columns evenly distributed around the cylinder. Each cell
//     subtends 360°/COLS of arc. Cell width at radius R is
//     2 · R · sin(π / COLS).
//   • Cell height = cell width (square cells), so adjacent rows touch
//     vertically the same way columns touch horizontally.
//   • ROWS rows total, vertically centred on Y=0 (so row (ROWS-1)/2
//     sits at the camera-eye-level row).
//
// Content distribution:
//   The 5 verticals (music/books/podcasts/film/radio) have wildly
//   uneven content counts in a real week (Music ~20, Books ~5,
//   Podcasts ~5, Film ~3, Radio ~2). We build one flat list of real
//   items, then pad to ROWS × COLS with duplicates from the largest
//   pool (typically music). Tiles keep their source vertical's colour
//   regardless of position, so the grid is colour-coded by category
//   even though categories are scattered rather than rowed.
//
//   Distribution within the grid uses a deterministic round-robin so
//   re-renders are stable (no shuffling between frames).

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import Tile from './Tile'

const RADIUS = 6.0          // distance from camera at origin to cell surface
const COLS = 11             // horizontal cells around the circumference
const ROWS = 11             // vertical cells (most off-screen at idle, pan to see)
const IMAGE_RATIO = 0.78    // image plane size as fraction of cell size

// Derived constants
const CELL_W = 2 * RADIUS * Math.sin(Math.PI / COLS)  // ≈ 1.69 at R=6
const CELL_H = CELL_W
const ROW_Y_OFFSET = (ROWS - 1) / 2                    // centres the grid on Y=0

// Build one big flat list of real items across every vertical. Each
// item carries its origin vertical so the renderer can colour-code.
function buildItemList(issue) {
  if (!issue) return []
  const verticals = ['music', 'books', 'podcasts', 'film', 'radio']
  const items = []
  for (const v of verticals) {
    for (const item of issue[v] || []) {
      items.push({ ...item, _vertical: v, _isFiller: false })
    }
  }
  return items
}

// Pad the item list to TARGET_COUNT by cycling through the largest pool
// (typically music). Each filler keeps its source vertical's colour so
// the grid still looks colour-coded by category, just with more of the
// abundant category.
function padItems(items, issue, targetCount) {
  if (items.length >= targetCount) return items.slice(0, targetCount)
  const sizes = ['music', 'books', 'podcasts', 'film', 'radio']
    .map((v) => ({ v, n: (issue[v] || []).length }))
    .sort((a, b) => b.n - a.n)
  const fillerVertical = sizes[0]?.v || 'music'
  const fillerPool = issue[fillerVertical] || []
  if (fillerPool.length === 0) return items

  const out = [...items]
  let i = 0
  while (out.length < targetCount) {
    const src = fillerPool[i % fillerPool.length]
    out.push({
      ...src,
      _vertical: fillerVertical,
      _isFiller: true,
      id: `${src.id}__filler_${i}`,
    })
    i++
  }
  return out
}

export default function CylinderGallery({ issue, focusedId, onTileSelect, rotation = 0 }) {
  const groupRef = useRef(null)

  // Smooth rotation toward externally driven yaw target
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += (rotation - groupRef.current.rotation.y) * 0.12
  })

  const cells = useMemo(() => {
    const realItems = buildItemList(issue)
    if (realItems.length === 0) return []
    const targetCount = ROWS * COLS  // 121 with COLS=ROWS=11
    const allItems = padItems(realItems, issue, targetCount)

    const cells = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const idx = row * COLS + col
        const item = allItems[idx]
        if (!item) continue

        // Horizontal: even angular distribution around the cylinder
        const angle = (col / COLS) * Math.PI * 2
        const x = Math.sin(angle) * RADIUS
        const z = Math.cos(angle) * RADIUS

        // Vertical: row 0 at top, row (ROWS-1) at bottom
        const y = (ROW_Y_OFFSET - row) * CELL_H

        // Yaw so the tile's +Z normal points inward toward (0,0,0)
        const yaw = angle + Math.PI

        cells.push({
          key: `${row}-${col}-${item.id}`,
          item,
          vertical: item._vertical,
          isFiller: item._isFiller,
          position: [x, y, z],
          rotation: [0, yaw, 0],
        })
      }
    }
    return cells
  }, [issue])

  if (cells.length === 0) return null

  return (
    <group ref={groupRef}>
      {cells.map(({ key, item, vertical, isFiller, position, rotation }) => (
        <Tile
          key={key}
          item={item}
          vertical={vertical}
          position={position}
          rotation={rotation}
          cellSize={CELL_W}
          imageRatio={IMAGE_RATIO}
          focused={focusedId === item.id}
          dimmed={isFiller}
          onSelect={onTileSelect}
        />
      ))}
    </group>
  )
}
