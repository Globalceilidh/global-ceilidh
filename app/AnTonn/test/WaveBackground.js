'use client'

// Wave background for /AnTonn/test.
//
// A full-viewport WebGL canvas sits behind the page content. As the
// user moves the mouse, a rolling ring buffer of up to MAX_RIPPLES
// "sources" is written into the shader; each source is a position (in
// UV) and an age (seconds since emission). The fragment shader sums
// sin(distance*freq - age*speed) with radial + temporal damping across
// all live sources, producing concentric waves that trail behind the
// cursor and fade in ~3-4 seconds. Idle behaviour: no new emissions,
// existing waves decay to nothing — the surface goes still. This
// preserves the ambience of the page (no continuous animation).
//
// The scene is drawn at NDC (fullscreen quad, camera bypassed) so the
// vertex shader is trivial and the whole cost is one fragment pass.
// Ripple math is inexpensive per-pixel but the loop is constant-bounded
// for WebGL 1.0 compatibility.
//
// Respects prefers-reduced-motion: pauses emission entirely.

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MAX_RIPPLES = 16
const RIPPLE_LIFETIME_SEC = 4.0
const EMIT_THROTTLE_SEC = 0.06
const EMIT_MIN_PX = 6

// Convert a #RRGGBB hex string to a THREE.Vector3 of normalised
// 0..1 floats. Uses Vector3 (not THREE.Color) to bypass THREE's
// automatic sRGB↔linear conversion — we want the shader output to
// land at exactly the sRGB values the CSS page bg is using, so the
// wave surface and page bg read as one continuous colour.
function hexToVec3(hex) {
  const h = String(hex).replace('#', '').padStart(6, '0')
  const r = parseInt(h.substring(0, 2), 16) / 255
  const g = parseInt(h.substring(2, 4), 16) / 255
  const b = parseInt(h.substring(4, 6), 16) / 255
  return new THREE.Vector3(r, g, b)
}

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform vec3 uBaseColor;
  uniform vec3 uModColor;
  uniform float uIntensityScale;
  // Each ripple: xy = origin UV, z = age in seconds (< 0 means inactive slot).
  uniform vec3 uRipples[${MAX_RIPPLES}];

  void main() {
    // Aspect-correct UV so ripples stay perfectly circular on any viewport.
    float aspect = uResolution.x / uResolution.y;
    vec2 uv = vUv;
    vec2 uvA = vec2(uv.x * aspect, uv.y);

    float sum = 0.0;
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec3 r = uRipples[i];
      // "continue" is unreliable on some GLSL 1.0 drivers; guard with if()
      if (r.z >= 0.0) {
        vec2 origin = vec2(r.x * aspect, r.y);
        float d = distance(uvA, origin);
        // Traveling-wave phase: d*freq - age*speed
        float phase = d * 22.0 - r.z * 4.0;
        // Radial fade (waves get quieter far from source)
        float radial = exp(-d * 1.8);
        // Temporal fade (older waves get quieter)
        float temporal = exp(-r.z * 1.35);
        sum += sin(phase) * radial * temporal;
      }
    }

    // Base is the "still water" colour — usually matched to the page
    // background so the wave surface reads as seamless with the page.
    // Ripples modulate toward uModColor. uIntensityScale scales the
    // overall wave brightness (per-page dimmer for the coloured
    // vertical surfaces where the wave was too loud).
    float intensity = clamp(sum * 0.32 * uIntensityScale, -0.45, 0.45);
    vec3 color = uBaseColor + intensity * uModColor;
    gl_FragColor = vec4(color, 1.0);
  }
`

function WavePlane({ mouseRef, reduceMotionRef, baseColor, modColor, intensityScale }) {
  const materialRef = useRef()

  // Ring buffer of ripple sources. Kept as a plain object so useFrame
  // can mutate without triggering React updates.
  const state = useRef({
    ripples: Array.from({ length: MAX_RIPPLES }, () => ({ x: 0, y: 0, emitTime: -1 })),
    lastEmit: 0,
    lastMouse: { x: -Infinity, y: -Infinity },
    idx: 0,
  })

  // Uniforms — allocate once. Vector2/Vector3 are mutated in place each
  // frame (THREE picks up the new values automatically).
  const uniforms = useMemo(() => ({
    uResolution: { value: new THREE.Vector2(1, 1) },
    uBaseColor: { value: hexToVec3(baseColor) },
    uModColor: { value: hexToVec3(modColor) },
    uIntensityScale: { value: intensityScale },
    uRipples: {
      value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector3(0, 0, -1)),
    },
  }), [])

  // Keep the colour + intensity uniforms in sync if the props change.
  useEffect(() => {
    uniforms.uBaseColor.value.copy(hexToVec3(baseColor))
    uniforms.uModColor.value.copy(hexToVec3(modColor))
    uniforms.uIntensityScale.value = intensityScale
  }, [baseColor, modColor, intensityScale, uniforms])

  useFrame(({ size, clock }) => {
    if (!materialRef.current) return
    const t = clock.getElapsedTime()

    // Emit a new ripple if the cursor has moved enough since last emit
    // (unless the user has requested reduced motion).
    if (!reduceMotionRef.current) {
      const m = mouseRef.current
      if (m.x >= 0 && m.y >= 0) {
        const dx = m.x - state.current.lastMouse.x
        const dy = m.y - state.current.lastMouse.y
        const dist = Math.hypot(dx, dy)
        if (t - state.current.lastEmit > EMIT_THROTTLE_SEC && dist > EMIT_MIN_PX) {
          state.current.ripples[state.current.idx] = {
            x: m.x / window.innerWidth,
            // Flip Y for WebGL UV (0 at bottom vs. 0 at top in DOM)
            y: 1.0 - m.y / window.innerHeight,
            emitTime: t,
          }
          state.current.idx = (state.current.idx + 1) % MAX_RIPPLES
          state.current.lastEmit = t
          state.current.lastMouse = { x: m.x, y: m.y }
        }
      }
    }

    // Push ripple state into uniform vec3 array.
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const r = state.current.ripples[i]
      const u = uniforms.uRipples.value[i]
      if (r.emitTime < 0) {
        u.set(0, 0, -1)
      } else {
        const age = t - r.emitTime
        if (age > RIPPLE_LIFETIME_SEC) {
          u.set(0, 0, -1)
          r.emitTime = -1
        } else {
          u.set(r.x, r.y, age)
        }
      }
    }

    // Resolution in device pixels so the aspect correction stays right.
    const pr = window.devicePixelRatio || 1
    uniforms.uResolution.value.set(size.width * pr, size.height * pr)
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function WaveBackground({
  mouseRef,
  baseColor = '#020409',
  modColor = '#242830',
  intensityScale = 1.0,
}) {
  const reduceMotionRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduceMotionRef.current = mq.matches
    const handler = () => { reduceMotionRef.current = mq.matches }
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  return (
    <Canvas
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
      camera={{ position: [0, 0, 1], near: 0.01, far: 10 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
    >
      <WavePlane
        mouseRef={mouseRef}
        reduceMotionRef={reduceMotionRef}
        baseColor={baseColor}
        modColor={modColor}
        intensityScale={intensityScale}
      />
    </Canvas>
  )
}
