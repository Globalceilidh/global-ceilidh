'use client'

// CylinderGallery — Phantom-style 11×11 grid wallpaper on the inside of
// a vertical cylinder, with per-tile geometry CURVED to match the
// cylinder surface (so the overall cylinder reads as smooth, not as
// an 11-faceted hendecagon).
//
// Each cell mesh is a subdivided plane whose vertices are warped so the
// plane follows an arc of the cylinder. Adjacent cells meet seamlessly
// along their shared edge — no flat-face seams, no visible polygon
// joints. Geometry is built once at module load and shared across all
// 121 cells (instances, not instances-of-instances, so it's cheap).

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Tile from './Tile'

const RADIUS = 6.0
const COLS = 11
const ROWS = 11
const IMAGE_RATIO = 0.60        // image plane size as fraction of cell — smaller = more border
const CELL_OVERLAP = 1.04       // cell BG extends 4% beyond touching edge so cells visibly join
const CURVE_SUBDIVISIONS = 16   // horizontal subdivisions per cell — enough for smooth arc at 11 cols

const CELL_W = 2 * RADIUS * Math.sin(Math.PI / COLS)
const CELL_H = CELL_W
const ROW_Y_OFFSET = (ROWS - 1) / 2
const CELL_ANGLE = (Math.PI * 2) / COLS

// Pre-built curved cell geometry, shared across all 121 cells. Vertices
// in the horizontal direction are pushed back along Z so the plane traces
// an arc on the cylinder. Z=0 at cell center, Z=-bulge at cell edges,
// where bulge = R - R·cos(half-cell-angle).
function buildCurvedCellGeometry() {
  // Slightly oversized so adjacent cells overlap by CELL_OVERLAP and
  // there's no gap between neighbouring BG planes.
  const w = CELL_W * CELL_OVERLAP
  const h = CELL_H * CELL_OVERLAP
  const g = new THREE.PlaneGeometry(w, h, CURVE_SUBDIVISIONS, 1)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const lx = pos.getX(i)
    // Each vertex's angle relative to the cell's center, on the cylinder.
    // The cell's "tangent" axis is local +X. lx / RADIUS gives the angle
    // subtended from the cell centre to this vertex (small-angle approx).
    const subAngle = lx / RADIUS
    // Push the vertex back (away from camera at origin) by however much
    // the cylinder surface deviates from the flat tangent at that angle.
    // Negative Z = away from the camera at the cylinder centre.
    const zShift = -(RADIUS - RADIUS * Math.cos(subAngle))
    pos.setZ(i, zShift)
  }
  pos.needsUpdate = true
  g.computeVertexNormals()
  return g
}

const CURVED_CELL_GEOM = buildCurvedCellGeometry()

// A smaller curved geom for the image plane — same arc-on-cylinder math
// but at imageRatio scale. Built independently so the image's curve
// depth is correct for its actual width rather than scaled from the
// larger cell geom.
function buildImageGeometry() {
  const w = CELL_W * IMAGE_RATIO
  const h = CELL_H * IMAGE_RATIO
  const g = new THREE.PlaneGeometry(w, h, CURVE_SUBDIVISIONS, 1)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const lx = pos.getX(i)
    const subAngle = lx / RADIUS
    const zShift = -(RADIUS - RADIUS * Math.cos(subAngle))
    pos.setZ(i, zShift)
  }
  pos.needsUpdate = true
  g.computeVertexNormals()
  return g
}

const CURVED_IMAGE_GEOM = buildImageGeometry()

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
        const x = Math.sin(angle) * RADIUS
        const z = Math.cos(angle) * RADIUS
        const y = (ROW_Y_OFFSET - row) * CELL_H * CELL_OVERLAP
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
          cellGeom={CURVED_CELL_GEOM}
          imageGeom={CURVED_IMAGE_GEOM}
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
