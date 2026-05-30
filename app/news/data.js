// Supabase reads for /news. Pattern mirrors app/sruth/archive/data.js:
//   - service-role client (we own the keys; this is server-only)
//   - dynamic ISR cache (Next.js revalidates every 5 minutes)
//   - no FastAPI hop in the public read path
//
// The admin Review UI mutates rows via /website-queue/* endpoints on the
// backend. Public reads happen here, directly against Supabase.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Shape of a public news item — narrow projection so we never ship the
// raw_items body_text / transcript fields to the public page payload.
const PUBLIC_COLS = 'id, slug, title_gd, title_en, body_gd, body_en, category, image_url, source_name, source_url, featured, featured_at, published_at';

const CATEGORY_FALLBACK = 'other';

export async function fetchPublishedItems({ category = null } = {}) {
  let query = supabase
    .from('sruth_website_queue')
    .select(PUBLIC_COLS)
    .eq('published', true)
    .eq('archived', false)
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(200);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[news.data] fetchPublishedItems error:', error);
    return [];
  }
  return data || [];
}

export async function fetchItemBySlug(slug) {
  if (!slug) return null;
  const { data, error } = await supabase
    .from('sruth_website_queue')
    .select(PUBLIC_COLS)
    .eq('slug', slug)
    .eq('published', true)
    .eq('archived', false)
    .limit(1);
  if (error) {
    console.error('[news.data] fetchItemBySlug error:', error);
    return null;
  }
  return (data && data[0]) || null;
}

export async function fetchAllSlugs() {
  // Used by Next.js generateStaticParams to pre-render per-item pages.
  const { data, error } = await supabase
    .from('sruth_website_queue')
    .select('slug')
    .eq('published', true)
    .eq('archived', false)
    .not('slug', 'is', null);
  if (error) {
    console.error('[news.data] fetchAllSlugs error:', error);
    return [];
  }
  return (data || []).filter(r => r.slug);
}

export function categoryOf(item) {
  return item?.category || CATEGORY_FALLBACK;
}
