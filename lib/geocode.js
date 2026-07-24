// lib/geocode.js
// Turn a free-text place name into a coarse (~1km) coordinate via Nominatim
// (OpenStreetMap). No API key; requires a real User-Agent and asks for at
// most ~1 request/second — fine at our volume, and this is the single place
// to swap the provider if that ever changes.
//
// Coordinates are rounded to 2 decimal places before returning: the schema
// wants coarse location and no globe zooms past continent scale, so finer
// precision would be data we never use and a liability when location_public
// is on.
//
// Returns { lat, lng } on success, or null on a miss or geocoder outage.
// Callers MUST treat null as "no coordinate yet" and must never block the
// user on it. (The /api/profile/location route keeps its own inline variant
// that distinguishes not-found from unavailable so it can give the user a
// reason on a deliberate change; this best-effort helper is for flows —
// onboarding — where a geocode failure must not stop the write.)

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const UA = 'GlobalCeilidh/1.0 (https://globalceilidh.com)';

const coarsen = (n) => Math.round(Number(n) * 100) / 100;

export async function geocodePlace(query) {
  const q = String(query || '').trim().slice(0, 160);
  if (!q) return null;
  try {
    const url = `${NOMINATIM}?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1`;
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
    if (!res.ok) return null;
    const hits = await res.json();
    if (!Array.isArray(hits) || hits.length === 0) return null;
    const lat = coarsen(hits[0].lat);
    const lng = coarsen(hits[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
