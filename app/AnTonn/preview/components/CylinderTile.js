'use client'

// SphereTileSegment — v14. One curved sphere-segment cell, rendered
// from inside the sphere (BackSide) with horizontally-flipped UVs so
// the texture reads correctly (BackSide alone would mirror it).
//
// No accent border. Just the image plus four small corner labels
// rotated to face the camera at origin.

import { useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

const VERTICAL_LABEL_GD = {
  music:    'CEÒL',
  podcasts: 'PODCAST',
}

function secondaryField(item, vertical) {
  if (vertical === 'music') return item.album || ''
  if (vertical === 'podcasts') return item.year ? String(item.year) : ''
  return ''
}

function sphericalToCartesian(R, phi, theta) {
  const sinT = Math.sin(theta)
  return new THREE.Vector3(
    R * sinT * Math.sin(phi),
    R * Math.cos(theta),
    R * sinT * Math.cos(phi),
  )
}

function SphereLabel({ position, text, fontSize, color, anchorX, anchorY }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.position.set(position.x, position.y, position.z)
    ref.current.lookAt(0, 0, 0)
    // No rotateY(PI) here — Drei <Text> is double-sided, and we want
    // the readable face pointing toward the camera at origin which is
    // exactly what lookAt(0,0,0) produces (object's -Z toward origin,
    // text faces +Z by default).
  }, [position.x, position.y, position.z])
  return (
    <group ref={ref}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX={anchorX}
        anchorY={anchorY}
        outlineColor="#000"
        outlineWidth={fontSize * 0.06}
        fillOpacity={0.95}
      >
        {text}
      </Text>
    </group>
  )
}

export default function SphereTileSegment({
  item,
  vertical,
  radius,
  phiCenter,
  thetaCenter,
  phiSpan,
  thetaSpan,
  onSelect,
  hovered,
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

  useFrame(() => {
    if (!meshRef.current) return
    const target = (internalHover || hovered || focused) ? 1.04 : 1.0
    meshRef.current.scale.x += (target - meshRef.current.scale.x) * 0.18
    meshRef.current.scale.y = meshRef.current.scale.x
    meshRef.current.scale.z = meshRef.current.scale.x
  })

  // Sphere segment for the image. 92% fill leaves an 8% translucent
  // border where the vortex shows through.
  //
  // CRITICAL UV FIX: Three.js generates SphereGeometry UVs based on
  // the FULL sphere's UV layout — so a segment covering 1/11 of phi
  // gets UVs in roughly [0, 0.09]. With the texture mapped that way,
  // each tile would sample only the rightmost 9% of the image, which
  // for most album covers reads as near-white-uniform.
  //
  // Fix: rescale each segment's UVs to span the full [0,1] × [0,1]
  // range. THEN flip U for BackSide rendering.
  const imageGeom = useMemo(() => {
    const fill = 0.92
    const imgPhi = phiSpan * fill
    const imgTheta = thetaSpan * fill
    const g = new THREE.SphereGeometry(
      radius * 0.996,
      12, 8,
      phiCenter - imgPhi / 2, imgPhi,
      thetaCenter - imgTheta / 2, imgTheta,
    )
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
      const u = (uv.getX(i) - uMin) / uRange
      const v = (uv.getY(i) - vMin) / vRange
      uv.setX(i, 1 - u)   // flip horizontally for BackSide
      uv.setY(i, v)
    }
    uv.needsUpdate = true
    return g
  }, [phiCenter, thetaCenter, phiSpan, thetaSpan, radius])

  const tlLabel = VERTICAL_LABEL_GD[vertical] || ''
  const trLabel = (item.creator || '').toUpperCase()
  const blLabel = (item.title || '').toUpperCase()
  const brLabel = secondaryField(item, vertical).toUpperCase()

  // Two labels per tile, both well inside the tile boundary so they
  // never collide with adjacent tiles' labels at the grid vertices.
  //   • Top-left: category (CEÒL or PODCAST)
  //   • Bottom-left: title
  // The previous 4-corner layout meant 4 labels converged at every
  // grid intersection — unreadable.
  const cornerR = radius * 0.99
  const phiInset = phiSpan * 0.32
  const thetaInset = thetaSpan * 0.32
  const tlPos = sphericalToCartesian(cornerR, phiCenter - phiInset, thetaCenter - thetaInset)
  const blPos = sphericalToCartesian(cornerR, phiCenter - phiInset, thetaCenter + thetaInset)

  // Font size scaled with cell size so labels remain readable but
  // small (~6% of the cell width).
  const cellArcAtMidRow = phiSpan * Math.sin(thetaCenter) * radius
  const fontSize = Math.max(0.045, cellArcAtMidRow * 0.07)

  return (
    <group>
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

      <SphereLabel position={tlPos} text={tlLabel} fontSize={fontSize * 0.85} color="#F2ECDC" anchorX="left" anchorY="top" />
      <SphereLabel position={blPos} text={blLabel} fontSize={fontSize}        color="#F2ECDC" anchorX="left" anchorY="bottom" />
    </group>
  )
}
