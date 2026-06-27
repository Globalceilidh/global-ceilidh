'use client'

// One tile on the cylinder. A textured plane with a labelled cover area,
// year + tags strip, and title + creator line below. Hover state slightly
// brightens; click state expands via the parent's onSelect callback.
//
// Geometry: 2.4 × 1.6 units, lifted slightly off the cylinder surface so
// tiles don't z-fight. The plane is rendered facing inward — toward (0,0,0)
// at the cylinder's centre, where the camera sits.

import { useRef, useState, useMemo, useEffect } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame, useLoader } from '@react-three/fiber'

const TILE_W = 2.4
const TILE_H = 1.6

// Per-vertical accent colour — used as the tile's tint when no cover image
// is supplied, and as the underline / tag glow when one is. Mirrors the
// existing An Tonn palette in app/AnTonn/page.js.
const VERTICAL_TINT = {
  music:    '#C9A047',  // Highland gold
  books:    '#6B4E1F',  // Sruth brown
  podcasts: '#7A4A8C',  // muted purple
  film:     '#A8323D',  // banked red
  radio:    '#3F6E2A',  // moss green
  tours:    '#1F4E6E',  // sea blue (marquee)
}

export default function Tile({ item, position, rotation, vertical, onSelect, hovered, focused }) {
  const groupRef = useRef(null)
  const [internalHover, setInternalHover] = useState(false)

  // Texture loading is lazy — if item.cover_url is a non-empty string we
  // try to load it; if it 404s or the value is empty, we fall back to a
  // flat colour tinted by the tile's vertical.
  const [texture, setTexture] = useState(null)
  useEffect(() => {
    if (!item.cover_url) return
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
      () => { /* swallow load errors — fallback to tint */ },
    )
    return () => { cancelled = true }
  }, [item.cover_url])

  // Brighten on hover or focus
  useFrame(() => {
    if (!groupRef.current) return
    const target = (internalHover || hovered || focused) ? 1.0 : 0.85
    groupRef.current.scale.x += (target * (focused ? 1.05 : 1) - groupRef.current.scale.x) * 0.15
    groupRef.current.scale.y = groupRef.current.scale.x
    groupRef.current.scale.z = groupRef.current.scale.x
  })

  const tint = VERTICAL_TINT[vertical] || '#888'

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Cover plane */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setInternalHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setInternalHover(false); document.body.style.cursor = 'auto' }}
        onClick={(e) => { e.stopPropagation(); onSelect?.(item) }}
      >
        <planeGeometry args={[TILE_W, TILE_H * 0.78]} />
        <meshBasicMaterial
          map={texture}
          color={texture ? '#ffffff' : tint}
          transparent
          opacity={internalHover || hovered ? 1.0 : 0.92}
        />
      </mesh>

      {/* Title — bottom of cover area */}
      <Text
        position={[0, -TILE_H * 0.45, 0.01]}
        fontSize={0.12}
        color="#F2ECDC"
        anchorX="center"
        anchorY="top"
        maxWidth={TILE_W * 0.95}
        outlineColor="#000"
        outlineWidth={0.005}
      >
        {(item.title || '').toUpperCase()}
      </Text>

      {/* Creator — below title */}
      <Text
        position={[0, -TILE_H * 0.55, 0.01]}
        fontSize={0.085}
        color={tint}
        anchorX="center"
        anchorY="top"
        maxWidth={TILE_W * 0.95}
        outlineColor="#000"
        outlineWidth={0.003}
      >
        {item.creator || ''}
      </Text>

      {/* Year + first tag pill */}
      {(item.year || item.tags?.[0]) && (
        <Text
          position={[-TILE_W * 0.45, TILE_H * 0.45, 0.01]}
          fontSize={0.075}
          color="#888"
          anchorX="left"
          anchorY="bottom"
        >
          {[item.year, ...(item.tags || []).slice(0, 2)].filter(Boolean).join(' · ').toUpperCase()}
        </Text>
      )}
    </group>
  )
}
