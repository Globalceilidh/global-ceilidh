'use client';

// /saoghal — "An Saoghal." A dark map of the Gàidhlig world.
//
// Two layers in v1.1:
//   1. Heat layer — gold gradient blobs over the Gaelic-speaking world,
//      densest at the Highland/Hebridean heartlands and Cape Breton,
//      fading out across the diaspora. Data: ./heat.js
//   2. Place-name pins — cream pins on every documented Gàidhlig-derived
//      community; click for the original Gàidhlig spelling, meaning, and
//      story of why the name travelled. Data: ./places.js
//
// Hover transform animation is applied to an *inner* span — never the
// outer marker element — because MapLibre uses the outer element's
// `transform` style to anchor the marker to its lng/lat. Animating
// transform on the outer element makes the pins teleport to (0,0).

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { HEAT_POINTS } from './heat';
import { PLACES } from './places';
import { SCOTLAND_GEO, IRELAND_GEO, WALES_GEO, MAN_GEO, DAL_RIATA_GEO } from './regions';
import { useLanguage } from '../../context/LanguageContext';

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Initial camera — also the target of the Reset button.
const HOME_CENTER = [-40, 45];
const HOME_ZOOM = 1.5;

const COLORS = {
  bg: '#0A0807',
  panelBg: '#16110C',
  pin: '#F2ECDC',           // cream — readable on dark map AND over gold heat
  pinRing: '#FCFAF5',
  pinShadow: 'rgba(0,0,0,0.6)',
  goldDeep: '#C9A24A',
  goldLight: '#F2D78A',
  text: '#F2ECDC',
  textMuted: '#9C8B6E',
  border: '#3A2E1E',
  accent: '#6B4E1F',
};

const serif = "'Fraunces', Georgia, serif";
const mono = "'IBM Plex Mono', Menlo, Consolas, monospace";

// ── The Saoghal story ──────────────────────────────────────────────────
// A chapter-based cinematic: each beat flies the camera somewhere and shows
// a line of narration. Chapter 1 = origins (Scott's script). Prose is English
// for now; Gàidhlig titles only where validated — the rest awaits Lewis/Joe.
// Voiceover audio, faint video, and a B&W+gold map restyle layer on later.
const STORY = [
  {
    id: 'intro',
    camera: { center: [6, 47], zoom: 2.4, pitch: 0, bearing: 0 },
    eyebrow: { en: 'An Saoghal · The Story', gd: 'An Saoghal · An Sgeul' },
    title:   { en: 'Where did the Gaels come from?', gd: 'Cò às a tha thu?' },
    body:    { en: 'Every Gael’s story begins far older, and far further away, than Scotland or Ireland.' },
  },
  {
    id: 'proto',
    camera: { center: [40, 50], zoom: 2.0, pitch: 0, bearing: 0 },
    eyebrow: { en: 'Bronze Age · Eurasia' },
    title:   { en: 'The Proto-Gaels' },
    body:    { en: 'The very first Proto-Gaels were Indo-European Bronze Age tribes — part of the great migrations that spread a family of languages across Eurasia.' },
  },
  {
    id: 'central-europe',
    camera: { center: [12, 48], zoom: 4.2, pitch: 0, bearing: 0 },
    eyebrow: { en: 'c. 1200 BC · Central Europe' },
    title:   { en: 'The forests of Central Europe' },
    body:    { en: 'By one archaeological model, they consolidated their distinct culture in the forests of Central Europe, around 1200 BC.' },
  },
  {
    id: 'galatians',
    camera: { center: [22, 44], zoom: 3.3, pitch: 0, bearing: 0 },
    eyebrow: { en: '279 BC · The eastern reach' },
    title:   { en: 'The Galatians' },
    body:    { en: 'A thousand years later, a Gaulish war-band — the Tectosages, Tolistobogii and Trocmi — swept east across the Balkans and seized the highlands of Anatolia, becoming the Galatians of Turkey.' },
  },
  {
    id: 'atlantic',
    camera: { center: [-4, 46], zoom: 3.9, pitch: 0, bearing: 0 },
    eyebrow: { en: 'c. 2500 BC · The Atlantic model' },
    title:   { en: 'The Atlantic coasts' },
    body:    { en: 'By another model, the culture never marched in from the east — it grew in place along the whole Atlantic seaboard, from Brittany to Iberia, as early as 2500 BC. Here belong the Gallaeci of Galicia, whose Q-Celtic tongue is the closest continental cousin to early Gaelic.' },
  },
  {
    id: 'keltoi',
    camera: { center: [12, 45], zoom: 2.7, pitch: 0, bearing: 0 },
    eyebrow: { en: 'The ancient world' },
    title:   { en: 'The Keltoi' },
    body:    { en: 'From Iberia to Anatolia, the ancient world knew them all by a single name — not yet “Gaels”, but the Keltoi.' },
  },

  // ── Chapter 2 · The Sea Road ──────────────────────────────────────────
  {
    id: 'castros',
    camera: { center: [-7.6, 42.8], zoom: 5.2, pitch: 0, bearing: 0 },
    eyebrow: { en: 'c. 600 BC · The Atlantic Iron Age' },
    title:   { en: 'The Castros' },
    body:    { en: 'While their cousins raided Rome, the Gallaeci locked down — over 2,000 stone hillforts, boxed in by mountain and ocean. That isolation preserved an archaic Q-Celtic tongue: the seed of Primitive Irish.' },
  },
  {
    id: 'sea-road',
    camera: { center: [-8, 50], zoom: 4.0, pitch: 0, bearing: 0 },
    eyebrow: { en: 'The archaeology' },
    title:   { en: 'The sea road' },
    body:    { en: 'No single invasion — a centuries-long Atlantic trade network. Skin boats swapped Gallaecian gold and tin for Irish copper, and carried songs, stories and bloodlines north. Slowly, the sea Celticised the isles.' },
  },
  {
    id: 'book-of-invasions',
    camera: { center: [-10, 49], zoom: 4.3, pitch: 0, bearing: 0 },
    eyebrow: { en: 'The myth · Lebor Gabála Érenn' },
    title:   { en: 'The Book of Invasions' },
    body:    { en: 'The Gaels told it differently: King Breogán raised a tower at Brigantia — A Coruña — and his kin glimpsed a green isle across the sea. The sons of Míl Espáine, the Milesians, sailed north and took Ireland, becoming the first true Gaels.' },
  },
  {
    id: 'rome',
    camera: { center: [-3, 50.5], zoom: 3.8, pitch: 0, bearing: 0 },
    regions: ['ireland'],
    eyebrow: { en: '19 BC → · Rome' },
    title:   { en: 'Rome crushes the continent' },
    body:    { en: 'Augustus subdued the Gallaeci; southern Britain fell soon after. But Rome halted at Hadrian’s Wall — beyond it the Picts stayed free — and it never crossed to Ireland. In those free lands the imported Q-Celtic was left to become Old Irish.' },
  },
  {
    id: 'dal-riata',
    camera: { center: [-5.6, 55.7], zoom: 6.0, pitch: 0, bearing: 0 },
    regions: ['ireland', 'dalriata'],
    eyebrow: { en: 'c. 500 AD · Dàl Riata' },
    title:   { en: 'Ireland to Alba' },
    body:    { en: 'By 500 AD the Irish Gaels crossed the North Channel into Argyll — the kingdom of Dàl Riata, straddling the sea. It held only the western seaboard and the isles, but from there Old Irish became Gàidhlig.' },
  },
  {
    id: 'columba',
    camera: { center: [-6.4, 56.33], zoom: 7.2, pitch: 0, bearing: 0 },
    regions: ['dalriata'],
    eyebrow: { en: '563 AD · Ì Chaluim Chille' },
    title:   { en: 'Columba and Iona' },
    body:    { en: 'From Ireland, Colum Cille — Columba — founded a monastery on the tiny isle of Iona. It became the powerhouse of Gaelic Christianity and learning, sending monks, manuscripts and the faith across Alba and far beyond.' },
  },
  {
    id: 'the-name',
    camera: { center: [-4, 53], zoom: 5.0, pitch: 0, bearing: 0 },
    regions: ['wales', 'man'],
    eyebrow: { en: 'The cousins · the name' },
    title:   { en: 'Who named the Gaels' },
    body:    { en: 'Our Brythonic cousins — the Welsh, with the Cornish and Bretons — called the Irish Gwyddel. That word became Goídel, then Gàidheal: “Gael”. Our own Goidelic family runs Irish, Scottish Gaelic, and the Manx of the Isle of Man.' },
  },
  {
    id: 'picts',
    camera: { center: [-4.2, 57], zoom: 5.1, pitch: 0, bearing: 0 },
    regions: ['scotland'],
    eyebrow: { en: 'c. 843 AD · Alba' },
    title:   { en: 'The Gael and the Pict' },
    body:    { en: 'The west was Gaelic Dàl Riata; the north and east belonged to the Picts. Under Cináed mac Ailpín the two crowns became one kingdom — Alba — and the Pictish tongue dissolved into Gàidhlig.' },
  },
  {
    id: 'norse',
    camera: { center: [0, 57], zoom: 4.2, pitch: 0, bearing: 0 },
    eyebrow: { en: 'c. 793–1266 · The Norse' },
    title:   { en: 'Vikings and Danes' },
    body:    { en: 'Then came the Norse. Norwegians seized the Hebrides and Man and married into the Gaels — the Gall-Ghàidheil, the Norse-Gaels. Danes founded Dublin and held the Danelaw. Longships, blood and words all folded into the Gael.' },
  },
  {
    id: 'high-water',
    camera: { center: [-4, 57], zoom: 5.0, pitch: 0, bearing: 0 },
    regions: ['scotland-gael'],
    eyebrow: { en: 'c. 1000–1100 AD · High-water' },
    title:   { en: 'Gàidhlig across all Alba' },
    body:    { en: 'At its height, Gàidhlig was spoken across almost the whole of Scotland — from Galloway in the south to the far north. It was the tongue of kings, court and country alike.' },
  },
  {
    id: 'lordship',
    camera: { center: [-6.2, 57], zoom: 5.3, pitch: 0, bearing: 0 },
    regions: ['dalriata'],
    eyebrow: { en: '1336–1493 · Rìoghachd nan Eilean' },
    title:   { en: 'The Lordship of the Isles' },
    body:    { en: 'From Somerled’s Norse-Gaelic line rose the Lordship of the Isles — a sea-kingdom of the Hebrides and western seaboard, ruled from Finlaggan on Islay. A golden age of Gaelic poetry, law, music and galleys.' },
  },
  {
    id: 'north-inch',
    camera: { center: [-3.43, 56.4], zoom: 8.5, pitch: 0, bearing: 0 },
    eyebrow: { en: '1396 · The North Inch' },
    title:   { en: 'The Battle of the North Inch' },
    body:    { en: 'At Perth, thirty against thirty, two Highland kindreds were made to fight to the death before the king — as sport. Clan turned upon clan. The beginning of the end, as the crown learned to set the Gael against the Gael.' },
  },

  // ── Chapter 3 · The Scattering ────────────────────────────────────────
  {
    id: 'darien-dream',
    camera: { center: [-40, 32], zoom: 1.7, pitch: 0, bearing: 0 },
    eyebrow: { en: '1698 · Darién' },
    title:   { en: 'Scotland reaches for the world' },
    body:    { en: 'Almost the whole nation’s wealth was staked on one dream: a Scottish colony at Darién, on the isthmus of Panama — a gateway between two oceans.' },
  },
  {
    id: 'darien-fall',
    camera: { center: [-77.7, 8.7], zoom: 5.0, pitch: 0, bearing: 0 },
    eyebrow: { en: '1700 · The collapse' },
    title:   { en: 'The dream drowns' },
    body:    { en: 'Disease, hunger and abandonment destroyed the colony. Darién bankrupted Scotland — and by 1707 a broke nation was folded into union with England. The road out was about to be forced open.' },
  },
  {
    id: 'clearances',
    camera: { center: [-4.6, 57.4], zoom: 5.3, pitch: 0, bearing: 0 },
    eyebrow: { en: 'c. 1750–1860 · Fuadach nan Gàidheal' },
    title:   { en: 'The Clearances' },
    body:    { en: 'Landlords cleared the glens for sheep. Families who had held the land for a thousand years were burned out, driven to the shore — and onto ships. The Gàidhealtachd emptied.' },
  },
  {
    id: 'scattering',
    camera: { center: [-30, 25], zoom: 1.2, pitch: 0, bearing: 0 },
    eyebrow: { en: 'The diaspora' },
    title:   { en: 'The scattering' },
    body:    { en: 'They carried Gàidhlig across the world — back to Ireland, to Cape Breton and the Carolinas, to Otago and the Australian bush. Wherever they landed, the ceilidh went on.' },
  },
  {
    id: 'you',
    camera: { center: [-40, 45], zoom: 1.6, pitch: 0, bearing: 0 },
    eyebrow: { en: '…and now, you' },
    title:   { en: 'You are the next chapter' },
    body:    { en: 'Wherever you stand, you are part of the largest Gàidhlig community the world has ever known. Add your pin — be 700,001.' },
  },
];

const pick = (obj, language) => (obj && language === 'gd' && obj.gd) ? obj.gd : (obj ? obj.en : '');

// Small viewport detection — the page is all inline styles (no media queries),
// so mobile layout branches read this instead.
function useIsMobile(bp = 760) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${bp}px)`);
    const on = () => setM(mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [bp]);
  return m;
}

// Pick a home zoom that keeps the whole globe on screen. On a narrow phone the
// desktop zoom (1.5 ≈ 460px sphere) overflows the viewport width; scale the
// zoom so the globe diameter lands at ~0.8× the smaller screen dimension.
// Globe diameter in px ≈ 512 · 2^zoom / π (MapLibre globe projection).
function fitGlobeZoom() {
  if (typeof window === 'undefined') return HOME_ZOOM;
  const w = window.innerWidth, h = window.innerHeight;
  if (w >= 760) return HOME_ZOOM;               // desktop unchanged
  const targetPx = 0.8 * Math.min(w, h);
  const z = Math.log2((targetPx * Math.PI) / 512);
  return Math.max(-1, Math.min(z, HOME_ZOOM));
}

// The story "text player" cluster is a frosted WHITE glass overlay you can
// see the globe through — kept black-and-white because Saoghal is still in
// Kansas. Colour is reserved for the Sruth/Oz side of the site.
const playBtnStyle = {
  position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 6,
  padding: '12px 24px', background: 'rgba(255,255,255,0.82)', color: '#14110D',
  border: '1px solid rgba(255,255,255,0.6)', borderRadius: 999, cursor: 'pointer',
  fontFamily: mono, fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase',
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
};
const skipBtnStyle = {
  position: 'absolute', top: 20, right: 20, zIndex: 7,
  padding: '8px 14px', background: 'rgba(255,255,255,0.72)', color: '#2A2622',
  border: '1px solid rgba(255,255,255,0.5)', borderRadius: 999, cursor: 'pointer',
  fontFamily: mono, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
};
const storyCardStyle = {
  position: 'absolute', left: '50%', bottom: 36, transform: 'translateX(-50%)', zIndex: 6,
  width: 'min(680px, 92vw)', textAlign: 'center', padding: '22px 26px 18px',
  background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 12,
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
};
const storyEyebrowStyle = { margin: '0 0 8px', fontFamily: mono, fontSize: 10, letterSpacing: '2.5px', color: '#6B6B6B', textTransform: 'uppercase' };
const storyTitleStyle = { margin: '0 0 10px', fontFamily: serif, fontWeight: 700, fontSize: 30, lineHeight: 1.15, color: '#14110D' };
const storyBodyStyle = { margin: '0 auto 18px', maxWidth: 560, fontFamily: serif, fontSize: 16, lineHeight: 1.6, color: '#2A2622' };
const storyNavStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 };
const navBtn = (disabled) => ({
  padding: '8px 16px', background: 'transparent',
  color: disabled ? 'rgba(20,17,13,0.3)' : '#14110D',
  border: `1px solid ${disabled ? 'rgba(20,17,13,0.2)' : 'rgba(20,17,13,0.55)'}`, borderRadius: 999,
  cursor: disabled ? 'default' : 'pointer',
  fontFamily: mono, fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase',
});

export default function SaoghalPage() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [storyActive, setStoryActive] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const isMobile = useIsMobile();
  const { language, toggleLanguage, t } = useLanguage();

  const flyHome = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    setSelected(null);
    map.flyTo({
      center: HOME_CENTER, zoom: fitGlobeZoom(),
      bearing: 0, pitch: 0,
      duration: 1200, essential: true,
    });
  }, []);

  // ── Story controls ──────────────────────────────────────────────────
  const startStory = useCallback(() => {
    setSelected(null);
    setStoryStep(0);
    setStoryActive(true);
  }, []);
  const endStory = useCallback(() => {
    setStoryActive(false);
    flyHome();
  }, [flyHome]);
  const nextStep = useCallback(() => setStoryStep((s) => Math.min(s + 1, STORY.length - 1)), []);
  const prevStep = useCallback(() => setStoryStep((s) => Math.max(s - 1, 0)), []);

  // Fly the camera as the story advances.
  useEffect(() => {
    if (!storyActive || !mapReady) return;
    const c = STORY[storyStep].camera;
    mapRef.current?.flyTo({
      center: c.center, zoom: c.zoom, pitch: c.pitch || 0, bearing: c.bearing || 0,
      duration: 2600, essential: true,
    });
  }, [storyActive, storyStep, mapReady]);

  // Region highlights (Scotland blue, Ireland green) — driven per beat by the
  // beat's `regions` list, so reordering beats can't break them.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;
    const regions = (storyActive && STORY[storyStep]?.regions) || [];
    const has = (n) => regions.includes(n);
    const set = (id, prop, v) => { if (map.getLayer(id)) map.setPaintProperty(id, prop, v); };
    set('scotland-fill', 'fill-opacity', has('scotland') ? 0.34 : 0);
    set('scotland-line', 'line-opacity', has('scotland') ? 0.85 : 0);
    set('ireland-fill', 'fill-opacity', has('ireland') ? 0.34 : 0);
    set('ireland-line', 'line-opacity', has('ireland') ? 0.85 : 0);
    set('wales-fill', 'fill-opacity', has('wales') ? 0.34 : 0);
    set('wales-line', 'line-opacity', has('wales') ? 0.85 : 0);
    set('man-fill', 'fill-opacity', has('man') ? 0.55 : 0);   // Man is tiny — punchier
    set('man-line', 'line-opacity', has('man') ? 0.95 : 0);
    set('scotland-gael-fill', 'fill-opacity', has('scotland-gael') ? 0.34 : 0);
    set('scotland-gael-line', 'line-opacity', has('scotland-gael') ? 0.7 : 0);
    set('dalriata-fill', 'fill-opacity', has('dalriata') ? 0.42 : 0);
    set('dalriata-line', 'line-opacity', has('dalriata') ? 0.95 : 0);
  }, [mapReady, storyActive, storyStep]);

  // Red origin bloom: fade in on the steppe (beat 2 = Proto-Gaels), then
  // spread west into Central Europe (beat 3). Points animate via rAF.
  const spreadRaf = useRef(null);
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const src = map?.getSource('proto-heat');
    if (!src) return;
    if (spreadRaf.current) { cancelAnimationFrame(spreadRaf.current); spreadRaf.current = null; }

    const cur = storyActive ? STORY[storyStep]?.id : null;
    const steppe = STEPPE_PTS.map((c) => heatFeat(c, 1));
    if (cur === 'proto') {
      src.setData(heatFC(steppe));
      map.setPaintProperty('proto-heat-layer', 'heatmap-opacity', 0.9);
    } else if (cur === 'central-europe') {
      map.setPaintProperty('proto-heat-layer', 'heatmap-opacity', 0.9);
      const dur = 2600, t0 = performance.now();
      const frame = (now) => {
        const t = Math.min((now - t0) / dur, 1);
        src.setData(heatFC([...steppe, ...CENTRAL_PTS.map((c) => heatFeat(c, t))]));
        if (t < 1) spreadRaf.current = requestAnimationFrame(frame);
      };
      spreadRaf.current = requestAnimationFrame(frame);
    } else if (cur === 'galatians') {
      // Red bloom stays up; the violet arrow leaves it.
      src.setData(heatFC([...steppe, ...CENTRAL_PTS.map((c) => heatFeat(c, 1))]));
      map.setPaintProperty('proto-heat-layer', 'heatmap-opacity', 0.9);
    } else if (cur === 'keltoi') {
      // Keltoi pan-out — Central-European Celts only (the steppe is pre-Celtic).
      src.setData(heatFC(CENTRAL_PTS.map((c) => heatFeat(c, 1))));
      map.setPaintProperty('proto-heat-layer', 'heatmap-opacity', 0.9);
    } else {
      map.setPaintProperty('proto-heat-layer', 'heatmap-opacity', 0);
    }
    return () => { if (spreadRaf.current) { cancelAnimationFrame(spreadRaf.current); spreadRaf.current = null; } };
  }, [mapReady, storyActive, storyStep]);

  // Teal Atlantic-model bloom — fades in on the Atlantic beat (step 4).
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map || !map.getLayer('atlantic-heat-layer')) return;
    const cur = storyActive ? STORY[storyStep]?.id : null;
    const show = cur === 'atlantic' || cur === 'keltoi' || cur === 'castros'; // + Galicia focus
    map.setPaintProperty('atlantic-heat-layer', 'heatmap-opacity', show ? 0.9 : 0);
  }, [mapReady, storyActive, storyStep]);

  // Purple Galatian settlement blooms — off unless we're on the Galatians beat;
  // the arrow animation (below) fades them in as the arrow reaches Anatolia.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map || !map.getLayer('galatia-heat-layer')) return;
    const cur = storyActive ? STORY[storyStep]?.id : null;
    if (cur === 'keltoi') {
      map.setPaintProperty('galatia-heat-layer', 'heatmap-opacity', 0.9);
    } else if (cur !== 'galatians') {
      map.setPaintProperty('galatia-heat-layer', 'heatmap-opacity', 0);   // galatians = arrow frame fades it in
    }
  }, [mapReady, storyActive, storyStep]);

  // Rome crimson wash — fades in on the Rome beat (Ireland stays clear).
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map || !map.getLayer('rome-heat-layer')) return;
    const show = storyActive && STORY[storyStep]?.id === 'rome';
    map.setPaintProperty('rome-heat-layer', 'heatmap-opacity', show ? 0.9 : 0);
    if (map.getLayer('hadrians-wall-layer')) {
      map.setPaintProperty('hadrians-wall-layer', 'line-opacity', show ? 0.9 : 0);
    }
  }, [mapReady, storyActive, storyStep]);

  // Keltoi merge — on the final beat, teal is already up and red + violet
  // return (their own effects set them); after a beat, crossfade all three into
  // one deep-amethyst bloom: they were all the Keltoi.
  const keltoiTimer = useRef(null);
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;
    if (keltoiTimer.current) { clearTimeout(keltoiTimer.current); keltoiTimer.current = null; }
    const set = (id, v) => { if (map.getLayer(id)) map.setPaintProperty(id, 'heatmap-opacity', v); };
    if (storyActive && STORY[storyStep]?.id === 'keltoi') {
      set('keltoi-heat-layer', 0);
      keltoiTimer.current = setTimeout(() => {
        set('proto-heat-layer', 0);
        set('atlantic-heat-layer', 0);
        set('galatia-heat-layer', 0);
        set('keltoi-heat-layer', 0.92);
      }, 1800);
    } else {
      set('keltoi-heat-layer', 0);
    }
    return () => { if (keltoiTimer.current) { clearTimeout(keltoiTimer.current); keltoiTimer.current = null; } };
  }, [mapReady, storyActive, storyStep]);

  // Migration arrows — per beat (Galatians on the Galatians beat, via step tag).
  const arrowRaf = useRef(null);
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const lsrc = map?.getSource('arrows-lines');
    const hsrc = map?.getSource('arrows-heads');
    if (!lsrc || !hsrc) return;
    if (arrowRaf.current) { cancelAnimationFrame(arrowRaf.current); arrowRaf.current = null; }

    const cur = storyActive ? STORY[storyStep]?.id : null;
    const active = cur ? ARROW_PATHS.filter((a) => a.beat === cur) : [];
    if (active.length) {
      const dur = 2600, t0 = performance.now();
      const frame = (now) => {
        const t = Math.min((now - t0) / dur, 1);
        const lines = [], heads = [];
        for (const arrow of active) {
          const path = arrow.pts;
          const idx = Math.max(1, Math.floor(t * (path.length - 1)));
          const seg = path.slice(0, idx + 1);
          lines.push({ type: 'Feature', properties: { color: arrow.color }, geometry: { type: 'LineString', coordinates: seg } });
          const tip = seg[seg.length - 1], prev = seg[seg.length - 2] || seg[0];
          heads.push({ type: 'Feature', properties: { bearing: bearingDeg(prev, tip), color: arrow.color }, geometry: { type: 'Point', coordinates: tip } });
        }
        lsrc.setData(heatFC(lines));
        hsrc.setData(heatFC(heads));
        // As the Galatian arrow nears Anatolia, bloom purple at the settlements.
        if (cur === 'galatians' && t >= 0.82 && map.getLayer('galatia-heat-layer')) {
          map.setPaintProperty('galatia-heat-layer', 'heatmap-opacity', 0.9);
        }
        if (t < 1) arrowRaf.current = requestAnimationFrame(frame);
      };
      arrowRaf.current = requestAnimationFrame(frame);
    } else {
      lsrc.setData(heatFC([]));
      hsrc.setData(heatFC([]));
    }
    return () => { if (arrowRaf.current) { cancelAnimationFrame(arrowRaf.current); arrowRaf.current = null; } };
  }, [mapReady, storyActive, storyStep]);

  // Keyboard: R or Home resets, Escape closes the side panel.
  useEffect(() => {
    function onKey(e) {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'r' || e.key === 'R' || e.key === 'Home') {
        e.preventDefault();
        flyHome();
      } else if (e.key === 'Escape') {
        setSelected(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flyHome]);

  // Click + hover handlers for the pin layer. Hover uses feature-state so
  // the size change happens entirely in the paint expressions, no JS scale
  // tracking on the DOM. Native pattern, MapLibre-canonical.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    let hoveredId = null;

    const onClick = (e) => {
      const f = e.features && e.features[0];
      if (!f) return;
      const place = PLACES.find((p) => p.id === f.properties.id);
      if (!place) return;
      setSelected(place);
      map.flyTo({
        center: [place.lng, place.lat],
        zoom: Math.max(map.getZoom(), 6.5),
        duration: 900,
      });
    };
    const onMove = (e) => {
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features.length) return;
      const id = e.features[0].id;
      if (hoveredId === id) return;
      if (hoveredId !== null) {
        map.setFeatureState({ source: 'places', id: hoveredId }, { hover: false });
      }
      hoveredId = id;
      map.setFeatureState({ source: 'places', id: hoveredId }, { hover: true });
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = '';
      if (hoveredId !== null) {
        map.setFeatureState({ source: 'places', id: hoveredId }, { hover: false });
        hoveredId = null;
      }
    };

    map.on('click', 'places-pins', onClick);
    map.on('mousemove', 'places-pins', onMove);
    map.on('mouseleave', 'places-pins', onLeave);

    return () => {
      map.off('click', 'places-pins', onClick);
      map.off('mousemove', 'places-pins', onMove);
      map.off('mouseleave', 'places-pins', onLeave);
    };
  }, [mapReady]);

  // Initialise the map once on mount.
  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLE,
      // Globe projection — renders the world as a 3D sphere at low zoom and
      // automatically transitions to flat Mercator around zoom 6, so the
      // place-name pins still work at town scale.
      projection: 'globe',
      center: HOME_CENTER,        // North Atlantic — Scotland + Cape Breton + diaspora arc all visible
      zoom: fitGlobeZoom(),
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    // Force globe projection on style.load — passing `projection: 'globe'` to
    // the constructor isn't reliable because the basemap style.json can
    // declare its own projection that wins. setProjection() after load
    // overrides anything the style says.
    map.on('style.load', () => {
      try { map.setProjection({ type: 'globe' }); } catch (e) { console.warn('globe projection unsupported:', e); }
    });
    map.on('load', () => {
      // Clean story globe: heat + place pins are kept in code (heat.js /
      // places.js, addHeatLayer / addPlacesLayer below) but NOT drawn here.
      // They return once the density layer + Sgrùdadh-verified place pins are
      // reintroduced — see the memory note for where/why.
      addRegionHighlights(map);
      addProtoHeat(map);
      addAtlanticHeat(map);
      addRomeHeat(map);
      addGalatiaHeat(map);
      addKeltoiHeat(map);
      addMigrationArrows(map);
      uniformLabelTiming(map);
      setMapReady(true);
    });

    // Built-in zoom +/- and compass control. Bottom-right keeps the top
    // corners free for the masthead and the Reset button.
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <main style={{
      position: 'fixed', inset: 0, background: COLORS.bg, color: COLORS.text,
      overflow: 'hidden',
    }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />

      {/* Hero — the reframe, above the globe, with the EN/GD pill. The
          diaspora "bearings" panel was lifted out of this page (reserved for
          the Ceilidh-page version of Saoghal). Gàidhlig copy is a draft
          pending the Lewis/Joe stamp. */}
      <header style={{
        position: 'absolute', top: isMobile ? 58 : 22, left: '50%', transform: 'translateX(-50%)',
        zIndex: 5, display: storyActive ? 'none' : 'block',
        width: 'min(640px, 92vw)', textAlign: 'center',
        padding: isMobile ? '13px 16px' : '16px 22px',
        background: 'rgba(10, 8, 7, 0.74)',
        border: `1px solid ${COLORS.border}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: 8,
      }}>
        <p style={{
          margin: 0, fontFamily: mono, fontSize: 10, letterSpacing: '2.5px',
          color: COLORS.textMuted, textTransform: 'uppercase',
        }}>Global Ceilidh · An Saoghal</p>

        <p style={{
          margin: '9px 0 8px', fontFamily: serif, fontStyle: 'italic',
          fontSize: isMobile ? 16 : 20, lineHeight: 1.35, color: COLORS.text,
        }}>
          {language === 'gd'
            ? 'Chan e àite as motha a th’ anns a’ choimhearsnachd Ghàidhlig san t‑saoghal — tha i air‑loidhne, anns gach àite. Agus tha thu gu bhith a’ tighinn dhan Chèilidh.'
            : 'The largest Gàidhlig community in the world isn’t a place — it’s online, everywhere. And you’re about to join the Cèilidh.'}
        </p>
        <p style={{
          margin: 0, fontFamily: serif, fontSize: isMobile ? 12.5 : 14,
          lineHeight: 1.55, color: COLORS.textMuted,
        }}>
          {language === 'gd'
            ? 'Tha barrachd dhaoine ag ionnsachadh ’s a’ bruidhinn Gàidhlig an‑diugh na aig àm sam bith eile san eachdraidh. Faigh a‑mach cò às a thàinig na Gàidheil, càit an deach iad — agus mar a chuireas tusa ris an sgeul.'
            : 'There are more people learning and speaking Gàidhlig today than at any moment in history. Find out where the Gaels came from, where they went — and how you’ll add to the story.'}
        </p>

        {/* EN ⇄ GD pill toggle — mirrors the site-nav toggle but
            restyled for the dark map chrome. */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={language === 'en' ? t('saoghal.switch_to_gd') : t('saoghal.switch_to_en')}
            title={language === 'en' ? t('saoghal.switch_to_gd') : t('saoghal.switch_to_en')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 10px',
              background: 'rgba(10, 8, 7, 0.5)',
              border: `1px solid ${COLORS.border}`,
              cursor: 'pointer',
              fontFamily: mono, fontSize: 10, letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: language === 'en' ? COLORS.goldLight : COLORS.textMuted, fontWeight: 600 }}>EN</span>
            <span style={{
              display: 'inline-block', position: 'relative',
              width: 28, height: 14, borderRadius: 7,
              background: language === 'gd' ? COLORS.goldDeep : '#3A2E1E',
              transition: 'background 200ms ease',
            }}>
              <span style={{
                position: 'absolute', top: 1.5,
                width: 11, height: 11, borderRadius: '50%',
                background: COLORS.text,
                left: language === 'gd' ? 14 : 1.5,
                transition: 'left 200ms ease',
              }}/>
            </span>
            <span style={{ color: language === 'gd' ? COLORS.goldLight : COLORS.textMuted, fontWeight: 600 }}>GD</span>
          </button>
        </div>
      </header>

      <button
        type="button"
        onClick={flyHome}
        aria-label={t('saoghal.reset_title')}
        title={t('saoghal.reset_title')}
        style={{
          position: 'absolute', top: 20, right: 20, zIndex: 5,
          display: storyActive ? 'none' : 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px',
          background: 'rgba(10, 8, 7, 0.72)',
          color: COLORS.text,
          border: `1px solid ${COLORS.border}`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          fontFamily: mono, fontSize: 10, letterSpacing: '2px',
          textTransform: 'uppercase', cursor: 'pointer',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1, color: COLORS.goldLight }}>◎</span>
        {t('saoghal.reset')}
      </button>

      {selected && (
        <aside style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, zIndex: 6,
          width: 'min(420px, 92vw)',
          background: COLORS.panelBg,
          borderLeft: `1px solid ${COLORS.border}`,
          padding: '28px 28px 40px',
          overflowY: 'auto',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        }}>
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label={t('common.close')}
            style={{
              position: 'absolute', top: 14, right: 14, width: 32, height: 32,
              background: 'transparent', color: COLORS.textMuted,
              border: `1px solid ${COLORS.border}`,
              cursor: 'pointer', fontSize: 18, lineHeight: 1, fontFamily: serif,
            }}
          >×</button>

          <p style={{
            margin: '0 0 6px', fontFamily: mono, fontSize: 10,
            letterSpacing: '2.5px', color: COLORS.accent, textTransform: 'uppercase',
          }}>{selected.region}</p>

          <h2 style={{
            margin: '0 0 4px', fontFamily: serif, fontWeight: 700,
            fontSize: 30, color: COLORS.text, lineHeight: 1.1,
          }}>{selected.name}</h2>

          <p style={{
            margin: '0 0 24px', fontFamily: serif, fontStyle: 'italic',
            fontSize: 22, color: COLORS.goldLight,
          }}>{selected.gaidhlig}</p>

          {!selected.verified && (
            <div style={{
              margin: '0 0 24px', padding: '8px 12px',
              background: 'rgba(201, 162, 74, 0.08)',
              border: `1px solid ${COLORS.border}`,
              fontFamily: mono, fontSize: 10, letterSpacing: '1.5px',
              color: COLORS.textMuted, textTransform: 'uppercase',
            }}>
              {t('saoghal.unverified')}
            </div>
          )}

          {(selected.body_en || selected.body_gd) ? (
            <Longform text={(language === 'gd' && selected.body_gd) ? selected.body_gd : (selected.body_en || selected.body_gd)} />
          ) : (
            <>
              <Section label={t('saoghal.meaning')} body={selected.meaning} />
              <Section label={t('saoghal.why_named')} body={selected.why_named} />
              {selected.founded && <Section label={t('saoghal.founded')} body={selected.founded} />}
            </>
          )}
        </aside>
      )}

      <footer style={{
        position: 'absolute', bottom: 16, left: 20, zIndex: 4,
        display: (storyActive || isMobile) ? 'none' : 'block',
        fontFamily: mono, fontSize: 9, letterSpacing: '1.5px',
        color: COLORS.textMuted, textTransform: 'uppercase',
      }}>
        Tìr nan Gàidheal · Everywhere
      </footer>

      {/* Story entry — begins the cinematic orientation. */}
      {!storyActive && (
        <button type="button" onClick={startStory} style={playBtnStyle}>
          ▶ {language === 'gd' ? 'Tòisich an sgeul' : 'Begin the story'}
        </button>
      )}

      {/* Story overlay — narration card + Back/Next/Skip. */}
      {storyActive && (() => {
        const ch = STORY[storyStep];
        const last = storyStep === STORY.length - 1;
        return (
          <>
            <button type="button" onClick={endStory} style={skipBtnStyle}>
              {language === 'gd' ? 'Leum thairis' : 'Skip'} ✕
            </button>
            <div style={storyCardStyle}>
              <p style={storyEyebrowStyle}>{pick(ch.eyebrow, language)}</p>
              <h2 style={storyTitleStyle}>{pick(ch.title, language)}</h2>
              {pick(ch.body, language) && <p style={storyBodyStyle}>{pick(ch.body, language)}</p>}
              <div style={storyNavStyle}>
                <button type="button" onClick={prevStep} disabled={storyStep === 0} style={navBtn(storyStep === 0)}>
                  ← {language === 'gd' ? 'Air ais' : 'Back'}
                </button>
                {/* Compact progress — a slim bar + "n / total". Replaces the
                    23-dot row, which overflowed the card on narrow screens and
                    pushed the Next button out of reach. */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 1 auto', minWidth: 0 }}>
                  <div style={{ position: 'relative', width: 'clamp(56px, 16vw, 140px)', height: 3, background: 'rgba(20,17,13,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${((storyStep + 1) / STORY.length) * 100}%`, background: '#14110D', transition: 'width 300ms ease' }} />
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 10, color: '#6B6B6B', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{storyStep + 1} / {STORY.length}</span>
                </div>
                {last ? (
                  <a href="/welcome" style={{
                    ...navBtn(false), textDecoration: 'none',
                    color: '#FFFFFF', background: '#14110D', borderColor: '#14110D', fontWeight: 700,
                  }}>
                    {language === 'gd' ? 'Gabh d’àite' : 'Stake your claim'} →
                  </a>
                ) : (
                  <button type="button" onClick={nextStep} style={navBtn(false)}>
                    {language === 'gd' ? 'Air adhart' : 'Next'} →
                  </button>
                )}
              </div>
            </div>
          </>
        );
      })()}
    </main>
  );
}

function Section({ label, body }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <p style={{
        margin: '0 0 6px', fontFamily: mono, fontSize: 10,
        letterSpacing: '2px', color: COLORS.textMuted, textTransform: 'uppercase',
      }}>{label}</p>
      <p style={{
        margin: 0, fontFamily: serif, fontSize: 15, lineHeight: 1.6,
        color: COLORS.text,
      }}>{body}</p>
    </div>
  );
}

// Renders rich body_en / body_gd content. Block rules:
//   - blocks split by blank line
//   - a block whose every line starts with "- " becomes a <ul>
//   - a single-line short block with no terminal punctuation becomes a section header
//   - everything else is a paragraph
// Inline: [label](url) becomes a gold underlined anchor.
function renderInline(text) {
  const parts = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIdx = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    parts.push(
      <a
        key={`a${match.index}`}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#F2D78A',
          textDecoration: 'underline',
          textUnderlineOffset: 2,
        }}
      >
        {match[1]}
      </a>
    );
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}

function Longform({ text }) {
  const blocks = text.split(/\n\n+/).map(b => b.trim()).filter(Boolean);
  const isHeaderLine = (line) => line.length < 80 && !/[.!?:]$/.test(line);
  const headerStyle = {
    margin: '30px 0 10px', fontFamily: serif, fontSize: 19,
    fontWeight: 700, color: '#F2D78A', lineHeight: 1.25,
  };
  const paragraphStyle = {
    margin: '0 0 16px', fontFamily: serif, fontSize: 15,
    lineHeight: 1.6, color: COLORS.text,
  };
  return (
    <div>
      {blocks.map((block, i) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 0 && lines.every(l => l.startsWith('- '))) {
          return (
            <ul key={i} style={{
              margin: '0 0 18px', paddingLeft: 20,
              fontFamily: serif, fontSize: 15, lineHeight: 1.6, color: COLORS.text,
            }}>
              {lines.map((l, j) => (
                <li key={j} style={{ marginBottom: 6 }}>{renderInline(l.replace(/^- /, ''))}</li>
              ))}
            </ul>
          );
        }
        // First line of a multi-line block can be a header followed by body —
        // the source author separates them with a single newline, not a blank.
        if (lines.length > 0 && isHeaderLine(lines[0])) {
          const header = <h3 style={headerStyle}>{lines[0]}</h3>;
          if (lines.length === 1) return <div key={i}>{header}</div>;
          return (
            <div key={i}>
              {header}
              <p style={paragraphStyle}>{renderInline(lines.slice(1).join(' '))}</p>
            </div>
          );
        }
        return (
          <p key={i} style={paragraphStyle}>{renderInline(lines.join(' '))}</p>
        );
      })}
    </div>
  );
}

// Region highlights for the story — Scotland (saltire blue) and the island of
// Ireland (green). Added hidden; the story toggles visibility per beat. Fills
// go beneath the basemap labels so place names stay legible on top.
function addRegionHighlights(map) {
  const layers = map.getStyle().layers || [];
  const firstLabel = layers.find((l) => /label|place|country/i.test(l.id))?.id;

  map.addSource('scotland', { type: 'geojson', data: SCOTLAND_GEO });
  map.addSource('ireland', { type: 'geojson', data: IRELAND_GEO });

  // Added visible but at opacity 0, with an opacity transition, so the story
  // can fade them in/out per beat.
  const fill = (id, source, color) => {
    map.addLayer({ id, type: 'fill', source, paint: { 'fill-color': color, 'fill-opacity': 0 } }, firstLabel);
    map.setPaintProperty(id, 'fill-opacity-transition', { duration: 900 });
  };
  const line = (id, source, color) => {
    map.addLayer({ id, type: 'line', source, paint: { 'line-color': color, 'line-width': 1.4, 'line-opacity': 0 } }, firstLabel);
    map.setPaintProperty(id, 'line-opacity-transition', { duration: 900 });
  };

  map.addSource('wales', { type: 'geojson', data: WALES_GEO });
  map.addSource('man', { type: 'geojson', data: MAN_GEO });
  map.addSource('dalriata', { type: 'geojson', data: DAL_RIATA_GEO });

  fill('scotland-fill', 'scotland', '#2F6FD0');   // saltire blue (the modern country)
  line('scotland-line', 'scotland', '#8FB8F2');
  fill('scotland-gael-fill', 'scotland', '#2FA36A'); // Gàidhlig across all Scotland (green)
  line('scotland-gael-line', 'scotland', '#7FD9AC');
  fill('ireland-fill', 'ireland', '#1A9E5F');      // Irish green (Goidelic)
  line('ireland-line', 'ireland', '#6FD8A6');
  fill('wales-fill', 'wales', '#E0873C');          // Brythonic — warm amber
  line('wales-line', 'wales', '#F2B577');
  fill('man-fill', 'man', '#1A9E5F');              // Manx = Goidelic, green like Ireland
  line('man-line', 'man', '#6FD8A6');
  fill('dalriata-fill', 'dalriata', '#2FB57E');    // Dàl Riata / the Lordship — Gael green
  line('dalriata-line', 'dalriata', '#7CE3B4');
}

// Red "origin" heat bloom for the story. Fades in on the Pontic-Caspian steppe
// (Proto-Gaels beat), then spreads west into Central Europe (next beat) — the
// Indo-European migration, rendered as a growing bloom. Points carry a 0..1
// `weight`; the effect animates the Central-Europe points' weight up to spread.
const STEPPE_PTS = [[38, 50], [42, 49], [46, 50], [50, 49], [44, 52], [48, 47], [52, 51], [40, 47]];
const CENTRAL_PTS = [[8, 48], [12, 48], [16, 49], [20, 49], [24, 50], [14, 46], [18, 47], [28, 49], [32, 50]];
// Atlantic model — a teal bloom hugging the western seaboard (Brittany → the
// Bay of Biscay → NW Iberia / Galicia), where Celtic culture grew in place.
const ATLANTIC_PTS = [[-4, 48], [-2.5, 47], [-1.5, 45.5], [-1.5, 44], [-8, 43], [-8.5, 42], [-9, 41.5], [-8, 41], [-6.5, 43], [-3.5, 46]];
// Rome — a crimson wash over Iberia, Gaul and southern Britain only. NO points
// over Ireland, and nothing past ~53°N so the bloom fades before Hadrian's Wall
// — Rome never took the Pictish north.
const ROME_PTS = [[-4, 40], [0, 41], [3, 43], [-1, 45], [2, 47], [5, 46], [8, 48], [4, 49], [1, 50], [-2, 52], [-2, 53], [10, 47], [6, 44], [-6, 40], [-8, 38.5], [12, 49]];
// Hadrian's Wall — Rome's northern limit (Solway → Tyne).
const HADRIANS_WALL = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[-3.21, 54.95], [-2.55, 54.99], [-1.53, 54.99]] } }] };
const heatFeat = (c, w) => ({ type: 'Feature', properties: { weight: w }, geometry: { type: 'Point', coordinates: c } });
const heatFC = (feats) => ({ type: 'FeatureCollection', features: feats });

function addProtoHeat(map) {
  const layers = map.getStyle().layers || [];
  const firstLabel = layers.find((l) => /label|place|country/i.test(l.id))?.id;
  map.addSource('proto-heat', { type: 'geojson', data: heatFC([]) });
  map.addLayer({
    id: 'proto-heat-layer', type: 'heatmap', source: 'proto-heat', maxzoom: 9,
    paint: {
      'heatmap-weight': ['get', 'weight'],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 1, 0.6, 4, 1.1, 7, 1.6],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 1, 28, 3, 70, 5, 130, 7, 220],
      'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.15, 'rgba(120,12,10,0.45)',
        0.4, 'rgba(190,30,22,0.60)',
        0.7, 'rgba(230,70,35,0.78)',
        1.0, 'rgba(255,150,80,0.90)'],
      'heatmap-opacity': 0,
    },
  }, firstLabel);
  map.setPaintProperty('proto-heat-layer', 'heatmap-opacity-transition', { duration: 1200 });
}

// Atlantic-model bloom (teal). Static points along the western seaboard; the
// story just fades its opacity in on the Atlantic beat.
function addAtlanticHeat(map) {
  const layers = map.getStyle().layers || [];
  const firstLabel = layers.find((l) => /label|place|country/i.test(l.id))?.id;
  map.addSource('atlantic-heat', { type: 'geojson', data: heatFC(ATLANTIC_PTS.map((c) => heatFeat(c, 1))) });
  map.addLayer({
    id: 'atlantic-heat-layer', type: 'heatmap', source: 'atlantic-heat', maxzoom: 9,
    paint: {
      'heatmap-weight': ['get', 'weight'],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 1, 0.6, 4, 1.1, 7, 1.6],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 1, 28, 3, 70, 5, 130, 7, 220],
      'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.15, 'rgba(18,80,100,0.42)',
        0.4, 'rgba(28,150,175,0.60)',
        0.7, 'rgba(52,196,216,0.78)',
        1.0, 'rgba(150,235,245,0.90)'],
      'heatmap-opacity': 0,
    },
  }, firstLabel);
  map.setPaintProperty('atlantic-heat-layer', 'heatmap-opacity-transition', { duration: 1200 });
}

// Rome — crimson wash over the continent + Britain (Ireland left clear).
function addRomeHeat(map) {
  const layers = map.getStyle().layers || [];
  const firstLabel = layers.find((l) => /label|place|country/i.test(l.id))?.id;
  map.addSource('rome-heat', { type: 'geojson', data: heatFC(ROME_PTS.map((c) => heatFeat(c, 1))) });
  map.addLayer({
    id: 'rome-heat-layer', type: 'heatmap', source: 'rome-heat', maxzoom: 9,
    paint: {
      'heatmap-weight': ['get', 'weight'],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 1, 0.6, 4, 1.1, 7, 1.6],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 1, 28, 3, 70, 5, 130, 7, 220],
      // Dark oxblood — much darker than the bright orange-red steppe bloom.
      'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.15, 'rgba(35,3,5,0.50)',
        0.4, 'rgba(70,6,8,0.72)',
        0.7, 'rgba(105,10,12,0.86)',
        1.0, 'rgba(135,18,20,0.92)'],
      'heatmap-opacity': 0,
    },
  }, firstLabel);
  map.setPaintProperty('rome-heat-layer', 'heatmap-opacity-transition', { duration: 1200 });

  // Hadrian's Wall — a dashed stone line marking Rome's northern limit.
  map.addSource('hadrians-wall', { type: 'geojson', data: HADRIANS_WALL });
  map.addLayer({
    id: 'hadrians-wall-layer', type: 'line', source: 'hadrians-wall',
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': '#E7DCC6', 'line-width': 2.5, 'line-dasharray': [2, 2], 'line-opacity': 0 },
  });
  map.setPaintProperty('hadrians-wall-layer', 'line-opacity-transition', { duration: 900 });
}

// Purple Galatian settlement blooms (Tectosages/Tolistobogii/Trocmi). Static
// points; the story fades them in as the arrow reaches Anatolia.
function addGalatiaHeat(map) {
  const layers = map.getStyle().layers || [];
  const firstLabel = layers.find((l) => /label|place|country/i.test(l.id))?.id;
  map.addSource('galatia-heat', { type: 'geojson', data: heatFC(GALATIA_PTS.map((c) => heatFeat(c, 1))) });
  map.addLayer({
    id: 'galatia-heat-layer', type: 'heatmap', source: 'galatia-heat', maxzoom: 9,
    paint: {
      'heatmap-weight': ['get', 'weight'],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 1, 0.6, 4, 1.1, 7, 1.6],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 1, 14, 3, 34, 5, 70, 7, 120],
      'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.15, 'rgba(90,40,130,0.42)',
        0.4, 'rgba(140,60,190,0.62)',
        0.7, 'rgba(179,104,232,0.80)',
        1.0, 'rgba(220,180,250,0.92)'],
      'heatmap-opacity': 0,
    },
  }, firstLabel);
  map.setPaintProperty('galatia-heat-layer', 'heatmap-opacity-transition', { duration: 900 });
}

// Unified "Keltoi" bloom — one deep amethyst covering all three regions
// (Central Europe + Atlantic + Galatia). On the final beat the three coloured
// blooms crossfade into this single colour: they were all the Keltoi.
function addKeltoiHeat(map) {
  const layers = map.getStyle().layers || [];
  const firstLabel = layers.find((l) => /label|place|country/i.test(l.id))?.id;
  const pts = [...CENTRAL_PTS, ...ATLANTIC_PTS, ...GALATIA_PTS].map((c) => heatFeat(c, 1));
  map.addSource('keltoi-heat', { type: 'geojson', data: heatFC(pts) });
  map.addLayer({
    id: 'keltoi-heat-layer', type: 'heatmap', source: 'keltoi-heat', maxzoom: 9,
    paint: {
      'heatmap-weight': ['get', 'weight'],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 1, 0.6, 4, 1.1, 7, 1.6],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 1, 28, 3, 70, 5, 130, 7, 220],
      'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.15, 'rgba(45,18,80,0.45)',
        0.4, 'rgba(80,35,130,0.64)',
        0.7, 'rgba(120,60,175,0.82)',
        1.0, 'rgba(170,125,222,0.92)'],
      'heatmap-opacity': 0,
    },
  }, firstLabel);
  map.setPaintProperty('keltoi-heat-layer', 'heatmap-opacity-transition', { duration: 1300 });
}

// Migration arrows — military-map style, per-arrow colour (SDF arrowhead so it
// recolours). Two Celtic waves a millennium apart: the Gallaeci west into
// Galicia (c.1000 BC) and the Galatians east into Anatolia (279 BC). Native
// line+symbol layers so they track the camera; the story draws them on.
// Tagged by beat id (not step number) so beats can be reordered freely.
// Colours: violet = Galatians · white = the mythic Milesian voyage · green =
// Dàl Riata · GOLD is reserved for the modern diaspora out of Scotland.
const GOLD = '#F2D78A';
const ARROW_DEFS = [
  // Galatians — a real migration out of the red bloom into Anatolia (violet).
  { beat: 'galatians', from: [20, 47], to: [33, 39.9], color: '#B368E8', bow: -0.22 },

  // The sea road — teal maritime network (Galicia ↔ Brittany ↔ Britain ↔ Ireland).
  { beat: 'sea-road', from: [-8, 43], to: [-9, 52],  color: '#34C4D8', bow:  0.16 },
  { beat: 'sea-road', from: [-8, 43], to: [-4.5, 48], color: '#34C4D8', bow: 0.12 },
  { beat: 'sea-road', from: [-5, 50], to: [-7, 52],  color: '#34C4D8', bow: -0.12 },

  // Book of Invasions — the mythic Milesian voyage (white; gold is reserved).
  { beat: 'book-of-invasions', from: [-8.4, 43.4], to: [-6.5, 52.2], color: '#EAF0FF', bow: 0.14 },

  // Dàl Riata — Ireland to Argyll (green).
  { beat: 'dal-riata', from: [-6, 55], to: [-5.4, 56.1], color: '#6FD8A6', bow: -0.20 },

  // The Norse — Vikings (Norway, ice-blue) into the Hebrides & Man; Danes
  // (Denmark, steel-blue) into Dublin & the Danelaw.
  { beat: 'norse', from: [7, 60],   to: [-6.5, 57.6],  color: '#86C7EA', bow: 0.10 },  // Norway → Hebrides
  { beat: 'norse', from: [6, 61],   to: [-4.5, 54.2],  color: '#86C7EA', bow: 0.16 },  // Norway → Man
  { beat: 'norse', from: [10, 56],  to: [-6.2, 53.35], color: '#3E6FA8', bow: 0.12 },  // Denmark → Dublin
  { beat: 'norse', from: [9, 55.5], to: [-1.1, 53.96], color: '#3E6FA8', bow: 0.10 },  // Denmark → York (Danelaw)

  // Darién — Scotland's doomed reach for Panama (pewter, not gold — gold is
  // reserved for the diaspora that actually took root).
  { beat: 'darien-dream', from: [-4.5, 56.8], to: [-77.7, 8.7], color: '#C0CAD6', bow: 0.16 },

  // The scattering — gold migrations out of Scotland.
  { beat: 'scattering', from: [-4.5, 57], to: [-6.5, 54.6],   color: GOLD, bow:  0.22 }, // back to Ireland
  { beat: 'scattering', from: [-4.5, 57], to: [-60.2, 46.1],  color: GOLD, bow:  0.18 }, // Cape Breton
  { beat: 'scattering', from: [-4.5, 57], to: [-79, 34.8],    color: GOLD, bow:  0.16 }, // the Carolinas
  { beat: 'scattering', from: [-4.5, 57], to: [151.2, -33.9], color: GOLD, bow: -0.12 }, // Australia
  { beat: 'scattering', from: [-4.5, 57], to: [170.5, -45.9], color: GOLD, bow: -0.10 }, // Otago, NZ
];
// Where the three Galatian tribes settled — purple blooms form here as the
// arrow arrives. Tectosages (Ankara, centre), Tolistobogii (west), Trocmi (east).
const GALATIA_PTS = [[32.85, 39.93], [31.3, 39.5], [35.0, 40.0]];
function arcCurve(a, b, bow = 0.18, n = 48) {
  const [ax, ay] = a, [bx, by] = b;
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;                 // perpendicular
  const cx = (ax + bx) / 2 + nx * len * bow;
  const cy = (ay + by) / 2 + ny * len * bow;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([u * u * ax + 2 * u * t * cx + t * t * bx, u * u * ay + 2 * u * t * cy + t * t * by]);
  }
  return pts;
}
const ARROW_PATHS = ARROW_DEFS.map((d) => ({ beat: d.beat, pts: arcCurve(d.from, d.to, d.bow), color: d.color }));
function bearingDeg(a, b) {
  const R = Math.PI / 180, D = 180 / Math.PI;
  const φ1 = a[1] * R, φ2 = b[1] * R, Δλ = (b[0] - a[0]) * R;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * D + 360) % 360;
}

function addMigrationArrows(map) {
  // Gold arrowhead icon (triangle pointing north; icon-rotate aims it).
  const s = 30;
  const cv = document.createElement('canvas');
  cv.width = s; cv.height = s;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#ffffff';                    // white shape; SDF icon-color recolours per arrow
  ctx.beginPath();
  ctx.moveTo(s / 2, 2); ctx.lineTo(s - 5, s - 5); ctx.lineTo(s / 2, s - 11); ctx.lineTo(5, s - 5);
  ctx.closePath(); ctx.fill();
  const img = ctx.getImageData(0, 0, s, s);
  if (!map.hasImage('mig-arrow')) map.addImage('mig-arrow', { width: s, height: s, data: img.data }, { sdf: true });

  map.addSource('arrows-lines', { type: 'geojson', data: heatFC([]) });
  map.addLayer({
    id: 'arrows-lines-layer', type: 'line', source: 'arrows-lines',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 5, 5.5],
      'line-opacity': 0.95,
    },
  });
  map.addSource('arrows-heads', { type: 'geojson', data: heatFC([]) });
  map.addLayer({
    id: 'arrows-heads-layer', type: 'symbol', source: 'arrows-heads',
    layout: {
      'icon-image': 'mig-arrow',
      'icon-size': ['interpolate', ['linear'], ['zoom'], 2, 0.55, 5, 1.05],
      'icon-rotate': ['get', 'bearing'],
      'icon-rotation-alignment': 'map',
      'icon-allow-overlap': true, 'icon-ignore-placement': true,
    },
    paint: { 'icon-color': ['get', 'color'] },
  });
}

// Heat layer setup. Source = HEAT_POINTS as a GeoJSON FeatureCollection.
// Layer = MapLibre 'heatmap' with a gold-amber ramp. Inserted below the first
// label-bearing layer of the basemap so country/region names stay legible
// on top of the glow.
function addHeatLayer(map) {
  const features = HEAT_POINTS.map((p) => ({
    type: 'Feature',
    properties: { weight: p.weight, name: p.name },
    geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
  }));

  map.addSource('gaidhlig-heat', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features },
  });

  // Find the first label-bearing layer so we can paint underneath it.
  const layers = map.getStyle().layers || [];
  const firstLabel = layers.find((l) => /label|place|country/i.test(l.id))?.id;

  map.addLayer(
    {
      id: 'gaidhlig-heat-layer',
      type: 'heatmap',
      source: 'gaidhlig-heat',
      maxzoom: 11,
      paint: {
        // Per-point weight drives intensity.
        'heatmap-weight': ['get', 'weight'],
        // Global intensity bumped a touch so low-zoom blobs read clearly.
        'heatmap-intensity': [
          'interpolate', ['linear'], ['zoom'],
          0, 1.0,
          5, 1.4,
          9, 2.0,
        ],
        // Radius grows with zoom so blobs look proportional, not pin-tiny.
        'heatmap-radius': [
          'interpolate', ['linear'], ['zoom'],
          0, 22,
          2, 45,
          4, 75,
          7, 140,
          10, 230,
        ],
        // Transparent → deep amber → gold. Top end capped well below pure
        // white so peak density reads as "warm gold glow" rather than the
        // hot bullseye it was before, which could look pin-like at world
        // zoom.
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0,    'rgba(0,0,0,0)',
          0.1,  'rgba(107, 78, 31, 0.32)',
          0.3,  'rgba(170, 122, 50, 0.50)',
          0.55, 'rgba(201, 162, 74, 0.62)',
          0.85, 'rgba(225, 185, 105, 0.70)',
          1.0,  'rgba(235, 200, 130, 0.78)',
        ],
        'heatmap-opacity': [
          'interpolate', ['linear'], ['zoom'],
          0, 0.85,
          9, 0.55,
          11, 0,
        ],
      },
    },
    firstLabel
  );
}

// Override the basemap's per-layer minzoom so the biggest-city tier doesn't
// appear before state borders / state labels / our pins. CARTO's default
// stages cities in waves: r2 (mega-cities) at zoom 4, r4 at 5, r7 at 6, etc.
// Pushing r2 to 5 means at zoom 4 you see only continents + state boundary
// lines, and at zoom 5 the world "snaps in" — state labels, major cities,
// and our pins all arrive together.
function uniformLabelTiming(map) {
  const adjust = { 'place_city_dot_r2': 5 };
  for (const [id, mz] of Object.entries(adjust)) {
    if (map.getLayer(id)) {
      map.setLayerZoomRange(id, mz, 24);
    }
  }
}

// Minimum-viable pin layer. No icons, no feature-state, no zoom-gating yet —
// just bright red circles at every place, always visible, large enough to
// see from across the globe. Once these are confirmed on screen we'll layer
// the polish back in one piece at a time.
function addPlacesLayer(map) {
  console.log('[saoghal] addPlacesLayer: building', PLACES.length, 'features');

  const features = PLACES.map((p) => ({
    type: 'Feature',
    properties: { id: p.id, name: p.name },
    geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
  }));

  try {
    map.addSource('places', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features },
      promoteId: 'id',
    });
    map.addLayer({
      id: 'places-pins',
      type: 'circle',
      source: 'places',
      minzoom: 5,
      paint: {
        'circle-radius': 8,
        'circle-color': '#F2ECDC',
        'circle-stroke-color': '#1A1A1A',
        'circle-stroke-width': 1.5,
        'circle-opacity': [
          'interpolate', ['linear'], ['zoom'],
          5, 0,
          6, 1,
        ],
        'circle-stroke-opacity': [
          'interpolate', ['linear'], ['zoom'],
          5, 0,
          6, 1,
        ],
      },
    });
    // Label layer — pin names appear beneath the dot, fading in at zoom 6
    // so they don't clutter the world view. Dark halo keeps them legible
    // over the heat-glow.
    map.addLayer({
      id: 'places-labels',
      type: 'symbol',
      source: 'places',
      minzoom: 6,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-size': 12,
        'text-offset': [0, 1.1],
        'text-anchor': 'top',
        'text-allow-overlap': false,
        'text-padding': 2,
      },
      paint: {
        'text-color': '#F2ECDC',
        'text-halo-color': '#0A0807',
        'text-halo-width': 1.6,
        'text-halo-blur': 0.5,
        'text-opacity': [
          'interpolate', ['linear'], ['zoom'],
          6, 0,
          7, 1,
        ],
      },
    });
    console.log('[saoghal] places-pins + places-labels layers added.');
  } catch (e) {
    console.error('[saoghal] FAILED to add places layer:', e);
  }
}

