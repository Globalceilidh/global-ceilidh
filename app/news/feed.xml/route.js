// /news/feed.xml — standards-compliant RSS 2.0 feed for the news page.
// Lets the Gaelic web subscribe to /news the same way they subscribe to
// any blog. Auto-discovered by feed readers via the <link rel="alternate">
// hint emitted from app/news/page.js metadata.

import { fetchPublishedItems } from '../data';

export const runtime = 'nodejs';
export const revalidate = 300;

const SITE = 'https://www.globalceilidh.com';

function escapeXml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(date) {
  if (!date) return new Date().toUTCString();
  try {
    return new Date(date).toUTCString();
  } catch {
    return new Date().toUTCString();
  }
}

export async function GET() {
  const items = await fetchPublishedItems({});
  const lastBuild = items[0]?.published_at || new Date().toISOString();

  const itemsXml = items.slice(0, 50).map(item => {
    const url = `${SITE}/news/${item.slug}`;
    const title = item.title_en || item.title_gd || 'Untitled';
    const description = item.body_en || item.body_gd || '';
    return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${rfc822(item.published_at)}</pubDate>
      <category>${escapeXml(item.category || 'news')}</category>
      ${item.source_name ? `<source url="${escapeXml(item.source_url || SITE)}">${escapeXml(item.source_name)}</source>` : ''}
      <description>${escapeXml(description)}</description>
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Global Ceilidh — News</title>
    <link>${SITE}/news</link>
    <atom:link href="${SITE}/news/feed.xml" rel="self" type="application/rss+xml" />
    <description>Scottish and Gàidhlig news, events, music, language, and community — daily.</description>
    <language>en</language>
    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>
    <ttl>30</ttl>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
    },
  });
}
