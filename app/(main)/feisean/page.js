import { FESTIVALS } from './data';
import { enrichFestivalsWithImages } from './og-image';
import FeiseanContent from './FeiseanContent';

// ISR: rebuild this page at most once a day. The og:image fetcher inside
// `enrichFestivalsWithImages` uses its own week-long fetch cache, so the
// page rebuild cost is just the cache lookups + render — no live hits on
// festival sites unless their entry has aged past the weekly window.
export const revalidate = 86400;

export const metadata = {
  title: 'Festivals & Games · GlobalCeilidh.com',
  description:
    'Scottish and Celtic festivals across North America — ASGF members plus events surfaced through Sruth.',
};

export default async function FeiseanPage() {
  // Server-side image enrichment runs here so the rendered HTML carries
  // <img src=…> for every festival site that has an og:image. Failures
  // collapse to null and the card renders the placeholder.
  const enriched = await enrichFestivalsWithImages(FESTIVALS);
  return <FeiseanContent festivals={enriched} />;
}
