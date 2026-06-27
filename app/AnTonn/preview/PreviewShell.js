'use client'

// Thin client wrapper that owns the ssr:false dynamic import for
// CylinderClient. Next.js 16 doesn't allow `dynamic(..., { ssr: false })`
// inside a Server Component (page.js), so the dynamic boundary has to
// live in a Client Component. This file is intentionally tiny — its only
// job is to gate Three.js / WebGL behind a browser-only render.

import dynamic from 'next/dynamic'

const CylinderClient = dynamic(() => import('./CylinderClient'), {
  ssr: false,
  loading: () => <StaticCoverLoading />,
})

export default function PreviewShell() {
  return <CylinderClient />
}

// While the WebGL bundle loads we show a dark frame with the AN TONN
// wordmark — gives the user something Sruth-branded to look at for the
// 200-500ms of script load + shader compile.
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
