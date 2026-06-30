'use client'

// Thin client wrapper. Three responsibilities:
//   1. WebGL feature detection on mount. The vortex shader still runs
//      on a Three.js canvas behind the new CSS-perspective wall — if
//      WebGL is unavailable (Norton TLS blocking, broken GPU, browser
//      flag disabling hw-accel) we render the list view instead.
//   2. Wrap the wall in an error boundary so any runtime crash falls
//      back to the list view rather than blanking the page.
//   3. Own the dynamic import of WallClient with ssr:false (Next.js
//      16 disallows this pattern in Server Components).
//
// First-paint experience uses /AnTonn/cover.png (the existing
// AnTonn magazine cover) so users see Sruth-branded imagery during the
// ~300-500ms WebGL initialise window rather than a generic dark gradient.

import { useEffect, useState, Component } from 'react'
import dynamic from 'next/dynamic'
import { ListView, SEOMirror } from './components/ListView'
import { issue as week2 } from './data/week-2026-06-23'

const WallClient = dynamic(() => import('./WallClient'), {
  ssr: false,
  loading: () => <StaticCoverLoading />,
})

export default function PreviewShell() {
  const [webglSupported, setWebglSupported] = useState(null)
  const [forceList, setForceList] = useState(false)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setWebglSupported(detectWebGL())
  }, [])

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
      <WallClient />
      <SEOMirror issue={week2} />
    </ErrorBoundary>
  )
}

function detectWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
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

function ListViewWithImmersiveOffer({ issue, immersiveAvailable, onTryImmersive }) {
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
        onTileSelect={() => {}}
      />
    </>
  )
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    console.error('[AnTonn wall error boundary]', error, info)
    this.props.onError?.(error)
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

// First-paint cover: the existing AnTonn magazine cover artwork as a
// full-bleed background with the AN TONN wordmark + tagline layered on
// top. Replaces what used to be a plain dark radial gradient — gives
// users something Sruth-branded to look at during the ~300-500ms
// before the WebGL bundle loads and the shader compiles.
function StaticCoverLoading() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#020409',
      overflow: 'hidden',
    }}>
      {/* Wave-imagery hero from /AnTonn/cover.png */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/AnTonn/cover.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.55,
      }} />
      {/* Dark gradient overlay so text reads against any cover content */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(2,4,9,0.4) 0%, rgba(2,4,9,0.85) 80%)',
      }} />
      {/* Centred wordmark */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: '#F2ECDC',
        textAlign: 'center',
        padding: 24,
      }}>
        <div style={{
          fontFamily: '"IBM Plex Mono", Menlo, monospace',
          fontSize: 11, letterSpacing: 4, color: '#C9A047',
          marginBottom: 16,
        }}>
          ● AN TONN
        </div>
        <div style={{
          fontFamily: 'Cinzel, Georgia, serif',
          fontSize: 'clamp(40px, 6vw, 64px)',
          fontWeight: 600, letterSpacing: 6,
          marginBottom: 12,
        }}>
          AN TONN
        </div>
        <div style={{
          fontFamily: 'EB Garamond, Georgia, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(14px, 1.8vw, 18px)',
          color: 'rgba(242, 236, 220, 0.7)',
          maxWidth: 480, lineHeight: 1.5,
        }}>
          The chronicle of the Gàidhlig current — coming through the wave…
        </div>
        {/* Subtle pulse dot */}
        <div style={{
          marginTop: 32,
          width: 8, height: 8, borderRadius: '50%',
          background: '#C9A047',
          opacity: 0.8,
          animation: 'antonn-pulse 1.4s ease-in-out infinite',
        }} />
        <style>{`
          @keyframes antonn-pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.85); }
            50%     { opacity: 1.0; transform: scale(1.15); }
          }
        `}</style>
      </div>
    </div>
  )
}
