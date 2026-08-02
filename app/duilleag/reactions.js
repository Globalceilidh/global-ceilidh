// app/duilleag/reactions.js
// The reaction palette. Slugs are the source of truth (validated server-side
// in lib/social.js REACTION_KINDS + accepted by gc_post_reactions once the
// fixed CHECK is dropped, migration 059). Each reaction carries a custom icon
// and a colour — the colour tints a post's border toward the reaction it's
// receiving most.
//
// NOTE: the Gàidhlig labels are first-pass and want the Lewis/Joe stamp.
//
// Icons are the trimmed wee-figure art (rx-*.png). Order runs positive → negative.
export const REACTIONS = [
  { kind: 'tonnsuas',  label: { en: 'Like',     gd: 'Tonn Suas' }, icon: '/people/rx-tonnsuas.png',  color: '#7EC8E3' }, // light blue
  { kind: 'tonnsios',  label: { en: 'Dislike',  gd: 'Tonn Sìos' }, icon: '/people/rx-tonnsios.png',  color: '#1B3A8B' }, // dark blue
  { kind: 'gradh',     label: { en: 'Love',     gd: 'Gràdh' },     icon: '/people/rx-gradh.png',     color: '#E5484D' }, // red
  { kind: 'solas',     label: { en: 'Approval', gd: 'Sòlas' },     icon: '/people/rx-solas.png',     color: '#F4C430' }, // sunny yellow
  { kind: 'fearagach', label: { en: 'Angry',    gd: 'Fearagach' }, icon: '/people/rx-fearagach.png', color: '#2B3A55' }, // dark storm blue
  { kind: 'bron',      label: { en: 'Sad',      gd: 'Bròn' },      icon: '/people/rx-bron.png',      color: '#6E7F94' }, // slate blue
  { kind: 'curam',     label: { en: 'Care',     gd: 'Cùram' },     icon: '/people/rx-curam.png',     color: '#C9A047' }, // gold
];

export const REACTION = Object.fromEntries(REACTIONS.map((r) => [r.kind, r]));

// A post's resting border when it has no reactions yet.
export const NEUTRAL_BORDER = 'rgba(255,255,255,0.16)';
