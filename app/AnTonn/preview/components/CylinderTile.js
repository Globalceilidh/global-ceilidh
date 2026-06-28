'use client'

// DomeTile (file still called CylinderTile so imports don't move) — v18.
//
// One cell on the inside of a sphere of radius R centred on the camera.
//
// Geometry construction: a small SphereGeometry segment built once
// centred at (-Z, equator) in local space — that's just "in front of
// the camera." The mesh's per-frame rotation moves it to its current
// angular grid position.
//
// Wrap math: a cell's home grid position is (gridR, gridC). Each frame
// we add the smoothed drag offset (in cell units), take the result
// modulo (rows, cols), and recentre around 0. That keeps every cell
// somewhere inside the 11×11 window — no empty slots ever — and
// off-screen cells naturally wrap to the opposite side when the drag
// pushes them out.
//
// Because the geometry IS a sphere segment, the cell curves in two
// directions at once: the upper-right corner of an upper-right cell
// bends up and right, which is what a fisheye view of a curved surface
// should look like.

import { useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export default function DomeTile({
  item,
  gridR,
  gridC,
  radius,
  step,
  rows,
  cols,
  smoothedURef,
  smoothedVRef,
  onSelect,
  focused,
}) {
  const meshRef = useRef(null)
  const [internalHover, setInternalHover] = useState(false)
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    if (!item?.cover_url) return
    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      item.cover_url,
      (tex) => {
        if (cancelled) return
        tex.colorSpace = THREE.SRGBColorSpace
        setTexture(tex)
      },
      undefined,
      () => {},
    )
    return () => { cancelled = true }
  }, [item?.cover_url])

  // Pre-built segment centred at -Z. Image fills 2/3 of the cell's
  // angular extent so the surrounding 1/3 of each cell is the dark
  // gap where the vortex bleeds through.
  const imageGeom = useMemo(() => {
    const fill = 2 / 3
    const half = (step * fill) / 2
    // SphereGeometry's phi=0 is +Z, theta=π/2 is the equator. We build
    // the segment centred at (phi=π, theta=π/2) so it lives at -Z.
    const g = new THREE.SphereGeometry(
      radius * 0.998,
      14, 10,
      Math.PI - half, half * 2,
      Math.PI / 2 - half, half * 2,
    )
    // UV rescale + horizontal flip for BackSide rendering.
    const uv = g.attributes.uv
    let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity
    for (let i = 0; i < uv.count; i++) {
      const u = uv.getX(i), v = uv.getY(i)
      if (u < uMin) uMin = u
      if (u > uMax) uMax = u
      if (v < vMin) vMin = v
      if (v > vMax) vMax = v
    }
    const uRange = (uMax - uMin) || 1
    const vRange = (vMax - vMin) || 1
    for (let i = 0; i < uv.count; i++) {
      uv.setX(i, 1 - (uv.getX(i) - uMin) / uRange)
      uv.setY(i, (uv.getY(i) - vMin) / vRange)
    }
    uv.needsUpdate = true
    return g
  }, [step, radius])

  // Per-frame: wrap (gridR + dragV) and (gridC + dragU) into [-cols/2, cols/2),
  // convert to (pitch, yaw), and apply to the mesh's rotation.
  useFrame(() => {
    if (!meshRef.current) return
    const dragU = (smoothedURef?.current ?? 0) / step  // radians → cell units
    const dragV = (smoothedVRef?.current ?? 0) / step

    const wrap = (v, n) => {
      const half = n / 2
      return ((v + half) % n + n) % n - half
    }
    const effC = wrap(gridC + dragU, cols)
    const effR = wrap(gridR + dragV, rows)

    // Yaw around Y axis (horizontal), pitch around X axis (vertical).
    // Grid R positive means "up the screen," so pitch needs to be negative.
    meshRef.current.rotation.y = effC * step
    meshRef.current.rotation.x = -effR * step

    const hot = internalHover || focused
    const target = hot ? 1.04 : 1.0
    meshRef.current.scale.x += (target - meshRef.current.scale.x) * 0.18
    meshRef.current.scale.y = meshRef.current.scale.x
    meshRef.current.scale.z = meshRef.current.scale.x
  })

  return (
    <mesh
      ref={meshRef}
      geometry={imageGeom}
      onPointerOver={(e) => { e.stopPropagation(); setInternalHover(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setInternalHover(false); document.body.style.cursor = 'auto' }}
      onClick={(e) => { e.stopPropagation(); onSelect?.(item) }}
    >
      <meshBasicMaterial
        map={texture}
        color={texture ? '#ffffff' : '#1a1f2a'}
        side={THREE.BackSide}
      />
    </mesh>
  )
}
