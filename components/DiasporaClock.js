'use client';

// DiasporaClock — the "where am I in the Gàidhlig world" orientation panel.
// Five fixed cultural anchors + the viewer. Each anchor row shows local time,
// a ● day / ☾ night glyph, and the great-circle distance + 8-way bearing from
// the viewer. The viewer's own row is gold and shows their coordinate.
//
// Lifted out of /AnTonn/marble so /saoghal (the globe) and the marble share
// one copy. `user` defaults to Brewerton, NY (Whitey, for testing); in
// production pass the signed-in user's gc_profiles location.

import { useState, useEffect } from 'react';

const DEFAULT_ANCHORS = [
  { name: 'Stornoway', region: 'Scotland',    tz: 'Europe/London',       lat: 58.2090, lng:  -6.3890 },
  { name: 'Halifax',   region: 'Nova Scotia', tz: 'America/Halifax',     lat: 44.6488, lng: -63.5752 },
  { name: 'Perth',     region: 'NY',          tz: 'America/New_York',    lat: 43.0009, lng: -74.1746 },
  { name: 'Seattle',   region: 'Washington',  tz: 'America/Los_Angeles', lat: 47.6062, lng:-122.3321 },
];

const DEFAULT_USER = {
  name: 'YOU', region: 'Brewerton, NY', tz: 'America/New_York', lat: 43.2384, lng: -76.1400,
};

const EARTH_MI = 3958.8;
const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const toRad = (d) => d * Math.PI / 180;

function greatCircleMiles(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_MI * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingCardinal(lat1, lng1, lat2, lng2) {
  const φ1 = toRad(lat1), φ2 = toRad(lat2), Δλ = toRad(lng2 - lng1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const deg = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return CARDINALS[Math.round(deg / 45) % 8];
}

function formatMiles(mi) {
  return mi >= 1000
    ? mi.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : Math.round(mi).toString();
}
function formatCoord(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}  ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}
function formatCity(tz, now) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'shortOffset',
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === 'hour').value);
  const minute = parts.find((p) => p.type === 'minute').value;
  const hhmm = `${String(hour).padStart(2, '0')}:${minute}`;
  let offset = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT';
  offset = offset.replace('GMT+0', 'GMT+').replace(/^UTC/, 'GMT');
  return { hhmm, offset, isDay: hour >= 6 && hour < 18 };
}

// onSelect(anchorOrUser) — optional; lets a host page fly the globe to a row.
export default function DiasporaClock({ user = DEFAULT_USER, anchors = DEFAULT_ANCHORS, onSelect }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto auto',
      columnGap: 14, rowGap: 3,
      fontFamily: 'var(--font-ibm-plex-mono), "IBM Plex Mono", Menlo, monospace',
      fontSize: 10, letterSpacing: 1,
      color: 'rgba(242,236,220,0.82)', lineHeight: 1.4,
    }}>
      {anchors.map((c) => {
        const { hhmm, offset, isDay } = formatCity(c.tz, now);
        const miles = greatCircleMiles(user.lat, user.lng, c.lat, c.lng);
        const dir = bearingCardinal(user.lat, user.lng, c.lat, c.lng);
        return (
          <ClockRow key={c.name} city={c.name} region={c.region} hhmm={hhmm} offset={offset}
            isDay={isDay} trailing={`${formatMiles(miles)} mi ${dir}`}
            onSelect={onSelect ? () => onSelect(c) : undefined} />
        );
      })}
      {(() => {
        const { hhmm, offset, isDay } = formatCity(user.tz, now);
        return (
          <ClockRow key="you" city={user.name} region={user.region} hhmm={hhmm} offset={offset}
            isDay={isDay} trailing={formatCoord(user.lat, user.lng)} isUser
            onSelect={onSelect ? () => onSelect(user) : undefined} />
        );
      })()}
    </div>
  );
}

function ClockRow({ city, region, hhmm, offset, isDay, trailing, isUser, onSelect }) {
  const dim = { color: 'rgba(242,236,220,0.42)' };
  const goldName = { color: '#C9A047', textTransform: 'uppercase' };
  const plainName = { color: 'rgba(242,236,220,0.82)', textTransform: 'uppercase' };
  const clickable = onSelect ? { cursor: 'pointer' } : {};
  return (
    <>
      <span onClick={onSelect} style={{
        fontSize: 11, lineHeight: 1, marginTop: 1,
        color: isUser ? '#C9A047' : 'inherit', ...clickable,
      }}>
        {isDay ? '●' : '☾'}
      </span>
      <span onClick={onSelect} style={{ ...(isUser ? goldName : plainName), ...clickable }}>
        {city}{region ? `, ${region}` : ''}
      </span>
      <span style={{ textAlign: 'right' }}>{hhmm}</span>
      <span style={dim}>{offset}</span>
      <span />
      <span style={dim}>{trailing}</span>
      <span />
      <span />
    </>
  );
}
