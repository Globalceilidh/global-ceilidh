// app/duilleag/panels.js
// The five faces of the Duilleag-cèilidh cylinder.
//
// Think of a revolving door with five glass panes rather than a smooth
// drum: each pane is one diaspora location, the page content floats on
// the inside of the glass, and the door wraps — pane 5 turns back into
// pane 1. Panel 0 is always where the door opens.
//
// Only `duilleag` has content today. The other four are deliberately
// single-column placeholders holding their backdrop and their name; what
// goes on them isn't decided yet, and reserving the slots now means the
// motion, the wrap and the backgrounds can all be tuned against the real
// thing before any of that content exists.

export const PANELS = [
  {
    slug: 'duilleag',
    kind: 'duilleag',
    place: { en: 'Scotland & Ireland', gd: 'Alba is Èirinn' },
    bg: '/duilleag/bg/scotland.webp',
    // Calanais, Lewis. The stones stand right-of-centre with open moor
    // and loch to the left, so the frame is pushed RIGHT: on a phone
    // (which crops the sides hard) that keeps the stones, and the empty
    // left of the picture is what ends up behind the nav column.
    bgPosition: '68% 48%',
  },
  {
    slug: 'usa',
    kind: 'placeholder',
    place: { en: 'United States', gd: 'Na Stàitean Aonaichte' },
    bg: '/duilleag/bg/usa.webp',
    // Pines on the left shore are the only hard subject; the rest is open
    // water. Framed left so a phone crop doesn't lose them.
    bgPosition: '38% 50%',
  },
  {
    slug: 'canada',
    kind: 'placeholder',
    place: { en: 'Canada', gd: 'Canada' },
    bg: '/duilleag/bg/canada.webp',
    // Cabot Trail — the coastline runs corner to corner, so any crop
    // still reads. Held centre.
    bgPosition: '50% 50%',
  },
  {
    slug: 'australia',
    kind: 'placeholder',
    place: { en: 'Australia', gd: 'Astràilia' },
    bg: '/duilleag/bg/australia.webp',
    // Rolling hill country, gums and a dirt road — no single subject to
    // protect, so it takes any crop. Biased down to the mid-ground.
    bgPosition: '50% 56%',
  },
  {
    slug: 'newzealand',
    kind: 'placeholder',
    place: { en: 'New Zealand', gd: 'Sealan Nuadh' },
    bg: '/duilleag/bg/newzealand.webp',
    // Lake and snow range at golden hour, tussock foreground. The range
    // sits high, so the frame is lifted to keep it above the fold.
    bgPosition: '50% 44%',
  },
];

export const PANEL_COUNT = PANELS.length;

// Proper modulo — JS `%` keeps the sign, which breaks the wrap when the
// door is turned backwards past panel 0.
export const wrapIndex = (i) => ((i % PANEL_COUNT) + PANEL_COUNT) % PANEL_COUNT;
