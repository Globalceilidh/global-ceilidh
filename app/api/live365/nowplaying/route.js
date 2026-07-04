// Server-side scraper for the Live365 embed widget.
//
// Live365 has no public now-playing JSON API (see the sitting feature
// request at feedback.live365.com/suggestions/39219). But their public
// embed widget renders the current track title + artist directly into
// the HTML, and there's no CORS issue when we fetch it from Vercel's
// server. We parse the response and hand back JSON.
//
// Cache: Next revalidates for CACHE_SECS so if 100 users are polling
// the client endpoint every 20s, Live365 only sees ~4 hits/min.
//
// Robustness: we try og:title first (most stable across Live365
// redesigns), then twitter:title, then <title>, then embedded JSON
// heuristics, then class-based DOM patterns. Returns whatever we can
// find plus a `source` field naming which strategy hit so we can
// notice silent parser drift.
//
// Add ?debug=1 to include a raw HTML head snippet for on-the-fly
// re-tuning if Live365 changes their markup.

const STATION_ID = 'a11866';
const EMBED_URL = `https://live365.com/embeds/v1/player/${STATION_ID}?s=md&m=dark&c=mp3`;
const CACHE_SECS = 15;

export const runtime = 'nodejs';

export async function GET(request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === '1';

  try {
    const res = await fetch(EMBED_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: CACHE_SECS },
    });

    if (!res.ok) {
      return Response.json(
        { ok: false, error: `Live365 returned ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const parsed = parseNowPlaying(html);

    const payload = {
      ok: true,
      station: STATION_ID,
      ...parsed,
    };
    if (debug) {
      payload.debug = {
        htmlHead: html.slice(0, 2000),
        htmlLength: html.length,
      };
    }

    return Response.json(payload, {
      headers: {
        // Client-side polling should hit this often, so let the browser
        // treat each response as fresh — Next's revalidate handles the
        // server-side caching.
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

function parseNowPlaying(html) {
  const result = { artist: null, track: null, source: null };

  // 1. og:title — canonical for embedded widgets
  const og = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
  );
  if (og) {
    const p = parseTitleString(og[1]);
    if (p.artist || p.track) return { ...result, ...p, source: 'og:title' };
  }

  // 2. twitter:title
  const tw = html.match(
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i
  );
  if (tw) {
    const p = parseTitleString(tw[1]);
    if (p.artist || p.track) return { ...result, ...p, source: 'twitter:title' };
  }

  // 3. og:description often carries "TRACK by ARTIST"
  const ogd = html.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogd) {
    const p = parseTitleString(ogd[1]);
    if (p.artist || p.track) return { ...result, ...p, source: 'og:description' };
  }

  // 4. <title>
  const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (t) {
    const p = parseTitleString(t[1]);
    if (p.artist || p.track) return { ...result, ...p, source: 'title' };
  }

  // 5. JSON in a script tag (many SPA widgets embed hydration state)
  const jsonPairs = [
    /["'](?:trackArtist|nowPlayingArtist|artist)["']\s*:\s*["']([^"']+)["']/i,
    /["'](?:trackTitle|nowPlayingTrack|title|track)["']\s*:\s*["']([^"']+)["']/i,
  ];
  const artistJ = html.match(jsonPairs[0]);
  const trackJ = html.match(jsonPairs[1]);
  if (artistJ || trackJ) {
    return {
      ...result,
      artist: artistJ ? artistJ[1] : null,
      track: trackJ ? trackJ[1] : null,
      source: 'json',
    };
  }

  // 6. Class-name heuristics
  const artistCls = html.match(
    /<[^>]+class=["'][^"']*artist[^"']*["'][^>]*>([^<]+)</i
  );
  const trackCls = html.match(
    /<[^>]+class=["'][^"']*(?:track|song|title)[^"']*["'][^>]*>([^<]+)</i
  );
  if (artistCls || trackCls) {
    return {
      ...result,
      artist: artistCls ? artistCls[1].trim() : null,
      track: trackCls ? trackCls[1].trim() : null,
      source: 'class',
    };
  }

  return result;
}

// Common title patterns Live365 has used in the past:
//   "TRACK by ARTIST"
//   "TRACK by ARTIST on STATION"
//   "STATION – TRACK – ARTIST"
//   "ARTIST – TRACK"
function parseTitleString(str) {
  const s = String(str || '').trim();
  if (!s) return {};

  const byMatch = s.match(/^(.+?)\s+by\s+(.+?)(?:\s+on\s+.+)?$/i);
  if (byMatch) {
    return { track: byMatch[1].trim(), artist: byMatch[2].trim() };
  }

  // "A – B – C" — station – track – artist heuristic
  const parts = s.split(/\s+[-–—]\s+/);
  if (parts.length === 3) {
    return { track: parts[1].trim(), artist: parts[2].trim() };
  }
  if (parts.length === 2) {
    // Ambiguous — return both fields; matchArtist will search both
    return { track: parts[0].trim(), artist: parts[1].trim() };
  }

  return { track: s };
}
