'use client'

// SphereTile — one cell on the inside of the sphere. Built fresh for v9
// to replace the flat-plane Tile component.
//
// Each tile is composed of:
//   • An accent-tinted sphere segment (thin ring behind the image)
//   • An image sphere segment (the cover art, genuinely curved along the
//     sphere surface — no more "painting on a wall")
//   • Four corner labels in white, positioned at the tile's corner
//     coordinates on the sphere surface, oriented to face the camera at
//     centre with up = world up.
//
// All meshes are rendered in WORLD coordinates within the parent group's
// frame (the group rotates as the user drags). No per-tile group needed
// because the SphereGeometry segments already encode their position via
// phiStart / thetaStart.

import { useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

const VERTICAL_TINT = {
  music:    '#C9A047',
  books:    '#6B4E1F',
  podcasts: '#7A4A8C',
  film:     '#A8323D',
  radio:    '#3F6E2A',
  tours:    '#1F4E6E',
}

const VERTICAL_LABEL_GD = {
  music:    'CEÒL',
  books:    'LEABHAR',
  podcasts: 'PODCAST',
  film:     'BHIDEO',
  radio:    'RÈIDIO',
  tours:    'CUAIRT',
}

function secondaryField(item, vertical) {
  if (vertical === 'music') return item.album || ''
  if (vertical === 'film') return item.year ? String(item.year) : ''
  if (vertical === 'podcasts') return item.year ? String(item.year) : ''
  return ''
}

// Convert (phi, theta) on a sphere of given radius to Cartesian (x, y, z).
// Three.js convention: phi is longitude (XZ plane), theta is from +Y down
// to -Y. So:
//   x = R · sin(theta) · sin(phi)
//   y = R · cos(theta)
//   z = R · sin(theta) · cos(phi)
function sphericalToCartesian(R, phi, theta) {
  const sinT = Math.sin(theta)
  return new THREE.Vector3(
    R * sinT * Math.sin(phi),
    R * Math.cos(theta),
    R * sinT * Math.cos(phi),
  )
}

// A small floating label positioned on the sphere, facing the camera at
// origin. Useful for the four corner labels of each tile. The group is
// transformed once on mount to lookAt(0,0,0) + rotateY(PI) so the text's
// front face points toward the centre.
function SphereLabel({ position, text, fontSize, color, anchorX, anchorY, dimmed }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.position.set(position.x, position.y, position.z)
    ref.current.lookAt(0, 0, 0)
    ref.current.rotateY(Math.PI)
  }, [position.x, position.y, position.z])
  return (
    <group ref={ref}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX={anchorX}
        anchorY={anchorY}
        outlineColor="#000"
        outlineWidth={fontSize * 0.05}
        fillOpacity={dimmed ? 0.55 : 0.92}
      >
        {text}
      </Text>
    </group>
  )
}

export default function SphereTile({
  item,
  vertical,
  phiCenter,
  thetaCenter,
  phiSpan,
  thetaSpan,
  imageFrac = 0.62,
  accentFrac = 0.66,
  radius,
  onSelect,
  hovered,
  focused,
  dimmed = false,
}) {
  const imageRef = useRef(null)
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

  // Subtle scale-up on hover/focus, applied to the image mesh
  useFrame(() => {
    if (!imageRef.current) return
    const target = (internalHover || hovered || focused) ? 1.05 : 1.0
    imageRef.current.scale.x += (target - imageRef.current.scale.x) * 0.18
    imageRef.current.scale.y = imageRef.current.scale.x
    imageRef.current.scale.z = imageRef.current.scale.x
  })

  // Build the two sphere-segment geometries — image (inner radius) and
  // accent (slightly outer radius) — once per tile. Cached in useMemo
  // because each segment is unique to its phi/theta range.
  const imageGeom = useMemo(() => {
    const imgPhi = phiSpan * imageFrac
    const imgTheta = thetaSpan * imageFrac
    return new THREE.SphereGeometry(
      radius * 0.992,             // slightly inside the wall so it doesn't z-fight
      6, 4,
      phiCenter - imgPhi / 2, imgPhi,
      thetaCenter - imgTheta / 2, imgTheta,
    )
  }, [phiCenter, thetaCenter, phiSpan, thetaSpan, imageFrac, radius])

  const accentGeom = useMemo(() => {
    const accPhi = phiSpan * accentFrac
    const accTheta = thetaSpan * accentFrac
    return new THREE.SphereGeometry(
      radius * 0.988,
      6, 4,
      phiCenter - accPhi / 2, accPhi,
      thetaCenter - accTheta / 2, accTheta,
    )
  }, [phiCenter, thetaCenter, phiSpan, thetaSpan, accentFrac, radius])

  const tint = VERTICAL_TINT[vertical] || '#888'
  const tlLabel = VERTICAL_LABEL_GD[vertical] || ''
  const trLabel = (item.creator || '').toUpperCase()
  const blLabel = (item.title || '').toUpperCase()
  const brLabel = secondaryField(item, vertical).toUpperCase()

  // Corner positions just inside the sphere surface so they sit slightly
  // in front of the image. Inset by 10% of cell span so labels don't sit
  // right at the seam with adjacent tiles.
  const cornerR = radius * 0.985
  const labelInsetPhi = phiSpan * 0.42
  const labelInsetTheta = thetaSpan * 0.42
  const tlPos = sphericalToCartesian(cornerR, phiCenter - labelInsetPhi, thetaCenter - labelInsetTheta)
  const trPos = sphericalToCartesian(cornerR, phiCenter + labelInsetPhi, thetaCenter - labelInsetTheta)
  const blPos = sphericalToCartesian(cornerR, phiCenter - labelInsetPhi, thetaCenter + labelInsetTheta)
  const brPos = sphericalToCartesian(cornerR, phiCenter + labelInsetPhi, thetaCenter + labelInsetTheta)

  // Font size — 1/4 of v8's size per user request. With radius 6 and
  // cell arc ~33°, cell world-size ≈ 1.7; v8 used fontSize ≈ 0.10
  // (≈ 6% of cell). v9 drops to ~0.025 (1.5% of cell) — about a quarter.
  const fontSize = 0.025

  return (
    <group>
      {/* Per-vertical accent — coloured sphere segment slightly larger
          than the image, rendered behind it */}
      <mesh geometry={accentGeom}>
        <meshBasicMaterial
          color={tint}
          transparent
          opacity={dimmed ? 0.30 : (internalHover || hovered ? 0.95 : 0.70)}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Image — curved sphere segment, image texture mapped via UVs */}
      <mesh
        ref={imageRef}
        geometry={imageGeom}
        onPointerOver={(e) => { e.stopPropagation(); setInternalHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setInternalHover(false); document.body.style.cursor = 'auto' }}
        onClick={(e) => { e.stopPropagation(); onSelect?.(item) }}
      >
        <meshBasicMaterial
          map={texture}
          color={texture ? '#ffffff' : '#1a1f2a'}
          transparent
          opacity={dimmed ? 0.78 : 1.0}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Corner labels — 4 small white texts at the tile corners */}
      <SphereLabel position={tlPos} text={tlLabel} fontSize={fontSize} color="#F2ECDC" anchorX="left"  anchorY="top"    dimmed={dimmed} />
      <SphereLabel position={trPos} text={trLabel} fontSize={fontSize} color="#F2ECDC" anchorX="right" anchorY="top"    dimmed={dimmed} />
      <SphereLabel position={blPos} text={blLabel} fontSize={fontSize} color="#F2ECDC" anchorX="left"  anchorY="bottom" dimmed={dimmed} />
      {brLabel && (
        <SphereLabel position={brPos} text={brLabel} fontSize={fontSize} color="#F2ECDC" anchorX="right" anchorY="bottom" dimmed={dimmed} />
      )}
    </group>
  )
}
