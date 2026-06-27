'use client'

// CylinderGallery — v10. Reverting v9's sphere experiment. The Phantom
// reference is a cylinder; we're going back to a cylinder. Two
// improvements over v8:
//
//   1. Each tile uses a per-tile CylinderGeometry SEGMENT (not a flat
//      plane). The segment's arc matches the wall's arc exactly, so
//      tiles bend with the cylinder rather than sitting as flat
//      polygons on a curved wall. No more "paintings on a wall."
//      Equally, every tile is the same shape — no lat-long distortion
//      like v9 had.
//
//   2. The wall is closed: top and bottom disk caps render in dark so
//      the user can't see "out" if they pitch toward the ends. Combined
//      with a pitch clamp of ±50° this matches the Phantom feel of
//      being fully inside a continuous wraparound surface.
//
// The corner-label layout from v8 stays — top-left CEÒL/LEABHAR/etc,
// top-right creator, bottom-left title, bottom-right album/year/blank,
// at ~1/4 the v8 font size.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CylinderTile from './CylinderTile'

const RADIUS = 6.0
const COLS = 11
const ROWS = 11

const CELL_ARC = (Math.PI * 2) / COLS         // angular span per column
const CELL_W   = 2 * RADIUS * Math.sin(Math.PI / COLS)  // chord (~1.69 at R=6)
const CELL_H   = CELL_W                        // square cells
const TOTAL_H  = ROWS * CELL_H                 // cylinder height (~18.6)
const Y_TOP    = TOTAL_H / 2

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

        // Tile centre Y: row 0 at top, row (ROWS-1) at bottom
        const yCenter = Y_TOP - (row + 0.5) * CELL_H
        // Tile angular start (theta=0 is +Z, increases toward +X)
        const thetaStart = col * CELL_ARC

        cells.push({
          key: `${row}-${col}-${item.id}`,
          item,
          vertical: item._vertical,
          isFiller: item._isFiller,
          yCenter,
          thetaStart,
          thetaArc: CELL_ARC,
          cellHeight: CELL_H,
        })
      }
    }
    return cells
  }, [issue])

  if (cells.length === 0) return null

  return (
    <group ref={groupRef}>
      {/* The wall — single continuous cylinder rendered from the inside.
          High radial segment count for a smooth circular cross-section.
          Translucent dark wash so the vortex glows through where the
          tiles don't sit. */}
      <mesh>
        <cylinderGeometry args={[RADIUS, RADIUS, TOTAL_H, 128, 1, true]} />
        <meshBasicMaterial
          color="#070b14"
          transparent
          opacity={0.42}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Top cap — dark disk that closes the cylinder so the user can't
          see "out" when looking up past the top row. Renders facing
          down (into the cylinder interior). */}
      <mesh position={[0, Y_TOP + 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[RADIUS * 1.01, 128]} />
        <meshBasicMaterial color="#020409" side={THREE.DoubleSide} />
      </mesh>

      {/* Bottom cap — same, mirrored */}
      <mesh position={[0, -Y_TOP - 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[RADIUS * 1.01, 128]} />
        <meshBasicMaterial color="#020409" side={THREE.DoubleSide} />
      </mesh>

      {/* Per-tile content — curved cylinder segments + corner labels */}
      {cells.map(({ key, item, vertical, isFiller, yCenter, thetaStart, thetaArc, cellHeight }) => (
        <CylinderTile
          key={key}
          item={item}
          vertical={vertical}
          radius={RADIUS}
          yCenter={yCenter}
          thetaStart={thetaStart}
          thetaArc={thetaArc}
          cellHeight={cellHeight}
          focused={focusedId === item.id}
          dimmed={isFiller}
          onSelect={onTileSelect}
        />
      ))}
    </group>
  )
}
