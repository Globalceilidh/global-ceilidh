// /AnTonn/preview — list view only (Three.js cylinder disabled).
//
// 2026-06-27: the cylinder was crashing browsers on first load — most
// likely a fragment-shader compatibility issue on certain GPU/driver
// combinations (Chrome's "this page couldn't load" tab-crash error,
// which the React error boundary can't catch because the crash is in
// the GPU process, not the JS process).
//
// To get the URL working RIGHT NOW we render the list view directly as
// a Server Component — no Three.js, no WebGL, no shader compilation,
// no client-side hydration risk. Same Week 2 data, same brand language,
// scrollable cards per vertical, fully accessible. Loads instantly.
//
// The Three.js cylinder code stays in the repo (CylinderClient,
// VortexBackground, etc.) and will come back once we've isolated the
// shader crash on a fresh branch and confirmed it works on the target
// devices. For Phase 0 review, list view is the prototype.

import StaticListView from './StaticListView'

export const metadata = {
  title: 'An Tonn · Prototype',
  description: 'The chronicle of the Gàidhlig current — interactive prototype.',
  robots: { index: false, follow: false },
}

export default function AnTonnPreview() {
  return <StaticListView />
}
