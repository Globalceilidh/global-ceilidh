// Source points for the Gàidhlig diaspora heat layer.
//
// Each point has a `weight` (0..1) representing the historical/present density
// of Gàidhlig speakers and place-names in that area. The MapLibre heatmap
// layer turns these points into smooth gradient blobs so the visual effect is
// "the Gaelic world glows brightest where it's densest."
//
// Weights are editorial first-pass — adjust freely. Add a point: drop a new
// object in the array, map re-renders.
//
// Rough scale:
//   1.0 — Gàidhlig-speaking heartlands (Highlands & Islands, Cape Breton)
//   0.7 — major historical settlement clusters with documented Gaelic culture
//   0.4 — scattered diaspora pockets with some living Gaelic presence
//   0.2 — single-name reminders (one town, one community)

export const HEAT_POINTS = [
  // Scotland — heartland (whole Highlands + Hebrides glow)
  { name: 'Inverness',     lng: -4.23,  lat: 57.48, weight: 1.0 },
  { name: 'Skye',          lng: -6.20,  lat: 57.30, weight: 1.0 },
  { name: 'Stornoway',     lng: -6.39,  lat: 58.21, weight: 1.0 },
  { name: 'Uist',          lng: -7.30,  lat: 57.40, weight: 0.9 },
  { name: 'Barra',         lng: -7.49,  lat: 56.97, weight: 0.9 },
  { name: 'Oban (Argyll)', lng: -5.47,  lat: 56.41, weight: 0.9 },
  { name: 'Sutherland',    lng: -4.50,  lat: 58.20, weight: 0.8 },
  { name: 'Ross-shire',    lng: -4.50,  lat: 57.55, weight: 0.8 },
  { name: 'Mull',          lng: -6.00,  lat: 56.45, weight: 0.8 },
  { name: 'Islay',         lng: -6.20,  lat: 55.78, weight: 0.7 },
  { name: 'Glasgow',       lng: -4.25,  lat: 55.86, weight: 0.5 },
  { name: 'Edinburgh',     lng: -3.19,  lat: 55.95, weight: 0.4 },

  // Cape Breton & Nova Scotia — the second heartland
  { name: 'Inverness NS',  lng: -61.29, lat: 46.23, weight: 0.95 },
  { name: 'Mabou',         lng: -61.39, lat: 46.08, weight: 0.9 },
  { name: 'Antigonish',    lng: -61.99, lat: 45.62, weight: 0.75 },
  { name: 'Sydney NS',     lng: -60.19, lat: 46.14, weight: 0.6 },
  { name: 'Christmas Island', lng: -60.49, lat: 45.99, weight: 0.7 },

  // PEI
  { name: 'Belfast PEI',   lng: -62.85, lat: 46.10, weight: 0.5 },

  // Ontario — Glengarry & southwestern clusters
  { name: 'Glengarry (Maxville)', lng: -74.86, lat: 45.28, weight: 0.7 },
  { name: 'Glencoe ON',    lng: -81.71, lat: 42.75, weight: 0.45 },

  // Newfoundland — Codroy Valley
  { name: 'Codroy Valley', lng: -59.32, lat: 47.83, weight: 0.5 },

  // USA — historical Cape Fear plus the New York Scots belt
  { name: 'Cape Fear NC',  lng: -78.88, lat: 35.05, weight: 0.45 },
  { name: 'NY Scots belt', lng: -73.60, lat: 43.10, weight: 0.35 },
  { name: 'Boston',        lng: -71.06, lat: 42.36, weight: 0.3 },

  // New Zealand — Waipu and Otago
  { name: 'Waipu NZ',      lng: 174.43, lat: -36.00, weight: 0.5 },
  { name: 'Otago / Dunedin', lng: 170.50, lat: -45.87, weight: 0.5 },

  // Australia — Highland-settled regions
  { name: 'Sydney AU',     lng: 151.21, lat: -33.87, weight: 0.3 },
  { name: 'Victoria',      lng: 145.00, lat: -37.00, weight: 0.3 },

  // Patagonia
  { name: 'Patagonia',     lng: -71.32, lat: -42.91, weight: 0.25 },

  // Western Canada — the Red River (Selkirk) settlement is the heaviest
  // pure-Gàidhlig settlement in the prairies: Lord Selkirk shipped Highlanders
  // out of Sutherland during the clearances in 1813. Calgary/Edmonton inherit
  // the broader Highland-society activity that followed the railway era.
  { name: 'Red River / Selkirk MB', lng: -97.14, lat: 49.90, weight: 0.6 },
  { name: 'Saskatoon',     lng: -106.67, lat: 52.13, weight: 0.3 },
  { name: 'Calgary',       lng: -114.07, lat: 51.05, weight: 0.35 },
  { name: 'Edmonton',      lng: -113.49, lat: 53.55, weight: 0.3 },

  // Pacific Northwest — Hudson's Bay Company was Highland-led, and BC
  // absorbed a steady stream of Scots from the late 19th century onward.
  // Vancouver and Victoria carry active Gaelic societies and classes today.
  { name: 'Vancouver',     lng: -123.12, lat: 49.28, weight: 0.4 },
  { name: 'Victoria BC',   lng: -123.37, lat: 48.43, weight: 0.35 },
  { name: 'Seattle',       lng: -122.33, lat: 47.61, weight: 0.3 },
  { name: 'Portland OR',   lng: -122.68, lat: 45.52, weight: 0.25 },

  // US Midwest — Highland Games circuits and active Scottish societies in
  // Detroit, Chicago, the Twin Cities, and the Wisconsin Caledonia/Argyle
  // belt; Cleveland and Indianapolis carry smaller pockets.
  { name: 'Detroit',       lng: -83.05, lat: 42.33, weight: 0.3 },
  { name: 'Chicago',       lng: -87.63, lat: 41.88, weight: 0.3 },
  { name: 'Twin Cities',   lng: -93.27, lat: 44.98, weight: 0.35 },
  { name: 'Wisconsin Scots belt', lng: -87.95, lat: 42.83, weight: 0.3 },
  { name: 'Cleveland',     lng: -81.69, lat: 41.50, weight: 0.25 },

  // Carolina backcountry — the Waxhaws and the NC/SC Piedmont absorbed huge
  // numbers of Highland Scots (post-1746 Jacobite refugees, then steady
  // emigration up to the Revolution) and Ulster Scots arriving overland from
  // Pennsylvania. Densest along the NC/SC line east of Charlotte: Union
  // County, Anson County, and over the border at Fort Mill. Companion to
  // the Cape Fear point already on the coast.
  { name: 'Waxhaw / Union Co NC',   lng: -80.74, lat: 34.92, weight: 0.5 },
  { name: 'Anson County NC',        lng: -80.08, lat: 34.97, weight: 0.45 },
  { name: 'Fort Mill SC',           lng: -80.94, lat: 35.01, weight: 0.4 },
];
