'use client';

// /AnTonn — the constellation hub, promoted from /AnTonn/test (2026-07-28).
//
// The magazine "cover" flavour of An Tonn is PARKED (not deleted): it lives at
// /AnTonn/cover, with /AnTonn/this-week + the magazine verticals (/music,
// /books, /podcasts, /film) still reachable for future revival. The four live
// verticals are /AnTonn/ceol, /bhidio, /leabhraichean, /podcraoladh.
//
// The constellation component itself stays in ./test/AnTonnHub.js (so its
// relative imports and the ./WaveBackground dynamic import keep resolving);
// /AnTonn/test 301-redirects here (next.config.js).

import AnTonnHub from './test/AnTonnHub';

export default function AnTonnPage() {
  return <AnTonnHub />;
}
