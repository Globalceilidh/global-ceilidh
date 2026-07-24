// app/api/map/members/route.js
// The read side of the map-visibility promise: everyone who ticked "Show on
// the map" (location_public) AND has a coarse coordinate. The personal globe
// draws these as dots alongside your own "you are here" pin; /saoghal can
// use the same endpoint later.
//
// What it exposes — handle, display name, coarse (~1km) coords, region,
// avatar — is all already public at /u/<handle>. This endpoint just gathers
// the members who consented to being placed on the map. Nobody without
// location_public appears here.
//
// Signed-in only (the personal globe is behind auth). The caller's own row
// is excluded — the globe draws "you are here" from your own profile, so
// returning yourself would just double-draw at the same point.

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  // Cap generously; at member scale this is tiny, and the globe can't
  // usefully render more than a few thousand markers anyway. If this ever
  // bites, cluster server-side or switch to a GeoJSON source + symbol layer.
  const { data, error } = await supabaseAdmin
    .from('gc_profiles')
    .select('handle, display_name, avatar_url, region, lat, lng, clerk_user_id')
    .eq('location_public', true)
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .limit(2000);

  if (error) {
    console.error('Map members query failed:', error);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  const members = (data || [])
    .filter((m) => m.clerk_user_id !== userId)
    .map((m) => ({
      handle: m.handle,
      displayName: m.display_name || `@${m.handle}`,
      region: m.region || null,
      avatarUrl: m.avatar_url || null,
      lat: Number(m.lat),
      lng: Number(m.lng),
    }));

  return Response.json({ ok: true, members });
}
