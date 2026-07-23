// app/duilleag/stubs.js
// The left column's link tree and the quick jumps above the feed. Both
// point at surfaces that exist.
//
// The placeholder feed and connections that used to live here are gone —
// migrations 034/035 are applied, so both now come from the real graph
// via /api/feed and /api/connections. The one thing still faked is the
// online dot in the connections list, which needs presence (Supabase
// Realtime); it reads offline for everyone rather than inventing a
// status, and is marked as such in Connections.js.

export const NAV_ITEMS = [
  { href: '/duilleag', icon: '⌂', label: { en: 'Home', gd: 'Dachaigh' } },
  { href: '/saoghal', icon: '◎', label: { en: 'An Saoghal', gd: 'An Saoghal' } },
  { href: '/saoghal/archives', icon: '❧', label: { en: 'Archives', gd: 'Tasglann' } },
  { href: '/sruth', icon: '≋', label: { en: 'Sruth', gd: 'Sruth' } },
  { href: '/AnTonn', icon: '◈', label: { en: 'An Tonn', gd: 'An Tonn' } },
  { href: '/feisean', icon: '⚑', label: { en: 'Fèisean', gd: 'Fèisean' } },
  { href: '/news', icon: '❋', label: { en: 'News', gd: 'Naidheachdan' } },
];

// A row of icon links above the feed — image marks, not text pills. Each
// link is represented by its own icon; order is intentional. Add more by
// dropping another { href, iconImg, label } in sequence.
export const QUICK_JUMPS = [
  { href: '/radio',  iconImg: '/AnTonn/test/reidio-icon.png', label: { en: 'Radio',  gd: 'Rèidio' } },
  { href: '/AnTonn', iconImg: '/AnTonn/test/AnTonn.png',      label: { en: 'An Tonn', gd: 'An Tonn' } },
];

