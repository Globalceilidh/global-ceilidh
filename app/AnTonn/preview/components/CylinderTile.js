'use client'

// CylinderTile — v10. Each tile is a CYLINDER segment (not a flat plane,
// not a sphere patch). The segment shares the wall's curvature exactly,
// so adjacent tiles meet seamlessly along their shared arc, and every
// tile is the same shape (no lat-long distortion).
//
// The tile is composed of three nested cylinder-segment meshes:
//   1. accent ring   — slightly larger than the image area, per-vertical tint
//   2. image         — cover texture, mapped via UVs
//   3. (no separate cell BG — the parent CylinderGallery wall handles
//      the dark wash behind every tile)
//
// Plus four corner labels (CEÒL/creator/title/album) positioned at
// world Cartesian coords on the cylinder surface, oriented to face the
// camera at centre.

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

// Cartesian point on the cylinder at angle theta + height y
function cylinderPoint(R, theta, y) {
  return new THREE.Vector3(R * Math.sin(theta), y, R * Math.cos(theta))
}

// Label component — flat 3D text positioned in world coords on the
// cylinder surface, rotated to face the camera at origin.
function CylinderLabel({ position, text, fontSize, color, anchorX, anchorY, dimmed }) {
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
        outlineWidth={fontSize * 0.06}
        fillOpacity={dimmed ? 0.55 : 0.92}
      >
        {text}
      </Text>
    </group>
  )
}

export default function CylinderTile({
  item,
  vertical,
  radius,
  yCenter,
  thetaStart,
  thetaArc,
  cellHeight,
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

  useFrame(() => {
    if (!imageRef.current) return
    const target = (internalHover || hovered || focused) ? 1.05 : 1.0
    imageRef.current.scale.x += (target - imageRef.current.scale.x) * 0.18
    imageRef.current.scale.y = imageRef.current.scale.x
    imageRef.current.scale.z = imageRef.current.scale.x
  })

  // Image segment — 60% of cell arc and height, centred. Sits a hair
  // inside the wall so it doesn't z-fight with the cylinder mesh.
  const imageGeom = useMemo(() => {
    const imgArc = thetaArc * 0.62
    const imgH = cellHeight * 0.62
    const g = new THREE.CylinderGeometry(
      radius * 0.998, radius * 0.998, imgH,
      8, 1, true,
      thetaStart + (thetaArc - imgArc) / 2, imgArc,
    )
    g.translate(0, yCenter, 0)
    return g
  }, [radius, yCenter, thetaStart, thetaArc, cellHeight])

  // Accent ring — slightly larger
  const accentGeom = useMemo(() => {
    const accArc = thetaArc * 0.70
    const accH = cellHeight * 0.70
    const g = new THREE.CylinderGeometry(
      radius * 0.996, radius * 0.996, accH,
      8, 1, true,
      thetaStart + (thetaArc - accArc) / 2, accArc,
    )
    g.translate(0, yCenter, 0)
    return g
  }, [radius, yCenter, thetaStart, thetaArc, cellHeight])

  const tint = VERTICAL_TINT[vertical] || '#888'
  const tlLabel = VERTICAL_LABEL_GD[vertical] || ''
  const trLabel = (item.creator || '').toUpperCase()
  const blLabel = (item.title || '').toUpperCase()
  const brLabel = secondaryField(item, vertical).toUpperCase()

  // Corner positions on the cylinder surface (slightly inside so labels
  // sit in front of the image meshes). Insets keep labels off the
  // cell boundary so adjacent tiles' labels don't crowd each other.
  const cornerR = radius * 0.992
  const yTop = yCenter + cellHeight * 0.42
  const yBot = yCenter - cellHeight * 0.42
  const thetaL = thetaStart + thetaArc * 0.08
  const thetaR = thetaStart + thetaArc * 0.92
  const tlPos = cylinderPoint(cornerR, thetaL, yTop)
  const trPos = cylinderPoint(cornerR, thetaR, yTop)
  const blPos = cylinderPoint(cornerR, thetaL, yBot)
  const brPos = cylinderPoint(cornerR, thetaR, yBot)

  // Font size — 1/4 of v8's 0.10 to match Scott's "1/4 the size" feedback
  const fontSize = 0.025

  return (
    <group>
      {/* Accent ring */}
      <mesh geometry={accentGeom}>
        <meshBasicMaterial
          color={tint}
          transparent
          opacity={dimmed ? 0.32 : (internalHover || hovered ? 0.95 : 0.72)}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Image — curved cylinder segment */}
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

      {/* Corner labels */}
      <CylinderLabel position={tlPos} text={tlLabel} fontSize={fontSize} color="#F2ECDC" anchorX="left"  anchorY="top"    dimmed={dimmed} />
      <CylinderLabel position={trPos} text={trLabel} fontSize={fontSize} color="#F2ECDC" anchorX="right" anchorY="top"    dimmed={dimmed} />
      <CylinderLabel position={blPos} text={blLabel} fontSize={fontSize} color="#F2ECDC" anchorX="left"  anchorY="bottom" dimmed={dimmed} />
      {brLabel && (
        <CylinderLabel position={brPos} text={brLabel} fontSize={fontSize} color="#F2ECDC" anchorX="right" anchorY="bottom" dimmed={dimmed} />
      )}
    </group>
  )
}
