import { createClient } from '@supabase/supabase-js';

// ASGF (Association of Scottish Games and Festivals) member events.
// Phase 1: this static list is the seed data for the public /feisean page.
// Phase 2 overlays dynamic cards pulled from sruth_admin's Morning Brief
// via getPublishedFromSruth() below.
//
// Date fields:
//   date_display — human-readable string for the card UI
//   date_start / date_end — ISO yyyy-mm-dd for sorting + the Phase-3 auto-expiry
//   is_tbd — true when the festival hasn't announced dates yet (don't auto-expire)
//
// All entries below incorporate the data fixes specified at build time:
//   - "August 98" → "August 8" (Central New York Scottish Games)
//   - Kalispell MO → MT (Flathead Celtic Festival)
//   - McMinnville year 2025 → 2026
//   - Flathead state corrected from MO → MT

export const STATE_NAMES = {
  AL: 'Alabama',
  CO: 'Colorado',
  FL: 'Florida',
  IN: 'Indiana',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MS: 'Mississippi',
  MT: 'Montana',
  NV: 'Nevada',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  SC: 'South Carolina',
  TN: 'Tennessee',
  VA: 'Virginia',
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const FESTIVALS = [
  // ── Alabama ────────────────────────────────────────────────────────────────
  {
    id: 'north-alabama-scottish',
    name: 'North Alabama Scottish Festival & Highland Games',
    city: 'Decatur',
    state: 'AL',
    address: 'Point Mallard Park, Decatur, AL',
    website: 'https://northalabamascotfest.org/',
    date_display: 'March 14 & 15, 2026',
    date_start: '2026-03-14',
    date_end: '2026-03-15',
    is_tbd: false,
  },

  // ── Colorado ───────────────────────────────────────────────────────────────
  {
    id: 'colorado-scottish-festival',
    name: 'Colorado Scottish Festival',
    city: 'Sedalia',
    state: 'CO',
    address: 'Denver Polo Club, 6359 Airport Road, Sedalia, CO',
    website: 'https://www.scottishgames.org/',
    date_display: 'September 26 & 27, 2026',
    date_start: '2026-09-26',
    date_end: '2026-09-27',
    is_tbd: false,
  },
  {
    id: 'longs-peak-scottish-irish',
    name: 'Longs Peak Scottish-Irish Highland Festival',
    city: 'Estes Park',
    state: 'CO',
    address: '3542 Aspen Valley Road, Estes Park, CO 80517',
    website: 'https://www.scotfest.com/',
    date_display: 'September 11 – 13, 2026',
    date_start: '2026-09-11',
    date_end: '2026-09-13',
    is_tbd: false,
  },
  {
    id: 'celtic-mountain-highland',
    name: 'Celtic Mountain Highland Games',
    city: 'Westcliffe',
    state: 'CO',
    address: 'Bluff Park, Westcliffe, CO',
    website: 'https://www.mustangmedicine.net/',
    date_display: 'October 3, 2026',
    date_start: '2026-10-03',
    date_end: '2026-10-03',
    is_tbd: false,
  },

  // ── Florida ────────────────────────────────────────────────────────────────
  {
    id: 'central-fl-scottish',
    name: 'Central Florida Scottish Highland Games',
    city: 'Winter Springs',
    state: 'FL',
    address: '1000 Central Winds Parkway, Winter Springs, FL',
    website: 'https://www.flascot.com/',
    date_display: 'January 17 & 18, 2026',
    date_start: '2026-01-17',
    date_end: '2026-01-18',
    is_tbd: false,
  },
  {
    id: 'northeast-fl-scottish',
    name: 'Northeast Florida Scottish Games & Festival',
    city: 'Green Cove Springs',
    state: 'FL',
    address: '2463 FL 16, Green Cove Springs, FL',
    website: 'https://www.neflgames.com/',
    date_display: 'February 28, 2026',
    date_start: '2026-02-28',
    date_end: '2026-02-28',
    is_tbd: false,
  },
  {
    id: 'panama-city-beach-scottish',
    name: 'Panama City Beach Scottish Festival',
    city: 'Panama City Beach',
    state: 'FL',
    address: '16200 Panama City Beach Pkwy, Panama City Beach, FL',
    website: 'https://pcbscottishfestival.com/',
    date_display: 'March 6 & 7, 2026',
    date_start: '2026-03-06',
    date_end: '2026-03-07',
    is_tbd: false,
  },
  {
    id: 'scottish-celtic-music-davie',
    name: 'Scottish Celtic Music Festival',
    city: 'Davie',
    state: 'FL',
    address: 'Davie Rodeo Grounds, 4201 Rodeo Way, Davie, FL',
    website: 'https://www.sassf.org/',
    date_display: 'March 28, 2026',
    date_start: '2026-03-28',
    date_end: '2026-03-28',
    is_tbd: false,
  },
  {
    id: 'st-augustine-celtic',
    name: 'St. Augustine Celtic Music & Heritage Festival',
    city: 'St. Augustine',
    state: 'FL',
    address: '25 W. Castillo Drive, St. Augustine, FL',
    website: 'https://www.celticstaugustine.com/',
    date_display: 'March 14 & 15, 2026',
    date_start: '2026-03-14',
    date_end: '2026-03-15',
    is_tbd: false,
  },
  {
    id: 'dunedin-highland',
    name: 'Dunedin Highland Games & Festival',
    city: 'Dunedin',
    state: 'FL',
    address: 'Dunedin, FL',
    website: 'https://www.dunedinsafoundation.com/highland-games/',
    date_display: 'April 10 & 11, 2026',
    date_start: '2026-04-10',
    date_end: '2026-04-11',
    is_tbd: false,
  },

  // ── Indiana ────────────────────────────────────────────────────────────────
  {
    id: 'blue-river-highland',
    name: 'Blue River Highland Games',
    city: 'Shelbyville',
    state: 'IN',
    address: '500 Frank Street, Shelbyville, IN',
    website: 'https://www.shelbyparks.com/214/highlandgames',
    date_display: 'May 16, 2026',
    date_start: '2026-05-16',
    date_end: '2026-05-16',
    is_tbd: false,
  },
  {
    id: 'indianapolis-scottish',
    name: 'Indianapolis Scottish Highland Games & Festival',
    city: 'Indianapolis',
    state: 'IN',
    address: 'Indianapolis, IN',
    website: 'https://www.indyscotgamesandfest.com/',
    date_display: 'October 10, 2026',
    date_start: '2026-10-10',
    date_end: '2026-10-10',
    is_tbd: false,
  },

  // ── Maryland ───────────────────────────────────────────────────────────────
  {
    id: 'celtic-southern-maryland',
    name: 'Celtic Festival of Southern Maryland',
    city: 'St. Leonard',
    state: 'MD',
    address: '10515 Mackall Rd., St. Leonard, MD',
    website: 'https://www.cssm.org/',
    date_display: 'April 25, 2026',
    date_start: '2026-04-25',
    date_end: '2026-04-25',
    is_tbd: false,
  },
  {
    id: 'fairhill-scottish',
    name: 'Fairhill Scottish Games',
    city: 'Elkton',
    state: 'MD',
    address: 'Elkton, MD',
    website: 'https://www.fairhillscottishgames.org/',
    date_display: 'May 16, 2026',
    date_start: '2026-05-16',
    date_end: '2026-05-16',
    is_tbd: false,
  },
  {
    id: 'garrett-county-celtic',
    name: 'Garrett County Celtic Festival',
    city: 'Friendsville',
    state: 'MD',
    address: 'Friendsville, MD',
    website: 'https://www.gccelticfestival.org/',
    date_display: 'June 6, 2026',
    date_start: '2026-06-06',
    date_end: '2026-06-06',
    is_tbd: false,
  },

  // ── Massachusetts ──────────────────────────────────────────────────────────
  {
    id: 'glasgow-lands-scottish',
    name: 'Glasgow Lands Scottish Festival',
    city: 'Blandford',
    state: 'MA',
    address: 'P.O. Box 86, Blandford, MA 01008',
    website: 'https://www.glasgowlands.org/',
    date_display: 'July 18, 2026',
    date_start: '2026-07-18',
    date_end: '2026-07-18',
    is_tbd: false,
  },

  // ── Michigan ───────────────────────────────────────────────────────────────
  {
    id: 'detroit-st-andrews-highland',
    name: 'St. Andrew’s Society of Detroit Annual Highland Games',
    city: 'Troy',
    state: 'MI',
    address: '2363 Rochester Road, Troy, MI',
    website: 'https://highlandgames.com/',
    date_display: 'July 31 – August 1, 2026',
    date_start: '2026-07-31',
    date_end: '2026-08-01',
    is_tbd: false,
  },

  // ── Mississippi ────────────────────────────────────────────────────────────
  {
    id: 'celticfest-mississippi',
    name: 'CelticFest Mississippi',
    city: 'Brandon',
    state: 'MS',
    address: '1112 North Shore Parkway, Brandon, MS',
    website: 'https://www.celticfestms.org/',
    date_display: 'October 10 & 11, 2026',
    date_start: '2026-10-10',
    date_end: '2026-10-11',
    is_tbd: false,
  },
  {
    id: 'highlands-islands-gulfport',
    name: 'Highland Games & Celtic Music Festival',
    city: 'Gulfport',
    state: 'MS',
    address: '15321 County Farm Road, Gulfport, MS',
    website: 'https://www.mshighlandsandislands.com/',
    date_display: 'November 14 & 15, 2026',
    date_start: '2026-11-14',
    date_end: '2026-11-15',
    is_tbd: false,
  },

  // ── Montana ────────────────────────────────────────────────────────────────
  {
    id: 'helena-valley-highland',
    name: 'Helena Valley Highland Gathering',
    city: 'East Helena',
    state: 'MT',
    address: '3575 Buckle Street, East Helena, MT',
    website: 'https://www.helenahighlanders.org/',
    date_display: 'July 18, 2026',
    date_start: '2026-07-18',
    date_end: '2026-07-18',
    is_tbd: false,
  },
  {
    id: 'bitterroot-celtic',
    name: 'Bitterroot Celtic Games & Gathering',
    city: 'Hamilton',
    state: 'MT',
    address: 'Daly Mansion, 251 Eastside Hwy, Hamilton, MT',
    website: 'https://www.bcgg.org/',
    date_display: 'August 15 & 16, 2026',
    date_start: '2026-08-15',
    date_end: '2026-08-16',
    is_tbd: false,
  },
  {
    // State corrected from MO → MT (the by-date listing had it as MO).
    id: 'flathead-celtic',
    name: 'Flathead Celtic Festival',
    city: 'Kalispell',
    state: 'MT',
    address: '563 McMannamy Draw, Kalispell, MT',
    website: 'https://www.flatheadcelticfestival.com/',
    date_display: 'September 11 & 12, 2026',
    date_start: '2026-09-11',
    date_end: '2026-09-12',
    is_tbd: false,
  },

  // ── Nevada ─────────────────────────────────────────────────────────────────
  {
    id: 'las-vegas-celtic',
    name: 'Las Vegas Celtic Society Festival & Highland Games',
    city: 'North Las Vegas',
    state: 'NV',
    address: 'Craig Ranch Regional Park, 628 W. Craig Road, North Las Vegas, NV',
    website: 'https://www.lasvegascelticsociety.org/',
    date_display: 'April 18 & 19, 2026',
    date_start: '2026-04-18',
    date_end: '2026-04-19',
    is_tbd: false,
  },

  // ── New Mexico ─────────────────────────────────────────────────────────────
  {
    id: 'rio-grande-celtic',
    name: 'Rio Grande Valley Celtic Festival',
    city: 'Albuquerque',
    state: 'NM',
    address: 'Balloon Fiesta Field, Albuquerque, NM',
    website: 'https://www.celtfestabq.com/',
    date_display: 'May 2 & 3, 2026',
    date_start: '2026-05-02',
    date_end: '2026-05-03',
    is_tbd: false,
  },

  // ── New York ───────────────────────────────────────────────────────────────
  {
    // Date corrected from "August 98" → "August 8".
    id: 'central-ny-scottish',
    name: 'Central New York Scottish Games',
    city: 'Liverpool',
    state: 'NY',
    address: 'Long Branch Park, Liverpool, NY',
    website: 'https://www.cnyscottishgames.org/',
    date_display: 'August 8, 2026',
    date_start: '2026-08-08',
    date_end: '2026-08-08',
    is_tbd: false,
  },
  {
    id: 'niagara-celtic',
    name: 'Niagara Celtic Heritage Festival',
    city: 'Lockport',
    state: 'NY',
    address: 'Niagara County Fairgrounds, Lockport, NY',
    website: 'https://niagraceltic.com/',
    date_display: 'September 19 & 20, 2026',
    date_start: '2026-09-19',
    date_end: '2026-09-20',
    is_tbd: false,
  },

  // ── North Carolina ─────────────────────────────────────────────────────────
  {
    id: 'grandfather-mountain',
    name: 'Grandfather Mountain Highland Games',
    city: 'Linville',
    state: 'NC',
    address: 'Linville, NC 28646',
    website: 'https://www.gmhg.org/',
    date_display: 'July 9 – 12, 2026',
    date_start: '2026-07-09',
    date_end: '2026-07-12',
    is_tbd: false,
  },

  // ── Oregon ─────────────────────────────────────────────────────────────────
  {
    // Year corrected from 2025 → 2026.
    id: 'mcminnville-scottish',
    name: 'McMinnville Scottish Festival',
    city: 'McMinnville',
    state: 'OR',
    address: 'Yamhill County Fairgrounds, McMinnville, OR',
    website: 'https://celticheritage.org/mac-scottish-festival/',
    date_display: 'October 4 & 5, 2026',
    date_start: '2026-10-04',
    date_end: '2026-10-05',
    is_tbd: false,
  },

  // ── Pennsylvania ───────────────────────────────────────────────────────────
  {
    id: 'celtic-classic-bethlehem',
    name: 'Celtic Classic Highland Games & Festival',
    city: 'Bethlehem',
    state: 'PA',
    address: 'Spring & Main Streets, Bethlehem, PA 18018',
    website: 'https://www.celticfest.org/',
    date_display: 'September 25 – 27, 2026',
    date_start: '2026-09-25',
    date_end: '2026-09-27',
    is_tbd: false,
  },

  // ── South Carolina ─────────────────────────────────────────────────────────
  {
    id: 'charleston-scottish',
    name: 'Charleston Scottish Games & Highland Festival',
    city: 'Charleston',
    state: 'SC',
    address: 'Charleston, SC',
    website: 'https://www.charlestonscots.org/',
    date_display: 'Date TBD',
    date_start: null,
    date_end: null,
    is_tbd: true,
  },

  // ── Tennessee ──────────────────────────────────────────────────────────────
  {
    id: 'smoky-mountain-scottish',
    name: 'Smoky Mountain Scottish Festival & Highland Games',
    city: 'Townsend',
    state: 'TN',
    address: '7930 Lamar Alexander Pkwy, Townsend, TN',
    website: 'https://www.smokymountaingames.org/',
    date_display: 'May 15 & 16, 2026',
    date_start: '2026-05-15',
    date_end: '2026-05-16',
    is_tbd: false,
  },
  {
    id: 'middle-tn-highland',
    name: 'Middle Tennessee Highland Games & Celtic Festival',
    city: 'Hendersonville',
    state: 'TN',
    address: 'Sanders Ferry Park, 513 Sanders Ferry Road, Hendersonville, TN',
    website: 'https://www.midtenngames.com/',
    date_display: 'September 11 – 13, 2026',
    date_start: '2026-09-11',
    date_end: '2026-09-13',
    is_tbd: false,
  },
  {
    id: 'dandridge-scots-irish',
    name: 'Dandridge Scots-Irish Festival',
    city: 'Dandridge',
    state: 'TN',
    address: 'Main Street, Dandridge, TN',
    website: 'https://www.scotsirishfestival.com/',
    date_display: 'September 25 & 26, 2026',
    date_start: '2026-09-25',
    date_end: '2026-09-26',
    is_tbd: false,
  },

  // ── Virginia ───────────────────────────────────────────────────────────────
  {
    id: 'sedalia-celtic-va',
    name: 'Celtic Festival & Highland Games (Sedalia Center)',
    city: 'Big Island',
    state: 'VA',
    address: '1108 Sedalia School Road, Big Island, VA',
    website: 'https://www.sedaliacenter.org/celtic-festival-highland-games/',
    date_display: 'March 28, 2026',
    date_start: '2026-03-28',
    date_end: '2026-03-28',
    is_tbd: false,
  },
  {
    id: 'virginia-scottish-games',
    name: 'Virginia Scottish Games',
    city: 'The Plains',
    state: 'VA',
    address: '5089 Old Tavern Road, The Plains, VA',
    website: 'https://www.vascottishgames.org/',
    date_display: 'September 5 & 6, 2026',
    date_start: '2026-09-05',
    date_end: '2026-09-06',
    is_tbd: false,
  },
];

// ── Dynamic Sruth-pipeline festivals ─────────────────────────────────────────
//
// Reads sruth_festivals rows where review_status='published' and the row
// has not been auto-expired. Same service-role pattern as the Sruth archive
// (server-only fetch; never bundles the SUPABASE_SERVICE_ROLE_KEY into the
// client). Failures degrade to an empty list so the public page keeps
// serving the static ASGF cards even when Supabase is unreachable.

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
}

export async function getPublishedFromSruth() {
  try {
    const { data, error } = await sb()
      .from('sruth_festivals')
      .select(
        'id, name, city, state_code, address, date_display, date_start, date_end, is_tbd, website, hero_image_url, description',
      )
      .eq('review_status', 'published')
      .is('expired_at', null)
      .order('date_start', { ascending: true, nullsFirst: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      city: row.city || '',
      state: row.state_code || '',
      address: row.address || '',
      website: row.website || '',
      date_display: row.date_display || (row.is_tbd ? 'Date TBD' : ''),
      date_start: row.date_start || null,
      date_end: row.date_end || null,
      is_tbd: !!row.is_tbd,
      hero_image_url: row.hero_image_url || null,
      description: row.description || '',
      _source: 'sruth',
    }));
  } catch (e) {
    console.error('getPublishedFromSruth failed:', e?.message || e);
    return [];
  }
}

// Group helpers used by the page renderer.

export function groupByMonth(festivals) {
  // Returns Map<monthIndex 0-11, festival[]>, plus a 'tbd' bucket at the end
  // for events with no announced date. Within each month, sorted by date_start.
  const buckets = new Map();
  for (let i = 0; i < 12; i++) buckets.set(i, []);
  const tbd = [];
  for (const f of festivals) {
    if (f.is_tbd || !f.date_start) {
      tbd.push(f);
      continue;
    }
    const month = new Date(f.date_start + 'T00:00:00Z').getUTCMonth();
    buckets.get(month).push(f);
  }
  for (const [, arr] of buckets) {
    arr.sort((a, b) => (a.date_start || '').localeCompare(b.date_start || ''));
  }
  return { months: buckets, tbd };
}

export function groupByState(festivals) {
  // Returns Map<stateCode, festival[]> sorted alphabetically by state name.
  // Empty states (no listed events) are omitted from this view.
  const buckets = new Map();
  for (const f of festivals) {
    if (!buckets.has(f.state)) buckets.set(f.state, []);
    buckets.get(f.state).push(f);
  }
  for (const [, arr] of buckets) {
    arr.sort((a, b) => (a.date_start || '9').localeCompare(b.date_start || '9'));
  }
  const sortedEntries = [...buckets.entries()].sort(([a], [b]) =>
    (STATE_NAMES[a] || a).localeCompare(STATE_NAMES[b] || b)
  );
  return new Map(sortedEntries);
}
