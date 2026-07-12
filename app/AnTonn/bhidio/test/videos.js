// Video catalog for /AnTonn/bhidio/test.
//
// Now sourced from sruth-backend's `/videos?vertical=bhidio` endpoint,
// which reads the gc_videos Supabase table. Editors curate the catalog
// in sruth-admin → "Bhidio Videos"; no code edits needed to add or
// remove videos from the wall.
//
// The endpoint is cached at the Vercel edge for 5 minutes so we don't
// hit Railway on every visitor — after an editorial change, users see
// the new video within 5 minutes of publish.
//
// Backend response shape (per row from gc_videos):
//   {
//     id, vertical, category, source,
//     youtube_id | video_url,
//     poster_url,
//     title, artist, duration,
//     display_order, is_published
//   }
//
// We normalise into the shape VideoWallCurved.js expects — `id`
// becomes youtube_id (or a UUID fallback), `poster` is the explicit
// poster URL if any, and `videoUrl` maps from video_url for non-
// YouTube sources.

const CATEGORIES = ['music', 'educational', 'comedy', 'drama', 'documentary', 'live']

const RAILWAY_URL =
  process.env.NEXT_PUBLIC_SRUTH_API ||
  'https://insightful-purpose-production-faf9.up.railway.app'

// Async loader — used by the page's server component. Returns a
// normalised { category: [videos] } catalog. Falls back to an empty
// catalog on any error so a Railway blip doesn't blank the wall.
export async function loadCatalog() {
  try {
    const res = await fetch(`${RAILWAY_URL}/videos?vertical=bhidio`, {
      // ISR — the fetch result is cached at the edge for 5 min.
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`videos api ${res.status}`)
    const raw = await res.json()
    const out = {}
    for (const cat of CATEGORIES) {
      const rows = raw?.[cat] || []
      out[cat] = rows.map(normaliseRow)
    }
    return out
  } catch (err) {
    console.error('[bhidio/test] loadCatalog failed:', err)
    return Object.fromEntries(CATEGORIES.map((c) => [c, []]))
  }
}

function normaliseRow(row) {
  const isYouTube = row.source === 'youtube'
  return {
    id: isYouTube ? row.youtube_id : row.id,
    title: row.title,
    artist: row.artist || undefined,
    duration: row.duration || '',
    source: row.source,
    videoUrl: row.video_url || undefined,
    poster: row.poster_url || undefined,
  }
}

// Kept for backward compatibility with any client-only code that
// imported the static catalog; empty by default so nothing looks stale.
export const VIDEO_CATALOG = {
  music: [],
  educational: [],
  comedy: [],
  drama: [],
  documentary: [],
  live: [],
}
