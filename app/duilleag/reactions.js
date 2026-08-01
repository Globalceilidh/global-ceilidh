// app/duilleag/reactions.js
// The reaction palette. Slugs are the source of truth (validated server-side
// in lib/social.js REACTION_KINDS + accepted by gc_post_reactions once the
// fixed CHECK is dropped, migration 059). Each reaction carries a custom icon
// and a colour — the colour tints a post's border toward the reaction it's
// receiving most.
//
// NOTE: the Gàidhlig labels are first-pass and want the Lewis/Joe stamp.
//
// Coming (need icons before they go in): Like → light blue (#7EC8E3),
// Dislike → dark blue (#1B3A8B), Disapproval → dark storm blue (#2B3A55).

// The full-resolution transparent PNGs (the wee-figure reaction art).
export const REACTIONS = [
  { kind: 'curam', label: { en: 'Care',     gd: 'Cùram' }, icon: '/people/rx-curam.png', color: '#2E86DE' }, // blue
  { kind: 'solas', label: { en: 'Approval', gd: 'Sòlas' }, icon: '/people/rx-solas.png', color: '#F4C430' }, // sunny yellow
  { kind: 'gradh', label: { en: 'Love',     gd: 'Gràdh' }, icon: '/people/rx-gradh.png', color: '#E5484D' }, // red
];

export const REACTION = Object.fromEntries(REACTIONS.map((r) => [r.kind, r]));

// A post's resting border when it has no reactions yet.
export const NEUTRAL_BORDER = 'rgba(255,255,255,0.16)';
