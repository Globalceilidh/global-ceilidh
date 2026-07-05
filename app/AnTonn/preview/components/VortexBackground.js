'use client'

// Fullscreen vortex background. Renders the Corryvreckan shader (see
// vortex.glsl.js) into a fullscreen plane behind everything else.
//
// Parent passes:
//   intensity   — 0..1; goes into uIntensity
//   mouseUv     — { x, y } in 0..1 normalised viewport space
//   paused      — freeze uTime when tab is hidden or motion is reduced
//
// We compute uMouseVel internally — the per-frame delta of the mouse
// position. The shader uses it to shear the flow in the direction the
// cursor is moving, so flicking left feels like dragging water with you.

import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { VORTEX_VERTEX_SHADER, VORTEX_FRAGMENT_SHADER } from './vortex.glsl'

export default function VortexBackground({ intensity = 0.0, mouseUv, paused = false }) {
  const { size } = useThree()
  const lastTimeRef = useRef(0)
  const accumulatedRef = useRef(0)
  const lastMouseRef = useRef({ x: 0.5, y: 0.5 })

  const uniforms = useMemo(() => ({
    uTime:       { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
    uMouseVel:   { value: new THREE.Vector2(0, 0) },
    uIntensity:  { value: 0.0 },
  }), [])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height)
  }, [size.width, size.height, uniforms])

  useFrame((_, delta) => {
    const now = performance.now() / 1000
    if (!paused) {
      const dt = now - (lastTimeRef.current || now)
      accumulatedRef.current += dt
      uniforms.uTime.value = accumulatedRef.current
    }
    lastTimeRef.current = now

    if (mouseUv) {
      // Mouse velocity = delta from last frame, in normalised UV/sec
      const dt = Math.max(delta, 0.001)
      const vx = (mouseUv.x - lastMouseRef.current.x) / dt
      const vy = (mouseUv.y - lastMouseRef.current.y) / dt
      // Low-pass filter so velocity decays gracefully rather than snapping
      uniforms.uMouseVel.value.x += (vx - uniforms.uMouseVel.value.x) * 0.25
      uniforms.uMouseVel.value.y += (vy - uniforms.uMouseVel.value.y) * 0.25
      // Smoothly lerp uMouse toward target — cross-origin iframes
      // (Live365, YouTube) swallow pointermove events, so mouseUv
      // freezes then snaps when the cursor re-enters our page.
      // Smoothing hides the snap and gives the vortex a natural glide.
      uniforms.uMouse.value.x += (mouseUv.x - uniforms.uMouse.value.x) * 0.15
      uniforms.uMouse.value.y += (mouseUv.y - uniforms.uMouse.value.y) * 0.15
      lastMouseRef.current = mouseUv
    }
    // Decay velocity when no movement
    uniforms.uMouseVel.value.x *= 0.92
    uniforms.uMouseVel.value.y *= 0.92

    // Smooth intensity changes
    uniforms.uIntensity.value += (intensity - uniforms.uIntensity.value) * 0.08
  })

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={VORTEX_VERTEX_SHADER}
        fragmentShader={VORTEX_FRAGMENT_SHADER}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}
