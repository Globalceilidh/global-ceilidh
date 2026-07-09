// /AnTonn/marble — the marble prototype.
//
// The user is inside a plexiglass sphere floating on a dark sea; the
// vortex from /AnTonn/preview is the sea. Four large white pill-buttons
// live on the inside of the marble, with the vortex bleeding through
// the letterforms. This is the steady-state prototype — the drop-into-
// sea intro and the click-through-vortex transitions come after we
// prove the look reads right.

import MarbleShell from './MarbleShell'

export const metadata = {
  title: 'An Tonn · Marble',
  description: 'The entertainment wing of Global Cèilidh — inside the marble.',
  robots: { index: false, follow: false },
}

export default function AnTonnMarble() {
  return <MarbleShell />
}
