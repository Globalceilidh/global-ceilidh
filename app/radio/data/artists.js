// Global Ceilidh Radio — artist + fallback library.
//
// Data model (locked-in for Phases 1-3):
//
//   ARTISTS: [{
//     id, name, aliases, emoji, tagline, photos, photoAlt,
//     videos: [{ videoId, start, end }],  // trimmed clips, seconds
//     tourDates,
//     isPartner,
//   }]
//
//   FALLBACK: {
//     logo,           // GC Radio logo image shown when Live365 plays
//                     // an artist not in the ARTISTS library
//     stockVideos: [] // GC feature clips + featured-partner ads to
//                     // rotate on the right pane when no artist video
//                     // is available
//     partners: []    // featured partner records (weighted rotation)
//   }
//
// `aliases` matters for Phase 3 Live365 sync — the widget currently
// reports the artist as "Piper.Ally", NOT "Ally the Piper". Any name
// variant Live365 might send goes in this array.
//
// Update this file directly; the /radio page reads it at build+run
// time. Later this can move to a CMS/Supabase table without changing
// the shape.

export const ARTISTS = [
  {
    id: 'ally-the-piper',
    name: 'Ally the Piper',
    aliases: ['piper.ally', 'ally piper', 'ally the piper'],
    emoji: '🪈',
    tagline: 'Bagpipe-rock on the Thruway',
    photos: [
      '/radio/ally-the-piper/photo-1.png',
      '/radio/ally-the-piper/photo-2.png',
    ],
    photoAlt: 'Ally the Piper — press photo',
    videos: [
      { videoId: 'n2yFNWQRiU0', start: 0, end: 240 },
    ],
    tourDates: 'US Club Tour · Jul 29 Albany NY (The Egg / Swyer Theatre) · Jul 30 Syracuse NY (Westcott Theater) · Aug 6 Ann Arbor MI (Blind Pig) · Aug 12 Grand Rapids MI (The Pyramid Scheme) · Aug 13–16 Milwaukee WI (Milwaukee Irish Fest)',
    isPartner: false,
  },
  {
    id: 'skipinnish',
    name: 'Skipinnish',
    aliases: ['skipinnish'],
    emoji: '🥁',
    tagline: 'England, Germany, and a winter run of Scottish theatres',
    photos: [
      '/radio/skipinnish/photo-1.png',
      '/radio/skipinnish/photo-2.png',
    ],
    photoAlt: 'Skipinnish — press photo',
    // No video available — right pane falls back to a second photo tile
    videos: [],
    tourDates: 'Sep 19 Gloucestershire, England · Nov 22–30 Germany Tour (Hamburg · Berlin · Cologne · Munich · Stuttgart) · Dec 3 Fort William (Nevis Centre) · Dec 4 Glasgow (Royal Concert Hall) · Dec 5 Glasgow (Barrowland Ballroom) · Dec 10 Perth (Perth Concert Hall) · Dec 11 Oban (Corran Halls)',
    isPartner: false,
  },
  {
    id: 'manran',
    name: 'Mànran',
    aliases: ['manran', 'mànran'],
    emoji: '🎸',
    tagline: 'Summer festival stages, Scotland to France',
    photos: [
      '/radio/manran/photo-1.png',
      '/radio/manran/photo-2.png',
      '/radio/manran/photo-3.png',
    ],
    photoAlt: 'Mànran — press photo',
    videos: [
      { videoId: 'lTrHY3U4gYA', start: 0, end: 240 },
    ],
    tourDates: 'Jul 16 Isle of Lewis (HebCelt Festival) · Jul 26 Loon-Plage, France (Parc Galame) · Jul 30–Aug 1 Inverness (Belladrum Tartan Heart Festival) · Aug 14–15 York (The Magpies Festival) · Sep 4–6 Jedburgh (Edge Fest)',
    isPartner: false,
  },
];

// Phase 3 fallback — shown when Live365 reports an artist that
// doesn't match anyone in ARTISTS.
//
// Drop these files into place when ready:
//   public/radio/gc-radio-logo.png   (Whitey to provide)
//   stockVideos entries with { videoId, start, end }
//   partner entries with { id, name, adImages, adVideos, url, weight }
export const FALLBACK = {
  logo: '/radio/gc-radio-logo.png',
  stockVideos: [],
  partners: [],
};

// Phase 3 helper — normalise a Live365 artist string and find a match
// in ARTISTS. Handles common variations ("Piper.Ally", "ally.piper",
// case differences, punctuation).
export function matchArtist(live365ArtistString) {
  if (!live365ArtistString) return null;
  const norm = (s) => s.toLowerCase().replace(/[.\s_-]+/g, '');
  const target = norm(live365ArtistString);
  for (const a of ARTISTS) {
    if (norm(a.name) === target) return a;
    if (a.aliases?.some((alias) => norm(alias) === target)) return a;
  }
  return null;
}
