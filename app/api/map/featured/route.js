// app/api/map/featured/route.js
// Featured events (the curated list on /tachartasan) as highlighted map
// pins. Small and hand-picked, rendered as NEON pins on the globe — brighter
// and pulsing, distinct from the plain-blue fèisean pins.
//
// `feisId` links a featured event to its /feisean entry (when it's the same
// game) so the globe can suppress the duplicate plain-blue pin and show only
// the neon one. Null when the featured event isn't in the ASGF list (e.g.
// Fergus, which is in Canada).
//
// Public data (same as the /tachartasan page); no auth. Coordinates geocoded
// once via Nominatim: Grandfather Mountain → MacRae Meadows (the actual games
// site); Fergus → Fergus, Ontario.

export const runtime = 'nodejs';

const FEATURED = [
  {
    id: 'grandfather-mountain-featured',
    feisId: 'grandfather-mountain',
    name: 'Grandfather Mountain Highland Games',
    location: 'Banner Elk, NC, USA',
    dateDisplay: 'July 10–13, 2026',
    website: 'https://grandfathermountain.com',
    lat: 36.086,
    lng: -81.8495,
  },
  {
    id: 'fergus-scottish',
    feisId: null,
    name: 'Fergus Scottish Festival',
    location: 'Fergus, Ontario, Canada',
    dateDisplay: 'August 2026',
    website: 'https://fergusscottishfestival.com',
    lat: 43.7059,
    lng: -80.3779,
  },
];

export async function GET() {
  return Response.json({ ok: true, featured: FEATURED });
}
