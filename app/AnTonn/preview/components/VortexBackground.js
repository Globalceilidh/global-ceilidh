'use client'

// Fullscreen vortex background — a Three.js orthographic plane that fills
// the viewport with the Corryvreckan shader (see vortex.glsl.js). Mounted
// behind the cylinder gallery; runs continuously while the page is active.
//
// Behaviour driven from the parent via props:
//   intensity   — 0..1; passed straight to the shader's uIntensity
//   mouseUv     — { x, y } in 0..1 space; passed to uMouse
//   paused      — when true, freezes uTime (saves battery when tab hidden
//                 or page idle)

import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { VORTEX_VERTEX_SHADER, VORTEX_FRAGMENT_SHADER } from './vortex.glsl'

export default function VortexBackground({ intensity = 0.0, mouseUv, paused = false }) {
  const materialRef = useRef(null)
  const { size, gl } = useThree()
  const startTimeRef = useRef(performance.now() / 1000)
  const lastTimeRef = useRef(0)
  const accumulatedRef = useRef(0)

  // Uniforms — created once, mutated in useFrame (cheaper than re-creating
  // an object every frame and letting React reconcile).
  const uniforms = useMemo(() => ({
    uTime:       { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
    uIntensity:  { value: 0.0 },
  }), [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Resize: keep uResolution in sync with canvas size so the aspect math
  // inside the shader stays correct.
  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height)
  }, [size.width, size.height, uniforms])

  // Per-frame: advance time, push mouse + intensity into uniforms.
  useFrame(() => {
    const now = performance.now() / 1000
    if (!paused) {
      const dt = now - (lastTimeRef.current || now)
      accumulatedRef.current += dt
      uniforms.uTime.value = accumulatedRef.current
    }
    lastTimeRef.current = now

    if (mouseUv) {
      uniforms.uMouse.value.set(mouseUv.x, mouseUv.y)
    }
    // Smooth intensity changes rather than jumping — easier on the eye
    uniforms.uIntensity.value += (intensity - uniforms.uIntensity.value) * 0.08
  })

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      {/* Fullscreen plane in NDC space — the vertex shader bypasses the
          camera matrix entirely (gl_Position = vec4(position.xy, 0, 1)),
          so any 2×2 plane fills the viewport regardless of camera setup. */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VORTEX_VERTEX_SHADER}
        fragmentShader={VORTEX_FRAGMENT_SHADER}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        transparent={false}
      />
    </mesh>
  )
}
