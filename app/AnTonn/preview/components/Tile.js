'use client'

// Tile — a single grid cell on the inside of the cylinder.
//
// Phantom-style structure (per Scott's spec):
//   • Cell is a square (CELL_W × CELL_W world units)
//   • Cells touch their neighbours — no gaps in the grid
//   • Inside each cell is a centred cover image, ~75% of cell size
//   • Around the image is a translucent dark "border" so the vortex
//     shader behind the cylinder glows softly through the negative space
//   • Thin per-vertical accent line frames the image, so even without
//     reading text you can tell category at a glance
//   • No text on the tile itself — the detail panel handles full info
//     when you tap. (Text at the density of 121 cells is unreadable
//     anyway; Phantom's tiles don't show metadata either at idle.)

import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const VERTICAL_TINT = {
  music:    '#C9A047',
  books:    '#6B4E1F',
  podcasts: '#7A4A8C',
  film:     '#A8323D',
  radio:    '#3F6E2A',
  tours:    '#1F4E6E',
}

// Cell dimensions are set by CylinderGallery (it knows the grid math).
// Defaults here are just sane fallbacks if a Tile is rendered standalone.
export default function Tile({
  item,
  position,
  rotation,
  vertical,
  cellSize = 3.0,
  imageRatio = 0.78,
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
      () => { /* fallback to tint */ },
    )
    return () => { cancelled = true }
  }, [item?.cover_url])

  // Slight scale-up on hover/focus — enough to read as interactive
  useFrame(() => {
    if (!groupRef.current) return
    const target = (internalHover || hovered || focused) ? 1.04 : 1.0
    groupRef.current.scale.x += (target - groupRef.current.scale.x) * 0.18
    groupRef.current.scale.y = groupRef.current.scale.x
    groupRef.current.scale.z = groupRef.current.scale.x
  })

  const tint = VERTICAL_TINT[vertical] || '#888'
  const imageSize = cellSize * imageRatio

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Cell background — translucent dark plane filling the whole cell.
          Cells touch their neighbours, so this creates one continuous
          dark wallpaper grid across the cylinder interior. The vortex
          glows through at low opacity. */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[cellSize, cellSize]} />
        <meshBasicMaterial
          color="#0a0d14"
          transparent
          opacity={dimmed ? 0.50 : 0.70}
          depthWrite={false}
        />
      </mesh>

      {/* Per-vertical accent line — thin border around the image area only.
          Adds a visible category cue without dominating the tile.
          Rendered as a slightly larger flat plane behind the image,
          tinted with the accent colour. */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[imageSize + 0.08, imageSize + 0.08]} />
        <meshBasicMaterial
          color={tint}
          transparent
          opacity={dimmed ? 0.30 : (internalHover || hovered ? 0.95 : 0.75)}
          depthWrite={false}
        />
      </mesh>

      {/* Image — sits inside the accent frame */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setInternalHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setInternalHover(false); document.body.style.cursor = 'auto' }}
        onClick={(e) => { e.stopPropagation(); onSelect?.(item) }}
      >
        <planeGeometry args={[imageSize, imageSize]} />
        <meshBasicMaterial
          map={texture}
          color={texture ? '#ffffff' : '#1a1f2a'}
          transparent
          opacity={dimmed ? 0.70 : 1.0}
        />
      </mesh>
    </group>
  )
}
