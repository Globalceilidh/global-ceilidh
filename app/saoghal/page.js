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
import { PLACES } from './places';
import { HEAT_POINTS } from './heat';

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

export default function SaoghalPage() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [mapReady, setMapReady] = useState(false);

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

  // Keyboard shortcuts. `R` or `Home` resets the view. Skipped when the
  // user is typing in a form control (defensive — we don't have inputs on
  // this page today but adding the guard now avoids a future surprise).
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
      addHeatLayer(map);
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

  // Add markers once the map is ready. Each marker is a plain button that we
  // hand to MapLibre untouched (it owns the outer element's transform); the
  // animated bit is a child <span> inside.
  //
  // Pins are zoom-gated: invisible at world view (where the heat layer tells
  // the story), fading in around zoom 4 (when admin-1 boundaries become
  // legible), fully visible by zoom 5 — and still under the basemap's own
  // place-name labels which start appearing at zoom 5–6.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const pairs = [];                // { outer, inner } pairs for visibility/scale updates
    const markers = PLACES.map((p) => {
      const { outer, inner } = buildMarkerElement(p, () => {
        setSelected(p);
        map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 6.5), duration: 900 });
      });
      pairs.push({ outer, inner });
      return new maplibregl.Marker({ element: outer }).setLngLat([p.lng, p.lat]).addTo(map);
    });

    // Pins only earn screen real estate once the basemap is showing cities
    // and towns. CARTO dark-matter labels major cities around zoom 5–6, so
    // we hide until 5.5, fade in 5.5 → 6.5, full at 6.5+. They also grow
    // slightly with zoom so they feel proportional to the closer-in detail
    // (HTML markers stay the same pixel size by default, which makes them
    // feel huge over a continent and tiny over a town — this re-balances).
    function updatePinVisibility() {
      const z = map.getZoom();
      let opacity, scale;
      if (z < 5.5) opacity = 0;
      else if (z > 6.5) opacity = 1;
      else opacity = (z - 5.5) / 1.0;
      if (z < 5.5) scale = 0.7;
      else if (z > 10) scale = 1.3;
      else scale = 0.7 + ((z - 5.5) / 4.5) * 0.6;
      for (const { outer, inner } of pairs) {
        outer.style.opacity = String(opacity);
        outer.style.pointerEvents = opacity > 0.05 ? 'auto' : 'none';
        inner.style.setProperty('--zoom-scale', String(scale));
      }
    }
    updatePinVisibility();
    map.on('zoom', updatePinVisibility);

    return () => {
      map.off('zoom', updatePinVisibility);
      markers.forEach((m) => m.remove());
    };
  }, [mapReady]);

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
          The Gàidhlig World
        </h1>
        <p style={{
          margin: 0, fontFamily: serif, fontSize: 13, lineHeight: 1.5,
          color: COLORS.textMuted,
        }}>
          The gold shows where Gàidhlig lives — brightest in the heartlands,
          fading across the diaspora. Click any cream pin for the story of its
          name.
        </p>
      </header>

      <button
        type="button"
        onClick={flyHome}
        aria-label="Reset view (R)"
        title="Reset view (R)"
        style={{
          position: 'absolute', top: 20, right: 20, zIndex: 5,
          display: 'flex', alignItems: 'center', gap: 8,
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
        Reset view
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
            aria-label="Close"
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
              Unverified — help us confirm
            </div>
          )}

          <Section label="Meaning" body={selected.meaning} />
          <Section label="Why it received the name" body={selected.why_named} />
          {selected.founded && <Section label="Founded" body={selected.founded} />}
        </aside>
      )}

      <footer style={{
        position: 'absolute', bottom: 16, left: 20, zIndex: 4,
        fontFamily: mono, fontSize: 9, letterSpacing: '1.5px',
        color: COLORS.textMuted, textTransform: 'uppercase',
      }}>
        Tìr nan Gàidheal · Everywhere
      </footer>
    </main>
  );
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
          0, 18,
          2, 40,
          4, 70,
          7, 140,
          10, 240,
        ],
        // Transparent → deep amber → bright gold.
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0,   'rgba(0,0,0,0)',
          0.1, 'rgba(107, 78, 31, 0.35)',
          0.3, 'rgba(170, 122, 50, 0.55)',
          0.55, 'rgba(201, 162, 74, 0.75)',
          0.85, 'rgba(242, 215, 138, 0.85)',
          1.0, 'rgba(255, 235, 175, 0.92)',
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

// Build the DOM element for one map pin.
//
// MapLibre owns the OUTER button's `transform` style for positioning (that's
// the lesson from the original teleport bug). So we only set opacity on the
// outer element, and do all scale/hover animation on an INNER span via CSS
// custom properties: --zoom-scale composes with --hover-scale so the two
// effects multiply cleanly instead of clobbering each other.
function buildMarkerElement(place, onClick) {
  const outer = document.createElement('button');
  outer.type = 'button';
  outer.setAttribute('aria-label', place.name);
  outer.style.cssText = `
    width: 14px; height: 14px; padding: 0;
    background: transparent; border: 0; cursor: pointer;
    display: block;
    opacity: 0; pointer-events: none;
    transition: opacity 0.25s ease;
  `;

  const inner = document.createElement('span');
  inner.style.cssText = `
    display: block; width: 9px; height: 9px; margin: 2.5px;
    border-radius: 50%;
    background: ${COLORS.pin};
    border: 1px solid ${COLORS.pinRing};
    box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.10), 0 1px 3px ${COLORS.pinShadow};
    --zoom-scale: 1;
    --hover-scale: 1;
    transform: scale(calc(var(--zoom-scale) * var(--hover-scale)));
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    transform-origin: center;
  `;
  outer.appendChild(inner);

  outer.addEventListener('mouseenter', () => {
    inner.style.setProperty('--hover-scale', '1.5');
    inner.style.boxShadow = `0 0 0 3px rgba(255, 255, 255, 0.22), 0 2px 5px ${COLORS.pinShadow}`;
  });
  outer.addEventListener('mouseleave', () => {
    inner.style.setProperty('--hover-scale', '1');
    inner.style.boxShadow = `0 0 0 1.5px rgba(255, 255, 255, 0.10), 0 1px 3px ${COLORS.pinShadow}`;
  });
  outer.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return { outer, inner };
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
