// /sruth — the news mothership (the web front page of the daily Sruth email).
// Server component: pulls live top stories from sruth_website_queue and the
// real newsletter archive, then hands them to the coloured client renderer.
// ISR 5 min, same cadence as /news and /sruth/archive.
//
// (Replaced the old coming-soon email-capture page on 2026-07-20.)

import { fetchPublishedItems } from '../news/data';
import { getPublishedIssues } from './archive/data';
import SruthMain from './SruthMain';

export const revalidate = 300;

export const metadata = {
  title: 'Sruth — the daily current of Gàidhlig news | Global Ceilidh',
  description:
    'Sruth is Global Ceilidh’s daily current of Scottish Gaelic news, culture, music and community — top stories, the An Tonn charts, and every past issue.',
  alternates: { canonical: 'https://globalceilidh.com/sruth' },
  openGraph: {
    title: 'Sruth — the daily current of Gàidhlig news',
    description: 'Top Gàidhlig stories, the An Tonn music charts, and the full newsletter archive.',
    url: 'https://globalceilidh.com/sruth',
  },
};

export default async function SruthPage() {
  // Degrade gracefully: a Supabase hiccup yields an empty (not broken) page.
  const [news, issues] = await Promise.all([
    fetchPublishedItems().catch(() => []),
    getPublishedIssues().catch(() => []),
  ]);

  return <SruthMain news={news} issues={issues} />;
}
