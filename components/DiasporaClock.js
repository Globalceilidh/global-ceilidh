'use client';

// DiasporaClock — the "Your Bearings" orientation / nav panel for the Gàidhlig
// world. One card per cultural anchor: name, country · area, local time + date,
// number of Gàidhlig speakers, and the great-circle distance + bearing from the
// viewer. The final card is the viewer themself — their location, and the
// Global Ceilidh member count in place of a speaker stat.
//
// Click a card to fly the globe there (host passes onSelect).
// `user` defaults to Brewerton, NY (testing) — production passes the signed-in
// user's gc_profiles location. `memberCount` = GC signups (default 1).

import { useState, useEffect } from 'react';

// Speaker counts are Scott-supplied; flagged for native-speaker/source review.
const DEFAULT_ANCHORS = [
  { name: 'Stornoway',  country: 'Scotland', area: 'Outer Hebrides', tz: 'Europe/London',   lat: 58.2090, lng:  -6.3890, speakers: 15200 },
  { name: 'Glasgow',    country: 'Scotland', area: 'Urban Lowlands', tz: 'Europe/London',   lat: 55.8642, lng:  -4.2518, speakers: 17780 },
  { name: 'Edinburgh',  country: 'Scotland', area: 'Urban Lowlands', tz: 'Europe/London',   lat: 55.9533, lng:  -3.1883, speakers:  8350 },
  { name: 'Oban',       country: 'Scotland', area: 'Inner Hebrides', tz: 'Europe/London',   lat: 56.4152, lng:  -5.4719, speakers:  8000 },
  { name: 'Cape Breton',country: 'Canada',   area: 'Nova Scotia',    tz: 'America/Halifax', lat: 46.1368, lng: -60.1942, speakers:  2000 },
];

const DEFAULT_USER = {
  name: 'Brewerton', country: 'USA', area: 'New York', tz: 'America/New_York', lat: 43.2384, lng: -76.1400,
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
const commas = (n) => n.toLocaleString('en-US');
function formatMiles(mi) {
  return mi >= 1000 ? mi.toLocaleString('en-US', { maximumFractionDigits: 0 }) : Math.round(mi).toString();
}
function formatCity(tz, now) {
  const p = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const g = (t) => p.find((x) => x.type === t)?.value || '';
  const hour = Number(g('hour'));
  return {
    hhmm: `${g('hour')}:${g('minute')}`,
    date: `${g('weekday')} ${g('day')} ${g('month')}`,
    isDay: hour >= 6 && hour < 18,
  };
}

const GOLD = '#C9A047';
const CREAM = 'rgba(242,236,220,0.88)';
const MUTED = 'rgba(242,236,220,0.45)';
const MONO = 'var(--font-ibm-plex-mono), "IBM Plex Mono", Menlo, monospace';

export default function DiasporaClock({
  user = DEFAULT_USER, anchors = DEFAULT_ANCHORS, memberCount = 1, onSelect,
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: MONO }}>
      {anchors.map((c) => {
        const { hhmm, date, isDay } = formatCity(c.tz, now);
        const miles = greatCircleMiles(user.lat, user.lng, c.lat, c.lng);
        const dir = bearingCardinal(user.lat, user.lng, c.lat, c.lng);
        return (
          <Card
            key={c.name}
            glyph={isDay ? '●' : '☾'}
            title={`${c.name.toUpperCase()}, ${c.country.toUpperCase()}`}
            area={c.area}
            time={hhmm} date={date}
            statNum={commas(c.speakers)} statLabel="Gàidhlig speakers"
            trailing={`${formatMiles(miles)} mi ${dir}`}
            onClick={onSelect ? () => onSelect(c) : undefined}
          />
        );
      })}

      {(() => {
        const { hhmm, date, isDay } = formatCity(user.tz, now);
        return (
          <Card
            key="you" isUser
            glyph={isDay ? '●' : '☾'}
            title={`${user.name.toUpperCase()}, ${user.country.toUpperCase()}`}
            area={user.area}
            time={hhmm} date={date}
            statNum={commas(memberCount)} statLabel={memberCount === 1 ? 'Gàidhlig user' : 'Gàidhlig users'}
            trailing="you are here"
            onClick={onSelect ? () => onSelect(user) : undefined}
          />
        );
      })()}
    </div>
  );
}

function Card({ glyph, title, area, time, date, statNum, statLabel, trailing, isUser, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 8,
        cursor: onClick ? 'pointer' : 'default',
        paddingBottom: 8,
        borderBottom: '1px solid rgba(58,46,30,0.6)',
      }}
    >
      <span style={{ fontSize: 11, lineHeight: '13px', color: isUser ? GOLD : CREAM }}>{glyph}</span>
      <div>
        <div style={{ fontSize: 10, letterSpacing: 1, color: isUser ? GOLD : CREAM }}>{title}</div>
        <div style={{ fontSize: 9, letterSpacing: 0.5, color: MUTED, marginTop: 1 }}>{area}</div>
        <div style={{ fontSize: 9, letterSpacing: 0.5, color: CREAM, marginTop: 3 }}>
          {time} <span style={{ color: MUTED }}>· {date}</span>
        </div>
        <div style={{ fontSize: 9, letterSpacing: 0.5, marginTop: 2 }}>
          <span style={{ color: GOLD }}>{statNum}</span>
          <span style={{ color: MUTED }}> {statLabel} · {trailing}</span>
        </div>
      </div>
    </div>
  );
}
