'use client'

// CylinderTile — v13 revert. Cylinder segments curved to the wall arc.
// All meshes at full opacity, side=DoubleSide so orientation can never
// hide a tile. UVs flipped on every segment so textures read correctly
// from the inside of the cylinder.

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

function cylinderPoint(R, theta, y) {
  return new THREE.Vector3(R * Math.sin(theta), y, R * Math.cos(theta))
}

function CylinderLabel({ position, text, fontSize, color, anchorX, anchorY }) {
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
        fillOpacity={0.92}
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

  // Cylinder segment for the image — curved with the wall, UVs flipped
  // so the texture reads correctly from inside (BackSide rendering
  // would otherwise mirror it).
  const imageGeom = useMemo(() => {
    const imgArc = thetaArc * 0.78
    const imgH = cellHeight * 0.78
    const g = new THREE.CylinderGeometry(
      radius * 0.998, radius * 0.998, imgH,
      8, 1, true,
      thetaStart + (thetaArc - imgArc) / 2, imgArc,
    )
    g.translate(0, yCenter, 0)
    const uv = g.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i))
    uv.needsUpdate = true
    return g
  }, [radius, yCenter, thetaStart, thetaArc, cellHeight])

  const accentGeom = useMemo(() => {
    const accArc = thetaArc * 0.88
    const accH = cellHeight * 0.88
    const g = new THREE.CylinderGeometry(
      radius * 0.996, radius * 0.996, accH,
      8, 1, true,
      thetaStart + (thetaArc - accArc) / 2, accArc,
    )
    g.translate(0, yCenter, 0)
    const uv = g.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i))
    uv.needsUpdate = true
    return g
  }, [radius, yCenter, thetaStart, thetaArc, cellHeight])

  const tint = VERTICAL_TINT[vertical] || '#888'
  const tlLabel = VERTICAL_LABEL_GD[vertical] || ''
  const trLabel = (item.creator || '').toUpperCase()
  const blLabel = (item.title || '').toUpperCase()
  const brLabel = secondaryField(item, vertical).toUpperCase()

  const cornerR = radius * 0.992
  const yTop = yCenter + cellHeight * 0.42
  const yBot = yCenter - cellHeight * 0.42
  const thetaL = thetaStart + thetaArc * 0.08
  const thetaR = thetaStart + thetaArc * 0.92
  const tlPos = cylinderPoint(cornerR, thetaL, yTop)
  const trPos = cylinderPoint(cornerR, thetaR, yTop)
  const blPos = cylinderPoint(cornerR, thetaL, yBot)
  const brPos = cylinderPoint(cornerR, thetaR, yBot)

  const fontSize = 0.04

  return (
    <group>
      {/* Accent ring — full opacity, double-sided */}
      <mesh geometry={accentGeom}>
        <meshBasicMaterial
          color={tint}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Image — full opacity, double-sided */}
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
          side={THREE.DoubleSide}
        />
      </mesh>

      <CylinderLabel position={tlPos} text={tlLabel} fontSize={fontSize} color="#F2ECDC" anchorX="left"  anchorY="top" />
      <CylinderLabel position={trPos} text={trLabel} fontSize={fontSize} color="#F2ECDC" anchorX="right" anchorY="top" />
      <CylinderLabel position={blPos} text={blLabel} fontSize={fontSize} color="#F2ECDC" anchorX="left"  anchorY="bottom" />
      {brLabel && (
        <CylinderLabel position={brPos} text={brLabel} fontSize={fontSize} color="#F2ECDC" anchorX="right" anchorY="bottom" />
      )}
    </group>
  )
}
