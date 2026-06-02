// Server-side og:image fetcher used by the /feisean page to enrich each
// festival's static record with a hero image pulled from the festival's
// own website. Falls back through og:image → twitter:image → null, and
// the consuming card renders the CSS gradient placeholder when null.
//
// Caching: every fetch uses Next.js's revalidate-based cache so we hit
// each festival site at most once a week. With ISR on the page itself,
// real cold-cache fetches happen at deploy time + once per revalidation
// window — never on every request.

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

// Match a <meta> tag where content + property/name can appear in either
// order. Two patterns handle both. Captures the URL.
function matchMeta(html, propName) {
  const escaped = propName.replace(/:/g, '\\:');
  const re1 = new RegExp(
    `<meta\\s+(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']+)["']`,
    'i',
  );
  const re2 = new RegExp(
    `<meta\\s+content=["']([^"']+)["'][^>]*(?:property|name)=["']${escaped}["']`,
    'i',
  );
  return (html.match(re1) || html.match(re2) || [, null])[1];
}

export async function fetchOgImage(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      // Long cache — festival sites don't change branding frequently. A
      // weekly revalidate keeps things current without hammering host sites.
      next: { revalidate: ONE_WEEK_SECONDS },
      headers: {
        // Some hosts block the default fetch User-Agent. Identify ourselves
        // honestly so site owners can spot us in logs if they care to.
        'User-Agent':
          'Mozilla/5.0 (compatible; GlobalCeilidh-FestivalsBot/1.0; +https://globalceilidh.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
      // 8s ceiling — better to show the placeholder than block the page
      // render on a slow third-party site.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    let img = matchMeta(html, 'og:image') || matchMeta(html, 'twitter:image');
    if (!img) return null;

    // Resolve protocol-relative or path-relative URLs against the source.
    try {
      img = new URL(img, url).toString();
    } catch {
      // Leave img as-is; the <img> tag will simply fail to load and the
      // card falls through to the placeholder via onError.
    }
    return img;
  } catch {
    // Network errors, CORS, timeouts, malformed HTML — all silently fall
    // through to the placeholder. The page must never break because a
    // festival's site is down.
    return null;
  }
}

export async function enrichFestivalsWithImages(festivals) {
  // Parallel fetch — Next.js cache dedupes repeat hits to the same URL
  // within a request, and the per-fetch timeout caps tail latency.
  const enriched = await Promise.all(
    festivals.map(async (f) => ({
      ...f,
      hero_image_url: await fetchOgImage(f.website),
    })),
  );
  return enriched;
}
