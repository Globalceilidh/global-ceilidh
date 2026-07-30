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
  const out = Object.fromEntries(CATEGORIES.map((c) => [c, []]))

  // Curated gc_videos for every category (editors add via sruth-admin).
  try {
    const res = await fetch(`${RAILWAY_URL}/videos?vertical=bhidio`, {
      next: { revalidate: 300 }, // ISR — cached at the edge for 5 min.
    })
    if (res.ok) {
      const raw = await res.json()
      for (const cat of CATEGORIES) out[cat] = (raw?.[cat] || []).map(normaliseRow)
    }
  } catch (err) {
    console.error('[bhidio] gc_videos loadCatalog failed:', err)
  }

  // Music column = the An Tonn YouTube ranking — top 100 music videos by views
  // (Top 20 + 80 more), sourced from the same snapshots that feed the chart.
  //
  // DISABLED 2026-07-29: the registry's YouTube channels were auto-resolved by
  // loose name-matching (antonn_youtube.resolve_registry_channels), which
  // mis-matched short/common band names to unrelated channels — "Fara" -> a
  // K-pop cover account, "Danú" -> a Minecraft channel, "The Lost Boys" -> a
  // food vlog, etc. Until the channels are verified server-side, the music
  // column falls back to the 16 curated gc_videos picks above (correct, hand-
  // picked). Re-enable by un-commenting once the verification pass has run.
  //
  // try {
  //   const r = await fetch(`${RAILWAY_URL}/antonn/ceol/top-videos?limit=100`, {
  //     next: { revalidate: 300 },
  //   })
  //   if (r.ok) {
  //     const d = await r.json()
  //     const vids = (d?.videos || [])
  //       .filter((v) => v.youtube_id)
  //       .map((v) => ({
  //         id: v.youtube_id, title: v.title, artist: v.artist || undefined,
  //         duration: '', source: 'youtube', poster: v.poster_url || undefined,
  //         views: v.views,
  //       }))
  //     if (vids.length) out.music = vids
  //   }
  // } catch (err) {
  //   console.error('[bhidio] ceol top-videos failed:', err)
  // }

  return out
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
