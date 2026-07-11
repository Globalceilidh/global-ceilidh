import TestSurface from '../../_components/TestSurface'

// /AnTonn/bhidio/test — Bhidio (Film / Video) vertical sandbox.
// Tonal quality: deep burgundy — the curtain before the projector rolls.

export const metadata = {
  title: 'Bhidio · An Tonn — sandbox',
  description: 'Bhidio (Film / Video) vertical test surface for the An Tonn wing.',
}

// Palette: deep burgundy still water, ripples peak toward a cardinal
// scarlet — kept close in family to the base so the wave reads as a
// slightly-lit disturbance of the same burgundy, not a colour shift.
export default function BhidioTest() {
  return <TestSurface background="#2E0812" waveMod="#701A2C" />
}
