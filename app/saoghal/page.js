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
      addHeatLayer(map);
      addPlacesLayer(map);
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
          The Gàidhlig World
        </h1>
        <p style={{
          margin: 0, fontFamily: serif, fontSize: 13, lineHeight: 1.5,
          color: COLORS.textMuted,
        }}>
          The gold shows where Gàidhlig lives — brightest in the heartlands,
          fading across the diaspora. Zoom in for the named places.
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
    console.log('[saoghal] places-pins layer added. Layer ids on map:',
      map.getStyle().layers.map((l) => l.id));
  } catch (e) {
    console.error('[saoghal] FAILED to add places layer:', e);
  }
}

