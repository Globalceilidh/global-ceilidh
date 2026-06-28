'use client'

// SphereTileSegment — v16. Donut-band wallpaper, not a full sphere.
//
// Each cell is a sphere segment (we keep the spherical curvature for the
// natural perspective stretch) but the gallery only places cells in a
// narrow latitudinal band around the equator — no polar convergence.
//
// No perimeter line. The image fills ~85% of the cell so the remaining
// ~15% gap reads as a dark slot around each tile, with the vortex
// shader bleeding through. Hover dims neighbours / scales focused cell.
//
// Four corner labels: top-left is the cover filename (truncated); the
// other three are placeholder words matching the phantom.land reference
// for visual layout sanity.

import { useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

// Three.js sphere convention: phi is longitude (XZ plane), theta is from
// +Y down to -Y. Returns the Cartesian point on a sphere of given radius.
function sphericalToCartesian(R, phi, theta) {
  const sinT = Math.sin(theta)
  return new THREE.Vector3(
    R * sinT * Math.sin(phi),
    R * Math.cos(theta),
    R * sinT * Math.cos(phi),
  )
}

// Derive the corner label from the cover_url filename. Strips extension,
// underscores → spaces, uppercases, truncates to one line.
function fileLabel(coverUrl) {
  if (!coverUrl) return ''
  const f = coverUrl.split('/').pop() || ''
  const decoded = decodeURIComponent(f).replace(/\.[a-z0-9]+$/i, '')
  return decoded.replace(/_/g, ' ').toUpperCase().slice(0, 20)
}

// Placeholder labels for the other three corners — wording matched to
// the phantom.land reference until real metadata fields are wired up.
const PLACEHOLDER_TR = 'EXPERIENCE'
const PLACEHOLDER_BL = 'TOOL'
const PLACEHOLDER_BR = '2026'

// A small label positioned on the sphere surface, oriented to face the
// camera at origin. Drei <Text> is double-sided so a single lookAt(0)
// puts the readable face toward the centre.
function SphereLabel({ position, text, fontSize, anchorX, anchorY }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.position.set(position.x, position.y, position.z)
    ref.current.lookAt(0, 0, 0)
  }, [position.x, position.y, position.z])
  return (
    <group ref={ref}>
      <Text
        fontSize={fontSize}
        color="#F2ECDC"
        anchorX={anchorX}
        anchorY={anchorY}
        outlineColor="#000"
        outlineWidth={fontSize * 0.06}
        fillOpacity={0.92}
        letterSpacing={0.08}
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

  // Image segment — 85% fill so the surrounding 15% gap reads as a clean
  // slot around each cell with the vortex shader bleeding through. UV
  // rescale + flip for BackSide reads the texture right-way-round.
  const imageGeom = useMemo(() => {
    const fill = 0.85
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
      uv.setX(i, 1 - (uv.getX(i) - uMin) / uRange)
      uv.setY(i, (uv.getY(i) - vMin) / vRange)
    }
    uv.needsUpdate = true
    return g
  }, [phiCenter, thetaCenter, phiSpan, thetaSpan, radius])

  const hot = internalHover || hovered || focused

  // Hover: tiny scale-up on the image. No border / glow to animate.
  useFrame(() => {
    if (meshRef.current) {
      const target = hot ? 1.02 : 1.0
      meshRef.current.scale.x += (target - meshRef.current.scale.x) * 0.18
      meshRef.current.scale.y = meshRef.current.scale.x
      meshRef.current.scale.z = meshRef.current.scale.x
    }
  })

  // Corner positions — pulled deep into the cell so neighboring tiles'
  // labels can't collide at the seams. 0.30 = label sits 30% from the
  // center along each axis, well clear of the 50%-from-center cell edge.
  const cornerR = radius * 0.99
  const phiInset = phiSpan * 0.30
  const thetaInset = thetaSpan * 0.30
  const tlPos = sphericalToCartesian(cornerR, phiCenter - phiInset, thetaCenter - thetaInset)
  const trPos = sphericalToCartesian(cornerR, phiCenter + phiInset, thetaCenter - thetaInset)
  const blPos = sphericalToCartesian(cornerR, phiCenter - phiInset, thetaCenter + thetaInset)
  const brPos = sphericalToCartesian(cornerR, phiCenter + phiInset, thetaCenter + thetaInset)

  // Much smaller labels than v15 so they don't dominate the cell and so
  // four-corner layout has room to breathe.
  const cellArc = phiSpan * Math.sin(thetaCenter) * radius
  const fontSize = Math.max(0.028, cellArc * 0.032)

  const tlText = fileLabel(item?.cover_url)

  return (
    <group>
      {/* Image — sphere segment with the cover texture, BackSide */}
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

      {/* Corner labels */}
      {tlText && (
        <SphereLabel position={tlPos} text={tlText}            fontSize={fontSize}        anchorX="left"  anchorY="top" />
      )}
      <SphereLabel   position={trPos} text={PLACEHOLDER_TR}    fontSize={fontSize * 0.85} anchorX="right" anchorY="top" />
      <SphereLabel   position={blPos} text={PLACEHOLDER_BL}    fontSize={fontSize * 0.85} anchorX="left"  anchorY="bottom" />
      <SphereLabel   position={brPos} text={PLACEHOLDER_BR}    fontSize={fontSize * 0.85} anchorX="right" anchorY="bottom" />
    </group>
  )
}
