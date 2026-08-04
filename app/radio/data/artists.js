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
      '/radio/ally-the-piper/photo-3.png',
      '/radio/ally-the-piper/photo-4.png',
      '/radio/ally-the-piper/photo-5.png',
      '/radio/ally-the-piper/photo-6.png',
      '/radio/ally-the-piper/photo-7.png',
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
    tour: [
      { date: '7/17–19', city: 'Cleveland, OH',   venue: 'Cleveland Irish Festival' },
      { date: '7/29',    city: 'Albany, NY',       venue: 'The Egg' },
      { date: '7/30',    city: 'Syracuse, NY',     venue: 'Westcott Theater' },
      { date: '7/31',    city: 'Erie, PA',         venue: 'Centennial Hall' },
      { date: '8/1–2',   city: 'Dublin, OH',       venue: 'Dublin Irish Festival' },
      { date: '8/6',     city: 'Ann Arbor, MI',    venue: 'The Blind Pig' },
      { date: '8/7–9',   city: 'Fergus, ON',       venue: 'Fergus Scottish Festival & Highland Games' },
      { date: '8/12',    city: 'Grand Rapids, MI', venue: 'Pyramid Scheme' },
      { date: '8/13',    city: 'Blue Island, IL',  venue: 'The Lyric Theater' },
      { date: '8/14–16', city: 'Milwaukee, WI',    venue: 'Milwaukee Irish Fest' },
      { date: '8/28–29', city: 'Olean, NY',        venue: 'Olean Celtic Festival' },
      { date: '9/3',     city: 'St. Louis, MO',    venue: 'Blue Strawberry' },
      { date: '9/4–6',   city: 'Kansas City, MO',  venue: 'Kansas City Irish Fest' },
      { date: '9/11–13', city: 'Pittsburgh, PA',   venue: 'Pittsburgh Irish Festival' },
      { date: '10/3',    city: 'San Diego, CA',    venue: 'Law-Di-Gras' },
    ],
    poster: '/radio/ally-the-piper/tour-dates-poster.png', // 748x528, ticker frame
    tickets: 'https://piperally.com',
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
    poster: '/radio/manran/manran-live.png', // live shot w/ MÀNRAN banner — ticker frame
    // Video retired 2026-07-07 (see Ally's videos comment); kept as
    // a reference in case /AnTonn/bhidio revives it:
    //   { videoId: 'lTrHY3U4gYA', start: 0, end: 240 }
    videos: [],
    // Refreshed 2026-08-03 from Whitey (supersedes the old HebCelt-era string).
    tour: [
      { date: 'Aug 5',      city: 'Lorient, France',        venue: 'Congress Palace' },
      { date: 'Aug 8',      city: 'New Lanark, Scotland',    venue: 'Lanark Market' },
      { date: 'Aug 14',     city: 'York, England',          venue: 'Sutton Park (The Magpies Festival)' },
      { date: 'Sep 5',      city: 'Inverness, Scotland',     venue: 'Eden Court' },
      { date: 'Sep 6',      city: 'Oxnam, Scotland',         venue: 'Lilliardsedge Holiday Park (Edge Fest)' },
      { date: 'Sep 12',     city: 'Moutier, Switzerland',    venue: 'Fête de la Vieille Ville' },
      { date: 'Oct 9',      city: 'Forfar, Scotland',        venue: 'Forfar Reid Hall' },
      { date: 'Oct 10',     city: 'Dunoon, Scotland',        venue: "The Queen's Hall" },
      { date: 'Oct 17',     city: 'Fort William, Scotland',  venue: 'The Nevis Centre' },
      { date: 'Nov 28',     city: 'Aberdeen, Scotland',      venue: 'Aberdeen Music Hall' },
      { date: 'Dec 12',     city: 'Glasgow, Scotland',       venue: 'OVO Hydro' },
      { date: 'Dec 28',     city: 'Stirling, Scotland',      venue: 'Albert Halls' },
      { date: 'Dec 29',     city: 'Strathpeffer, Scotland',  venue: 'Strathpeffer Pavilion' },
      { date: 'Dec 30',     city: 'Kingussie, Scotland',     venue: 'Badenoch Centre' },
      { date: "Jan 1 '27",  city: 'Portree, Scotland',       venue: 'Portree Community Centre' },
      { date: "Jan 2 '27",  city: 'Killin, Scotland',        venue: 'McLaren Hall' },
      { date: "Oct 15 '27", city: 'Lindau, Germany',         venue: 'Club Vaudeville' },
      { date: "Oct 23 '27", city: 'Ludwigsburg, Germany',    venue: 'Scala Kultur' },
      { date: "Oct 28 '27", city: 'Hamburg, Germany',        venue: 'Knust' },
    ],
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
    poster: '/radio/skerryvore/skerryvore-live.png', // live shot w/ SKERRYVORE backdrop — ticker frame
    videos: [],
    // Ticker set = the imminent run (Aug–mid-Sep 2026). Full 2026/27 world tour
    // (~85 dates) held for a dedicated tour page; a ticker can't scroll them all
    // inside its 6-min window. Source: skerryvore.com/tour (2026-08-03).
    tour: [
      { date: 'Aug 7',     city: 'Sion, Switzerland',     venue: 'Guinness Irish Festival' },
      { date: 'Aug 9',     city: 'Linlithgow, UK',        venue: 'Party at The Palace' },
      { date: 'Aug 16',    city: 'Brechin, UK',           venue: 'Summer End Angus' },
      { date: 'Aug 21',    city: 'Darvel, UK',            venue: 'Darvel Music Festival (Sold Out)' },
      { date: 'Aug 22',    city: 'Edinburgh, UK',         venue: 'Heather On The Hill' },
      { date: 'Aug 23',    city: 'Exeter, UK',            venue: 'Beautiful Days' },
      { date: 'Aug 29',    city: 'Tønder, Denmark',       venue: 'Tønder Festival' },
      { date: 'Aug 30',    city: 'Merthyr Mawr, UK',      venue: 'Between the Trees' },
      { date: 'Sep 1',     city: 'Northampton, MA',       venue: 'The Iron Horse' },
      { date: 'Sep 2',     city: 'Natick, MA',            venue: 'Center for Arts in Natick' },
      { date: 'Sep 3',     city: 'Boothbay Harbor, ME',   venue: 'The Opera House' },
      { date: 'Sep 4',     city: 'Plymouth, NH',          venue: 'The Flying Monkey' },
      { date: 'Sep 5',     city: 'Altamont, NY',          venue: 'Capital District Scottish Games' },
      { date: 'Sep 16',    city: 'Mason City, IA',        venue: 'North Iowa Area Community College' },
      { date: 'Sep 18–19', city: 'Appleton, WI',          venue: 'Fox Cities Irish Fest' },
      { date: 'Sep 20',    city: 'Madison, WI',           venue: 'Atwood Music Hall' },
    ],
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
    tour: [
      { date: 'Sep 19',   city: 'Gloucestershire, England', venue: '' },
      { date: 'Nov 22–30', city: 'Germany Tour',            venue: 'Hamburg · Berlin · Cologne · Munich · Stuttgart' },
      { date: 'Dec 3',    city: 'Fort William, Scotland',   venue: 'Nevis Centre' },
      { date: 'Dec 4',    city: 'Glasgow, Scotland',        venue: 'Royal Concert Hall' },
      { date: 'Dec 5',    city: 'Glasgow, Scotland',        venue: 'Barrowland Ballroom' },
      { date: 'Dec 10',   city: 'Perth, Scotland',          venue: 'Perth Concert Hall' },
      { date: 'Dec 11',   city: 'Oban, Scotland',           venue: 'Corran Halls' },
    ],
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
  // Shown when the Live365 track doesn't match anyone in ARTISTS. The
  // rèidio icon (radio tower from the Sniomh swirl, transparent bg) is
  // centered on the dark tile — contain, not cover.
  icon:       '/AnTonn/test/reidio-icon.png',    // 1254 x 1254, transparent
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
