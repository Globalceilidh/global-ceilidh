'use client'

// SphereTileSegment — v15. Phantom.land-style sphere wallpaper.
//
// Each cell is a sphere segment rendered BackSide (we're inside the sphere).
// On top of the image we draw a thin white perimeter line that traces the
// segment's edges along the sphere surface. A second, thicker line behind
// it is the "hover glow" — colored from the cover art's dominant tone,
// fades in when the cell is hovered/focused.
//
// Four corner labels: top-left is the cover filename (truncated), the
// other three are placeholders. All four labels are positioned on the
// sphere surface and oriented to face the camera at origin.

import { useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text, Line } from '@react-three/drei'

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

// Sample the perimeter of a sphere segment as a closed polyline. Each
// edge runs along the sphere surface (constant phi or constant theta),
// so the line stays glued to the sphere instead of cutting through it
// like 4 straight chords would.
function buildPerimeter(R, phiC, thetaC, phiSpan, thetaSpan, samplesPerEdge = 8) {
  const phi0 = phiC - phiSpan / 2
  const phi1 = phiC + phiSpan / 2
  const theta0 = thetaC - thetaSpan / 2
  const theta1 = thetaC + thetaSpan / 2
  const pts = []
  for (let i = 0; i <= samplesPerEdge; i++) {
    const t = i / samplesPerEdge
    pts.push(sphericalToCartesian(R, phi0 + t * phiSpan, theta0))
  }
  for (let i = 1; i <= samplesPerEdge; i++) {
    const t = i / samplesPerEdge
    pts.push(sphericalToCartesian(R, phi1, theta0 + t * thetaSpan))
  }
  for (let i = 1; i <= samplesPerEdge; i++) {
    const t = i / samplesPerEdge
    pts.push(sphericalToCartesian(R, phi1 - t * phiSpan, theta1))
  }
  for (let i = 1; i <= samplesPerEdge; i++) {
    const t = i / samplesPerEdge
    pts.push(sphericalToCartesian(R, phi0, theta1 - t * thetaSpan))
  }
  return pts
}

// Pull a dominant color from the cover image by averaging it down to a
// 1×1 pixel. Cheap, runs once per texture, gives the hover glow its hue.
function deriveDominantColor(image) {
  try {
    const c = document.createElement('canvas')
    c.width = 1; c.height = 1
    const ctx = c.getContext('2d')
    ctx.drawImage(image, 0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255)
  } catch {
    return new THREE.Color('#C9A047')
  }
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
  const glowRef = useRef(null)
  const borderRef = useRef(null)
  const [internalHover, setInternalHover] = useState(false)
  const [texture, setTexture] = useState(null)
  const [dominantColor, setDominantColor] = useState(() => new THREE.Color('#C9A047'))

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
        if (tex.image) {
          setDominantColor(deriveDominantColor(tex.image))
        }
      },
      undefined,
      () => {},
    )
    return () => { cancelled = true }
  }, [item?.cover_url])

  // Image segment — 92% fill so the surrounding 8% gap reads as the
  // white border + a sliver of the vortex behind it. UV rescale + flip
  // for BackSide reads the texture right-way-round.
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
      uv.setX(i, 1 - (uv.getX(i) - uMin) / uRange)
      uv.setY(i, (uv.getY(i) - vMin) / vRange)
    }
    uv.needsUpdate = true
    return g
  }, [phiCenter, thetaCenter, phiSpan, thetaSpan, radius])

  // White border at 95% fill — sits in the gap just outside the image.
  // The hover glow line shares this same path; widthwise difference is
  // what makes the glow extend visibly around the white core.
  const borderPoints = useMemo(() => buildPerimeter(
    radius * 0.998,
    phiCenter, thetaCenter,
    phiSpan * 0.95, thetaSpan * 0.95,
  ), [phiCenter, thetaCenter, phiSpan, thetaSpan, radius])

  const hot = internalHover || hovered || focused

  // Smooth hover state — glow opacity and a tiny image-segment scale-up.
  useFrame(() => {
    if (meshRef.current) {
      const target = hot ? 1.02 : 1.0
      meshRef.current.scale.x += (target - meshRef.current.scale.x) * 0.18
      meshRef.current.scale.y = meshRef.current.scale.x
      meshRef.current.scale.z = meshRef.current.scale.x
    }
    if (glowRef.current?.material) {
      const target = hot ? 0.85 : 0.0
      glowRef.current.material.opacity += (target - glowRef.current.material.opacity) * 0.15
    }
    if (borderRef.current?.material) {
      const target = hot ? 0.95 : 0.55
      borderRef.current.material.opacity += (target - borderRef.current.material.opacity) * 0.15
    }
  })

  // Corner positions — pulled in from the segment edges so the labels sit
  // visibly inside the cell rather than at the seam with neighbors.
  const cornerR = radius * 0.99
  const phiInset = phiSpan * 0.40
  const thetaInset = thetaSpan * 0.40
  const tlPos = sphericalToCartesian(cornerR, phiCenter - phiInset, thetaCenter - thetaInset)
  const trPos = sphericalToCartesian(cornerR, phiCenter + phiInset, thetaCenter - thetaInset)
  const blPos = sphericalToCartesian(cornerR, phiCenter - phiInset, thetaCenter + thetaInset)
  const brPos = sphericalToCartesian(cornerR, phiCenter + phiInset, thetaCenter + thetaInset)

  // Scale font with cell arc length so labels are readable but small.
  const cellArc = phiSpan * Math.sin(thetaCenter) * radius
  const fontSize = Math.max(0.04, cellArc * 0.055)

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

      {/* Hover glow — wide colored line on the same path as the border.
          renderOrder=0 so it draws BEFORE the white core line; depthTest
          off so it isn't occluded by the slightly-deeper border line. */}
      <Line
        ref={glowRef}
        points={borderPoints}
        color={dominantColor}
        lineWidth={9}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={false}
        renderOrder={0}
      />

      {/* White perimeter border — thin core line, draws on top of the
          glow so the halo bleeds outward around a crisp white stroke. */}
      <Line
        ref={borderRef}
        points={borderPoints}
        color="#ffffff"
        lineWidth={1.4}
        transparent
        opacity={0.55}
        depthWrite={false}
        depthTest={false}
        renderOrder={1}
      />

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
