// app/api/profile/location/route.js
// Set (or clear) where you are.
//
// Onboarding has always captured `region` as free text and nothing else —
// there was no geocoding anywhere in the codebase, so gc_profiles.lat and
// .lng were never written and the personal globe had nothing to centre
// on. This is the missing half: turn a place name into a coarse
// coordinate and store both.
//
// Coordinates are rounded to 2 decimal places (~1km) before they are
// stored. The schema calls for coarsened coordinates and the globe never
// zooms past continent scale, so street-level precision would be data we
// have no use for and a liability if `location_public` is ever on.
//
// Geocoding is Nominatim (OpenStreetMap): no key, but it requires a real
// User-Agent and asks for at most 1 request/second. Fine at this volume;
// if it ever isn't, this is the single place to swap the provider.

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getProfileByClerkId } from '../../../../lib/social';

export const runtime = 'nodejs';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const UA = 'GlobalCeilidh/1.0 (https://globalceilidh.com)';

const coarsen = (n) => Math.round(Number(n) * 100) / 100;

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  let payload;
  try { payload = await req.json(); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }

  const query = String(payload.query || '').trim().slice(0, 160);
  const locationPublic = payload.location_public;

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    // Toggling visibility only — no new place given, so don't re-geocode.
    if (!query && typeof locationPublic === 'boolean') {
      const { error } = await supabaseAdmin
        .from('gc_profiles')
        .update({ location_public: locationPublic })
        .eq('id', me.id);
      if (error) throw error;
      return Response.json({ ok: true, location_public: locationPublic });
    }

    if (!query) return Response.json({ ok: false, error: 'query_required' }, { status: 400 });

    const url = `${NOMINATIM}?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
    if (!res.ok) {
      return Response.json({ ok: false, error: 'geocode_unavailable', reason: 'Couldn’t look that up just now.' }, { status: 502 });
    }
    const hits = await res.json();
    if (!Array.isArray(hits) || hits.length === 0) {
      return Response.json({ ok: false, error: 'not_found', reason: 'No place found by that name.' }, { status: 404 });
    }

    const hit = hits[0];
    // Keep what the user typed as the label. The Nominatim display_name is
    // a full postal chain ("Brewerton, Onondaga County, New York, 13029,
    // United States") and nobody describes where they live that way.
    const patch = {
      region: query,
      lat: coarsen(hit.lat),
      lng: coarsen(hit.lon),
    };
    if (typeof locationPublic === 'boolean') patch.location_public = locationPublic;

    const { data, error } = await supabaseAdmin
      .from('gc_profiles')
      .update(patch)
      .eq('id', me.id)
      .select('region, lat, lng, location_public')
      .single();
    if (error) throw error;

    return Response.json({
      ok: true,
      location: {
        region: data.region,
        lat: Number(data.lat),
        lng: Number(data.lng),
        locationPublic: !!data.location_public,
      },
    });
  } catch (err) {
    console.error('Set location failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
