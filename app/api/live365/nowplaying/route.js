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

const STATION_ID = 'a11866';
const UPSTREAM = `https://api.live365.com/station/${STATION_ID}`;
const CACHE_SECS = 15;

export const runtime = 'nodejs';

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

    return Response.json(payload, {
      headers: {
        'Cache-Control': `s-maxage=${CACHE_SECS}, stale-while-revalidate=30`,
      },
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: String(err && err.message ? err.message : err) },
      { status: 500 }
    );
  }
}
