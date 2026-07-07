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
//     logoNarrow / logoWide,   // fallback logos per tile aspect
//     stockVideos: [],         // GC feature clips + featured-partner
//                              // ads on the right pane when no artist
//                              // video is available
//     partners: []             // featured partner records
//   }
//
// `aliases` matters for Phase 3 Live365 sync — the widget can report
// artist names with different casing, punctuation, or accents.
// matchArtist() substring-matches on normalised strings, so any
// variant Live365 might send should go in this array.
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
    // Video sequencer retired 2026-07-07 (Whitey's call — YouTube's
    // control flash on clip transitions + cross-origin pointer swallow
    // + inability to real-sync with Live365 audio outweighed the
    // pastiche-video vision). All artists are static image carousels
    // now. MTV-style video montage moves to /AnTonn/bhidio.
    //
    // Original 6-clip Ally sequence preserved here in case we revive:
    //   { videoId: 'n2yFNWQRiU0', start: 6,   end: 195 },  // :06  – 3:15
    //   { videoId: '_E6O8Uxp67g', start: 7,   end: 65  },  // :07  – 1:05
    //   { videoId: '_E6O8Uxp67g', start: 100, end: 123 },  // 1:40 – 2:03
    //   { videoId: '_E6O8Uxp67g', start: 138, end: 149 },  // 2:18 – 2:29
    //   { videoId: 'DoMowA_9sxY', start: 9,   end: 45  },  // :09  – :45
    //   { videoId: 'DoMowA_9sxY', start: 274, end: 299 },  // 4:34 – 4:59
    videos: [],
    tourDates: 'US Club Tour · Jul 29 Albany NY (The Egg / Swyer Theatre) · Jul 30 Syracuse NY (Westcott Theater) · Aug 6 Ann Arbor MI (Blind Pig) · Aug 12 Grand Rapids MI (The Pyramid Scheme) · Aug 13–16 Milwaukee WI (Milwaukee Irish Fest)',
    isPartner: false,
  },
  {
    id: 'bad-haggis',
    name: 'Bad Haggis',
    aliases: ['bad haggis'],
    emoji: '🥁',
    tagline: null,
    photos: [
      '/radio/bad_haggis/b_h_1.png',
      '/radio/bad_haggis/b_h_2.png',
      '/radio/bad_haggis/b_h_3.png',
      '/radio/bad_haggis/b_h_4.png',
    ],
    photoAlt: 'Bad Haggis — press photo',
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'beluga-lagoon',
    name: 'Beluga Lagoon',
    aliases: ['beluga lagoon'],
    emoji: '🌊',
    tagline: null,
    photos: [
      '/radio/beluga_lagoon/beluga_1.png',
      '/radio/beluga_lagoon/beluga_2.png',
      '/radio/beluga_lagoon/beluga_3.png',
      '/radio/beluga_lagoon/beluga_4.png',
    ],
    photoAlt: 'Beluga Lagoon — press photo',
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'hadrians-wall',
    name: "Hadrian's Wall",
    aliases: ["hadrian's wall", 'hadrians wall', 'hadrian wall'],
    emoji: '🎻',
    tagline: null,
    photos: [
      '/radio/hadrians-wall/hadrians_wall_1.png',
      '/radio/hadrians-wall/hadrians_wall_2.png',
      '/radio/hadrians-wall/hadrians_wall_3.png',
      '/radio/hadrians-wall/hadrians_wall_4.png',
    ],
    photoAlt: "Hadrian's Wall — press photo",
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'isla-scott',
    name: 'Isla Scott',
    aliases: ['isla scott'],
    emoji: '🎻',
    tagline: null,
    photos: [
      '/radio/isla_scott/isla-scott-1.png',
      '/radio/isla_scott/isla-scott-2.png',
      '/radio/isla_scott/isla-scott-3.png',
      '/radio/isla_scott/isla-scott-4.png',
    ],
    photoAlt: 'Isla Scott — press photo',
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'josie-duncan',
    name: 'Josie Duncan',
    aliases: ['josie duncan'],
    emoji: '🎤',
    tagline: null,
    photos: [
      '/radio/josie_duncan/j-d-1.png',
      '/radio/josie_duncan/j-d-2.png',
      '/radio/josie_duncan/j-d-3.png',
      '/radio/josie_duncan/j-d-4.png',
      '/radio/josie_duncan/j-d-5.png',
    ],
    photoAlt: 'Josie Duncan — press photo',
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'julie-fowlis',
    name: 'Julie Fowlis',
    aliases: ['julie fowlis'],
    emoji: '🎤',
    tagline: null,
    photos: [
      '/radio/julie_fowlis/jf_1.png',
      '/radio/julie_fowlis/jf_2.png',
      '/radio/julie_fowlis/jf_3.png',
      '/radio/julie_fowlis/jf_4.png',
      '/radio/julie_fowlis/jf_5.png',
    ],
    photoAlt: 'Julie Fowlis — press photo',
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'kim-carnie',
    name: 'Kim Carnie',
    aliases: ['kim carnie'],
    emoji: '🎤',
    tagline: null,
    photos: [
      '/radio/kim_carnie/k-c-1.png',
      '/radio/kim_carnie/k-c-2.png',
      '/radio/kim_carnie/k-c-3.png',
      '/radio/kim_carnie/k-c-4.png',
      '/radio/kim_carnie/k-c-5.png',
      '/radio/kim_carnie/k-c-6.png',
    ],
    photoAlt: 'Kim Carnie — press photo',
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'mairi-mcgillivray',
    name: 'Mairi McGillivray',
    aliases: ['mairi mcgillivray', 'mairi macgillivray', 'màiri mcgillivray'],
    emoji: '🎻',
    tagline: null,
    photos: [
      '/radio/Mairi_McGillivray/m_m_1.png',
      '/radio/Mairi_McGillivray/m_m_2.png',
      '/radio/Mairi_McGillivray/m_m_3.png',
      '/radio/Mairi_McGillivray/m_m_4.png',
    ],
    photoAlt: 'Mairi McGillivray — press photo',
    videos: [],
    tourDates: null,
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
    // Video retired 2026-07-07 (see Ally's videos comment); kept as
    // a reference in case /AnTonn/bhidio revives it:
    //   { videoId: 'lTrHY3U4gYA', start: 0, end: 240 }
    videos: [],
    tourDates: 'Jul 16 Isle of Lewis (HebCelt Festival) · Jul 26 Loon-Plage, France (Parc Galame) · Jul 30–Aug 1 Inverness (Belladrum Tartan Heart Festival) · Aug 14–15 York (The Magpies Festival) · Sep 4–6 Jedburgh (Edge Fest)',
    isPartner: false,
  },
  {
    id: 'proclaimers',
    name: 'The Proclaimers',
    aliases: ['proclaimers', 'the proclaimers'],
    emoji: '🎤',
    tagline: null,
    photos: [
      '/radio/proclaimers/proclaimers_1.png',
      '/radio/proclaimers/proclaimers_2.png',
      '/radio/proclaimers/proclaimers_3.png',
      '/radio/proclaimers/proclaimers_4.png',
    ],
    photoAlt: 'The Proclaimers — press photo',
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'runrig',
    name: 'Runrig',
    aliases: ['runrig'],
    emoji: '🎸',
    tagline: null,
    photos: [
      '/radio/runrig/runrig-1.png',
      '/radio/runrig/runrig-2.png',
      '/radio/runrig/runrig-3.png',
    ],
    photoAlt: 'Runrig — press photo',
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'sian',
    name: 'Sian',
    aliases: ['sian', 'sìan'],
    emoji: '🎤',
    tagline: null,
    photos: [
      '/radio/sian/Sian_1.png',
      '/radio/sian/Sian_2.png',
      '/radio/sian/Sian_3.png',
      '/radio/sian/Sian_4.png',
    ],
    photoAlt: 'Sian — press photo',
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'skerryvore',
    name: 'Skerryvore',
    aliases: ['skerryvore'],
    emoji: '🎸',
    tagline: null,
    photos: [
      '/radio/skerryvore/skerryvore_1.png',
      '/radio/skerryvore/skerryvore_2.png',
      '/radio/skerryvore/skerryvore_3.png',
      '/radio/skerryvore/skerryvore_4.png',
    ],
    photoAlt: 'Skerryvore — press photo',
    videos: [],
    tourDates: null,
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
      '/radio/skipinnish/photo-3.png',
      '/radio/skipinnish/photo-4.png',
    ],
    photoAlt: 'Skipinnish — press photo',
    videos: [],
    tourDates: 'Sep 19 Gloucestershire, England · Nov 22–30 Germany Tour (Hamburg · Berlin · Cologne · Munich · Stuttgart) · Dec 3 Fort William (Nevis Centre) · Dec 4 Glasgow (Royal Concert Hall) · Dec 5 Glasgow (Barrowland Ballroom) · Dec 10 Perth (Perth Concert Hall) · Dec 11 Oban (Corran Halls)',
    isPartner: false,
  },
  {
    id: 'steve-earle',
    name: 'Steve Earle',
    aliases: ['steve earle'],
    emoji: '🎸',
    tagline: null,
    photos: [
      '/radio/steve_earle/steve_earle_1.png',
      '/radio/steve_earle/steve_earle_2.png',
      '/radio/steve_earle/steve_earle_3.png',
      '/radio/steve_earle/steve_earle_4.png',
    ],
    photoAlt: 'Steve Earle — press photo',
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'tide-lines',
    name: 'Tide Lines',
    aliases: ['tide lines'],
    emoji: '🎸',
    tagline: null,
    photos: [
      '/radio/tide_lines/t-l-1.png',
      '/radio/tide_lines/t-l-2.png',
      '/radio/tide_lines/t-l-3.png',
      '/radio/tide_lines/t-l-4.png',
    ],
    photoAlt: 'Tide Lines — press photo',
    videos: [],
    tourDates: null,
    isPartner: false,
  },
  {
    id: 'trail-west',
    name: 'Trail West',
    aliases: ['trail west'],
    emoji: '🪗',
    tagline: null,
    photos: [
      '/radio/trail_west/t_w_1.png',
      '/radio/trail_west/t_w_2.png',
      '/radio/trail_west/t_w_3.png',
      '/radio/trail_west/t_w_4.png',
    ],
    photoAlt: 'Trail West — press photo',
    videos: [],
    tourDates: null,
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
