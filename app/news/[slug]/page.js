// /news/[slug] — per-item permalink page. Server component for fetch +
// metadata + static params; renders via NewsItemContent client component
// so useLanguage() works for bilingual rendering.

import { notFound } from 'next/navigation';
import { fetchItemBySlug, fetchAllSlugs } from '../data';
import NewsItemContent from './NewsItemContent';

export const revalidate = 300;

export async function generateStaticParams() {
  const rows = await fetchAllSlugs();
  return rows.map(r => ({ slug: r.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await fetchItemBySlug(slug);
  if (!item) return { title: 'Not found — Global Ceilidh' };
  const title = item.title_en || item.title_gd || 'News';
  const desc = (item.body_en || item.body_gd || '').slice(0, 180);
  return {
    title: `${title} — Global Ceilidh`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: item.image_url ? [{ url: item.image_url }] : undefined,
    },
  };
}

export default async function NewsItemPage({ params }) {
  const { slug } = await params;
  const item = await fetchItemBySlug(slug);
  if (!item) notFound();
  return <NewsItemContent item={item} />;
}
