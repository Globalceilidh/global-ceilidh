import TestSurface from '../../_components/TestSurface'
import VideoWallCurved from './VideoWallCurved'
import { loadCatalog } from './videos'

// /AnTonn/bhidio/test — Bhidio (Film / Video) vertical sandbox.
// Tonal quality: deep burgundy — the curtain before the projector rolls.
// Centre content: an inner-bend wall of video cards, six category
// columns (Music / Educational / Comedy / Drama / Documentary / Live).
//
// Server component: fetches the catalog from sruth-backend at build /
// ISR revalidation time, passes it as a prop to the (client) wall.
// Editors curate videos in sruth-admin → Bhidio Videos.

export const metadata = {
  title: 'Bhidio · An Tonn — sandbox',
  description: 'Bhidio (Film / Video) vertical test surface for the An Tonn wing.',
}

// Palette: deep burgundy still water, ripples peak toward a cardinal
// scarlet — kept close in family to the base so the wave reads as a
// slightly-lit disturbance of the same burgundy, not a colour shift.
export default async function BhidioTest() {
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
