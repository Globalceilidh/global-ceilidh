import TestSurface from '../../_components/TestSurface'

// /AnTonn/leabhraichean/test — Leabhraichean (Books) vertical sandbox.
// Tonal quality: dark brassy gold — old leather binding, lamplight on ink.

export const metadata = {
  title: 'Leabhraichean · An Tonn — sandbox',
  description: 'Leabhraichean (Books) vertical test surface for the An Tonn wing.',
}

// Palette: dark brassy gold still water, ripples peak toward a warm
// polished-brass — lamp catching gold leaf on an old spine.
export default function LeabhraicheanTest() {
  return <TestSurface background="#2E2108" waveMod="#C69A2A" />
}
