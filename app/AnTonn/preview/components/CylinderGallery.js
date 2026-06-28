'use client'

// CylinderGallery — v13 revert. Going back to the v11 cylinder
// architecture that was working: 11×11 cells on a closed cylinder with
// dark disk caps top and bottom, the vortex shader showing through
// between tiles. Two fixes from v11 issues:
//
//   1. NO MORE DIMMING. Every tile renders at full opacity, including
//      filler music duplicates. The previous "dim fillers to mark them
//      as repeats" effect was making panels read as empty.
//   2. Double-sided materials on tiles so orientation errors can never
//      produce invisible faces.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CylinderTile from './CylinderTile'

const RADIUS = 6.0
const COLS = 11
const ROWS = 11

const CELL_ARC = (Math.PI * 2) / COLS
const CELL_W   = 2 * RADIUS * Math.sin(Math.PI / COLS)
const CELL_H   = CELL_W
const TOTAL_H  = ROWS * CELL_H
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

function padItems(items, issue, targetCount, cols) {
  if (items.length >= targetCount) return items.slice(0, targetCount)
  const sizes = ['music', 'books', 'podcasts', 'film', 'radio']
    .map((v) => ({ v, n: (issue[v] || []).length }))
    .sort((a, b) => b.n - a.n)
  const fillerVertical = sizes[0]?.v || 'music'
  const fillerPool = issue[fillerVertical] || []
  if (fillerPool.length === 0) return items

  const out = [...items]
  const stride = chooseCoprime(fillerPool.length, cols)
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
  // No-adjacent-duplicates swap pass
  for (let pos = items.length; pos < out.length; pos++) {
    const row = Math.floor(pos / cols)
    const col = pos % cols
    const leftBase = col > 0 ? out[pos - 1]?.id?.split('__')[0] : null
    const upBase = row > 0 ? out[pos - cols]?.id?.split('__')[0] : null
    const myBase = out[pos].id.split('__')[0]
    if ((leftBase && myBase === leftBase) || (upBase && myBase === upBase)) {
      for (let swap = pos + 1; swap < out.length; swap++) {
        const swapBase = out[swap].id.split('__')[0]
        if (swapBase !== leftBase && swapBase !== upBase) {
          ;[out[pos], out[swap]] = [out[swap], out[pos]]
          break
        }
      }
    }
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
    const allItems = padItems(realItems, issue, targetCount, COLS)

    const cells = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const idx = row * COLS + col
        const item = allItems[idx]
        if (!item) continue

        const yCenter = Y_TOP - (row + 0.5) * CELL_H
        const thetaStart = col * CELL_ARC

        cells.push({
          key: `${row}-${col}-${item.id}`,
          item,
          vertical: item._vertical,
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
      {/* Top cap — dark disk closes off the cylinder so the user can't
          see "out" when looking up past the top row. */}
      <mesh position={[0, Y_TOP + 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[RADIUS * 1.01, 128]} />
        <meshBasicMaterial color="#020409" side={THREE.DoubleSide} />
      </mesh>

      {/* Bottom cap */}
      <mesh position={[0, -Y_TOP - 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[RADIUS * 1.01, 128]} />
        <meshBasicMaterial color="#020409" side={THREE.DoubleSide} />
      </mesh>

      {cells.map(({ key, item, vertical, yCenter, thetaStart, thetaArc, cellHeight }) => (
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
          onSelect={onTileSelect}
        />
      ))}
    </group>
  )
}
