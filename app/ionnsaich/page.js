
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '../../context/LanguageContext';

const LessonEngine = dynamic(() => import('../../components/LessonEngine'), { ssr: false });

export default function LearnPage() {
  const { t, language } = useLanguage();
  const [lessonStarted, setLessonStarted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const levels = [
    {
      id: 'beginner',
      gd: 'Tòiseachadh',
      en: 'Beginner',
      desc_en: 'Complete beginner — all Gàidhlig shown with English and pronunciation',
      desc_gd: 'Tòiseachadh ùr — Gàidhlig air fad le Beurla agus fuaimneachadh',
      color: 'border-tarheel bg-tarheel-pale',
      active: 'border-tarheel bg-tarheel text-white',
    },
    {
      id: 'intermediate',
      gd: 'Meadhanach',
      en: 'Intermediate',
      desc_en: 'Early learner — English hidden, hover to reveal',
      desc_gd: 'Tòiseachadh — Beurla falaichte, suath gus fhoillseachadh',
      color: 'border-cobalt/30 bg-cobalt-light',
      active: 'border-cobalt bg-cobalt text-white',
    },
    {
      id: 'advanced',
      gd: 'Adhartach',
      en: 'Advanced',
      desc_en: 'Full immersion — Gàidhlig only throughout',
      desc_gd: 'Bogadh iomlan — Gàidhlig a-mhàin air feadh',
      color: 'border-gc-border bg-gc-bg',
      active: 'border-gc-dark bg-gc-dark text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-gc-bg">

      {!lessonStarted ? (
        <>
          {/* Hero */}
          <section className="bg-gradient-to-br from-gc-dark to-gc-mid text-white py-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="section-label text-tarheel mb-2">GlobalCeilidh.com</p>
              <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4 tracking-wide">
                {t('learn.title')}
              </h1>
              <p className="text-white/70 font-body text-lg">
                {t('learn.subtitle')}
              </p>
            </div>
          </section>

          {/* Lesson selector */}
          <section className="py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Scene intro */}
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
                        : 'Welcome to An Cafaidh Balla Cloiche — The Stone Wall Coffee Shop. We\'ll use this real-world setting to learn Gàidhlig naturally. Choose your level to begin.'}
                    </p>
                    <p className="text-cobalt font-body font-medium mt-2">
                      Tagh do ìre — Choose your level
                    </p>
                  </div>
                </div>
              </div>

              {/* Level Cards */}
              <div className="grid gap-4 mb-8">
                {levels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                      selectedLevel === level.id ? level.active : level.color + ' hover:border-tarheel'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-display font-semibold text-lg mb-1">
                          {level.gd}
                          <span className="font-body font-normal text-sm ml-2 opacity-70">— {level.en}</span>
                        </div>
                        <p className={`text-sm font-body ${selectedLevel === level.id ? 'text-white/80' : 'text-gc-muted'}`}>
                          {language === 'gd' ? level.desc_gd : level.desc_en}
                        </p>
                      </div>
                      {selectedLevel === level.id && (
                        <span className="text-2xl ml-4">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Download guide + Start buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/treòrachadh-leasan-1.pdf"
                  download
                  className="flex-1 px-6 py-3 border border-tarheel text-tarheel-dark font-medium rounded-lg hover:bg-tarheel-pale transition-colors text-center text-sm font-display tracking-wide"
                >
                  📄 {t('learn.guide_btn')}
                </a>
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
            ← {t('common.back')}
          </button>
          <LessonEngine level={selectedLevel} language={language} />
        </div>
      )}
    </div>
  );
}
