import { FESTIVALS, getPublishedFromSruth } from './data';
import { enrichFestivalsWithImages } from './og-image';
import FeiseanContent from './FeiseanContent';

// ISR: rebuild this page at most once a day. The og:image fetcher inside
// `enrichFestivalsWithImages` uses its own week-long fetch cache, so the
// page rebuild cost is just the cache lookups + render — no live hits on
// festival sites unless their entry has aged past the weekly window.
//
// Sruth-pipeline festivals come from a fresh Supabase read on each rebuild
// (rate-limited by `revalidate`), so newly-published rows surface within
// the daily window without needing a manual cache bust.
export const revalidate = 86400;

export const metadata = {
  title: 'Festivals & Games · GlobalCeilidh.com',
  description:
    'Scottish and Celtic festivals across North America — ASGF members plus events surfaced through Sruth.',
};

export default async function FeiseanPage() {
  // Load static (ASGF) + dynamic (Sruth pipeline) in parallel. Dynamic
  // failure is non-fatal — page degrades to just the static cards.
  const [dynamicFestivals] = await Promise.all([getPublishedFromSruth()]);

  // Dynamic rows may already carry a hero_image_url set manually by the
  // editor (admin override). Only run the og:image fetcher against rows
  // where the field is empty, so admin-curated images aren't overwritten.
  const dynamicNeedingImages = dynamicFestivals.filter((f) => !f.hero_image_url);
  const dynamicWithImages = dynamicFestivals.filter((f) => f.hero_image_url);
  const [staticEnriched, dynamicEnriched] = await Promise.all([
    enrichFestivalsWithImages(FESTIVALS),
    enrichFestivalsWithImages(dynamicNeedingImages),
  ]);

  // Concat — no dedup. If an editor publishes a Sruth-detected card that
  // duplicates an ASGF entry, the badge makes the duplicate obvious and
  // the editor can reject/archive it from sruth-admin. Avoids accidental
  // hiding of legitimate near-duplicates.
  const festivals = [...staticEnriched, ...dynamicEnriched, ...dynamicWithImages];

  return <FeiseanContent festivals={festivals} />;
}
