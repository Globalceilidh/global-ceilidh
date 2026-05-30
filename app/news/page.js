// /news — public-facing curated feed of approved items from the Sruth
// ingestion pipeline. Server component for the ISR fetch; renders the
// gc-themed layout via the client component below so useLanguage() works
// for bilingual rendering.

import { fetchPublishedItems } from './data';
import NewsContent from './NewsContent';

export const revalidate = 300;

export const metadata = {
  title: 'News — Global Ceilidh',
  description:
    'Daily Scottish and Gàidhlig news, events, music, language, and community — curated from the Sruth ingestion pipeline.',
  openGraph: {
    title: 'News — Global Ceilidh',
    description: 'Scottish news, events, music, language, and diaspora — daily.',
  },
};

export default async function NewsPage({ searchParams }) {
  const sp = await searchParams;
  const validCategories = new Set([
    'all', 'news', 'events', 'community', 'language', 'music',
    'history', 'sport', 'food', 'arts',
  ]);
  const active = validCategories.has(sp?.category) ? sp.category : 'all';

  const items = await fetchPublishedItems({
    category: active === 'all' ? null : active,
  });

  return <NewsContent items={items} active={active} />;
}
