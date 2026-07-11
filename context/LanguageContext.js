'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  // Navigation
  nav: {
    learn: { en: 'Learn', gd: 'Ionnsaich' },
    news: { en: 'News', gd: 'Naidheachd' },
    events: { en: 'Featured Events', gd: 'Tachartasan Comharraichte' },
    feisean: { en: 'Festivals & Games', gd: 'Fèisean' },
    community: { en: 'Community', gd: 'Coimhearsnachd' },
    media: { en: 'Media', gd: 'Meadhanan' },
    about: { en: 'About', gd: 'Mu Dheidhinn' },
  },
  // Homepage
  home: {
    welcome: {
      en: 'Welcome to GlobalCeilidh.com',
      gd: 'Fàilte gu GlobalCeilidh.com'
    },
    tagline: {
      en: 'The global home of Scottish Gaelic language, culture and community.',
      gd: 'Dachaigh cruinneil cànan, cultar agus coimhearsnachd na Gàidhlig.'
    },
    cta_learn: {
      en: 'Start Learning',
      gd: 'Tòisich ag Ionnsachadh'
    },
    cta_community: {
      en: 'Join the Community',
      gd: 'Bi nad bhall den Choimhearsnachd'
    },
    mission_title: {
      en: 'A Gathering Place for the Global Gael',
      gd: 'Àite Cruinneachaidh airson a\' Ghàidheil Cruinneil'
    },
    mission_body: {
      en: 'Sixty to seventy percent of people engaging with Scottish Gaelic culture online are outside the United Kingdom. This platform was built for them — for you — wherever in the world your journey has taken you.',
      gd: 'Tha seasgad gu seachdad sa cheud de na daoine a tha a\' com-pàirteachadh le cultar na Gàidhlig air-loidhne taobh a-muigh na Rìoghachd Aonaichte. Chaidh an làrach-lìn seo a thogail airson na daoine sin — airson tusa — ge b\'e càit an tug do thuras thu.'
    },
  },
  // Learn page
  learn: {
    title: { en: 'Learn Scottish Gaelic', gd: 'Ionnsaich Gàidhlig' },
    subtitle: { en: 'With Aileen — Your AI Gàidhlig Tutor', gd: 'Le Aileen — Do Thidsear Gàidhlig AI' },
    guide_btn: { en: 'Download Lesson Guide', gd: 'Luchdaich a-nuas Treòrachadh an Leasan' },
    level_begin: { en: 'Beginner', gd: 'Tòiseachadh' },
    level_mid: { en: 'Intermediate', gd: 'Meadhanach' },
    level_adv: { en: 'Advanced', gd: 'Adhartach' },
  },
  // Featured Events page (paid: sponsors, partners, advertisers).
  // The Festivals & Games page (free ASGF + Sruth pipeline) is at /feisean.
  events: {
    title: { en: 'Featured Events', gd: 'Tachartasan Comharraichte' },
    subtitle: { en: 'Sponsored and partner Gaelic events from across the GlobalCeilidh network', gd: 'Tachartasan Gàidhlig le luchd-taic agus com-pàirtichean bho lìonra GlobalCeilidh' },
    submit_title: { en: 'Submit Your Event', gd: 'Cuir a-steach Do Thachartas' },
    submit_body: { en: 'Post once — reach every Gaelic community platform worldwide.', gd: 'Post aon uair — ruig gach àrd-ùrlar coimhearsnachd Gàidhlig air feadh an t-saoghail.' },
    name: { en: 'Event Name', gd: 'Ainm an Tachartais' },
    date: { en: 'Date', gd: 'Ceann-latha' },
    location: { en: 'Location', gd: 'Àite' },
    description: { en: 'Description', gd: 'Tuairisgeul' },
    organiser: { en: 'Organiser', gd: 'Luchd-eagrachaidh' },
    website: { en: 'Website / Link', gd: 'Làrach-lìn / Ceangal' },
    submit_btn: { en: 'Submit Event', gd: 'Cuir a-steach Tachartas' },
    push_label: { en: 'Also post to:', gd: 'Post cuideachd gu:' },
  },
  // Community page
  community: {
    title: { en: 'Community', gd: 'Coimhearsnachd' },
    subtitle: { en: 'Every Gaelic organisation — one home', gd: 'Gach buidheann Ghàidhlig — aon dachaigh' },
  },
  // Common
  common: {
    loading: { en: 'Loading...', gd: 'A\' luchdachadh...' },
    back: { en: 'Back', gd: 'Air ais' },
    next: { en: 'Next', gd: 'Adhart' },
    submit: { en: 'Submit', gd: 'Cuir a-steach' },
    close: { en: 'Close', gd: 'Dùin' },
    learn_more: { en: 'Learn more', gd: 'Ionnsaich tuilleadh' },
    formal_badge: { en: 'Formal', gd: 'Foirmeil' },
    lets_talk: { en: "Let's Talk", gd: 'Thig, bruidhinneas' },
  },
  // AnTonn marble — /AnTonn/marble
  marble: {
    help: {
      en: 'Drag anywhere — the sphere rotates around you',
      gd: 'Slaod àite sam bith — cuairsgidh an cruinne mun cuairt ort',
    },
  },
  // Global Ceilidh Radio — /AnTonn/radio
  radio: {
    tagline: {
      en: 'The soundtrack of an t-sruth streaming around the world.',
      gd: 'Fuaim-cheòl an t-sruth a\' sruthadh air feadh an t-saoghail.',
    },
    ad_label: { en: 'Ad · above the wave', gd: 'Sanas · os cionn na tuinne' },
    vote_pill: { en: 'Vote', gd: 'Bhòt' },
    request_pill: { en: 'Request a Song', gd: 'Iarr Òran' },
    ticker_sponsor: {
      en: 'Welcome to Global Ceilidh Radio — sponsor a spot on our ticker at globalceilidh@gmail.com',
      gd: 'Fàilte gu Global Cèilidh Rèidio — thoir taic do àite air an teichdear againn aig globalceilidh@gmail.com',
    },
    footer_ticker_ask: {
      en: 'Interested in reserving your spot on the ticker? Email',
      gd: 'A bheil ùidh agad ann an àite a ghlèidheadh air an teichdear? Cuir post-d gu',
    },

    // Vote modal
    vote_title: { en: 'Vote — Top 10', gd: 'Bhòt — Prìomh 10' },
    category: { en: 'Category', gd: 'Roinn' },
    best_artist: { en: 'Best Artist', gd: 'Prìomh Neach-ciùil' },
    best_song: { en: 'Best Song', gd: 'Prìomh Òran' },
    best_album: { en: 'Best Album', gd: 'Prìomh Chlàr' },
    nominees: { en: 'Nominees', gd: 'Ainmichean' },
    loading_nominees: { en: 'Loading nominees…', gd: 'A\' luchdachadh ainmichean…' },
    no_nominees: {
      en: 'No nominees yet — be the first with a write-in below.',
      gd: 'Chan eil ainmichean fhathast — bi a\' chiad neach le ainm a-steach gu h-ìseal.',
    },
    writein_label: { en: 'Or write in a nominee', gd: 'No sgrìobh ainm a-steach' },
    writein_artist: { en: 'Artist name', gd: 'Ainm neach-ciùil' },
    writein_song: { en: 'Song title', gd: 'Tiotal òrain' },
    writein_album: { en: 'Album title', gd: 'Tiotal clàir' },
    writein_hint: {
      en: 'Write-ins become official nominees after 5 votes.',
      gd: 'Bidh ainmean a-steach \'nan ainmichean oifigeil an dèidh 5 bhòtaichean.',
    },
    cast_vote: { en: 'Cast vote', gd: 'Cuir do bhòt' },
    submitting: { en: 'Submitting…', gd: 'A\' cur a-steach…' },
    cancel: { en: 'Cancel', gd: 'Sguir' },
    close: { en: 'Close', gd: 'Dùin' },
    vote_recorded: {
      en: 'Vote recorded. Come back tomorrow for another.',
      gd: 'Chaidh do bhòt a chlàradh. Till a-màireach airson tè eile.',
    },
    vote_promoted: {
      en: 'Vote recorded — your write-in just hit 5 votes and is now a nominee!',
      gd: 'Chaidh do bhòt a chlàradh — ràinig d\' ainm a-steach 5 bhòtaichean agus tha e a-nis \'na ainm oifigeil!',
    },
    pick_or_writein: {
      en: 'Pick a nominee or type a write-in.',
      gd: 'Tagh ainm no sgrìobh fear a-steach.',
    },
    network_error: {
      en: 'Network error — try again.',
      gd: 'Mearachd lìn — feuch a-rithist.',
    },
    generic_error: { en: 'Something went wrong.', gd: 'Chaidh rud-eigin ceàrr.' },

    // Request modal
    request_title: { en: 'Request a Song', gd: 'Iarr Òran' },
    song_title_required: { en: 'Song title *', gd: 'Tiotal òrain *' },
    artist: { en: 'Artist', gd: 'Neach-ciùil' },
    album: { en: 'Album', gd: 'Clàr' },
    notes_optional: { en: 'Notes (optional)', gd: 'Notaichean (roghainneil)' },
    send_request: { en: 'Send request', gd: 'Cuir iarrtas' },
    song_title_error: {
      en: 'Song title required.',
      gd: 'Feumar tiotal òrain.',
    },
    request_received: {
      en: 'Request received — thanks! We\'ll queue it into the rotation.',
      gd: 'Fhuaireadh d\' iarrtas — mòran taing! Cuiridh sinn a-steach dhan chuairt e.',
    },
  },
  // An Saoghal — the diaspora map page
  saoghal: {
    title: { en: 'The Gàidhlig World', gd: 'An Saoghal Gàidhealach' },
    intro: {
      en: 'The gold shows where Gàidhlig lives — brightest in the heartlands, fading across the diaspora. Zoom in for the named places.',
      gd: 'Tha an t-òr a\' sealltainn far a bheil a\' Ghàidhlig beò — as soilleire anns na cridhe-tìrean, a\' crìonadh thar an diaspora. Dèan sùm a-steach airson nan àiteachan ainmichte.',
    },
    reset: { en: 'Reset view', gd: 'Ath-shuidhich' },
    reset_title: { en: 'Reset view (R)', gd: 'Ath-shuidhich sealladh (R)' },
    unverified: { en: 'Unverified — help us confirm', gd: 'Gun dearbhadh — cuidich gus a dhearbhadh' },
    meaning: { en: 'Meaning', gd: 'Ciall' },
    why_named: { en: 'Why it received the name', gd: 'Carson a fhuair e an t-ainm' },
    founded: { en: 'Founded', gd: 'Air a stèidheachadh' },
    switch_to_gd: { en: 'Switch to Gàidhlig', gd: 'Tionndaidh gu Gàidhlig' },
    switch_to_en: { en: 'Switch to English', gd: 'Tionndaidh gu Beurla' },
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('gc_language');
    if (saved) setLanguage(saved);
  }, []);

  const toggleLanguage = () => {
    const next = language === 'en' ? 'gd' : 'en';
    setLanguage(next);
    localStorage.setItem('gc_language', next);
  };

  const t = (path) => {
    const keys = path.split('.');
    let obj = translations;
    for (const key of keys) {
      obj = obj?.[key];
    }
    return obj?.[language] || obj?.en || path;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
