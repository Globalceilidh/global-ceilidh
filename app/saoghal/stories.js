// app/saoghal/stories.js
// The repository of stories told through the globe.
//
// /saoghal is the stage; this is the programme. The origins story was
// hardcoded as THE story on the page, which was fine while there was one
// of them and stops being fine the moment there are two. Everything that
// will ever be narrated over the globe gets an entry here, and the index
// at /saoghal/sgeulachdan reads from it.
//
// Each live story is its own page under /saoghal/archives/<slug> — the
// origins cinematic lives at /saoghal/archives/Gael_1. `slug` is the folder
// name; storyHref builds the URL. That gives every story a shareable URL
// and makes "watch it again" from the Archives index a link, not a hunt.
//
// `beats` is the story's beat count. When a second story is built, add its
// folder under /saoghal/archives and point its entry's slug at it.

export const STORIES = [
  {
    id: 'origins',
    slug: 'Gael_1',
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

// Live stories have a slug → their own page in the Archives. Anything
// without one isn't built yet and has no destination.
export const storyHref = (story) =>
  story?.slug ? `/saoghal/archives/${story.slug}` : null;
