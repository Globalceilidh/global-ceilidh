import TestSurface from '../_components/TestSurface'
import VideoWallCurved from './test/VideoWallCurved'
import { loadCatalog } from './test/videos'

// /AnTonn/bhidio — Bhidio (Film / Video). Promoted from /AnTonn/bhidio/test
// (2026-07-28); the test route 301-redirects here. Wall components stay in
// ./test/ so their own imports keep resolving. Server component: fetches the
// catalog at build / ISR time and passes it to the (client) wall.

export const metadata = {
  title: 'Bhidio · An Tonn',
  description: 'Bhidio (Film / Video) — the An Tonn video current.',
}

export default async function Bhidio() {
  const catalog = await loadCatalog()
  return (
    <TestSurface
      background="#2E0812"
      waveMod="#701A2C"
      wordmarkSrc="/AnTonn/test/bhidio-wordmark.png"
      wordmarkAlt="Bhidio"
    >
      <VideoWallCurved catalog={catalog} />
    </TestSurface>
  )
}
