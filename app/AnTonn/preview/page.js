// /AnTonn/preview — the cylinder prototype landing page.
//
// Gated behind the pre-launch cookie via middleware.js (path /AnTonn/* is
// not in PUBLIC_PREFIXES), so anyone hitting this URL needs to have
// already set the gc_access cookie via ?key=6776 (handled by middleware).
//
// Server component → dynamically imports the client shell with ssr:false
// because Three.js / WebGL only runs in the browser. During SSR we render
// a static loading frame instead of crashing.

import dynamic from 'next/dynamic'

const CylinderClient = dynamic(() => import('./CylinderClient'), {
  ssr: false,
  loading: () => <StaticCoverLoading />,
})

export const metadata = {
  title: 'An Tonn · Prototype',
  description: 'The chronicle of the Gàidhlig current — interactive prototype.',
  robots: { index: false, follow: false },
}

export default function AnTonnPreview() {
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
