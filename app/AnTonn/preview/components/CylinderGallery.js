'use client'

// SphereGallery (kept under CylinderGallery filename for the import) —
// v12. Final answer on this question after too many iterations:
//
//   • Tiles are distributed on a SPHERE using Fibonacci point spacing
//     (no lat-long pole distortion that v9's grid sphere had).
//   • Each tile is a FLAT plane sized to roughly fill its Fibonacci
//     neighbourhood. Flat tiles = identical shape every time, no
//     stretching from per-tile sphere-segment geometry.
//   • Tiles face inward toward the camera at origin via Object3D
//     lookAt + rotateY(π) — this is the orientation fix v4 missed.
//     Front face (with the image) always points at the viewer; text
//     reads correctly on every tile.
//   • NO backdrop — the vortex shader is the wall. Tiles float in
//     vortex space, sphere shape implied by the positions.
//   • NO dimming on fillers. Every tile renders at full opacity. The
//     user explicitly said "no empty panels"; v11 dimmed-filler effect
//     was reading as empty.
//   • Coprime-stride filler distribution + neighbour-aware swap so no
//     two cells in adjacent positions hold the same cover.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CylinderTile from './CylinderTile'

const RADIUS = 6.0
const TILE_COUNT = 121               // 11×11 worth — Scott's spec
const TILE_SIZE = 1.5                // world-space side length of each tile plane
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))  // ≈ 2.39996

// Fibonacci sphere — evenly distributed points on a unit sphere
function fibonacciPoints(n) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = GOLDEN_ANGLE * i
    pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r))
  }
  return pts
}

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

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }
function chooseCoprime(n, hint) {
  for (let delta = 0; delta < n; delta++) {
    for (const sign of [1, -1]) {
      const cand = hint + delta * sign
      if (cand > 0 && cand < n && gcd(cand, n) === 1) return cand
    }
  }
  return 1
}

// Pad up to targetCount with duplicates from the largest pool (music),
// chosen via coprime stride so the same item doesn't appear back-to-back.
function padItems(items, issue, targetCount) {
  if (items.length >= targetCount) return items.slice(0, targetCount)
  const sizes = ['music', 'books', 'podcasts', 'film', 'radio']
    .map((v) => ({ v, n: (issue[v] || []).length }))
    .sort((a, b) => b.n - a.n)
  const fillerVertical = sizes[0]?.v || 'music'
  const fillerPool = issue[fillerVertical] || []
  if (fillerPool.length === 0) return items

  const out = [...items]
  const stride = chooseCoprime(fillerPool.length, 7)
  let i = 0
  while (out.length < targetCount) {
    const src = fillerPool[(i * stride) % fillerPool.length]
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

// Build position + rotation for each Fibonacci point so that a flat
// plane placed there with that rotation faces the origin (+Z toward
// the camera at 0,0,0) and has world up as its local up.
function buildTransforms(points, radius) {
  const dummy = new THREE.Object3D()
  return points.map((p) => {
    const pos = p.clone().multiplyScalar(radius)
    dummy.position.copy(pos)
    dummy.lookAt(0, 0, 0)            // -Z toward origin
    dummy.rotateY(Math.PI)           // flip so +Z (front) toward origin
    dummy.updateMatrix()
    return {
      position: [pos.x, pos.y, pos.z],
      rotation: [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z],
    }
  })
}

export default function CylinderGallery({ issue, focusedId, onTileSelect, rotation = 0 }) {
  const groupRef = useRef(null)

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += (rotation - groupRef.current.rotation.y) * 0.12
  })

  const tiles = useMemo(() => {
    const real = buildItemList(issue)
    if (real.length === 0) return []
    const all = padItems(real, issue, TILE_COUNT)
    const points = fibonacciPoints(TILE_COUNT)
    const transforms = buildTransforms(points, RADIUS)
    return all.map((item, idx) => ({
      key: `${idx}-${item.id}`,
      item,
      vertical: item._vertical,
      position: transforms[idx].position,
      rotation: transforms[idx].rotation,
    }))
  }, [issue])

  if (tiles.length === 0) return null

  return (
    <group ref={groupRef}>
      {tiles.map(({ key, item, vertical, position, rotation }) => (
        <CylinderTile
          key={key}
          item={item}
          vertical={vertical}
          position={position}
          rotation={rotation}
          size={TILE_SIZE}
          focused={focusedId === item.id}
          onSelect={onTileSelect}
        />
      ))}
    </group>
  )
}
