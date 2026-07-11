'use client';

// Client wrapper for /news so useLanguage() works for the bilingual UI.
// Server component upstream handles data fetching; this just renders.

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguagePill from '@/components/LanguagePill';

const TABS = [
  { key: 'all',       en: 'All',       gd: 'Na h-uile' },
  { key: 'news',      en: 'News',      gd: 'Naidheachdan' },
  { key: 'events',    en: 'Events',    gd: 'Tachartasan' },
  { key: 'community', en: 'Community', gd: 'Coimhearsnachd' },
  { key: 'language',  en: 'Language',  gd: 'Cànan' },
  { key: 'music',     en: 'Music',     gd: 'Ceòl' },
  { key: 'history',   en: 'History',   gd: 'Eachdraidh' },
  { key: 'sport',     en: 'Sport',     gd: 'Spòrs' },
  { key: 'food',      en: 'Food',      gd: 'Biadh' },
  { key: 'arts',      en: 'Arts',      gd: 'Ealain' },
];

function fmtDate(s, language) {
  if (!s) return '';
  try {
    return new Date(s).toLocaleDateString(language === 'gd' ? 'gd-GB' : undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return ''; }
}

// Three density tiers based on rest count (items in the grid below the
// featured slot). More items on the page → tighter grid → smaller
// thumbnails so the page stays scannable instead of becoming a long scroll
// of identical large cards.
//
//   sparse  ≤ 6 cards:  1 / 2 cols          big thumbnails, full summary
//   normal  7–18 cards: 1 / 2 / 3 cols      medium thumbnails
//   dense   ≥ 19 cards: 2 / 3 / 4 cols      compact thumbnails, short summary
//
// Featured card sizing tracks density too: a featured story at 30 items
// shouldn't take up half the viewport.
function densityFor(count) {
  if (count <= 6) return 'sparse';
  if (count <= 18) return 'normal';
  return 'dense';
}

const GRID_CLASSES = {
  sparse: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  normal: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  dense:  'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
};

const CARD_STYLES = {
  sparse: {
    imageAspect: 'aspect-video',
    padding: 'p-6',
    titleSize: 'text-lg',
    bodySize: 'text-sm',
    bodyMax: 200,
  },
  normal: {
    imageAspect: 'aspect-video',
    padding: 'p-5',
    titleSize: 'text-base',
    bodySize: 'text-sm',
    bodyMax: 140,
  },
  dense: {
    imageAspect: 'aspect-[4/3]',
    padding: 'p-4',
    titleSize: 'text-sm',
    bodySize: 'text-xs',
    bodyMax: 90,
  },
};

const FEATURED_STYLES = {
  sparse: { imageAspect: 'aspect-[21/9]', padding: 'p-8',     titleSize: 'text-2xl md:text-3xl', bodySize: 'text-base', bodyMax: 280 },
  normal: { imageAspect: 'aspect-[21/9]', padding: 'p-7',     titleSize: 'text-2xl md:text-3xl', bodySize: 'text-base', bodyMax: 240 },
  dense:  { imageAspect: 'aspect-[16/9]', padding: 'p-6',     titleSize: 'text-xl md:text-2xl',  bodySize: 'text-sm',   bodyMax: 180 },
};

function NewsCard({ item, language, featured = false, density = 'normal' }) {
  const href = item.slug ? `/news/${item.slug}` : '#';
  // Editor approved with bilingual title + summary where the classifier
  // produced both. Show in the user's chosen language; fall back to the
  // other language if the chosen one is empty.
  const title = language === 'gd'
    ? (item.title_gd || item.title_en)
    : (item.title_en || item.title_gd);
  const body = language === 'gd'
    ? (item.body_gd || item.body_en)
    : (item.body_en || item.body_gd);

  const styles = featured ? FEATURED_STYLES[density] : CARD_STYLES[density];

  const cardClasses = featured
    ? "bg-white rounded-2xl border-2 border-tarheel/30 overflow-hidden hover:shadow-xl transition-shadow duration-200"
    : "bg-white rounded-2xl border border-gc-border overflow-hidden hover:shadow-lg transition-shadow duration-200";

  return (
    <Link href={href} className={cardClasses}>
      {item.image_url && (
        <div
          className={`w-full ${styles.imageAspect} bg-gc-border`}
          style={{
            backgroundImage: `url(${JSON.stringify(item.image_url)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      <div className={styles.padding}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-tarheel-dark text-[10px] font-display tracking-widest uppercase font-medium">
            {item.category || 'other'}
          </span>
          {featured && (
            <span className="bg-tarheel-pale text-tarheel-dark text-[10px] font-display tracking-widest uppercase font-semibold px-2 py-0.5 rounded-full">
              ★ {language === 'gd' ? 'Air comharrachadh' : 'Featured'}
            </span>
          )}
        </div>
        <h3 className={`font-display font-semibold text-gc-dark ${styles.titleSize} leading-snug mb-2`}>
          {title || (language === 'gd' ? 'Gun tiotal' : 'Untitled')}
        </h3>
        {body && (
          <p className={`font-body text-gc-text ${styles.bodySize} leading-relaxed mb-3`}>
            {body.length > styles.bodyMax
              ? body.slice(0, styles.bodyMax) + '…'
              : body}
          </p>
        )}
        <div className="text-gc-muted text-[10px] font-display tracking-wide uppercase">
          {item.source_name ? `${item.source_name} · ` : ''}{fmtDate(item.published_at, language)}
        </div>
      </div>
    </Link>
  );
}

export default function NewsContent({ items, active }) {
  const { language } = useLanguage();

  // Featured slot only on the All view — keeps the curated story at the
  // top of the main feed; category-specific views are pure chronological.
  const featured = active === 'all' ? items.find(i => i.featured) : null;
  const rest = featured ? items.filter(i => i.id !== featured.id) : items;

  const activeTab = TABS.find(t => t.key === active) || TABS[0];
  const density = densityFor(rest.length);

  return (
    <div className="min-h-screen bg-gc-bg" style={{ position: 'relative' }}>
      <LanguagePill position="top-right" variant="dark" offsetTop={20} offsetRight={20} />
      {/* Hero — mirrors /naidheachd's gradient + tarheel eyebrow pattern */}
      <section className="bg-gradient-to-br from-gc-dark to-gc-mid text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-tarheel text-xs font-display tracking-widest uppercase mb-2">
            GlobalCeilidh.com
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4 tracking-wide">
            {language === 'gd' ? 'Naidheachd' : 'News'}
          </h1>
          <p className="text-white/70 font-body text-lg">
            {language === 'gd'
              ? 'Naidheachdan às an t-saoghal Ghàidhlig agus Albannach'
              : 'News from the Gaelic and Scottish world'}
          </p>
        </div>
      </section>

      {/* Category tabs — sticky beneath hero */}
      <nav className="bg-white border-b border-gc-border sticky top-0 z-10 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 py-3 whitespace-nowrap">
          {TABS.map(t => {
            const isActive = t.key === active;
            const href = t.key === 'all' ? '/news' : `/news?category=${t.key}`;
            return (
              <Link
                key={t.key}
                href={href}
                className={`px-4 py-2 rounded-lg font-display text-xs tracking-widest uppercase transition-colors duration-150 ${
                  isActive
                    ? 'bg-gc-dark text-white font-semibold'
                    : 'text-gc-text hover:bg-gc-bg font-medium'
                }`}
              >
                {language === 'gd' ? t.gd : t.en}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Body */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 && (
            <div className="bg-white rounded-2xl border border-gc-border p-12 text-center">
              <p className="text-4xl mb-4">📰</p>
              <h2 className="font-display text-gc-dark text-xl mb-2">
                {language === 'gd' ? 'A\' tighinn gu luath' : 'Nothing here yet'}
              </h2>
              <p className="text-gc-muted font-body">
                {language === 'gd'
                  ? `Cha deach naidheachdan sam bith fhoillseachadh fo ${activeTab.gd.toLowerCase()} fhathast. Thig air ais a-màireach.`
                  : `Nothing published under ${activeTab.en} yet. Items are added daily as editors approve them — check back tomorrow.`}
              </p>
            </div>
          )}

          {featured && (
            <div className="mb-8">
              <NewsCard item={featured} language={language} featured density={density} />
            </div>
          )}

          {rest.length > 0 && (
            <div className={GRID_CLASSES[density]}>
              {rest.map(item => (
                <NewsCard key={item.id} item={item} language={language} density={density} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gc-border py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gc-muted text-xs font-display tracking-widest uppercase">
          <Link href="/news/feed.xml" className="text-tarheel-dark hover:text-tarheel mx-3">RSS</Link>
          <span className="text-gc-border">·</span>
          <Link href="/sruth/archive" className="text-tarheel-dark hover:text-tarheel mx-3">
            {language === 'gd' ? 'Tasglann Sruth' : 'Sruth Archive'}
          </Link>
          <span className="text-gc-border">·</span>
          <a
            href="mailto:sruth_editors@globalceilidh.com?subject=News%20page%20feedback"
            className="text-tarheel-dark hover:text-tarheel mx-3"
          >
            {language === 'gd' ? 'Beachdan' : 'Feedback'}
          </a>
        </div>
      </footer>
    </div>
  );
}
