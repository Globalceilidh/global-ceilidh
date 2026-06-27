'use client'

// Thin client wrapper. Owns three responsibilities:
//   1. Detect WebGL support synchronously on mount. If unavailable
//      (Norton TLS interception of script loads, broken GPU, browser
//      flag disabling hw-accel, etc.) the cylinder will never render,
//      so we bypass it entirely and show the list view directly.
//   2. Wrap the cylinder in an error boundary so any runtime crash
//      (shader compile failure, Three.js init error, anything) falls
//      back to the list view rather than blanking the page.
//   3. Own the dynamic import of CylinderClient with ssr:false (Next.js
//      16 disallows this pattern in Server Components).
//
// Net effect: the URL ALWAYS shows something useful. WebGL on = cylinder.
// WebGL off / errored = same data in a scrollable list. No more "this
// page couldn't load" silent failures.

import { useEffect, useState, Component } from 'react'
import dynamic from 'next/dynamic'
import { ListView, SEOMirror } from './components/ListView'
import { issue as week2 } from './data/week-2026-06-23'

const CylinderClient = dynamic(() => import('./CylinderClient'), {
  ssr: false,
  loading: () => <StaticCoverLoading />,
})

export default function PreviewShell() {
  const [webglSupported, setWebglSupported] = useState(null)  // null = still checking
  const [forceList, setForceList] = useState(false)            // user toggle
  const [errored, setErrored] = useState(false)                // boundary tripped

  useEffect(() => {
    setWebglSupported(detectWebGL())
  }, [])

  // Decision tree:
  //   - still detecting → static cover
  //   - WebGL absent OR user toggled OR boundary errored → list view
  //   - otherwise → cylinder, wrapped in error boundary
  if (webglSupported === null) return <StaticCoverLoading />

  if (!webglSupported || forceList || errored) {
    return (
      <>
        <ListViewWithImmersiveOffer
          issue={week2}
          immersiveAvailable={webglSupported && !errored}
          onTryImmersive={() => {
            setForceList(false)
            setErrored(false)
          }}
        />
        <SEOMirror issue={week2} />
      </>
    )
  }

  return (
    <ErrorBoundary onError={() => setErrored(true)}>
      <CylinderClient />
      <SEOMirror issue={week2} />
    </ErrorBoundary>
  )
}

// ── WebGL detection ────────────────────────────────────────────────────

function detectWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    // Probe for fragment shader compile capability — some "supports WebGL"
    // browsers still fail on custom shaders due to driver bugs.
    const shader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(shader, 'void main() { gl_FragColor = vec4(1.0); }')
    gl.compileShader(shader)
    const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    gl.deleteShader(shader)
    return ok
  } catch {
    return false
  }
}

// ── ListView wrapper with "Try immersive" affordance ──────────────────

function ListViewWithImmersiveOffer({ issue, immersiveAvailable, onTryImmersive }) {
  // Stub onClose — when only list view is reachable, the close button
  // is hidden; when immersive is reachable, it lets the user switch.
  return (
    <>
      {immersiveAvailable && (
        <button
          type="button"
          onClick={onTryImmersive}
          style={{
            position: 'fixed', top: 18, right: 18, zIndex: 90,
            padding: '10px 18px', borderRadius: 999,
            background: 'rgba(201, 160, 71, 0.18)',
            border: '1px solid rgba(201, 160, 71, 0.5)',
            color: '#C9A047', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            fontFamily: '"IBM Plex Mono", Menlo, monospace',
            fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          ◯ Try immersive view
        </button>
      )}
      <ListView
        issue={issue}
        onClose={immersiveAvailable ? onTryImmersive : () => {}}
        onTileSelect={() => { /* Detail panel handled inside ListView in v3 — for now just no-op */ }}
      />
    </>
  )
}

// ── Error boundary ─────────────────────────────────────────────────────

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    // Console for diagnostic; parent flips state to render list view next.
    console.error('[AnTonn cylinder error boundary]', error, info)
    this.props.onError?.(error)
  }
  render() {
    // If we caught, render nothing — the parent will re-render with the
    // list-view path on the next tick (via the onError callback).
    if (this.state.hasError) return null
    return this.props.children
  }
}

// ── First-paint cover ─────────────────────────────────────────────────

function StaticCoverLoading() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at center, #0a1a2a 0%, #020409 80%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#C9A047', fontFamily: 'Cinzel, Georgia, serif',
      letterSpacing: 6, fontSize: 18,
    }}>
      AN TONN
    </div>
  )
}
