'use client'

// CylinderGallery — five rows of tiles wrapping the inside of a vertical
// cylinder. The viewer stands at the centre (camera at origin); tiles
// face inward toward the camera and always stay upright (their +Y axis
// aligned with world +Y).
//
// Each row holds TILES_PER_ROW tiles. Real items fill first; if a row
// is short, we pad with music duplicates (or, if music itself is short,
// duplicates from the largest available pool). This matches Scott's
// "fill blanks with duplicates of the music cards" instinct — the
// sphere always looks dense and active even on a sparse week.
//
// Tiles are colour-coded by their original vertical regardless of which
// row they end up in (a music filler in the books row stays gold-framed
// so the category is always legible).
//
// Why we're not on a sphere: the v4 sphere attempt distributed tiles
// via Fibonacci and let pitch run free. Two problems followed —
// tile orientation breaks at the poles, and a freely-rotating camera
// turns the world upside-down at ±90°. Cylinder with clamped pitch
// keeps tiles upright and readable; the curvature comes from the
// cylinder wrap itself plus the camera perspective.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import Tile from './Tile'

const RADIUS = 8.0          // distance from camera at origin to tile surface
const ROW_VERTICAL_GAP = 2.6 // distance between row centres
const TILES_PER_ROW = 20
const ROWS = ['music', 'books', 'podcasts', 'film', 'radio']

// Build the list of tiles for one row. Always returns exactly TILES_PER_ROW
// items. Real items first; pad with duplicates from the supplied filler
// pool. Each tile keeps the `_vertical` of its source so colour-coding
// reflects content origin rather than row.
function buildRow(rowVertical, issue, fillerPool) {
  const real = (issue[rowVertical] || []).map((it) => ({ ...it, _vertical: rowVertical, _isFiller: false }))
  const out = [...real]
  let fillerIdx = 0
  while (out.length < TILES_PER_ROW && fillerPool.length > 0) {
    const src = fillerPool[fillerIdx % fillerPool.length]
    out.push({
      ...src,
      _vertical: src._sourceVertical || 'music',
      _isFiller: true,
      id: `${src.id}__${rowVertical}_filler_${fillerIdx}`,
    })
    fillerIdx++
  }
  return out
}

export default function CylinderGallery({ issue, focusedId, onTileSelect, rotation = 0 }) {
  const groupRef = useRef(null)

  // Smooth rotation toward the externally driven yaw target
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += (rotation - groupRef.current.rotation.y) * 0.12
  })

  const tiles = useMemo(() => {
    if (!issue) return []

    // Filler pool — music by default, since that's the abundant category
    // in a typical Sruth week. Falls back to whichever vertical has the
    // most items if music itself is sparse.
    const verticalSizes = ROWS.map((v) => ({ v, n: (issue[v] || []).length }))
    const sorted = [...verticalSizes].sort((x, y) => y.n - x.n)
    const fillerVertical = sorted[0]?.v || 'music'
    const fillerPool = (issue[fillerVertical] || []).map((it) => ({ ...it, _sourceVertical: fillerVertical }))

    const rowsCount = ROWS.length
    const centreOffset = (rowsCount - 1) / 2 // so rows are vertically centred on Y=0

    const allTiles = []
    ROWS.forEach((rowVertical, rowIdx) => {
      const rowItems = buildRow(rowVertical, issue, fillerPool)
      const y = (centreOffset - rowIdx) * ROW_VERTICAL_GAP
      const n = rowItems.length

      rowItems.forEach((item, colIdx) => {
        // Even distribution around the circle, with a half-step stagger
        // every other row so neighbouring rows aren't column-aligned
        // (more interesting to look at and reduces vertical seam lines).
        const angle = (colIdx / n) * Math.PI * 2 + (rowIdx % 2 ? Math.PI / n : 0)
        const x = Math.sin(angle) * RADIUS
        const z = Math.cos(angle) * RADIUS
        // Yaw makes the tile's +Z normal point inward toward (0,0,0)
        const yaw = angle + Math.PI

        allTiles.push({
          key: `${item._vertical}-${item.id}`,
          item,
          vertical: item._vertical,
          isFiller: item._isFiller,
          position: [x, y, z],
          rotation: [0, yaw, 0],
        })
      })
    })
    return allTiles
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
