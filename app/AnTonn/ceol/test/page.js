import TestSurface from '../../_components/TestSurface'

// /AnTonn/ceol/test — Ceòl (Music) vertical sandbox.
// Tonal quality: dark navy — night sky before the ceilidh begins.

export const metadata = {
  title: 'Ceòl · An Tonn — sandbox',
  description: 'Ceòl (Music) vertical test surface for the An Tonn wing.',
}

// Palette: dark navy still water, ripples brighten toward a colder,
// electric-blue peak — the kind of colour a spot on a dance floor
// throws through fog.
export default function CeolTest() {
  return <TestSurface background="#0B1739" waveMod="#3A6ACF" />
}
