'use client';

// /saoghal — "An Saoghal." The hub of the Gàidhlig world: a member's
// destination for exploring it, sitting alongside /radio and /AnTonn.
//
// This used to BE the origins cinematic; that has moved to its own page in
// the Archives at /saoghal/archives/Gael_1, because a welcome step-through
// and a place you return to to "investigate the world further" are two
// different jobs. Here you get the free-explore globe — heat over the
// Gaelic-speaking world, a pin on every documented Gàidhlig place-name —
// and a door into the Archives (Tasglann), the growing library of
// step-throughs and films. New cinematics land there, not here.

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { HEAT_POINTS } from './heat';
import { PLACES } from './places';
import { useLanguage } from '../../context/LanguageContext';
import LanguagePill from '../../components/LanguagePill';
import { LIVE_STORIES, storyHref } from './stories';

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Opening frame — also the target of the reset button. Wide enough that
// Scotland and the Cape Breton diaspora are both in the North Atlantic view.
const HOME_CENTER = [-40, 45];
const HOME_ZOOM = 1.5;

const GOLD = '#C9A047';
const SANS = '"IBM Plex Sans", system-ui, sans-serif';
const SERIF = '"Fraunces", "EB Garamond", Georgia, serif';
const MONO = '"IBM Plex Mono", Menlo, Consolas, monospace';
const BEBAS = 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif';

export default function SaoghalHub() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [archivesOpen, setArchivesOpen] = useState(false);
  const { language } = useLanguage();
  const gd = language === 'gd';

  // Build the globe once.
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    let map;
    try {
      map = new maplibregl.Map({
        container: mapContainer.current,
        style: BASEMAP_STYLE,
        projection: 'globe',
        center: HOME_CENTER,
        zoom: HOME_ZOOM,
        attributionControl: false,
      });
    } catch (e) {
      console.warn('[saoghal] map init failed:', e);
      return;
    }
    mapRef.current = map;

    // The style.json can declare its own projection and win, so re-assert
    // globe once it has loaded — same landmine as the cinematic.
    map.on('style.load', () => {
      try { map.setProjection({ type: 'globe' }); } catch { /* unsupported */ }
    });

    map.on('load', () => {
      addHeatLayer(map);
      addPlacesLayer(map);

      // Click a pin → open its story in the side panel.
      map.on('click', 'places-pins', (e) => {
        const id = e.features?.[0]?.properties?.id;
        const place = PLACES.find((p) => p.id === id);
        if (place) setSelected(place);
      });
      map.on('mouseenter', 'places-pins', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'places-pins', () => { map.getCanvas().style.cursor = ''; });
    });

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  const flyHome = useCallback(() => {
    setSelected(null);
    mapRef.current?.flyTo({ center: HOME_CENTER, zoom: HOME_ZOOM, bearing: 0, pitch: 0, duration: 1200, essential: true });
  }, []);

  const zoomBy = (d) => {
    const map = mapRef.current;
    if (map) map.easeTo({ zoom: map.getZoom() + d, duration: 260 });
  };

  return (
    <main style={styles.root}>
      <div ref={mapContainer} style={styles.map} />

      <LanguagePill position="top-right" variant="white" />

      {/* ── Masthead ──────────────────────────────────────────────── */}
      <header style={styles.masthead}>
        <p style={styles.eyebrow}>{gd ? 'An Saoghal Gàidhealach' : 'The Gaelic World'}</p>
        <h1 style={styles.title}>An Saoghal</h1>
        <p style={styles.tagline}>
          {gd
            ? 'Cruinne nan Gàidheal — lorg na h-àiteachan a ghiùlain an cànan.'
            : 'The world of the Gael — find the places that carried the language.'}
        </p>
      </header>

      {/* ── Map controls ──────────────────────────────────────────── */}
      <div style={styles.controls}>
        <button style={styles.ctrl} onClick={() => zoomBy(1)} aria-label={gd ? 'Sùm a-steach' : 'Zoom in'}>+</button>
        <button style={styles.ctrl} onClick={() => zoomBy(-1)} aria-label={gd ? 'Sùm a-mach' : 'Zoom out'}>−</button>
        <button style={{ ...styles.ctrl, ...styles.ctrlHome }} onClick={flyHome} aria-label={gd ? 'Air ais don t-saoghal' : 'Reset view'}>⌂</button>
      </div>

      {/* ── Archives door ─────────────────────────────────────────── */}
      <div style={styles.archives}>
        <button style={styles.archivesToggle} onClick={() => setArchivesOpen((o) => !o)}>
          <span style={styles.archivesIcon} aria-hidden="true">❧</span>
          <span style={styles.archivesLabel}>{gd ? 'Tasglann' : 'The Archives'}</span>
          <span style={styles.archivesCaret} aria-hidden="true">{archivesOpen ? '▾' : '▸'}</span>
        </button>
        {archivesOpen && (
          <div style={styles.archivesBody}>
            <p style={styles.archivesLead}>
              {gd ? 'Sgeulachdan air an innse thairis air a’ chruinne.' : 'Stories told across the globe.'}
            </p>
            {LIVE_STORIES.map((story) => (
              <a key={story.id} href={storyHref(story)} style={styles.archLink}>
                <span style={styles.archTitle}>{gd ? story.title.gd : story.title.en}</span>
                <span style={styles.archEra}>{gd ? story.era.gd : story.era.en}</span>
              </a>
            ))}
            <a href="/saoghal/archives" style={styles.archAll}>
              {gd ? 'A h-uile gin →' : 'See all →'}
            </a>
          </div>
        )}
      </div>

      {/* ── Selected place ────────────────────────────────────────── */}
      {selected && (
        <aside style={styles.panel}>
          <button style={styles.panelClose} onClick={() => setSelected(null)} aria-label={gd ? 'Dùin' : 'Close'}>×</button>
          <p style={styles.panelGaidhlig}>{selected.gaidhlig}</p>
          <h2 style={styles.panelName}>{selected.name}</h2>
          <p style={styles.panelRegion}>{selected.region}{selected.founded ? ` · ${selected.founded}` : ''}</p>
          {selected.meaning && (
            <p style={styles.panelBlock}><span style={styles.panelKey}>{gd ? 'Brìgh' : 'Meaning'}</span>{selected.meaning}</p>
          )}
          {selected.why_named && (
            <p style={styles.panelBlock}><span style={styles.panelKey}>{gd ? 'Carson' : 'Why the name'}</span>{selected.why_named}</p>
          )}
          {!selected.verified && (
            <p style={styles.unverified}>{gd ? 'Gun dearbhadh fhathast' : 'Unverified — help us confirm'}</p>
          )}
        </aside>
      )}
    </main>
  );
}

// ── Map layers (self-contained; mirror the cinematic's builders) ────────

function addHeatLayer(map) {
  const features = HEAT_POINTS.map((p) => ({
    type: 'Feature',
    properties: { weight: p.weight, name: p.name },
    geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
  }));
  map.addSource('gaidhlig-heat', { type: 'geojson', data: { type: 'FeatureCollection', features } });

  const layers = map.getStyle().layers || [];
  const firstLabel = layers.find((l) => /label|place|country/i.test(l.id))?.id;

  map.addLayer(
    {
      id: 'gaidhlig-heat-layer',
      type: 'heatmap',
      source: 'gaidhlig-heat',
      maxzoom: 11,
      paint: {
        'heatmap-weight': ['get', 'weight'],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1.0, 5, 1.4, 9, 2.0],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 22, 2, 45, 4, 75, 7, 140, 10, 230],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.1, 'rgba(107, 78, 31, 0.32)',
          0.3, 'rgba(170, 122, 50, 0.50)',
          0.55, 'rgba(201, 162, 74, 0.62)',
          0.85, 'rgba(225, 185, 105, 0.70)',
          1.0, 'rgba(235, 200, 130, 0.78)',
        ],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0.85, 9, 0.55, 11, 0],
      },
    },
    firstLabel
  );
}

function addPlacesLayer(map) {
  const features = PLACES.map((p) => ({
    type: 'Feature',
    properties: { id: p.id, name: p.name },
    geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
  }));
  map.addSource('places', { type: 'geojson', data: { type: 'FeatureCollection', features }, promoteId: 'id' });

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
      'circle-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 6, 1],
      'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 6, 1],
    },
  });
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
      'text-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0, 7, 1],
    },
  });
}

// ── styles ──────────────────────────────────────────────────────────────

const glass = {
  background: 'rgba(10,10,7,0.62)',
  backdropFilter: 'blur(14px) saturate(130%)',
  WebkitBackdropFilter: 'blur(14px) saturate(130%)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14,
};

const styles = {
  root: { position: 'fixed', inset: 0, background: '#0A0807', overflow: 'hidden' },
  map: { position: 'absolute', inset: 0 },

  masthead: { position: 'absolute', top: 22, left: 22, zIndex: 10, maxWidth: 'min(78vw, 460px)', pointerEvents: 'none' },
  eyebrow: { fontFamily: MONO, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: GOLD, margin: 0 },
  title: {
    fontFamily: BEBAS, fontSize: 'clamp(40px, 8vw, 84px)', letterSpacing: '0.04em',
    color: '#F2ECDC', margin: '2px 0 0', lineHeight: 0.95, textShadow: '0 2px 30px rgba(0,0,0,0.7)',
  },
  tagline: {
    fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(14px, 2.4vw, 18px)',
    color: 'rgba(242,236,220,0.82)', margin: '8px 0 0', textShadow: '0 1px 16px rgba(0,0,0,0.8)',
  },

  controls: { position: 'absolute', right: 16, bottom: 20, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 7 },
  ctrl: {
    width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 9, cursor: 'pointer', ...glass, color: '#F2ECDC', fontSize: 20, lineHeight: 1, fontFamily: SANS,
  },
  ctrlHome: { color: GOLD, fontSize: 18, marginTop: 2 },

  archives: { position: 'absolute', left: 22, bottom: 20, zIndex: 10, width: 'min(86vw, 300px)' },
  archivesToggle: {
    ...glass, width: '100%', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
    padding: '11px 15px', borderRadius: 999, color: '#F2ECDC',
  },
  archivesIcon: { color: GOLD, fontSize: 16 },
  archivesLabel: { fontFamily: BEBAS, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase' },
  archivesCaret: { marginLeft: 'auto', fontSize: 12, color: 'rgba(242,236,220,0.6)' },
  archivesBody: { ...glass, marginTop: 8, padding: '12px 15px 14px', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 4 },
  archivesLead: { fontFamily: SANS, fontSize: 12.5, color: 'rgba(242,236,220,0.6)', margin: '0 0 6px' },
  archLink: { display: 'flex', flexDirection: 'column', gap: 1, padding: '8px 10px', borderRadius: 9, textDecoration: 'none', background: 'rgba(255,255,255,0.04)' },
  archTitle: { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 15, color: '#F2ECDC' },
  archEra: { fontFamily: MONO, fontSize: 10.5, color: 'rgba(242,236,220,0.5)' },
  archAll: { fontFamily: SANS, fontSize: 12.5, color: GOLD, textDecoration: 'none', padding: '6px 10px 2px' },

  panel: {
    position: 'absolute', top: 0, right: 0, bottom: 0, zIndex: 15,
    width: 'min(92vw, 380px)', padding: '58px 26px 30px', boxSizing: 'border-box',
    overflowY: 'auto', ...glass, borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderRight: 'none',
  },
  panelClose: {
    position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(0,0,0,0.3)', color: '#F2ECDC',
    fontSize: 18, lineHeight: 1, cursor: 'pointer',
  },
  panelGaidhlig: { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: GOLD, margin: 0 },
  panelName: { fontFamily: BEBAS, fontSize: 34, letterSpacing: '0.03em', color: '#F2ECDC', margin: '4px 0 0' },
  panelRegion: { fontFamily: MONO, fontSize: 12, color: 'rgba(242,236,220,0.6)', margin: '4px 0 18px' },
  panelBlock: { fontFamily: SANS, fontSize: 14.5, lineHeight: 1.65, color: 'rgba(242,236,220,0.9)', margin: '0 0 14px' },
  panelKey: { display: 'block', fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: GOLD, marginBottom: 3 },
  unverified: {
    fontFamily: SANS, fontSize: 12, color: '#D9B36B', margin: '4px 0 0',
    padding: '8px 11px', borderRadius: 8, background: 'rgba(217,179,107,0.1)', border: '1px solid rgba(217,179,107,0.25)',
  },
};
