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
import { SCOTLAND_GEO, IRELAND_GEO } from './regions';
import { useLanguage } from '../../context/LanguageContext';
import DiasporaClock from '../../components/DiasporaClock';

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
    id: 'atlantic',
    camera: { center: [-4, 44], zoom: 4.2, pitch: 0, bearing: 0 },
    eyebrow: { en: 'c. 2500 BC · The Atlantic' },
    title:   { en: 'The Atlantic coasts' },
    body:    { en: 'By another, their culture formed far earlier still — along the Atlantic coasts of France and Spain, as early as 2500 BC.' },
  },
  {
    id: 'keltoi',
    camera: { center: [7, 47], zoom: 3.0, pitch: 0, bearing: 0 },
    eyebrow: { en: 'The ancient world' },
    title:   { en: 'The Keltoi' },
    body:    { en: 'To the rest of the ancient world, they were not yet “Gaels”. They were simply known as the Keltoi.' },
  },
];

const pick = (obj, language) => (obj && language === 'gd' && obj.gd) ? obj.gd : (obj ? obj.en : '');

const playBtnStyle = {
  position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 6,
  padding: '12px 24px', background: 'rgba(10,8,7,0.82)', color: '#F2D78A',
  border: '1px solid #C9A24A', borderRadius: 999, cursor: 'pointer',
  fontFamily: mono, fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase',
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
};
const skipBtnStyle = {
  position: 'absolute', top: 20, right: 20, zIndex: 7,
  padding: '8px 14px', background: 'rgba(10,8,7,0.72)', color: '#9C8B6E',
  border: '1px solid #3A2E1E', borderRadius: 999, cursor: 'pointer',
  fontFamily: mono, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
};
const storyCardStyle = {
  position: 'absolute', left: '50%', bottom: 36, transform: 'translateX(-50%)', zIndex: 6,
  width: 'min(680px, 92vw)', textAlign: 'center', padding: '22px 26px 18px',
  background: 'rgba(10,8,7,0.82)', border: '1px solid #3A2E1E', borderRadius: 8,
  backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
};
const storyEyebrowStyle = { margin: '0 0 8px', fontFamily: mono, fontSize: 10, letterSpacing: '2.5px', color: '#9C8B6E', textTransform: 'uppercase' };
const storyTitleStyle = { margin: '0 0 10px', fontFamily: serif, fontWeight: 700, fontSize: 30, lineHeight: 1.15, color: '#F2D78A' };
const storyBodyStyle = { margin: '0 auto 18px', maxWidth: 560, fontFamily: serif, fontSize: 16, lineHeight: 1.6, color: '#F2ECDC' };
const storyNavStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 };
const dotsStyle = { display: 'flex', gap: 6, alignItems: 'center' };
const dotStyle = { width: 7, height: 7, borderRadius: '50%', display: 'inline-block', transition: 'background 200ms' };
const navBtn = (disabled) => ({
  padding: '8px 16px', background: 'transparent',
  color: disabled ? '#3A2E1E' : '#F2ECDC',
  border: `1px solid ${disabled ? '#3A2E1E' : '#6B4E1F'}`, borderRadius: 999,
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
  const { language, toggleLanguage, t } = useLanguage();

  const flyHome = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    setSelected(null);
    map.flyTo({
      center: HOME_CENTER, zoom: HOME_ZOOM,
      bearing: 0, pitch: 0,
      duration: 1200, essential: true,
    });
  }, []);

  // Fly the globe to a diaspora anchor (or the user) when its clock row is
  // clicked — makes the orientation panel an actual nav map.
  const flyToAnchor = useCallback((a) => {
    const map = mapRef.current;
    if (!map || a == null || a.lng == null || a.lat == null) return;
    setSelected(null);
    map.flyTo({
      center: [a.lng, a.lat],
      zoom: Math.max(map.getZoom(), 4.5),
      duration: 1400, essential: true,
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

  // Region highlights (Scotland blue, Ireland green) — shown on the intro beat.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;
    const show = storyActive && storyStep === 0;
    ['scotland-fill', 'scotland-line', 'ireland-fill', 'ireland-line'].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', show ? 'visible' : 'none');
    });
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
      zoom: HOME_ZOOM,
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

      <header style={{
        position: 'absolute', top: 20, left: 20, zIndex: 5,
        padding: '12px 18px',
        background: 'rgba(10, 8, 7, 0.72)',
        border: `1px solid ${COLORS.border}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        maxWidth: 340,
      }}>
        <p style={{
          margin: 0, fontFamily: mono, fontSize: 10, letterSpacing: '2.5px',
          color: COLORS.textMuted, textTransform: 'uppercase',
        }}>Global Ceilidh · An Saoghal</p>
        <h1 style={{
          margin: '6px 0 4px', fontFamily: serif, fontWeight: 400, fontSize: 22,
          color: COLORS.text, fontStyle: 'italic',
        }}>
          {t('saoghal.title')}
        </h1>
        <p style={{
          margin: 0, fontFamily: serif, fontSize: 13, lineHeight: 1.5,
          color: COLORS.textMuted,
        }}>
          {t('saoghal.intro')}
        </p>

        {/* EN ⇄ GD pill toggle — mirrors the site-nav toggle but
            restyled for the dark map chrome. */}
        <button
          type="button"
          onClick={toggleLanguage}
          aria-label={language === 'en' ? t('saoghal.switch_to_gd') : t('saoghal.switch_to_en')}
          title={language === 'en' ? t('saoghal.switch_to_gd') : t('saoghal.switch_to_en')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginTop: 12,
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

      {/* Diaspora nav panel — your bearings to the cultural anchors.
          Click a row to fly the globe there. */}
      <div style={{
        position: 'absolute', bottom: 52, left: 20, zIndex: 5,
        display: storyActive ? 'none' : 'block',
        width: 'min(300px, 82vw)',
        padding: '12px 14px',
        background: 'rgba(10, 8, 7, 0.72)',
        border: `1px solid ${COLORS.border}`,
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}>
        <p style={{
          margin: '0 0 10px', fontFamily: mono, fontSize: 9, letterSpacing: '2px',
          color: COLORS.textMuted, textTransform: 'uppercase',
        }}>The heartlands · and how far you stand</p>

        <DiasporaClock onSelect={flyToAnchor} />

        {/* The reframe: the largest Gàidhlig community isn't a place — it's the
            global online one. Join from anywhere and you're 700,001. */}
        <div style={{ height: 1, background: COLORS.border, margin: '12px 0' }} />
        <p style={{
          margin: '0 0 8px', fontFamily: serif, fontStyle: 'italic',
          fontSize: 13, lineHeight: 1.5, color: COLORS.text,
        }}>
          The largest Gàidhlig community in the world isn’t a place — it’s online, everywhere.
        </p>
        <p style={{
          margin: '0 0 12px', fontFamily: mono, fontSize: 9.5, letterSpacing: '0.5px',
          lineHeight: 1.6, color: COLORS.textMuted,
        }}>
          <span style={{ color: COLORS.goldLight }}>700,000</span> speakers &amp; learners.
          Join from where you stand — and you’re <span style={{ color: COLORS.goldLight }}>700,001</span>.
        </p>
        <a href="/welcome" style={{
          display: 'inline-block', fontFamily: mono, fontSize: 10, letterSpacing: '2px',
          textTransform: 'uppercase', color: COLORS.goldLight, textDecoration: 'none',
          borderBottom: `1px solid ${COLORS.goldDeep}`, paddingBottom: 2,
        }}>Join the Cèilidh →</a>
      </div>

      <footer style={{
        position: 'absolute', bottom: 16, left: 20, zIndex: 4,
        display: storyActive ? 'none' : 'block',
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
                <div style={dotsStyle}>
                  {STORY.map((_, i) => (
                    <span key={i} style={{ ...dotStyle, background: i === storyStep ? '#F2D78A' : '#3A2E1E' }} />
                  ))}
                </div>
                {last ? (
                  <button type="button" onClick={endStory} style={navBtn(false)}>
                    {language === 'gd' ? 'Fosgail an saoghal' : 'Explore the map'} →
                  </button>
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

  const fill = (id, source, color) => map.addLayer({
    id, type: 'fill', source, layout: { visibility: 'none' },
    paint: { 'fill-color': color, 'fill-opacity': 0.34 },
  }, firstLabel);
  const line = (id, source, color) => map.addLayer({
    id, type: 'line', source, layout: { visibility: 'none' },
    paint: { 'line-color': color, 'line-width': 1.4, 'line-opacity': 0.85 },
  }, firstLabel);

  fill('scotland-fill', 'scotland', '#2F6FD0');   // saltire blue
  line('scotland-line', 'scotland', '#8FB8F2');
  fill('ireland-fill', 'ireland', '#1A9E5F');      // Irish green
  line('ireland-line', 'ireland', '#6FD8A6');
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

