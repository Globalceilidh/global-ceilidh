'use client'

// CylinderGallery — v8 architecture.
//
// Backdrop: one big CylinderGeometry mesh renders the dark translucent
// wall behind every tile. Because it's a single continuous cylinder
// (32 radial segments, smooth shading) there are zero seams between
// columns — adjacent tiles share the same wall surface, no visible
// boundary, no double-blending where two BG planes used to overlap.
//
// Per-tile content: each cell is a Tile group that holds only the
// image + per-vertical accent frame + four corner Gàidhlig labels.
// No background plane per tile (the cylinder mesh handles that), so
// there's nothing for adjacent tiles' edges to collide against.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Tile from './Tile'

const RADIUS = 6.0
const COLS = 11
const ROWS = 11
const IMAGE_RATIO = 0.60
const RADIAL_SEGMENTS = 64       // higher = smoother cylinder curve, no visible flats

const CELL_W = 2 * RADIUS * Math.sin(Math.PI / COLS)
const CELL_H = CELL_W
const ROW_Y_OFFSET = (ROWS - 1) / 2
const CYLINDER_HEIGHT = ROWS * CELL_H

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

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += (rotation - groupRef.current.rotation.y) * 0.12
  })

  const cells = useMemo(() => {
    const realItems = buildItemList(issue)
    if (realItems.length === 0) return []
    const targetCount = ROWS * COLS
    const allItems = padItems(realItems, issue, targetCount)

    const cells = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const idx = row * COLS + col
        const item = allItems[idx]
        if (!item) continue

        const angle = (col / COLS) * Math.PI * 2
        const x = Math.sin(angle) * RADIUS * 0.985  // pull tile content slightly inward
                                                     // off the cylinder wall so they sit
                                                     // ON the wall, not embedded in it
        const z = Math.cos(angle) * RADIUS * 0.985
        const y = (ROW_Y_OFFSET - row) * CELL_H
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
      {/* The wall — single continuous cylinder, rendered from the inside
          via side=BackSide. Zero seams across columns. */}
      <mesh>
        <cylinderGeometry args={[RADIUS, RADIUS, CYLINDER_HEIGHT, RADIAL_SEGMENTS, 1, true]} />
        <meshBasicMaterial
          color="#070b14"
          transparent
          opacity={0.42}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Per-tile content on top of the wall */}
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
