// /AnTonn/preview — the cylinder prototype landing page (restored).
//
// PreviewShell handles WebGL detection + error boundary internally, so
// if anything in the Three.js path fails it falls back to ListView
// client-side rather than showing "this page couldn't load." The
// previous Server Component static page is no longer rendered here —
// see git history if a pure-HTML fallback is ever needed again.

import PreviewShell from './PreviewShell'

export const metadata = {
  title: 'An Tonn · Prototype',
  description: 'The chronicle of the Gàidhlig current — interactive prototype.',
  robots: { index: false, follow: false },
}

export default function AnTonnPreview() {
  return <PreviewShell />
}
