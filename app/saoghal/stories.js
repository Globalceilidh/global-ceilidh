// app/saoghal/stories.js
// The repository of stories told through the globe.
//
// /saoghal is the stage; this is the programme. The origins story was
// hardcoded as THE story on the page, which was fine while there was one
// of them and stops being fine the moment there are two. Everything that
// will ever be narrated over the globe gets an entry here, and the index
// at /saoghal/sgeulachdan reads from it.
//
// A story is reached with ?story=<id>, which /saoghal picks up on mount
// and starts directly. That also gives every story a shareable URL and
// makes "watch it again" a link rather than a hunt.
//
// `beats` is the STORY array's length where the story is built into
// page.js. When a second story arrives, the beat arrays should move into
// their own modules alongside this one and be referenced from here — the
// registry is deliberately shaped to allow that without a rewrite.

export const STORIES = [
  {
    id: 'origins',
    status: 'live',
    title: { en: 'Where did the Gaels come from?', gd: 'Cò às a tha na Gàidheil?' },
    blurb: {
      en: 'The long road from the steppe to the Atlantic, out of Ireland into Alba, and on into the diaspora — 23 beats across four thousand years.',
      gd: 'An rathad fada bhon steppe gun Chuan Siar, à Èirinn a-steach do dh’Alba, agus a-mach don diaspora — 23 ceumannan thar ceithir mìle bliadhna.',
    },
    beats: 23,
    era: { en: 'c. 2000 BC → today', gd: 'c. 2000 RC → an-diugh' },
  },
  // Sketched, not built. Listed so the shape of the programme is visible
  // rather than implied — and so it is obvious which are real.
  {
    id: 'clearances',
    status: 'coming',
    title: { en: 'The Clearances, farm by farm', gd: 'Na Fuadaichean, tuathanas air thuathanas' },
    blurb: {
      en: 'Not one event but hundreds. Follow the evictions glen by glen and watch where each shipload actually landed.',
      gd: 'Chan e aon tachartas ach na ceudan. Lean na fuadaichean gleann air ghleann.',
    },
    era: { en: '1750 → 1860', gd: '1750 → 1860' },
  },
  {
    id: 'sean-nos',
    status: 'coming',
    title: { en: 'How a song travelled', gd: 'Mar a shiubhail òran' },
    blurb: {
      en: 'Take a single waulking song and trace every place it was recorded — Lewis to Cape Breton to a kitchen in Ontario.',
      gd: 'Gabh aon òran-luaidh agus lorg gach àite an deach a chlàradh.',
    },
    era: { en: 'living memory', gd: 'cuimhne bheò' },
  },
];

export const LIVE_STORIES = STORIES.filter((s) => s.status === 'live');

export const storyHref = (id) => `/saoghal?story=${id}`;
