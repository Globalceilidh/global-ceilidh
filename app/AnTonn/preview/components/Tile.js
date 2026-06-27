'use client'

// Tile — v8. One cell on the cylinder wall. No background plane any more
// (the parent CylinderGallery's single cylinder mesh handles that).
// Just the per-vertical accent frame, the image, and four persistent
// corner labels in Gàidhlig.
//
// Corner label layout:
//   top-left      category Gàidhlig word (CEÒL/LEABHAR/PODCAST/BHIDEO/RÈIDIO)
//   top-right     creator (artist/author/host/director/station)
//   bottom-left   title (song name / book title / podcast name / film name)
//   bottom-right  album (music only — blank for other verticals)
//
// All labels render in white at ~6% of cell size — small enough that
// 121 tiles' worth of labels don't overwhelm the wallpaper effect.

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

// Gàidhlig category labels — top-left corner of every tile
const VERTICAL_LABEL_GD = {
  music:    'CEÒL',
  books:    'LEABHAR',
  podcasts: 'PODCAST',
  film:     'BHIDEO',
  radio:    'RÈIDIO',
  tours:    'CUAIRT',
}

// Bottom-right secondary field per vertical
function secondaryField(item, vertical) {
  if (vertical === 'music')    return item.album || ''
  if (vertical === 'film')     return item.year ? String(item.year) : ''
  if (vertical === 'podcasts') return item.year ? String(item.year) : ''
  return ''
}

export default function Tile({
  item,
  position,
  rotation,
  vertical,
  cellSize = 1.7,
  imageRatio = 0.60,
  onSelect,
  hovered,
  focused,
  dimmed = false,
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
    const target = (internalHover || hovered || focused) ? 1.04 : 1.0
    groupRef.current.scale.x += (target - groupRef.current.scale.x) * 0.18
    groupRef.current.scale.y = groupRef.current.scale.x
    groupRef.current.scale.z = groupRef.current.scale.x
  })

  const tint = VERTICAL_TINT[vertical] || '#888'
  const imageSize = cellSize * imageRatio
  const labelSize = cellSize * 0.06
  const labelInset = cellSize * 0.44

  // Per-vertical content for the corner labels
  const tlLabel = VERTICAL_LABEL_GD[vertical] || ''
  const trLabel = (item.creator || '').toUpperCase()
  const blLabel = (item.title || '').toUpperCase()
  const brLabel = secondaryField(item, vertical).toUpperCase()

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Per-vertical accent ring — thin plane behind the image */}
      <mesh position={[0, 0, 0.001]} scale={[1.06, 1.06, 1]}>
        <planeGeometry args={[imageSize, imageSize]} />
        <meshBasicMaterial
          color={tint}
          transparent
          opacity={dimmed ? 0.32 : (internalHover || hovered ? 0.95 : 0.72)}
          depthWrite={false}
        />
      </mesh>

      {/* Image — flat plane carrying the cover texture */}
      <mesh
        position={[0, 0, 0.005]}
        onPointerOver={(e) => { e.stopPropagation(); setInternalHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setInternalHover(false); document.body.style.cursor = 'auto' }}
        onClick={(e) => { e.stopPropagation(); onSelect?.(item) }}
      >
        <planeGeometry args={[imageSize, imageSize]} />
        <meshBasicMaterial
          map={texture}
          color={texture ? '#ffffff' : '#1a1f2a'}
          transparent
          opacity={dimmed ? 0.78 : 1.0}
        />
      </mesh>

      {/* Top-left: Gàidhlig category */}
      <Text
        position={[-labelInset, labelInset, 0.01]}
        fontSize={labelSize}
        color="#F2ECDC"
        anchorX="left"
        anchorY="top"
        outlineColor="#000"
        outlineWidth={0.003}
        fillOpacity={dimmed ? 0.55 : 0.92}
      >
        {tlLabel}
      </Text>

      {/* Top-right: creator/artist/author */}
      <Text
        position={[labelInset, labelInset, 0.01]}
        fontSize={labelSize}
        color="#F2ECDC"
        anchorX="right"
        anchorY="top"
        maxWidth={cellSize * 0.55}
        outlineColor="#000"
        outlineWidth={0.003}
        fillOpacity={dimmed ? 0.55 : 0.92}
        textAlign="right"
      >
        {trLabel}
      </Text>

      {/* Bottom-left: title/song name */}
      <Text
        position={[-labelInset, -labelInset, 0.01]}
        fontSize={labelSize}
        color="#F2ECDC"
        anchorX="left"
        anchorY="bottom"
        maxWidth={cellSize * 0.55}
        outlineColor="#000"
        outlineWidth={0.003}
        fillOpacity={dimmed ? 0.55 : 0.92}
        textAlign="left"
      >
        {blLabel}
      </Text>

      {/* Bottom-right: album / year / blank */}
      {brLabel && (
        <Text
          position={[labelInset, -labelInset, 0.01]}
          fontSize={labelSize}
          color="#F2ECDC"
          anchorX="right"
          anchorY="bottom"
          maxWidth={cellSize * 0.55}
          outlineColor="#000"
          outlineWidth={0.003}
          fillOpacity={dimmed ? 0.55 : 0.85}
          textAlign="right"
        >
          {brLabel}
        </Text>
      )}
    </group>
  )
}
