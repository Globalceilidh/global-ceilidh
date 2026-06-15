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

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PLACES } from './places';
import { HEAT_POINTS } from './heat';

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

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

  // Initialise the map once on mount.
  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLE,
      center: [-30, 50],          // North Atlantic — Scotland + Cape Breton in view
      zoom: 2.3,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.on('load', () => {
      addHeatLayer(map);
      setMapReady(true);
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add markers once the map is ready. Each marker is a plain button that we
  // hand to MapLibre untouched (it owns the outer element's transform); the
  // animated bit is a child <span> inside.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const markers = PLACES.map((p) => {
      const el = buildMarkerElement(p, () => {
        setSelected(p);
        map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 5), duration: 900 });
      });
      return new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
    });
    return () => markers.forEach((m) => m.remove());
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

// Build the DOM element for one map pin. The OUTER button is what MapLibre
// positions (so its `transform` style is left alone). All hover animation
// happens on the INNER span. This is the fix for the "pins fly to (0,0) on
// hover" bug — see file header.
function buildMarkerElement(place, onClick) {
  const el = document.createElement('button');
  el.type = 'button';
  el.setAttribute('aria-label', place.name);
  el.style.cssText = `
    width: 18px; height: 18px; padding: 0;
    background: transparent; border: 0; cursor: pointer;
    display: block;
  `;

  const inner = document.createElement('span');
  inner.style.cssText = `
    display: block; width: 14px; height: 14px; margin: 2px;
    border-radius: 50%;
    background: ${COLORS.pin};
    border: 2px solid ${COLORS.pinRing};
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18), 0 1px 4px ${COLORS.pinShadow};
    transition: transform 0.12s ease, box-shadow 0.12s ease;
    transform-origin: center;
  `;
  el.appendChild(inner);

  el.addEventListener('mouseenter', () => {
    inner.style.transform = 'scale(1.4)';
    inner.style.boxShadow = `0 0 0 5px rgba(255, 255, 255, 0.28), 0 2px 6px ${COLORS.pinShadow}`;
  });
  el.addEventListener('mouseleave', () => {
    inner.style.transform = 'scale(1)';
    inner.style.boxShadow = `0 0 0 3px rgba(255, 255, 255, 0.18), 0 1px 4px ${COLORS.pinShadow}`;
  });
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
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
