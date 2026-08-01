// app/duilleag/reactions.js
// The reaction palette. Slugs are the source of truth (validated
// server-side in lib/social.js REACTION_KINDS + the gc_post_reactions
// CHECK); the glyph and label are presentation only.
//
// NOTE: the Gàidhlig labels are first-pass and want the Lewis/Joe stamp
// before public launch (see project_gc_social_nomenclature).

export const REACTIONS = [
  { kind: 'slainte',  glyph: '🥂', label: { en: 'Slàinte', gd: 'Slàinte' } },
  { kind: 'gaol',     glyph: '❤️', label: { en: 'Love',    gd: 'Gaol' } },
  { kind: 'gaire',    glyph: '😄', label: { en: 'Ha',      gd: 'Gàire' } },
  { kind: 'iongnadh', glyph: '😮', label: { en: 'Wow',     gd: 'Iongnadh' } },
  { kind: 'taing',    glyph: '🙏', label: { en: 'Thanks',  gd: 'Taing' } },
];

export const GLYPH = Object.fromEntries(REACTIONS.map((r) => [r.kind, r.glyph]));
