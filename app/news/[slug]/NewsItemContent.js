'use client';

// Per-item article view in the gc design language. The headline shows in
// the user's chosen language; if the alternate language is available and
// differs, it appears as an italic tarheel subtitle. Same for the body.

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguagePill from '@/components/LanguagePill';

function fmtDate(s, language) {
  if (!s) return '';
  try {
    return new Date(s).toLocaleDateString(language === 'gd' ? 'gd-GB' : undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return ''; }
}

export default function NewsItemContent({ item }) {
  const { language } = useLanguage();

  // Primary text in the chosen language with a fallback if missing.
  // Alt text appears only if the OTHER language has a meaningfully different
  // value — avoids rendering the same sentence twice in italic.
  const primaryTitle = language === 'gd'
    ? (item.title_gd || item.title_en)
    : (item.title_en || item.title_gd);
  const altTitle = language === 'gd'
    ? (item.title_en && item.title_en !== item.title_gd ? item.title_en : null)
    : (item.title_gd && item.title_gd !== item.title_en ? item.title_gd : null);

  const primaryBody = language === 'gd'
    ? (item.body_gd || item.body_en)
    : (item.body_en || item.body_gd);
  const altBody = language === 'gd'
    ? (item.body_en && item.body_en !== item.body_gd ? item.body_en : null)
    : (item.body_gd && item.body_gd !== item.body_en ? item.body_gd : null);

  const feedbackHref = `mailto:sruth_editors@globalceilidh.com?subject=${encodeURIComponent(`Feedback on: ${primaryTitle}`)}&body=${encodeURIComponent(`I just read this on globalceilidh.com/news/${item.slug}.\n\n`)}`;

  return (
    <div className="min-h-screen bg-gc-bg">
      {/* Back-link bar */}
      <nav className="bg-white border-b border-gc-border py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <Link href="/news" className="text-tarheel-dark hover:text-tarheel text-xs font-display tracking-widest uppercase">
            ← {language === 'gd' ? 'Air ais gu Naidheachd' : 'Back to News'}
          </Link>
          <LanguagePill position="inline" variant="light" />
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gc-border overflow-hidden">

          <div className="px-8 md:px-12 pt-10 pb-6">
            <Link
              href={`/news?category=${item.category}`}
              className="inline-block text-tarheel-dark text-xs font-display tracking-widest uppercase mb-5 hover:text-tarheel"
            >
              {item.category || 'other'}
            </Link>

            <h1 className="font-display font-semibold text-gc-dark text-3xl md:text-4xl leading-tight mb-4">
              {primaryTitle}
            </h1>

            {altTitle && (
              <p className="font-body italic text-tarheel-dark text-lg md:text-xl mb-5 leading-snug">
                {altTitle}
              </p>
            )}

            <p className="text-gc-muted text-xs font-display tracking-widest uppercase">
              {item.source_name ? `${item.source_name} · ` : ''}
              {fmtDate(item.published_at, language)}
            </p>
          </div>

          {item.image_url && (
            <div className="bg-gc-border">
              <img
                src={item.image_url}
                alt=""
                className="block w-full h-auto"
              />
            </div>
          )}

          <div className="px-8 md:px-12 py-8">
            {primaryBody && (
              <div className="font-body text-gc-text text-lg leading-relaxed mb-6">
                {primaryBody}
              </div>
            )}

            {altBody && (
              <div className="font-body italic text-tarheel-dark text-base leading-relaxed py-5 border-t border-gc-border my-6">
                {altBody}
              </div>
            )}

            {item.source_url && (
              <div className="pt-6 border-t border-gc-border mt-6">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-tarheel hover:bg-tarheel-dark text-white px-6 py-3 rounded-lg font-display text-xs tracking-widest uppercase transition-colors duration-150"
                >
                  {language === 'gd' ? 'Leugh aig an tùs ↗' : 'Read at the source ↗'}
                </a>
              </div>
            )}

            <div className="pt-6 border-t border-gc-border mt-8 text-center">
              <a
                href={feedbackHref}
                className="text-tarheel-dark hover:text-tarheel text-xs font-display tracking-widest uppercase"
              >
                {language === 'gd'
                  ? 'Cuir beachdan air an naidheachd seo →'
                  : 'Send feedback on this story →'}
              </a>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
