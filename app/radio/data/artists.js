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
      // Ally the Piper — 6-clip sequence, ~5m 42s total playtime,
      // then wraps. Chained via YouTube IFrame Player API in
      // VideoSequencerTile (Phase 2 sequencer).
      { videoId: 'n2yFNWQRiU0', start: 6,   end: 195 },  // :06  – 3:15
      { videoId: '_E6O8Uxp67g', start: 7,   end: 65  },  // :07  – 1:05
      { videoId: '_E6O8Uxp67g', start: 100, end: 123 },  // 1:40 – 2:03
      { videoId: '_E6O8Uxp67g', start: 138, end: 149 },  // 2:18 – 2:29
      { videoId: 'DoMowA_9sxY', start: 9,   end: 45  },  // :09  – :45
      { videoId: 'DoMowA_9sxY', start: 274, end: 299 },  // 4:34 – 4:59
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
// doesn't match anyone in ARTISTS. Two logo images, one designed
// for each tile aspect (portrait 3:4 for the narrow left panel,
// landscape 16:11 for the wide right panel).
//
// Drop stockVideos + partners entries here when ready — they'll rotate
// on the right pane during unknown-artist windows.
export const FALLBACK = {
  logoNarrow: '/radio/gc-radio-logo-narrow.png', // ~474 x 632, portrait
  logoWide:   '/radio/gc-radio-logo-wide.png',   // ~900 x 632, landscape
  stockVideos: [],
  partners: [],
};

// Phase 3 helper — normalise a Live365 artist string and find any
// artist in ARTISTS whose name or alias appears WITHIN it. Substring
// match (not equality) so multi-artist strings like
// "Mia Asano & Piper.Ally" still match Ally via her `piper.ally` alias
// (both normalize to something containing "piperally").
export function matchArtist(live365ArtistString) {
  if (!live365ArtistString) return null;
  const norm = (s) =>
    s.toLowerCase().replace(/[.\s_&,()/\-\\]+/g, '');
  const target = norm(live365ArtistString);
  if (target.length === 0) return null;

  for (const a of ARTISTS) {
    const candidates = [a.name, ...(a.aliases || [])];
    for (const c of candidates) {
      const n = norm(c);
      // Guard against 1-2 char aliases accidentally matching everything
      if (n.length >= 4 && target.includes(n)) return a;
    }
  }
  return null;
}
