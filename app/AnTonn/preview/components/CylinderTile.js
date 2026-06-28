'use client'

// CylinderCell — v17. One cell on the inside of a vertical cylinder.
//
// Geometry: a CylinderGeometry segment covering this cell's phi range
// and y range, rendered BackSide so the texture faces the camera at
// origin. Image fills 2/3 of the cell (centred), the surrounding 1/3
// is transparent — that's where the vortex shader bleeds through.
//
// Four corner labels:
//   TL  Type      ("CEÒL" / "PODCAST")
//   TR  Creator
//   BL  Title     (shrinks then truncates if too long)
//   BR  Release date
//
// Font + color match the "ISSUE Nº" line on the AnTonn page header:
// IBM Plex Mono Medium, #F2ECDC at 0.6 fill opacity, letter-spaced.
//
// Vertical wrap: baseY is the cell's "home" Y position on the wall.
// Each frame we read the shared smoothed yOffset from a ref, wrap the
// offset position modulo TOTAL_HEIGHT, and write to this group's
// position.y. When the wall scrolls past TOTAL_HEIGHT/2, the cell
// teleports to the opposite side so the wall looks infinite.

import { useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

// IBM Plex Mono Medium, served from /public/fonts. Local-only because
// (a) we hit Norton TLS interception fetching from CDNs on dev
// machines, and (b) same-origin loads are immune to that whole class
// of problem in production too.
const FONT_URL = '/fonts/IBMPlexMono-Medium.woff'

const TYPE_LABEL = {
  music: 'CEÒL',
  podcasts: 'PODCAST',
}

// Cylinder convention (matches Three.js CylinderGeometry):
//   theta=0 → +Z; theta=π/2 → +X
function cylinderPoint(R, phi, y) {
  return new THREE.Vector3(R * Math.sin(phi), y, R * Math.cos(phi))
}

// Title length → shrink, then truncate. Up to 14 chars → full size;
// 15–22 chars → shrink to fit; longer → truncate with ellipsis.
function fitLabel(text, baseSize) {
  if (!text) return { text: '', size: baseSize }
  const full = 14
  const max = 22
  if (text.length <= full) return { text, size: baseSize }
  if (text.length <= max) return { text, size: baseSize * (full / text.length) }
  return { text: text.slice(0, max - 1) + '…', size: baseSize * (full / max) }
}

function CornerLabel({ position, text, size, anchorX, anchorY }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.position.set(position.x, position.y, position.z)
    ref.current.lookAt(0, 0, 0)
  }, [position.x, position.y, position.z])
  if (!text) return null
  return (
    <group ref={ref}>
      <Text
        font={FONT_URL}
        fontSize={size}
        color="#F2ECDC"
        anchorX={anchorX}
        anchorY={anchorY}
        outlineColor="#000"
        outlineWidth={size * 0.06}
        fillOpacity={0.6}
        letterSpacing={0.12}
      >
        {text}
      </Text>
    </group>
  )
}

export default function CylinderCell({
  item,
  vertical,
  radius,
  phiCenter,
  phiSpan,
  baseY,
  ySpan,
  totalHeight,
  smoothedYRef,
  onSelect,
  focused,
}) {
  const groupRef = useRef(null)
  const meshRef = useRef(null)
  const [internalHover, setInternalHover] = useState(false)
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    if (!item?.cover_url) return
    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(item.cover_url, (tex) => {
      if (cancelled) return
      tex.colorSpace = THREE.SRGBColorSpace
      setTexture(tex)
    }, undefined, () => {})
    return () => { cancelled = true }
  }, [item?.cover_url])

  // Image patch — cylinder segment at 2/3 the cell's phi-and-y extent.
  // CylinderGeometry centers along Y at zero; the parent group's
  // position.y places it correctly on the wall.
  const imageGeom = useMemo(() => {
    const fill = 2 / 3
    const imgPhi = phiSpan * fill
    const imgY = ySpan * fill
    const g = new THREE.CylinderGeometry(
      radius * 0.998, radius * 0.998,
      imgY,
      14, 1, true,
      phiCenter - imgPhi / 2, imgPhi,
    )
    // Rescale UVs to [0,1] × [0,1] across this patch, then flip U for
    // BackSide rendering so the cover reads non-mirrored.
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
  }, [phiCenter, phiSpan, ySpan, radius])

  // Per-frame: wrap this cell's Y so the wall scrolls infinitely.
  useFrame(() => {
    if (!groupRef.current) return
    const yo = smoothedYRef?.current ?? 0
    const raw = baseY + yo
    const wrapped = ((raw % totalHeight) + totalHeight) % totalHeight
    groupRef.current.position.y = wrapped > totalHeight / 2 ? wrapped - totalHeight : wrapped

    if (meshRef.current) {
      const hot = internalHover || focused
      const target = hot ? 1.02 : 1.0
      meshRef.current.scale.x += (target - meshRef.current.scale.x) * 0.18
      meshRef.current.scale.y = meshRef.current.scale.x
      meshRef.current.scale.z = meshRef.current.scale.x
    }
  })

  // Corner positions — inside the cell area, in the transparent margin
  // around the image. 0.38 = label sits ~38% from cell center along
  // each axis (image is 33% from center → labels just outside the image
  // edge but inside the cell edge).
  const cornerR = radius * 0.992
  const phiInset = phiSpan * 0.38
  const yInset = ySpan * 0.38
  const tlPos = cylinderPoint(cornerR, phiCenter - phiInset,  yInset)
  const trPos = cylinderPoint(cornerR, phiCenter + phiInset,  yInset)
  const blPos = cylinderPoint(cornerR, phiCenter - phiInset, -yInset)
  const brPos = cylinderPoint(cornerR, phiCenter + phiInset, -yInset)

  // Base font size scales with cell arc width so labels feel consistent
  // across the wall. Tuned roughly to match the AnTonn 10px "ISSUE Nº"
  // header treatment at the cell center.
  const arc = phiSpan * radius
  const baseSize = arc * 0.045

  const tlText = TYPE_LABEL[vertical] || ''
  const trText = (item.creator || '').toUpperCase()
  const blText = (item.title || '').toUpperCase()
  const brText = item.year ? String(item.year) : ''

  const tlFit = { text: tlText, size: baseSize }
  const trFit = fitLabel(trText, baseSize)
  const blFit = fitLabel(blText, baseSize)
  const brFit = { text: brText, size: baseSize }

  return (
    <group ref={groupRef}>
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

      <CornerLabel position={tlPos} text={tlFit.text} size={tlFit.size} anchorX="left"  anchorY="top" />
      <CornerLabel position={trPos} text={trFit.text} size={trFit.size} anchorX="right" anchorY="top" />
      <CornerLabel position={blPos} text={blFit.text} size={blFit.size} anchorX="left"  anchorY="bottom" />
      <CornerLabel position={brPos} text={brFit.text} size={brFit.size} anchorX="right" anchorY="bottom" />
    </group>
  )
}
