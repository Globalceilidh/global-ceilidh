'use client'

// Tile — one cell on the inside of the cylinder. v7 uses the curved
// geometry passed in from CylinderGallery (both `cellGeom` for the
// translucent dark background and `imageGeom` for the cover art).
// Each cell follows the cylinder arc rather than sitting flat, so
// adjacent cells meet seamlessly and the overall cylinder reads as
// smooth rather than as an 11-sided polygon.
//
// Cell background opacity dropped from 0.7 → 0.32 so the vortex glows
// through softly between images — the cell BG is a wash, not a solid
// frame. Image is smaller (0.60 of cell) leaving more border for the
// vortex to show through.

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

export default function Tile({
  item,
  position,
  rotation,
  vertical,
  cellGeom,
  imageGeom,
  cellSize = 3.0,
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

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Cell background — curved plane following the cylinder arc.
          Very translucent so the vortex glows softly through. Cells
          overlap their neighbours by ~4% so the dark wash reads as
          continuous wallpaper with no visible seams. */}
      <mesh geometry={cellGeom} position={[0, 0, -0.02]}>
        <meshBasicMaterial
          color="#070b14"
          transparent
          opacity={dimmed ? 0.22 : 0.32}
          depthWrite={false}
        />
      </mesh>

      {/* Per-vertical accent ring — thin coloured plane behind the
          image, slightly larger than the image so it shows as a
          border. Curved at image scale. */}
      <mesh geometry={imageGeom} position={[0, 0, -0.005]} scale={[1.06, 1.06, 1]}>
        <meshBasicMaterial
          color={tint}
          transparent
          opacity={dimmed ? 0.30 : (internalHover || hovered ? 0.95 : 0.70)}
          depthWrite={false}
        />
      </mesh>

      {/* Image — curved plane carrying the cover texture */}
      <mesh
        geometry={imageGeom}
        onPointerOver={(e) => { e.stopPropagation(); setInternalHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setInternalHover(false); document.body.style.cursor = 'auto' }}
        onClick={(e) => { e.stopPropagation(); onSelect?.(item) }}
      >
        <meshBasicMaterial
          map={texture}
          color={texture ? '#ffffff' : '#1a1f2a'}
          transparent
          opacity={dimmed ? 0.70 : 1.0}
        />
      </mesh>

      {/* Hover title — drifts above the cell so user gets context
          before committing to tap. drei <Text> = SDF, crisp at zoom. */}
      {(internalHover || hovered || focused) && (
        <>
          <mesh position={[0, cellSize * 0.50, 0.04]}>
            <planeGeometry args={[cellSize * 1.4, cellSize * 0.20]} />
            <meshBasicMaterial color="#020409" transparent opacity={0.78} depthWrite={false} />
          </mesh>
          <Text
            position={[0, cellSize * 0.54, 0.05]}
            fontSize={cellSize * 0.10}
            color="#F2ECDC"
            anchorX="center"
            anchorY="middle"
            maxWidth={cellSize * 1.3}
            outlineColor="#000"
            outlineWidth={0.005}
            textAlign="center"
          >
            {(item.title || '').toUpperCase()}
          </Text>
          <Text
            position={[0, cellSize * 0.44, 0.05]}
            fontSize={cellSize * 0.07}
            color={tint}
            anchorX="center"
            anchorY="middle"
            maxWidth={cellSize * 1.3}
            outlineColor="#000"
            outlineWidth={0.003}
            textAlign="center"
          >
            {item.creator || ''}
          </Text>
        </>
      )}
    </group>
  )
}
