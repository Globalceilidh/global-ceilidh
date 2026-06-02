'use client';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FESTIVALS, STATE_NAMES, MONTH_NAMES, groupByMonth, groupByState } from './data';

// Phase-1 image: until the og:image fetcher lands (Phase 2), every card uses a
// branded CSS-gradient placeholder. The card preserves the same 2/3-image,
// 1/3-overlay anatomy specified for the final design so the layout doesn't
// shift when real images arrive — only the visual contents of the top section.
function FestivalCard({ festival, isDynamic }) {
  const { t, language } = useLanguage();
  const stateName = STATE_NAMES[festival.state] || festival.state;
  const websiteLabel = festival.website
    ? festival.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
    : null;

  return (
    <a
      href={festival.website}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl overflow-hidden bg-[#1a2744] border border-white/10 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 hover:border-tarheel/60 hover:shadow-xl hover:shadow-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-tarheel"
    >
      {/* Hero (top 2/3) — Phase 1 placeholder. The aspect ratio matches what a */}
      {/* real og:image will fill, so swapping it in later is a contents-only */}
      {/* change, no layout shift. */}
      <div className="relative aspect-[3/2] bg-gradient-to-br from-tarheel/40 via-cobalt/30 to-gc-dark overflow-hidden">
        {/* Subtle celtic-knot suggestion via concentric rings */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-15">
          <defs>
            <radialGradient id={`ring-${festival.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A8CBE3" stopOpacity="1" />
              <stop offset="100%" stopColor="#A8CBE3" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[42, 34, 26, 18, 10].map((r, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={`url(#ring-${festival.id})`}
              strokeWidth="0.6"
              strokeOpacity={0.95 - i * 0.13}
            />
          ))}
        </svg>
        {isDynamic && (
          // "Via sruth." badge for dynamic-pipeline cards. Phase 1 only renders
          // static ASGF cards, so this branch never fires yet — wired up now so
          // the Phase-2 dynamic overlay doesn't need a re-touch of this file.
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] tracking-[0.15em] uppercase text-white/90 font-display">
            via sruth.
          </div>
        )}
      </div>

      {/* Overlay panel (bottom 1/3) */}
      <div className="p-4 bg-[#0f1c33]">
        <h3 className="font-display font-bold text-white text-base leading-tight mb-1.5 line-clamp-2 group-hover:text-tarheel-light transition-colors">
          {festival.name}
        </h3>
        <p className="text-white/70 text-xs mb-1">
          {festival.city}, {stateName}
        </p>
        <p className="text-tarheel-light text-xs font-medium mb-2">
          {festival.date_display}
        </p>
        {websiteLabel && (
          <p className="text-tarheel text-[11px] truncate group-hover:underline">
            {websiteLabel}
          </p>
        )}
      </div>
    </a>
  );
}

function MonthSection({ monthIdx, festivals }) {
  if (!festivals.length) return null;
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-3 mb-5 pl-1">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-white tracking-wide">
          {MONTH_NAMES[monthIdx]}
        </h2>
        <span className="text-tarheel-light/60 text-sm font-display tracking-widest uppercase">
          {festivals.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {festivals.map((f) => (
          <FestivalCard key={f.id} festival={f} />
        ))}
      </div>
    </section>
  );
}

function StateSection({ stateCode, festivals }) {
  if (!festivals.length) return null;
  const stateName = STATE_NAMES[stateCode] || stateCode;
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-3 mb-5 pl-1">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-white tracking-wide">
          {stateName}
        </h2>
        <span className="text-tarheel-light/60 text-sm font-display tracking-widest uppercase">
          {festivals.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {festivals.map((f) => (
          <FestivalCard key={f.id} festival={f} />
        ))}
      </div>
    </section>
  );
}

export default function FeiseanPage() {
  const { t, language } = useLanguage();
  const [view, setView] = useState('date'); // 'date' | 'state'

  const byMonth = groupByMonth(FESTIVALS);
  const byState = groupByState(FESTIVALS);

  return (
    <div className="min-h-screen bg-gc-dark">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0a1628] to-gc-dark pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-display text-tarheel text-xs tracking-widest uppercase mb-3">
            GlobalCeilidh.com
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 tracking-wide">
            {language === 'gd' ? 'Fèisean is Geamaichean' : 'Festivals & Games'}
          </h1>
          <p className="font-body text-white/70 text-lg max-w-3xl leading-relaxed">
            {language === 'gd'
              ? 'Fèisean Gàidhealach is Cheilteach air feadh Aimearaga a Tuath — air an cur ri chèile bho bhuill ASGF agus tachartasan a tha sinn a’ lorg gach seachdain.'
              : 'Scottish and Celtic festivals across North America — drawn from ASGF member events and what we surface every week.'}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="sticky top-16 z-20 bg-gc-dark/95 backdrop-blur border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-3" role="tablist">
            <button
              type="button"
              onClick={() => setView('date')}
              role="tab"
              aria-selected={view === 'date'}
              className={`px-5 py-2 rounded-md text-sm font-display tracking-wide transition-all ${
                view === 'date'
                  ? 'bg-tarheel text-white font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {language === 'gd' ? 'A rèir Cinn-latha' : 'By Date'}
            </button>
            <button
              type="button"
              onClick={() => setView('state')}
              role="tab"
              aria-selected={view === 'state'}
              className={`px-5 py-2 rounded-md text-sm font-display tracking-wide transition-all ${
                view === 'state'
                  ? 'bg-tarheel text-white font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {language === 'gd' ? 'A rèir Stàite' : 'By State'}
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {view === 'date' ? (
            <>
              {[...byMonth.months.entries()].map(([m, arr]) => (
                <MonthSection key={m} monthIdx={m} festivals={arr} />
              ))}
              {byMonth.tbd.length > 0 && (
                <section className="mb-12">
                  <div className="flex items-baseline gap-3 mb-5 pl-1">
                    <h2 className="font-display text-2xl md:text-3xl font-semibold text-white tracking-wide">
                      {language === 'gd' ? 'Ri dhearbhadh' : 'Date TBD'}
                    </h2>
                    <span className="text-tarheel-light/60 text-sm font-display tracking-widest uppercase">
                      {byMonth.tbd.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {byMonth.tbd.map((f) => (
                      <FestivalCard key={f.id} festival={f} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            [...byState.entries()].map(([code, arr]) => (
              <StateSection key={code} stateCode={code} festivals={arr} />
            ))
          )}
        </div>
      </section>

      {/* Footer note */}
      <section className="py-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/50 text-xs font-display tracking-widest uppercase mb-2">
            ASGF Members
          </p>
          <p className="text-white/60 text-sm font-body max-w-xl mx-auto">
            {language === 'gd'
              ? 'Tha na fèisean seo nam buill den Association of Scottish Games and Festivals.'
              : 'These festivals are members of the Association of Scottish Games and Festivals.'}
          </p>
        </div>
      </section>
    </div>
  );
}
