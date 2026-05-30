'use client';

// Client wrapper for /news so useLanguage() works for the bilingual UI.
// Server component upstream handles data fetching; this just renders.

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

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

function NewsCard({ item, language, featured = false }) {
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

  const cardClasses = featured
    ? "bg-white rounded-2xl border-2 border-tarheel/30 overflow-hidden hover:shadow-xl transition-shadow duration-200"
    : "bg-white rounded-2xl border border-gc-border overflow-hidden hover:shadow-lg transition-shadow duration-200";

  return (
    <Link href={href} className={cardClasses}>
      {item.image_url && (
        <div
          className={featured ? "w-full aspect-[21/9] bg-gc-border" : "w-full aspect-video bg-gc-border"}
          style={{
            backgroundImage: `url(${JSON.stringify(item.image_url)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      <div className={featured ? "p-8" : "p-6"}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-tarheel-dark text-xs font-display tracking-widest uppercase font-medium">
            {item.category || 'other'}
          </span>
          {featured && (
            <span className="bg-tarheel-pale text-tarheel-dark text-[10px] font-display tracking-widest uppercase font-semibold px-2 py-1 rounded-full">
              ★ {language === 'gd' ? 'Air comharrachadh' : 'Featured'}
            </span>
          )}
        </div>
        <h3 className={featured
          ? "font-display font-semibold text-gc-dark text-2xl md:text-3xl leading-tight mb-3"
          : "font-display font-semibold text-gc-dark text-lg leading-snug mb-2"}>
          {title || (language === 'gd' ? 'Gun tiotal' : 'Untitled')}
        </h3>
        {body && (
          <p className={featured
            ? "font-body text-gc-text text-base leading-relaxed mb-4"
            : "font-body text-gc-text text-sm leading-relaxed mb-3"}>
            {body.length > (featured ? 280 : 180)
              ? body.slice(0, featured ? 280 : 180) + '…'
              : body}
          </p>
        )}
        <div className="text-gc-muted text-xs font-display tracking-wide uppercase">
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

  return (
    <div className="min-h-screen bg-gc-bg">
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
              <NewsCard item={featured} language={language} featured />
            </div>
          )}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(item => (
                <NewsCard key={item.id} item={item} language={language} />
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
