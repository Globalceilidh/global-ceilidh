'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const LessonEngine = dynamic(() => import('@/components/LessonEngine'), { ssr: false });

const UNITS = {
  dachaigh: { gd: 'Dhachaigh Agus Teaghlach', en: 'Home & Family',   image: '/dachaigh-family.png' },
  slainte:  { gd: 'Slàinte Mhath',            en: 'The Pub',         image: '/slainte-bartender.png' },
  pairc:    { gd: "A' Phàirc",                en: 'The Park',        image: '/pairc-baile-na-cuairteig.png' },
  cidsin:   { gd: "Anns a' Chidsin",          en: 'In the Kitchen',  image: '/cidsin-parents-cooking.png' },
  margaidh: { gd: "Aig a' Mhargaidh",         en: 'At the Market',   image: '/margaidh-baile-na-cuairteig.png' },
};

const levels = [
  {
    id: 'beginner',
    gd: 'Tòiseachadh', en: 'Beginner',
    desc_en: 'Complete beginner — all Gàidhlig shown with English and pronunciation',
    desc_gd: 'Tòiseachadh ùr — Gàidhlig air fad le Beurla agus fuaimneachadh',
    color: 'border-tarheel bg-tarheel-pale',
    active: 'border-tarheel bg-tarheel text-white',
  },
  {
    id: 'intermediate',
    gd: 'Meadhanach', en: 'Intermediate',
    desc_en: 'Early learner — English hidden, hover to reveal',
    desc_gd: 'Tòiseachadh — Beurla falaichte, suath gus fhoillseachadh',
    color: 'border-cobalt/30 bg-cobalt-light',
    active: 'border-cobalt bg-cobalt text-white',
  },
  {
    id: 'advanced',
    gd: 'Adhartach', en: 'Advanced',
    desc_en: 'Full immersion — Gàidhlig only throughout',
    desc_gd: 'Bogadh iomlan — Gàidhlig a-mhàin air feadh',
    color: 'border-gc-border bg-gc-bg',
    active: 'border-gc-dark bg-gc-dark text-white',
  },
];

export default function UnitPage() {
  const { unit } = useParams();
  const { language } = useLanguage();
  const [lessonStarted, setLessonStarted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const unitData = UNITS[unit];

  if (!unitData) {
    return (
      <div className="min-h-screen bg-gc-bg flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-4xl mb-4">🏴󠁧󠁢󠁳󠁣󠁴󠁿</p>
          <h1 className="font-display text-2xl font-semibold text-gc-dark mb-3">
            {language === 'gd' ? "A' Tighinn a Dh'aithghearr" : 'Coming Soon'}
          </h1>
          <p className="text-gc-muted font-body mb-6">
            {language === 'gd'
              ? 'Tha an aonad seo ga ullachadh. Thig air ais a dh\'aithghearr!'
              : 'This unit is being prepared. Check back soon!'}
          </p>
          <Link href="/ionnsaich/abair-de"
            className="inline-block px-6 py-3 bg-tarheel text-white rounded-lg text-sm font-medium hover:bg-tarheel-dark transition-colors font-display">
            ← {language === 'gd' ? 'Air ais gu Abair De?' : 'Back to Abair De?'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gc-bg">
      {!lessonStarted ? (
        <>
          <section className="relative text-white py-16">
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={unitData.image}
                alt={unitData.en}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link
                href="/ionnsaich/abair-de"
                className="text-white text-sm mb-4 inline-flex items-center gap-2 hover:text-tarheel transition-colors"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
              >
                ← {language === 'gd' ? 'Air ais' : 'Back'}
              </Link>
              <p className="section-label text-tarheel mb-2" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>GlobalCeilidh.com</p>
              <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4 tracking-wide" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                {language === 'gd' ? unitData.gd : unitData.en}
              </h1>
              <p className="text-white font-body text-lg" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                {language === 'gd' ? 'Le Aileen — Do Thidsear Gàidhlig AI' : 'With Aileen — Your AI Gàidhlig Tutor'}
              </p>
            </div>
          </section>

          <section className="py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl border border-gc-border p-6 mb-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-tarheel/10 border border-tarheel/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-display text-tarheel font-bold">A</span>
                  </div>
                  <div>
                    <p className="text-xs font-display tracking-widest uppercase text-tarheel mb-1">Aileen</p>
                    <p className="text-gc-text font-body leading-relaxed">
                      {language === 'gd'
                        ? `Fàilte gu ${unitData.gd}! Tagh do ìre gus tòiseachadh.`
                        : `Welcome to ${unitData.en}! Choose your level to begin learning Gàidhlig in this real-world setting.`}
                    </p>
                    <p className="text-cobalt font-body font-medium mt-2">
                      Tagh do ìre — Choose your level
                    </p>
                  </div>
                </div>
              </div>

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
                      {selectedLevel === level.id && <span className="text-2xl ml-4">✓</span>}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => selectedLevel && setLessonStarted(true)}
                disabled={!selectedLevel}
                className={`w-full px-6 py-3 font-medium rounded-lg transition-colors text-sm font-display tracking-wide ${
                  selectedLevel
                    ? 'bg-tarheel text-white hover:bg-tarheel-dark cursor-pointer'
                    : 'bg-gc-border text-gc-muted cursor-not-allowed'
                }`}
              >
                {language === 'gd' ? 'Tòisich an Leasan →' : 'Start Lesson →'}
              </button>
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
          <LessonEngine level={selectedLevel} locationSlug={unit} language={language} />
        </div>
      )}
    </div>
  );
}
