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
//
// It also has to be able to SET a location, because nothing else in the
// codebase could: onboarding stored `region` as free text and never a
// coordinate, so every globe had nothing to centre on. Type a place,
// /api/profile/location geocodes it, and the pin lands.

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useLanguage } from '../../context/LanguageContext';

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// No location yet: the North Atlantic, so Scotland and the Cape Breton
// diaspora are both in frame and it reads as deliberate, not broken.
const FALLBACK_CENTER = [-30, 50];
const FALLBACK_ZOOM = 0.35;
const LOCATED_ZOOM = 2.2;

export default function PersonalGlobe({ profile }) {
  const { language } = useLanguage();
  const gd = language === 'gd';
  const container = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const memberMarkersRef = useRef([]);
  const feisMarkersRef = useRef([]);

  const [loc, setLoc] = useState({
    region: profile.region,
    lat: profile.lat,
    lng: profile.lng,
    locationPublic: profile.locationPublic,
  });
  const [members, setMembers] = useState([]);
  const [feisean, setFeisean] = useState([]);
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [failed, setFailed] = useState(false);

  const hasLocation = Number.isFinite(loc.lat) && Number.isFinite(loc.lng);

  // Build the map once.
  useEffect(() => {
    if (mapRef.current || !container.current) return;
    let map;
    try {
      map = new maplibregl.Map({
        container: container.current,
        style: BASEMAP_STYLE,
        projection: 'globe',
        center: FALLBACK_CENTER,
        zoom: FALLBACK_ZOOM,
        attributionControl: false,
        // Zoom via the on-card buttons, double-tap and pinch — but NOT the
        // wheel. Wheel-zoom would trap the mouse over the map and stop the
        // connections column scrolling past it, which is the more common
        // thing you want to do here. Pitch stays off; this is a globe, not
        // a terrain view.
        scrollZoom: false,
        doubleClickZoom: true,
        touchZoomRotate: true,
        touchPitch: false,
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

    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);

  // Centre and pin follow the location, so setting one updates in place
  // rather than needing the map torn down and rebuilt.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasLocation) return;

    const place = () => {
      map.flyTo({ center: [loc.lng, loc.lat], zoom: LOCATED_ZOOM, duration: 1400 });
      if (markerRef.current) markerRef.current.remove();
      const el = document.createElement('div');
      el.setAttribute('title', gd ? 'Tha thu an seo' : 'You are here');
      el.style.cssText =
        'width:13px;height:13px;border-radius:50%;background:#E01B24;' +
        'border:2px solid rgba(255,255,255,0.92);' +
        'box-shadow:0 0 0 4px rgba(224,27,36,0.26),0 0 16px 4px rgba(224,27,36,0.55);';
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map);
    };

    if (map.isStyleLoaded()) place();
    else map.once('load', place);
  }, [hasLocation, loc.lat, loc.lng, gd]);

  // Other members who chose to be on the map. This is the other half of
  // `location_public`: your dot shows on their globe, theirs on yours.
  useEffect(() => {
    let alive = true;
    fetch('/api/map/members')
      .then((r) => r.json())
      .then((j) => { if (alive && j.ok) setMembers(j.members || []); })
      .catch(() => {}); // a globe with only your own pin is a fine failure mode
    return () => { alive = false; };
  }, []);

  // Draw the member dots — smaller and gold, so they read as "other people"
  // next to your red "you are here". Title shows on hover.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const draw = () => {
      memberMarkersRef.current.forEach((mk) => mk.remove());
      memberMarkersRef.current = [];
      for (const m of members) {
        if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) continue;
        const el = document.createElement('div');
        el.setAttribute('title', m.region ? `${m.displayName} · ${m.region}` : m.displayName);
        el.style.cssText =
          'width:9px;height:9px;border-radius:50%;background:#E9C879;' +
          'border:1.5px solid rgba(255,255,255,0.85);cursor:pointer;' +
          'box-shadow:0 0 8px 2px rgba(233,200,121,0.45);';
        memberMarkersRef.current.push(
          new maplibregl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map)
        );
      }
    };
    if (map.isStyleLoaded()) draw();
    else map.once('load', draw);
    return () => {
      memberMarkersRef.current.forEach((mk) => mk.remove());
      memberMarkersRef.current = [];
    };
  }, [members]);

  // Fèisean & Highland Games — the same public list as /feisean, geocoded.
  // These show on everyone's globe (not gated on location_public — they're
  // public events, not people).
  useEffect(() => {
    let alive = true;
    fetch('/api/map/feisean')
      .then((r) => r.json())
      .then((j) => { if (alive && j.ok) setFeisean(j.feisean || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Draw the fèis pins in blue — distinct from the red "you are here" and the
  // gold member dots. Title on hover shows the game, place and dates.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const draw = () => {
      feisMarkersRef.current.forEach((mk) => mk.remove());
      feisMarkersRef.current = [];
      for (const f of feisean) {
        if (!Number.isFinite(f.lat) || !Number.isFinite(f.lng)) continue;
        const where = [f.city, f.state].filter(Boolean).join(', ');
        const title = [f.name, where, f.dateDisplay].filter(Boolean).join(' · ');
        // A real anchor, exactly like the /feisean card: clicking opens the
        // game's own website in a new tab. More reliable than window.open
        // (no popup-blocker) and it's the same semantics as the card.
        const el = document.createElement(f.website ? 'a' : 'div');
        el.setAttribute('title', title);
        if (f.website) {
          el.href = f.website;
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
        }
        el.style.cssText =
          'display:block;width:10px;height:10px;border-radius:50%;background:#3B82F6;' +
          'border:1.5px solid rgba(255,255,255,0.9);cursor:pointer;' +
          'box-shadow:0 0 9px 2px rgba(59,130,246,0.5);';
        feisMarkersRef.current.push(
          new maplibregl.Marker({ element: el }).setLngLat([f.lng, f.lat]).addTo(map)
        );
      }
    };
    if (map.isStyleLoaded()) draw();
    else map.once('load', draw);
    return () => {
      feisMarkersRef.current.forEach((mk) => mk.remove());
      feisMarkersRef.current = [];
    };
  }, [feisean]);

  // Snap back to your pin. This is the whole point of a *personal* globe:
  // after spinning or zooming off somewhere, one tap returns you to where
  // you said you are, at the zoom the card was born at.
  function recenter() {
    const map = mapRef.current;
    if (!map || !hasLocation) return;
    map.flyTo({ center: [loc.lng, loc.lat], zoom: LOCATED_ZOOM, duration: 900 });
  }

  const zoomBy = (delta) => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ zoom: map.getZoom() + delta, duration: 260 });
  };

  async function save() {
    if (!query.trim() || busy) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/profile/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.reason || (gd ? 'Cha do lorg sinn sin.' : 'Couldn’t find that.'));
        return;
      }
      setLoc(json.location);
      setEditing(false);
      setQuery('');
    } catch {
      setError(gd ? 'Cha do dh’obraich sin.' : 'That didn’t work.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisibility() {
    const next = !loc.locationPublic;
    setLoc((l) => ({ ...l, locationPublic: next }));
    try {
      await fetch('/api/profile/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_public: next }),
      });
    } catch {
      setLoc((l) => ({ ...l, locationPublic: !next })); // put it back
    }
  }

  return (
    <div style={s.wrap}>
      {failed
        ? <div style={s.fallback}>{gd ? 'Chan urrainn an cruinne a shealltainn' : 'Globe unavailable'}</div>
        : (
          <div style={s.mapWrap}>
            <div ref={container} style={s.map} />
            <div style={s.controls} data-no-drag>
              <button style={s.ctrl} onClick={() => zoomBy(1)} aria-label={gd ? 'Sùm a-steach' : 'Zoom in'} title={gd ? 'Sùm a-steach' : 'Zoom in'}>+</button>
              <button style={s.ctrl} onClick={() => zoomBy(-1)} aria-label={gd ? 'Sùm a-mach' : 'Zoom out'} title={gd ? 'Sùm a-mach' : 'Zoom out'}>−</button>
              {hasLocation && (
                <button style={{ ...s.ctrl, ...s.ctrlReset }} onClick={recenter} aria-label={gd ? 'Air ais thugad fhèin' : 'Recentre on you'} title={gd ? 'Air ais thugad fhèin' : 'Recentre on you'}>⌖</button>
              )}
            </div>
          </div>
        )}

      <div style={s.caption}>
        {editing || !hasLocation ? (
          <>
            <input
              autoFocus={editing}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
              placeholder={gd ? 'Càit a bheil thu?' : 'Where are you?'}
              style={s.input}
            />
            <div style={s.editRow}>
              <button style={s.save} onClick={save} disabled={!query.trim() || busy}>
                {busy ? '…' : (gd ? 'Cuir ann' : 'Set')}
              </button>
              {hasLocation && (
                <button style={s.cancel} onClick={() => { setEditing(false); setError(null); }}>
                  {gd ? 'Sguir dheth' : 'Cancel'}
                </button>
              )}
            </div>
            {error && <span style={s.error}>{error}</span>}
          </>
        ) : (
          <>
            <button style={s.place} onClick={() => setEditing(true)} title={gd ? 'Atharraich' : 'Change'}>
              {loc.region || (gd ? 'An t-àite agad' : 'Your location')}
            </button>
            <button style={s.privacy} onClick={toggleVisibility}>
              {loc.locationPublic
                ? (gd ? 'Ri fhaicinn le càch' : 'Visible to others')
                : (gd ? 'Falaichte bho chàch' : 'Hidden from others')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const SANS = '"IBM Plex Sans", system-ui, sans-serif';

const s = {
  wrap: {
    background: 'rgba(12,20,16,0.30)',
    backdropFilter: 'blur(22px) saturate(135%)',
    WebkitBackdropFilter: 'blur(22px) saturate(135%)',
    border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: 14,
    boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  mapWrap: { position: 'relative' },
  // Was a full square — at column width that made the globe the biggest
  // thing on the page. A 3:2 letterbox keeps the sphere legible while
  // giving the connections list the room it actually needs.
  map: { width: '100%', aspectRatio: '3 / 2', maxHeight: 190, background: '#050B08' },
  controls: {
    position: 'absolute', top: 7, right: 7, zIndex: 2,
    display: 'flex', flexDirection: 'column', gap: 5,
  },
  ctrl: {
    width: 24, height: 24, padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 6, cursor: 'pointer',
    background: 'rgba(8,16,12,0.62)', border: '1px solid rgba(255,255,255,0.16)',
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 1,
    fontFamily: SANS,
  },
  ctrlReset: { color: '#E9C879', fontSize: 14, marginTop: 2 },
  fallback: {
    width: '100%', aspectRatio: '3 / 2', display: 'flex',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    padding: 16, fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.45)',
  },
  caption: {
    display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start',
    padding: '10px 13px 12px', borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  place: {
    background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
    fontFamily: '"Fraunces", "EB Garamond", Georgia, serif', fontStyle: 'italic',
    fontWeight: 700, fontSize: 14, color: '#FFFFFF',
  },
  privacy: {
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
    letterSpacing: 0.3, color: 'rgba(255,255,255,0.44)',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(0,0,0,0.26)', border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8, padding: '7px 9px', color: '#FFFFFF',
    fontFamily: SANS, fontSize: 13,
  },
  editRow: { display: 'flex', gap: 7, alignItems: 'center' },
  save: {
    background: '#C9A047', border: 'none', borderRadius: 999, padding: '4px 13px',
    fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#1A1206', cursor: 'pointer',
  },
  cancel: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.5)',
  },
  error: { fontFamily: SANS, fontSize: 11.5, color: '#E88' },
};
