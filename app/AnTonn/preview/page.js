// /AnTonn/preview — the cylinder prototype landing page.
//
// Gated behind the pre-launch cookie via middleware.js (path /AnTonn/* is
// not in PUBLIC_PREFIXES), so anyone hitting this URL needs to have
// already set the gc_access cookie via ?key=6776 (handled by middleware).
//
// This is a Server Component. The WebGL/Three.js scene is wrapped by
// PreviewShell which is a thin Client Component owning the
// `dynamic(..., { ssr: false })` boundary — Next.js 16 disallows that
// dynamic pattern in Server Components.

import PreviewShell from './PreviewShell'

export const metadata = {
  title: 'An Tonn · Prototype',
  description: 'The chronicle of the Gàidhlig current — interactive prototype.',
  robots: { index: false, follow: false },
}

export default function AnTonnPreview() {
  return <PreviewShell />
}
