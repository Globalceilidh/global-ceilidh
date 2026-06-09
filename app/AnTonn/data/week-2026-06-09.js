// An Tonn — Week 1 Pilot Issue
// Tuesday 9 Ògmhios 2026 (June 9, 2026)
//
// All Spotify / YouTube / buy URLs are placeholder "#" until populated.
// Edit this file each Tuesday morning; both the web pages and (eventually)
// the Sruth section renderer pull from the same shape.

export const issue = {
  number: 1,
  date_iso: "2026-06-09",
  date_gd: "Dimàirt 9 Ògmhios 2026",
  date_en: "Tuesday 9 June 2026",
  tagline: "The Pilot Rankings · Combined Data & Editorial Snapshot",
  intro_left:
    "Mainstream tracking systems routinely obscure traditional and minority-language music by absorbing them into generic \"World\" or \"Folk\" categories. An Tonn (The Wave) is our correction to the system.",
  intro_right:
    "Our weekly flagship rankings evaluate rolling streaming footprints, YouTube activity, festival prominence, historical peer-reviewed awards, and acute linguistic or cultural relevance to provide a clear snapshot of the global Gaelic and Scottish traditional world.",
};

// Four headline callouts at the top of the page. Each links into its
// canonical entry in one of the sub-charts where the editor can put more
// context.
export const spotlights = [
  {
    label: "#1 Overall",
    title: "Tide Lines",
    accent: "#1A4FA0",                 // deep blue
    icon: "★",
    spotify_url: "https://open.spotify.com/artist/47WvBuryaMeInhqbcoi0uN",
    youtube_url: "https://www.youtube.com/channel/UCSX39m6HKC8pSzNrUkedNDQ",
    note: "",
  },
  {
    label: "#1 Gaelic Track",
    title: "Cho Binn 's A Bha Thu",
    subtitle: "VALTOS ft. EILIDH CORMACK",
    accent: "#6B4E1F",                 // sruth brown
    icon: "✺",                         // triskele-ish
    // Specific track URL pending — the title doesn't appear on Valtos's
    // two confirmed albums (2022 self-titled, 2025 Valtos & Friends).
    // Pointing at Eilidh Cormack's artist page until the editor confirms
    // a release.
    spotify_url: "https://open.spotify.com/artist/2c6jW5KHxnQ4Q4kaSE1LyO",
    youtube_url: "https://www.youtube.com/@valtosband",
    note: "",
  },
  {
    label: "Fastest Rising",
    title: "Bradley Parker",
    subtitle: "HEATSEEKERS",
    accent: "#D9700E",                 // orange
    icon: "↗",
    // Bradley Parker doesn't surface as a Scottish/Gàidhlig artist in
    // streaming-platform searches. Either a placeholder name in the
    // pilot data or a very small new act — editor to confirm canonical
    // artist URL.
    spotify_url: "#",
    youtube_url: "#",
    note: "",
  },
  {
    label: "Heaviest Act",
    title: "Gun Ghaol",
    subtitle: "PURE GAELIC METALCORE",
    accent: "#B83232",                 // red
    icon: "⚡",
    spotify_url: "https://open.spotify.com/artist/1Wx6yzsgdgwB65T3uvEXux",
    youtube_url: "https://www.youtube.com/@GunGhaol",
    note: "",
  },
];

// Flagship Top 10 Overall. Movement values: "up"/"down"/"hold"/"new" + amount.
export const top10 = [
  {
    rank: 1,
    artist: "Tide Lines",
    movement: { type: "up", amount: 1 },
    current: "Holding massive overall influence as they continue to dominate independent Scottish album sales and main-stage festival billing with their anthemic Highland-pop sound.",
    spotify_url: "https://open.spotify.com/artist/47WvBuryaMeInhqbcoi0uN",
    youtube_url: "https://www.youtube.com/channel/UCSX39m6HKC8pSzNrUkedNDQ",
  },
  {
    rank: 2,
    artist: "Skerryvore",
    movement: { type: "down", amount: 1 },
    current: "Backed by their verified multi-time Live Act of the Year status on BBC Alba, they remain a premier touring and streaming force across both sides of the Atlantic.",
    spotify_url: "https://open.spotify.com/artist/0rvuzsIPX7eql9Iq8e8AUA",
    youtube_url: "https://www.youtube.com/channel/UCWgOjWlM28iTe3QW0rs5zhw",
  },
  {
    rank: 3,
    artist: "Julie Fowlis",
    movement: { type: "hold" },
    current: "The unassailable global standard-bearer for traditional Gaelic vocal music, maintaining massive, steady back-catalog metrics and high-tier cinematic placement.",
    spotify_url: "https://open.spotify.com/artist/3IqWMVFksTbtL2EaFi5o8k",
    youtube_url: "https://www.youtube.com/channel/UC0AgLcvtuLDXgU6-5yZhEqQ",
  },
  {
    rank: 4,
    artist: "Valtos",
    movement: { type: "up", amount: 2 },
    current: "Driving the fastest-growing digital movement in the language by flawlessly blending modern house production with traditional Gaelic vocal samples.",
    spotify_url: "https://open.spotify.com/artist/6gh1HzdxwTgfznOANixjNQ",
    youtube_url: "https://www.youtube.com/@valtosband",
  },
  {
    rank: 5,
    artist: "Peat & Diesel",
    movement: { type: "up", amount: 3 },
    current: "Their raw, high-impact \"Stornoway Punk-Trad\" style continues to command massive Hebridean and mainland live engagement, pushing them up into the top tier.",
    spotify_url: "https://open.spotify.com/artist/6RyuUqLnAvBHgSebptuPXu",
    youtube_url: "https://www.youtube.com/channel/UCRnbAaWZBsr9UMSF4r8rctQ",
  },
  {
    rank: 6,
    artist: "Talisk",
    movement: { type: "down", amount: 2 },
    current: "Virtuoso concertina-led acoustic trio commanding elite, high-velocity streaming numbers across premium global folk circles.",
    spotify_url: "https://open.spotify.com/artist/1khU7sW2d95qMTDnyDfzBT",
    youtube_url: "https://www.youtube.com/channel/UCG-AsgBzENpt8BVio-MXmKw",
  },
  {
    rank: 7,
    artist: "Mànran",
    movement: { type: "hold" },
    current: "A long-standing multi-instrumental powerhouse whose dual-lead pipe and fiddle rock serves as a permanent fixture on international festival rosters.",
    spotify_url: "https://open.spotify.com/artist/0okPaVyeEjh0VJtfBdNPho",
    youtube_url: "https://www.youtube.com/channel/UCKDV-fFZh-J-oVbh8KcBdZQ",
  },
  {
    rank: 8,
    artist: "Gaelic Storm",
    movement: { type: "hold" },
    current: "Anchoring the massive North American diaspora market with continuous heavy touring cycles and top-tier folk festival billing.",
    spotify_url: "https://open.spotify.com/artist/5dlzTgw97q5k5ws89Ww1UK",
    youtube_url: "https://www.youtube.com/channel/UCa8cU1g6Qj_LmiPyETlXU-g",
  },
  {
    rank: 9,
    artist: "Sian",
    movement: { type: "new" },
    current: "Holding immense industry clout following their recent Album of the Year victory for Aroan, anchoring their pure acoustic space with critical and peer relevance.",
    spotify_url: "https://open.spotify.com/artist/6W0gi7s1caVyE37MWG8fWg",
    // No official YouTube channel surfaced — Sian distributes via Bandcamp.
    youtube_url: "",
  },
  {
    rank: 10,
    artist: "Niteworks",
    movement: { type: "down", amount: 1 },
    current: "Their monumental electronic-trad studio catalog remains the undisputed gold standard for algorithmic crossover engagement.",
    spotify_url: "https://open.spotify.com/artist/0ZPK5uOCt6b4DQL7dEgnTq",
    youtube_url: "https://www.youtube.com/niteworksband",
  },
];

// The Seven Currents — sub-charts. Each has a colour theme matching the
// poster.
export const currents = [
  {
    slug: "trad-rock",
    name: "Trad-Rock & Arena Anthems",
    accent: "#1A4FA0",
    icon: "🌊",
    items: ["Tide Lines", "Skerryvore", "Skipinnish", "Mànran", "Peat & Diesel"],
  },
  {
    slug: "acoustic-traditional",
    name: "Acoustic & Traditional Folk",
    accent: "#5E3A91",
    icon: "🎻",
    items: ["Sian", "Siobhan Miller", "Julie Fowlis", "Talisk", "Duncan Chisholm"],
  },
  {
    slug: "modern-electronic",
    name: "Modern Electronic Crossover",
    accent: "#0E8079",
    icon: "▬",
    items: ["Valtos", "Niteworks", "An Dannsa Dub", "Whyte", "Project Smok"],
  },
  {
    slug: "te-reo-gaidhlig",
    name: "Te Reo Gàidhlig (Pure Language List)",
    accent: "#C49100",
    icon: "✺",
    items: [
      "Valtos ft. Eilidh Cormack – Cho Binn ’s a Bha Thu",
      "Julie Fowlis – Hùg air bhonaig mhòir",
      "Gun Ghaol – Salm",
      "Niteworks – A' Ghrian",
      "Cruinn – Stiùrin a' Mhàthaich",
    ],
  },
  {
    slug: "heavy-folk-metal",
    name: "Heavy / Folk Metal",
    accent: "#B83232",
    icon: "⚡",
    items: ["Saor", "Alestorm", "Gun Ghaol", "Hand of Kalliach", "Cnoc an Tursa"],
  },
  {
    slug: "diaspora-crossover",
    name: "Diaspora Crossover",
    accent: "#3E7B3E",
    icon: "🌐",
    items: [
      "Gaelic Storm (US)",
      "Enter the Haggis (Canada)",
      "The Elders (US)",
      "The High Kings (Ireland/Global)",
      "Claymore (Australia)",
    ],
  },
  {
    slug: "heatseekers",
    name: "Heatseekers — Velocity & Grassroots Growth",
    accent: "#D9700E",
    icon: "★",
    items: [
      "Bradley Parker",
      "Hebridean Field Recordings",
      "Ceitidh Smith",
      "Malin Makes Music",
      "Eòrpa Collective",
    ],
  },
];

// Leabhraichean Air An Tonn — Books Riding The Wave.
export const books = [
  {
    title: "The Caledoniad",
    subtitle: "The Making of Scottish History",
    author: "Catriona M.M. MacDonald",
    publisher: "John Donald / Birlinn Ltd",
    release_date: "2026-06-18",
    cover_url: "",      // placeholder; drop a URL or local upload path
    buy_url: "https://birlinn.co.uk/product/the-caledoniad-2/",
  },
  {
    title: "Máel Coluim III, 'Canmore'",
    subtitle: "An Eleventh-Century Scottish King",
    author: "Neil McGuigan",
    publisher: "John Donald / Birlinn Ltd",
    release_date: "2026-06-18",
    cover_url: "",
    buy_url: "https://birlinn.co.uk/product/mael-coluim-iii-canmore-2/",
  },
  {
    title: "The Sound of Many Waters",
    subtitle: "A Journey Along the River Tay",
    author: "Robin Crawford",
    publisher: "Birlinn Ltd",
    release_date: "2026-07-02",
    cover_url: "",
    buy_url: "https://birlinn.co.uk/product/the-sound-of-many-waters/",
  },
  {
    title: "Air Cuan Dubh Drilseach",
    subtitle: "On a Glittering Black Sea",
    author: "Tim Armstrong",
    // Published by CLÀR in 2013. Won the Saltire Society First Book of
    // the Year Award 2013; selected by Scot Lit Fest in 2016 as one of
    // the five most important Gaelic novels of all time.
    publisher: "CLÀR · Saltire Society First Book of the Year 2013",
    release_date: "",
    cover_url: "",
    buy_url: "https://www.amazon.com/Air-Cuan-Dubh-Drilseach-Scots_gaelic-ebook/dp/B071R28Z2P",
  },
];

// The five compact methodology bullets that appear on the hub. The full
// long-form explainer lives at /AnTonn/methodology.
export const methodology = [
  { name: "Streaming Activity", note: "Spotify listeners, YouTube metrics" },
  { name: "Festival Prominence", note: "International & national billing" },
  { name: "Awards & Accolades", note: "MG ALBA, Mòd, industry recognition" },
  { name: "Cultural Relevance", note: "Linguistic, heritage & diaspora impact" },
  { name: "Editorial Assessment", note: "Expert knowledge & scene insight" },
];

// The "Page 2" of the print poster — Beyond the Charts. Tour watch,
// podcasts, the featured book, coming-next-week preview.

export const beyond_charts = {
  tagline_en: "Beyond the Charts",
  tagline_gd: "Far a bheil a' cheòl gar toirt…",
  tagline_gd_en: "Where the music is taking us.",
};

// ON THE ROAD — Global Diaspora Tour Watch.
export const tours = [
  {
    artist: "Skerryvore",
    tour: "20th Anniversary Tour",
    accent: "#1A4FA0",
    body:
      "Currently headlining a major UK summer run celebrating their twentieth anniversary year before crossing the Atlantic for North American festival appearances later this summer.",
    image_url: "",
    dates_url: "https://www.globalceilidh.com/AnTonn/music",
  },
  {
    artist: "Gaelic Storm",
    tour: "Summer Amphitheater Run",
    accent: "#3E7B3E",
    body:
      "Maintaining one of the busiest touring schedules in the diaspora world with continuous North American outdoor festival and theatre appearances.",
    image_url: "",
    dates_url: "https://www.globalceilidh.com/AnTonn/music",
  },
  {
    artist: "Valtos",
    tour: "HebCelt + Summer Festivals",
    accent: "#0E8079",
    body:
      "Actively appearing across Scotland's major summer festival circuit and continuing their rapid rise as the leading electronic-Gaelic crossover act.",
    image_url: "",
    dates_url: "https://www.globalceilidh.com/AnTonn/music",
  },
  {
    artist: "Enter the Haggis",
    tour: "Northeast US Tour",
    accent: "#B83232",
    body:
      "Returning to key Northeastern US and Canadian markets with an expanding summer touring schedule.",
    image_url: "",
    dates_url: "https://www.globalceilidh.com/AnTonn/music",
  },
];

// IN YOUR EARS — Podcasts of the Month.
export const podcasts = [
  {
    title: "SpeakGaelic Podcast",
    accent: "#3E7B3E",
    body:
      "The premier multimedia Gaelic-learning podcast featuring lessons, conversation, and contemporary language usage.",
    spotify_url: "https://open.spotify.com/show/0KrHv2TEK05wIk8Oi9Laz8",
    apple_url: "https://podcasts.apple.com/gb/podcast/speakgaelic/id1589431251",
    // BBC Sounds carries SpeakGaelic but doesn't expose a stable per-
    // series link the same way Apple/Spotify do; speakgaelic.scot is the
    // canonical destination that links onward to BBC Sounds and iPlayer.
    bbc_sounds_url: "https://speakgaelic.scot/",
    image_url: "",
  },
  {
    title: "A' Phiseag",
    accent: "#5E3A91",
    body:
      "Independent Gaelic conversation covering culture, music, creativity, and modern life.",
    // Direct URLs pending — A' Phiseag doesn't surface in Spotify / Apple
    // Podcasts / Buzzsprout searches. Either a forthcoming or very small
    // independent show; editor to confirm canonical URL.
    spotify_url: "#",
    apple_url: "#",
    bbc_sounds_url: "",
    image_url: "",
  },
  {
    title: "Pipeline",
    accent: "#1A4FA0",
    body:
      "BBC Radio Scotland's long-running home for piping, pipe bands, and traditional music excellence.",
    spotify_url: "",
    apple_url: "",
    // Pipeline's BBC Sounds page didn't surface in a direct search. The
    // BBC Sounds catalog page is the canonical fallback; the editor can
    // swap in the exact /sounds/series URL once we confirm it.
    bbc_sounds_url: "https://www.bbc.co.uk/sounds/category/genre-music-musicgenresfolk",
    image_url: "",
  },
  {
    title: "Rapal / Caithris Na H-Oidhche",
    accent: "#B83232",
    body:
      "BBC Radio nan Gàidheal's essential destination for new Gaelic music, alternative sounds, folk, electronic crossover, and emerging artists.",
    spotify_url: "",
    apple_url: "",
    // Same situation as Pipeline — Rapal exists on BBC Sounds but the
    // direct series URL didn't surface. BBC Radio nan Gàidheal landing
    // page as the fallback.
    bbc_sounds_url: "https://www.bbc.co.uk/sounds/station/bbc_radio_nan_gaidheal",
    image_url: "",
  },
];

// FEATURED READ OF THE WEEK — promoted version of one book with full
// editorial copy. The remaining books in `books` (above) render as
// "Also Coming This Summer" beneath it.
export const featured_book = {
  title: "The Caledoniad",
  subtitle: "The Making of Scottish History",
  author: "Catriona M.M. Macdonald",
  publisher: "John Donald / Birlinn Ltd",
  release_date: "2026-06-18",
  cover_url: "",
  buy_url: "https://birlinn.co.uk/product/the-caledoniad-2/",
  body:
    "The Frank Watson Book Prize-winning exploration of how Scots at home and abroad helped construct, preserve, and reinterpret Scottish history across generations. Essential reading for anyone who wants to understand the story we all carry.",
};

// COMING NEXT WEEK — preview strip at the bottom of the hub.
export const next_week = [
  {
    label: "New Releases",
    icon: "♪",
    accent: "#1A4FA0",
    note: "The freshest Gaelic and Scottish music drops you need to hear.",
  },
  {
    label: "Festival Watch",
    icon: "⛺",
    accent: "#3E7B3E",
    note: "What's happening on the festival circuit at home and abroad.",
  },
  {
    label: "Books Current",
    icon: "📖",
    accent: "#C49100",
    note: "The latest releases, reviews, and author spotlights.",
  },
  {
    label: "Podcast Current",
    icon: "🎙",
    accent: "#5E3A91",
    note: "New episodes and audio you won't want to miss.",
  },
  {
    label: "Heatseekers Update",
    icon: "★",
    accent: "#B83232",
    note: "Who's rising fast: new momentum and breakout artists.",
  },
];
