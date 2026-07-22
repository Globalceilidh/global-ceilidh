'use client';

// app/duilleag/PersonalGlobe.js
// The personal globe at the head of the right column.
//
// The rule that makes this yours rather than a widget: it is ALWAYS
// centred on where you said you are, and your pin is ALWAYS drawn —
// whether or not you let anyone else see it. `location_public` gates
// your dot on OTHER people's globes and on /saoghal, never on your own.
// You should be able to see yourself on the world even if the world
// can't see you.

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useLanguage } from '../../context/LanguageContext';

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Where the globe sits when someone hasn't given a location yet: the
// North Atlantic, so Scotland and the Cape Breton diaspora are both in
// frame and the thing still looks deliberate rather than broken.
const FALLBACK_CENTER = [-30, 50];
const FALLBACK_ZOOM = 1.1;
const LOCATED_ZOOM = 2.6;

export default function PersonalGlobe({ profile }) {
  const { language } = useLanguage();
  const gd = language === 'gd';
  const container = useRef(null);
  const mapRef = useRef(null);
  const [failed, setFailed] = useState(false);

  const hasLocation = Number.isFinite(profile.lat) && Number.isFinite(profile.lng);

  useEffect(() => {
    if (mapRef.current || !container.current) return;

    let map;
    try {
      map = new maplibregl.Map({
        container: container.current,
        style: BASEMAP_STYLE,
        projection: 'globe',
        center: hasLocation ? [profile.lng, profile.lat] : FALLBACK_CENTER,
        zoom: hasLocation ? LOCATED_ZOOM : FALLBACK_ZOOM,
        attributionControl: false,
        // A card, not a map surface: no zooming, no pitch. Drag still
        // spins the globe, which is the one interaction worth having.
        scrollZoom: false,
        doubleClickZoom: false,
        touchZoomRotate: false,
        keyboard: false,
      });
    } catch (e) {
      console.warn('Personal globe failed to init:', e);
      setFailed(true);
      return;
    }
    mapRef.current = map;

    // Passing `projection: 'globe'` to the constructor isn't reliable —
    // the basemap style.json can declare its own projection and win.
    // Same landmine as /saoghal; same fix.
    map.on('style.load', () => {
      try { map.setProjection({ type: 'globe' }); } catch (e) {
        console.warn('globe projection unsupported:', e);
      }
    });

    if (hasLocation) {
      const el = document.createElement('div');
      el.style.cssText =
        'width:12px;height:12px;border-radius:50%;background:#C9A047;' +
        'box-shadow:0 0 0 3px rgba(201,160,71,0.28),0 0 14px 3px rgba(201,160,71,0.55);';
      new maplibregl.Marker({ element: el })
        .setLngLat([profile.lng, profile.lat])
        .addTo(map);
    }

    return () => { map.remove(); mapRef.current = null; };
  }, [hasLocation, profile.lat, profile.lng]);

  return (
    <div style={s.wrap}>
      {failed
        ? <div style={s.fallback}>{gd ? 'Chan urrainn an cruinne a shealltainn' : 'Globe unavailable'}</div>
        : <div ref={container} style={s.map} />}

      <div style={s.caption}>
        {hasLocation ? (
          <>
            <span style={s.place}>{profile.region || (gd ? 'An t-àite agad' : 'Your location')}</span>
            <span style={s.privacy}>
              {profile.locationPublic
                ? (gd ? 'Ri fhaicinn le càch' : 'Visible to others')
                : (gd ? 'Falaichte bho chàch' : 'Hidden from others')}
            </span>
          </>
        ) : (
          <a href="/welcome" style={s.setLocation}>
            {gd ? 'Cuir an t-àite agad ris →' : 'Add your location →'}
          </a>
        )}
      </div>
    </div>
  );
}

const SANS = '"IBM Plex Sans", system-ui, sans-serif';

const s = {
  wrap: {
    background: 'rgba(10,18,14,0.46)',
    backdropFilter: 'blur(16px) saturate(120%)',
    WebkitBackdropFilter: 'blur(16px) saturate(120%)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 14,
    overflow: 'hidden',
    flexShrink: 0,
  },
  map: { width: '100%', aspectRatio: '1 / 1', background: '#050B08' },
  fallback: {
    width: '100%', aspectRatio: '1 / 1', display: 'flex',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    padding: 16, fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.45)',
  },
  caption: {
    display: 'flex', flexDirection: 'column', gap: 2,
    padding: '10px 13px 12px', borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  place: {
    fontFamily: '"Fraunces", "EB Garamond", Georgia, serif', fontStyle: 'italic',
    fontWeight: 700, fontSize: 14, color: '#FFFFFF',
  },
  privacy: {
    fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
    letterSpacing: 0.3, color: 'rgba(255,255,255,0.44)',
  },
  setLocation: {
    fontFamily: SANS, fontSize: 13, color: '#C9A047', textDecoration: 'none',
  },
};
