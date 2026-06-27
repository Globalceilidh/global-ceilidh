'use client'

// SphereGallery — v9. Replaces the cylinder entirely with a true closed
// sphere. The user stands inside a complete dome with no openings; tiles
// are arrayed on the inside surface in an 11×11 lat-long grid.
//
// Why this finally fixes the "hexagonal" / "flat tiles on a wall" feel:
//
//   1. The backdrop wall is a single closed SphereGeometry rendered from
//      the inside (BackSide). No facets, no seams, no openings — you
//      can no longer see "out" the top or bottom because there's no
//      top or bottom hole. Smooth curvature everywhere.
//
//   2. Each tile is a sphere SEGMENT (a small region of a sphere of
//      slightly smaller radius) instead of a flat plane. The image
//      texture maps to the segment's UVs, so the image itself genuinely
//      curves with the sphere — no more "paintings on a wall." Adjacent
//      segments share the same sphere surface, so tiles flow into each
//      other along their boundaries.
//
//   3. Camera FOV is bumped to 110° in CylinderClient. Combined with
//      the curved geometry, tiles at the edges of the viewport visibly
//      stretch outward (gyrosphere / fisheye effect).
//
// Grid layout: 11 longitudes × 11 latitudes, with the latitude range
// pulled in from the poles by 0.2 rad so the cells near the very top
// and bottom don't collapse into points.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SphereTile from './SphereTile'

const RADIUS = 6.0
const COLS = 11
const ROWS = 11
const POLE_INSET = 0.2                          // rad — keep tiles off the very poles
const IMAGE_FRAC = 0.62                          // image segment as fraction of cell angular span
const ACCENT_FRAC = 0.66                         // accent ring slightly larger than image

const PHI_SPAN = (2 * Math.PI) / COLS            // longitude angle per cell
const THETA_RANGE = Math.PI - 2 * POLE_INSET     // total latitude angle used
const THETA_SPAN = THETA_RANGE / ROWS            // latitude angle per cell

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

        const phiCenter = (col / COLS) * Math.PI * 2
        // Three.js sphere theta: 0 at top, PI at bottom. We want our row
        // 0 at top, row (ROWS-1) at bottom, with POLE_INSET buffer.
        const thetaCenter = POLE_INSET + ((row + 0.5) / ROWS) * THETA_RANGE

        cells.push({
          key: `${row}-${col}-${item.id}`,
          item,
          vertical: item._vertical,
          isFiller: item._isFiller,
          phiCenter,
          thetaCenter,
        })
      }
    }
    return cells
  }, [issue])

  if (cells.length === 0) return null

  return (
    <group ref={groupRef}>
      {/* The wall — single closed sphere, rendered from the inside via
          side=BackSide. Dark and translucent so the vortex glows
          through. Closed = no holes at top/bottom that the user can
          "see out" through. */}
      <mesh>
        <sphereGeometry args={[RADIUS, 64, 48]} />
        <meshBasicMaterial
          color="#070b14"
          transparent
          opacity={0.42}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Per-tile content — sphere segments + corner labels */}
      {cells.map(({ key, item, vertical, isFiller, phiCenter, thetaCenter }) => (
        <SphereTile
          key={key}
          item={item}
          vertical={vertical}
          phiCenter={phiCenter}
          thetaCenter={thetaCenter}
          phiSpan={PHI_SPAN}
          thetaSpan={THETA_SPAN}
          imageFrac={IMAGE_FRAC}
          accentFrac={ACCENT_FRAC}
          radius={RADIUS}
          focused={focusedId === item.id}
          dimmed={isFiller}
          onSelect={onTileSelect}
        />
      ))}
    </group>
  )
}
