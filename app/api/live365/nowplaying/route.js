// Server-side proxy for Live365's now-playing API.
//
// The public JSON endpoint at api.live365.com/station/<station_id>
// returns the currently-playing track, artist, cover art, and recent
// history — no HTML scraping needed. This route wraps it so the
// browser never touches Live365 directly (CORS + station-id hygiene)
// and Next caches the response so 100 polling clients only hit
// upstream ~4×/min.
//
// Add ?debug=1 to include the raw upstream JSON in the response.

import { supabaseAdmin } from '../../../../lib/supabase';

const STATION_ID = 'a11866';
const UPSTREAM = `https://api.live365.com/station/${STATION_ID}`;
const CACHE_SECS = 4;   // was 15 — bumped for tighter Live365 → tile sync

export const runtime = 'nodejs';

// Fire-and-forget hourly-bucketed counter. Failures are swallowed —
// metrics should never break the response.
async function logMetric(metric) {
  try {
    const hourBucket = new Date();
    hourBucket.setMinutes(0, 0, 0);
    await supabaseAdmin.rpc('increment_gc_radio_metric', {
      p_hour: hourBucket.toISOString(),
      p_metric: metric,
    });
  } catch (_) {
    /* swallow */
  }
}

// Fire-and-forget now-playing log. RPC handles dedup: same track within
// 5 min = update last_seen; anything else = new play row. Skips
// null/empty tracks so between-song gaps don't create bogus entries.
async function logNowPlaying(artist, title, art) {
  if (!artist || !title) return;
  try {
    await supabaseAdmin.rpc('log_now_playing', {
      p_artist:  artist,
      p_title:   title,
      p_art_url: art || null,
    });
  } catch (_) {
    /* swallow */
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === '1';

  try {
    const res = await fetch(UPSTREAM, {
      headers: {
        'Accept': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      },
      next: { revalidate: CACHE_SECS },
    });

    if (!res.ok) {
      logMetric('live365_nowplaying_fail');
      return Response.json(
        { ok: false, error: `Live365 upstream returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Live365 uses hyphenated keys — bracket-notation access.
    const current = data['current-track'] || {};
    const lastPlayed = Array.isArray(data['last-played']) ? data['last-played'] : [];

    const payload = {
      ok: true,
      station: STATION_ID,
      artist: current.artist || null,
      track: current.title || null,
      art: current.art || null,
      duration: current.duration || null,
      status: current.status || null,
      source: 'api.live365.com',
      lastPlayed: lastPlayed.slice(0, 5).map((t) => ({
        artist: t.artist || null,
        track: t.title || null,
        art: t.art || null,
      })),
    };

    if (debug) {
      payload.debug = { raw: data };
    }

    logMetric('live365_nowplaying_ok');
    logNowPlaying(payload.artist, payload.track, payload.art);

    return Response.json(payload, {
      headers: {
        'Cache-Control': `s-maxage=${CACHE_SECS}, stale-while-revalidate=30`,
      },
    });
  } catch (err) {
    logMetric('live365_nowplaying_error');
    return Response.json(
      { ok: false, error: String(err && err.message ? err.message : err) },
      { status: 500 }
    );
  }
}
