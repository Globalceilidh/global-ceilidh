'use client'

// Same shape as PreviewShell: WebGL detect + dynamic client import +
// error boundary. If WebGL is unavailable we fall back to a static
// four-button list so the entry still functions on GPUs/browsers that
// can't run the vortex shader.

import { useEffect, useState, Component } from 'react'
import dynamic from 'next/dynamic'

const MarbleClient = dynamic(() => import('./MarbleClient'), {
  ssr: false,
  loading: () => <MarbleLoading />,
})

export default function MarbleShell() {
  const [webglSupported, setWebglSupported] = useState(null)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setWebglSupported(detectWebGL())
  }, [])

  if (webglSupported === null) return <MarbleLoading />
  if (!webglSupported || errored) return <StaticFallback />

  return (
    <ErrorBoundary onError={() => setErrored(true)}>
      <MarbleClient />
    </ErrorBoundary>
  )
}

function detectWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    return true
  } catch {
    return false
  }
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
    console.error('[AnTonn marble error boundary]', error, info)
    this.props.onError?.(error)
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function MarbleLoading() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#020409',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#F2ECDC',
      fontFamily: '"IBM Plex Mono", Menlo, monospace',
      fontSize: 11, letterSpacing: 4, opacity: 0.7,
    }}>
      AN TONN
    </div>
  )
}

// No-WebGL fallback — just four pill links on a dark background. The
// vortex + marble aesthetic is unavailable but the navigation still
// works, so the entry into the entertainment wing isn't broken for
// users whose devices can't run the shader.
function StaticFallback() {
  const items = [
    { label: 'Ceòl',          href: '/AnTonn/this-week' },
    { label: 'Bhidio',        href: '/AnTonn/this-week' },
    { label: 'Pod-chraoladh', href: '/AnTonn/this-week' },
    { label: 'Leabhraichean', href: '/AnTonn/this-week' },
  ]
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#020409',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24,
      color: '#F2ECDC',
    }}>
      <div style={{
        fontFamily: 'Cinzel, Georgia, serif', fontSize: 20,
        letterSpacing: 6, fontWeight: 600, marginBottom: 20,
      }}>AN TONN</div>
      {items.map((it) => (
        <a key={it.label} href={it.href} style={{
          display: 'block', padding: '14px 40px', minWidth: 260, textAlign: 'center',
          borderRadius: 999, border: '1px solid rgba(255,255,255,0.35)',
          color: '#F2ECDC', textDecoration: 'none',
          fontFamily: 'Cinzel, Georgia, serif',
          fontSize: 18, letterSpacing: 4, fontWeight: 600,
        }}>
          {it.label.toUpperCase()}
        </a>
      ))}
    </div>
  )
}
