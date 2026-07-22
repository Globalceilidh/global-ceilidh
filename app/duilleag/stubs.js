// app/duilleag/stubs.js
// Placeholder data for the parts of the Duilleag-cèilidh whose schema
// doesn't exist yet, kept in ONE file so the swap to real data is a
// deletion rather than a hunt.
//
//   PLACEHOLDER_FEED         -> needs gc_follows (034) + audience
//                               resolution (035). The feed is other
//                               people's posts, filtered by the tier the
//                               author chose; none of that can run until
//                               the graph has rows in it.
//   PLACEHOLDER_CONNECTIONS  -> needs gc_follows for the list itself, and
//                               presence (Supabase Realtime, unbuilt) for
//                               the online dot. Everyone here is shown
//                               offline except one, so the dot's two
//                               states are both visible while designing.
//
// NAV_ITEMS and QUICK_JUMPS are real — they point at surfaces that exist.

export const NAV_ITEMS = [
  { href: '/duilleag', icon: '⌂', label: { en: 'Home', gd: 'Dachaigh' } },
  { href: '/saoghal', icon: '◎', label: { en: 'An Saoghal', gd: 'An Saoghal' } },
  { href: '/sruth', icon: '≋', label: { en: 'Sruth', gd: 'Sruth' } },
  { href: '/AnTonn', icon: '◈', label: { en: 'An Tonn', gd: 'An Tonn' } },
  { href: '/feisean', icon: '⚑', label: { en: 'Fèisean', gd: 'Fèisean' } },
  { href: '/news', icon: '❋', label: { en: 'News', gd: 'Naidheachdan' } },
];

export const QUICK_JUMPS = [
  { href: '/radio', icon: '⏻', label: { en: 'Radio', gd: 'Rèidio' } },
  { href: '/rooms/an-cidsin', icon: '⌬', label: { en: 'Rooms', gd: 'Seòmraichean' } },
  { href: '/ionnsaich', icon: '✦', label: { en: 'Abair E', gd: 'Abair E' } },
];

export const PLACEHOLDER_FEED = [
  {
    id: 'stub-1',
    author: 'Lewis MacFhionghain',
    when: '2h',
    body: 'Chuir sinn crìoch air an t-seachdain le òran bho Ìle. Tha an samhradh a’ tighinn gu crìch ach tha an ceòl a’ dol air adhart.',
  },
  {
    id: 'stub-2',
    author: 'Ceit NicDhòmhnaill',
    when: '5h',
    body: 'First fèis of the season in Antigonish this weekend — three generations of one family on the same stage. That is what this is all for.',
  },
  {
    id: 'stub-3',
    author: 'Ruairidh Mac a’ Ghobhainn',
    when: '1d',
    body: 'Question for the fluent speakers: is there a Gàidhlig word that carries the same weight as “hiraeth”? Closest I have found is “cianalas” but it is not quite it.',
  },
];

export const PLACEHOLDER_CONNECTIONS = [
  { id: 'c1', initials: 'LM', name: 'Lewis MacFhionghain', online: true },
  { id: 'c2', initials: 'CN', name: 'Ceit NicDhòmhnaill', online: false },
  { id: 'c3', initials: 'RG', name: 'Ruairidh Mac a’ Ghobhainn', online: false },
  { id: 'c4', initials: 'MS', name: 'Mòrag Stiùbhart', online: true },
  { id: 'c5', initials: 'AD', name: 'Anna Dhòmhnallach', online: false },
];
