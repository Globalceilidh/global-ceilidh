'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLanguage } from '../../../../context/LanguageContext';

const LessonEngine = dynamic(() => import('../../../../components/LessonEngine'), { ssr: false });

export default function CafaidhPage() {
  const { language } = useLanguage();
  const [lessonStarted, setLessonStarted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const levels = [
    {
      id: 'beginner',
      gd: 'Tòiseachadh',
      en: 'Beginner',
      desc_en: 'All Gàidhlig shown with English and pronunciation',
      desc_gd: 'Gàidhlig air fad le Beurla agus fuaimneachadh',
      color: 'border-tarheel bg-tarheel-pale text-gc-dark',
      active: 'border-tarheel bg-tarheel text-white',
    },
    {
      id: 'intermediate',
      gd: 'Meadhanach',
      en: 'Intermediate',
      desc_en: 'English hidden, hover to reveal',
      desc_gd: 'Beurla falaichte, suath gus fhoillseachadh',
      color: 'border-cobalt/30 bg-cobalt-light text-gc-dark',
      active: 'border-cobalt bg-cobalt text-white',
    },
    {
      id: 'advanced',
      gd: 'Adhartach',
      en: 'Advanced',
      desc_en: 'Full immersion — Gàidhlig only',
      desc_gd: 'Bogadh iomlan — Gàidhlig a-mhàin',
      color: 'border-gc-border bg-gc-bg text-gc-dark',
      active: 'border-gc-dark bg-gc-dark text-white',
    },
    {
      id: 'fluent',
      gd: 'Fileanta',
      en: 'Fluent',
      desc_en: 'Expert level — no assistance',
      desc_gd: 'Ìre eòlaich — gun chuideachadh',
      color: 'border-gc-border bg-gc-bg text-gc-dark',
      active: 'border-gc-dark bg-gc-dark text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-gc-bg">

      {!lessonStarted ? (
        <>
          {/* Hero */}
          <section className="relative bg-gradient-to-br from-gc-dark to-gc-mid text-white py-12">
            <div className="absolute inset-0 overflow-hidden">
              <img
                src="/coffee-shop.png"
                alt="An Cafaidh Balla Cloiche"
                className="w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-gc-dark/85 to-gc-mid/75" />
            </div>
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link
                href="/ionnsaich/abair-de"
                className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center gap-2 transition-colors"
              >
                ← {language === 'gd' ? 'Air ais' : 'Back'}
              </Link>
              <p className="section-label text-tarheel mb-2">GlobalCeilidh.com</p>
              <h1 className="text-4xl md:text-5xl font-display font-semibold mb-2 tracking-wide">
                {language === 'gd' ? 'An Cafaidh Balla Cloiche' : 'The Stone Wall Café'}
              </h1>
            </div>
          </section>

          <section className="py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Coffee shop image */}
              <div className="rounded-2xl overflow-hidden mb-8 shadow-sm border border-gc-border">
                <img
                  src="/coffee-shop.png"
                  alt="An Cafaidh Balla Cloiche"
                  className="w-full h-56 object-cover"
                />
              </div>

              {/* Aileen welcome message */}
              <div className="bg-white rounded-2xl border border-gc-border p-6 mb-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-tarheel/10 border border-tarheel/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-display text-tarheel font-bold">A</span>
                  </div>
                  <div>
                    <p className="text-xs font-display tracking-widest uppercase text-tarheel mb-1">Aileen</p>
                    <p className="text-gc-text font-body leading-relaxed">
                      {language === 'gd'
                        ? 'Fàilte gu An Cafaidh Balla Cloiche — an àite as fheàrr leat a chleachdas sinn airson Gàidhlig ionnsachadh tro shuidheachaidhean beatha làitheil. Tagh do ìre gus tòiseachadh.'
                        : "Welcome to An Cafaidh Balla Cloiche — The Stone Wall Coffee Shop. We'll use this real-world setting to learn Gàidhlig naturally. Choose your level to begin."}
                    </p>
                    <p className="text-cobalt font-body font-medium mt-2">
                      {language === 'gd' ? 'Tagh do ìre —' : 'Choose your level —'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Level selector — horizontal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {levels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                      selectedLevel === level.id ? level.active : level.color + ' hover:border-tarheel'
                    }`}
                  >
                    <div className="font-display font-semibold text-sm mb-1">
                      {language === 'gd' ? level.gd : level.en}
                    </div>
                    <p className={`text-xs font-body leading-snug ${
                      selectedLevel === level.id ? 'text-white/80' : 'text-gc-muted'
                    }`}>
                      {language === 'gd' ? level.desc_gd : level.desc_en}
                    </p>
                    {selectedLevel === level.id && (
                      <span className="text-lg mt-1 block">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Three buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/treòrachadh-leasan-1.pdf"
                  download
                  className="flex-1 px-6 py-3 border border-tarheel text-tarheel-dark font-medium rounded-lg hover:bg-tarheel-pale transition-colors text-center text-sm font-display tracking-wide"
                >
                  📄 {language === 'gd' ? 'Luchdaich sìos Treòrachadh' : 'Download Lesson Guide'}
                </a>
                <button
                  className="flex-1 px-6 py-3 border border-gc-border text-gc-text font-medium rounded-lg hover:border-tarheel hover:bg-tarheel-pale transition-colors text-sm font-display tracking-wide"
                >
                  📖 {language === 'gd' ? 'Abairtean is Faclan' : 'Phrases and Words'}
                </button>
                <button
                  onClick={() => selectedLevel && setLessonStarted(true)}
                  disabled={!selectedLevel}
                  className={`flex-1 px-6 py-3 font-medium rounded-lg transition-colors text-sm font-display tracking-wide ${
                    selectedLevel
                      ? 'bg-tarheel text-white hover:bg-tarheel-dark cursor-pointer'
                      : 'bg-gc-border text-gc-muted cursor-not-allowed'
                  }`}
                >
                  {language === 'gd' ? 'Tòisich an Leasan →' : 'Start Lesson →'}
                </button>
              </div>

            </div>
          </section>
        </>
      ) : (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => { setLessonStarted(false); setSelectedLevel(null); }}
            className="mb-6 text-sm text-gc-muted hover:text-tarheel-dark flex items-center gap-2 transition-colors"
          >
            ← {language === 'gd' ? 'Air ais' : 'Back'}
          </button>
          <LessonEngine level={selectedLevel} language={language} />
        </div>
      )}
    </div>
  );
}
