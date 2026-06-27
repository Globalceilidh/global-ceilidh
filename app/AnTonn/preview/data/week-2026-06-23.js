// An Tonn — Week 2026-06-23 (prototype seed data)
//
// Placeholder dataset used by the cylinder prototype until the ingest
// pipeline (per the AI Council brief) is wired. Hand-curated subset of
// real Gàidhlig artists, books, podcasts, film/TV, and radio shows so
// the prototype shows plausible content shape, not lorem ipsum. Every
// `id` is a stable slug we can carry forward into the canonical
// antonn_items schema; cover_url fields are external — they'll either
// load if the URL is reachable from the browser, or fall back to a flat
// per-vertical colour tile.
//
// Schema (one tile):
//   id        — stable slug
//   title     — display title
//   creator   — artist/author/host/director/station
//   year      — release year (or current year for ongoing shows)
//   tags      — small array of short tags shown on the tile
//   cover_url — external image URL or null
//   blurb     — 40-80 words for the detail panel
//   links     — { spotify, youtube, bandcamp, buy, listen, watch, ... }

export const issue = {
  number: 2,
  date_iso: '2026-06-23',
  date_gd: 'Dimàirt 23 Ògmhios 2026',
  date_en: 'Tuesday 23 June 2026',
  tagline: 'Sruth a\' Sheachdaineach · The Weekly Current',

  music: [
    {
      id: 'tide-lines-summer-anthem',
      title: 'Summer Anthem (2026 Mix)',
      creator: 'Tide Lines',
      year: 2026,
      tags: ['Highland Pop', 'Alba'],
      cover_url: null,
      blurb: 'The Mallaig four-piece return with the festival-ready single that\'s already topping independent Scottish charts. Same anthemic Highland-pop sound, sharper production.',
      links: { spotify: 'https://open.spotify.com/artist/47WvBuryaMeInhqbcoi0uN', youtube: 'https://www.youtube.com/channel/UCSX39m6HKC8pSzNrUkedNDQ' },
    },
    {
      id: 'valtos-cho-binn',
      title: 'Cho Binn \'s A Bha Thu',
      creator: 'VALTOS ft. Eilidh Cormack',
      year: 2026,
      tags: ['Trad Electronica', 'Gàidhlig'],
      cover_url: null,
      blurb: 'Skye-based trad-electronic duo Valtos team with Cape Breton-rooted singer Eilidh Cormack on a track that bridges the Hebrides and Atlantic Canada in four minutes.',
      links: { spotify: 'https://open.spotify.com/artist/2c6jW5KHxnQ4Q4kaSE1LyO', youtube: 'https://www.youtube.com/@valtosband' },
    },
    {
      id: 'gun-ghaol-gairm',
      title: 'A\' Ghairm',
      creator: 'Gun Ghaol',
      year: 2026,
      tags: ['Metalcore', 'Gàidhlig'],
      cover_url: null,
      blurb: 'Pure Gàidhlig metalcore from Lewis. Slow burn opener, blast-beat second half, lyrics drawn from 19th-century Skye land-clearance poetry.',
      links: { spotify: 'https://open.spotify.com/artist/1Wx6yzsgdgwB65T3uvEXux', youtube: 'https://www.youtube.com/@GunGhaol' },
    },
    {
      id: 'manran-an-uair',
      title: 'An Uair Seo',
      creator: 'Mànran',
      year: 2026,
      tags: ['Trad', 'Alba'],
      cover_url: null,
      blurb: 'Mànran\'s most explicitly political record — the title track is a direct response to the 2026 Gaelic Language Bill consultation.',
      links: { spotify: 'https://open.spotify.com/artist/4mZWb2tBgQVowZMQXmiTfH' },
    },
    {
      id: 'iona-fyfe-folk',
      title: 'Borderlands II',
      creator: 'Iona Fyfe',
      year: 2026,
      tags: ['Folk Revival', 'Doric'],
      cover_url: null,
      blurb: 'Aberdeenshire singer\'s follow-up to the 2024 Borderlands EP. Half Scots, half Gàidhlig — Iona\'s strongest crossover yet.',
      links: { spotify: 'https://open.spotify.com/artist/4dXpybtH3hr2hZbBPHXrV2' },
    },
    {
      id: 'mary-jane-lamond-suas',
      title: 'Suas e!',
      creator: 'Mary Jane Lamond',
      year: 2025,
      tags: ['Cape Breton', 'Gàidhlig'],
      cover_url: null,
      blurb: 'The Cape Breton anchor returns to An Tonn this week with a reissue of her 1997 cult favourite, newly remastered with previously unreleased B-sides.',
      links: { spotify: 'https://open.spotify.com/artist/4SnyzPCCSm6BJUQc4S8jLR' },
    },
  ],

  books: [
    {
      id: 'acair-summer-2026',
      title: 'Cathadh an Aigeil',
      creator: 'Eilidh Mhoireasdan',
      year: 2026,
      tags: ['Acair', 'Fiction'],
      cover_url: null,
      blurb: 'A debut novella set on the western edge of Lewis, following three generations of women through a single Atlantic storm.',
      links: { buy: 'https://www.acairbooks.com' },
    },
    {
      id: 'bradan-poetry-2026',
      title: 'Songs from the North Atlantic',
      creator: 'Lewis MacKinnon',
      year: 2026,
      tags: ['Bradan Press', 'Poetry'],
      cover_url: null,
      blurb: 'Bilingual poetry collection from the Nova Scotia poet, with each verse rendered in both Gàidhlig and English on facing pages.',
      links: { buy: 'https://bradanpress.com' },
    },
    {
      id: 'luath-2026',
      title: 'The Last Speakers of South Uist',
      creator: 'Margaret MacDonald',
      year: 2026,
      tags: ['Luath', 'Non-fiction'],
      cover_url: null,
      blurb: 'Oral history project documenting the final cohort of monolingual Gàidhlig speakers on South Uist, recorded between 2019 and 2024.',
      links: { buy: 'https://www.luath.co.uk' },
    },
    {
      id: 'cnl-childrens-2026',
      title: 'Cù Beag Bàn',
      creator: 'Anne Frater',
      year: 2026,
      tags: ['Children\'s'],
      cover_url: null,
      blurb: 'New picture book from the Bòrd na Gàidhlig children\'s reading scheme. For ages 4-7.',
      links: { buy: 'https://www.gaelicbooks.org' },
    },
  ],

  podcasts: [
    {
      id: 'litir-do-luchd-ionnsachaidh',
      title: 'Litir do Luchd-ionnsachaidh',
      creator: 'BBC Radio nan Gàidheal',
      year: 2026,
      tags: ['Weekly', 'Learners'],
      cover_url: null,
      blurb: 'The 30-year-old weekly letter to Gàidhlig learners from Ruairidh MacIlleathain. This week: the etymology of Sgithnach (Skye).',
      links: { listen: 'https://www.bbc.co.uk/programmes/p02pc9pz' },
    },
    {
      id: 'beag-air-bheag',
      title: 'Beag air Bheag',
      creator: 'BBC Radio nan Gàidheal',
      year: 2026,
      tags: ['Weekly', 'Beginners'],
      cover_url: null,
      blurb: 'Beginners\' Gàidhlig podcast. New episode covers the conditional mood with examples drawn from this month\'s Sruth.',
      links: { listen: 'https://www.bbc.co.uk/programmes/b00wfsxz' },
    },
    {
      id: 'an-drochaid',
      title: 'An Drochaid',
      creator: 'Cape Breton University',
      year: 2026,
      tags: ['Cape Breton', 'Cultural'],
      cover_url: null,
      blurb: 'Cape Breton\'s long-running bridge podcast — interviews with diaspora-circuit musicians and tradition bearers.',
      links: { listen: 'https://www.cbu.ca/an-drochaid' },
    },
  ],

  film: [
    {
      id: 'an-t-eilean-s4',
      title: 'An t-Eilean — Season 4',
      creator: 'BBC Alba',
      year: 2026,
      tags: ['Drama', 'Gàidhlig'],
      cover_url: null,
      blurb: 'The Lewis-set drama returns for its fourth season this autumn. First trailer dropped this week; production confirmed for August.',
      links: { watch: 'https://www.bbc.co.uk/iplayer/episodes/m001bvy7/an-t-eilean' },
    },
    {
      id: 'screen-scotland-fund',
      title: 'Voices of the Hebrides',
      creator: 'MacTV',
      year: 2026,
      tags: ['Documentary'],
      cover_url: null,
      blurb: 'Documentary on Gàidhlig songwriters working in 2026 — funded by Screen Scotland\'s Gaelic Broadcasting fund. Release Q4.',
      links: { watch: 'https://www.screen.scot' },
    },
    {
      id: 'mna-glasgow',
      title: 'Mnà',
      creator: 'Glasgow Film Festival',
      year: 2026,
      tags: ['Short Film'],
      cover_url: null,
      blurb: 'Short film by Aimée McCallum that won the Gàidhlig category at the 2026 Glasgow Film Festival. Now streaming on the BBC Alba digital platform.',
      links: { watch: 'https://www.bbc.co.uk/alba' },
    },
  ],

  radio: [
    {
      id: 'bbc-rng-live',
      title: 'BBC Radio nan Gàidheal — Live',
      creator: 'BBC',
      year: 2026,
      tags: ['Live', '24/7'],
      cover_url: null,
      blurb: 'Scotland\'s only fully-Gàidhlig national radio station. Daily news, music, children\'s programmes, and the An Litir letter every Saturday.',
      links: { listen: 'https://www.bbc.co.uk/sounds/play/live:bbc_radio_nan_gaidheal' },
    },
    {
      id: 'cigo-port-hawkesbury',
      title: 'CIGO 101.9 — Port Hawkesbury',
      creator: 'Cape Breton Community',
      year: 2026,
      tags: ['Cape Breton'],
      cover_url: null,
      blurb: 'Cape Breton\'s eastern-shore community station, with weekly Gàidhlig programme Tuesdays 6pm Atlantic time.',
      links: { listen: 'https://www.cigofm.com' },
    },
  ],

  tours: [
    { id: 'tide-lines-tour-2026', artist: 'Tide Lines', dates: 'July 2026', cities: 'Glasgow · Edinburgh · Stornoway · Halifax NS · Boston' },
    { id: 'manran-tour-2026', artist: 'Mànran', dates: 'August 2026', cities: 'Inverness · Skye · Cape Breton · Toronto · NYC' },
    { id: 'iona-fyfe-tour-2026', artist: 'Iona Fyfe', dates: 'September 2026', cities: 'Aberdeen · Glasgow · Belfast · Dublin' },
  ],
}

export default issue
