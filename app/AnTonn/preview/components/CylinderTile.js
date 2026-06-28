'use client'

// CylinderTile — v12. Flat square plane that faces the camera at the
// centre of the sphere. No per-tile curved geometry (avoids the
// distortion v9 produced with sphere segments). Identical shape on every
// tile, fixed inward orientation via the position+rotation passed in
// from SphereGallery's lookAt math.
//
// Composition:
//   • accent ring   — slightly larger flat plane behind, per-vertical tint
//   • image         — flat plane with cover texture
//   • 4 corner labels at small font in tile-local space

import { useRef, useState, useEffect } from 'react'
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

export default function CylinderTile({
  item,
  vertical,
  position,
  rotation,
  size = 1.5,
  onSelect,
  hovered,
  focused,
}) {
  const groupRef = useRef(null)
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
    if (!groupRef.current) return
    const target = (internalHover || hovered || focused) ? 1.06 : 1.0
    groupRef.current.scale.x += (target - groupRef.current.scale.x) * 0.18
    groupRef.current.scale.y = groupRef.current.scale.x
    groupRef.current.scale.z = groupRef.current.scale.x
  })

  const tint = VERTICAL_TINT[vertical] || '#888'
  const imageSize = size * 0.92      // image is most of the tile
  const accentSize = size * 1.0      // accent ring matches outer edge
  const labelFont = size * 0.04      // ~1/4 of v8 label size
  const labelInset = size * 0.45

  const tlLabel = VERTICAL_LABEL_GD[vertical] || ''
  const trLabel = (item.creator || '').toUpperCase()
  const blLabel = (item.title || '').toUpperCase()
  const brLabel = secondaryField(item, vertical).toUpperCase()

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Accent frame — per-vertical tint behind the image */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[accentSize, accentSize]} />
        <meshBasicMaterial
          color={tint}
          transparent
          opacity={internalHover || hovered ? 1.0 : 0.78}
          depthWrite={false}
        />
      </mesh>

      {/* Image — flat plane with cover texture. Full opacity on all
          tiles (no dimmed-filler look). */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setInternalHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setInternalHover(false); document.body.style.cursor = 'auto' }}
        onClick={(e) => { e.stopPropagation(); onSelect?.(item) }}
      >
        <planeGeometry args={[imageSize, imageSize]} />
        <meshBasicMaterial
          map={texture}
          color={texture ? '#ffffff' : '#1a1f2a'}
        />
      </mesh>

      {/* Corner labels — small white text in tile-local frame */}
      <Text
        position={[-labelInset, labelInset, 0.01]}
        fontSize={labelFont}
        color="#F2ECDC"
        anchorX="left" anchorY="top"
        outlineColor="#000" outlineWidth={labelFont * 0.06}
      >
        {tlLabel}
      </Text>
      <Text
        position={[labelInset, labelInset, 0.01]}
        fontSize={labelFont}
        color="#F2ECDC"
        anchorX="right" anchorY="top"
        maxWidth={size * 0.55}
        outlineColor="#000" outlineWidth={labelFont * 0.06}
        textAlign="right"
      >
        {trLabel}
      </Text>
      <Text
        position={[-labelInset, -labelInset, 0.01]}
        fontSize={labelFont}
        color="#F2ECDC"
        anchorX="left" anchorY="bottom"
        maxWidth={size * 0.55}
        outlineColor="#000" outlineWidth={labelFont * 0.06}
      >
        {blLabel}
      </Text>
      {brLabel && (
        <Text
          position={[labelInset, -labelInset, 0.01]}
          fontSize={labelFont}
          color="#F2ECDC"
          anchorX="right" anchorY="bottom"
          maxWidth={size * 0.55}
          outlineColor="#000" outlineWidth={labelFont * 0.06}
          textAlign="right"
        >
          {brLabel}
        </Text>
      )}
    </group>
  )
}
