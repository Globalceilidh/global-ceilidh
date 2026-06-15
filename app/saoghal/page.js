'use client';

// /saoghal — "World." A dark map of Gàidhlig place names across the diaspora.
//
// v1 scope: just the place-name layer. Pins on each documented Gàidhlig-derived
// town/community, click to open a side panel with the Gàidhlig spelling,
// meaning, and the story of why the name travelled. Data lives in ./places.js
// so adding a new place is a one-file edit.
//
// Later layers (living communities, migration routes, clan search, Sruth
// integration, timeline) slot in as additional sources/layers on the same map.

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PLACES } from './places';

// CARTO's dark-matter style: free, no token, looks great with gold accents.
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const COLORS = {
  bg: '#0A0807',
  panelBg: '#16110C',
  pin: '#C9A24A',
  pinRing: '#F2D78A',
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

  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLE,
      center: [-60, 50],          // somewhere over the North Atlantic
      zoom: 2.6,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.on('load', () => setMapReady(true));
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add a marker per place once the map is ready. Each marker is a small gold
  // circle with a soft ring — readable on the dark basemap at any zoom.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const markers = PLACES.map((p) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.setAttribute('aria-label', p.name);
      el.style.cssText = `
        width: 16px; height: 16px; border-radius: 50%;
        background: ${COLORS.pin};
        border: 2px solid ${COLORS.pinRing};
        box-shadow: 0 0 0 3px rgba(201, 162, 74, 0.18), 0 1px 4px rgba(0,0,0,0.5);
        cursor: pointer; padding: 0;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
      `;
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.25)';
        el.style.boxShadow = `0 0 0 5px rgba(201, 162, 74, 0.28), 0 2px 6px rgba(0,0,0,0.6)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = `0 0 0 3px rgba(201, 162, 74, 0.18), 0 1px 4px rgba(0,0,0,0.5)`;
      });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelected(p);
        map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 5), duration: 900 });
      });
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .addTo(map);
      return marker;
    });
    return () => markers.forEach((m) => m.remove());
  }, [mapReady]);

  return (
    <main style={{
      position: 'fixed', inset: 0, background: COLORS.bg, color: COLORS.text,
      overflow: 'hidden',
    }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />

      {/* Top-left masthead */}
      <header style={{
        position: 'absolute', top: 20, left: 20, zIndex: 5,
        padding: '12px 18px',
        background: 'rgba(10, 8, 7, 0.72)',
        border: `1px solid ${COLORS.border}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        maxWidth: 320,
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
          {PLACES.length} place names so far — click any pin to see its Gàidhlig story.
        </p>
      </header>

      {/* Right info panel */}
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
              cursor: 'pointer', fontSize: 18, lineHeight: 1,
              fontFamily: serif,
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
            fontSize: 22, color: COLORS.pin,
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

      {/* Bottom-left credits */}
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
