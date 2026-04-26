'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

// Phrase data per unit — keyed by unit id
const unitData = {
  cafaidh: {
    gd: 'An Cafaidh Balla Cloiche',
    en: 'The Stone Wall Café',
    image: '/coffee-shop.png',
    character: 'Ceitidh',
    phrases: [
      { id: 1, gd: 'Madainn mhath', en: 'Good morning', phonetic: 'MAT-in va' },
      { id: 2, gd: 'Ciamar a tha sibh an-diugh?', en: 'How are you today?', phonetic: 'KIM-er a ha shiv an-JOO' },
      { id: 3, gd: 'Tha mi gu math, tapadh leibh', en: 'I am well, thank you', phonetic: 'ha mi goo ma, TAP-uh LEV' },
      { id: 4, gd: 'Cofaidh dubh, mas e ur toil e', en: 'Black coffee, please', phonetic: 'KAW-fee doo, mas e ur tol e' },
      { id: 5, gd: 'Dè na chosgais?', en: 'How much does it cost?', phonetic: 'jay na HOSK-ish' },
      { id: 6, gd: 'Tapadh leibh', en: 'Thank you', phonetic: 'TAP-uh LEV' },
      { id: 7, gd: 'Mar sin leibh', en: 'Goodbye', phonetic: 'mar shin LEV' },
    ],
  },
};

// Fallback for placeholder units
const placeholderData = (id) => ({
  gd: id,
  en: id,
  image: null,
  character: 'Ceitidh',
  phrases: [
    { id: 1, gd: 'Fàilte', en: 'Welcome', phonetic: 'FAL-cha' },
    { id: 2, gd: 'Tapadh leibh', en: 'Thank you', phonetic: 'TAP-uh LEV' },
  ],
});

export default function UnitPage({ params }) {
  const { language } = useLanguage();
  const { unit } = params;
  const data = unitData[unit] || placeholderData(unit);

  const [activeLevel, setActiveLevel] = useState('beginner');
  const [aileenPhrase, setAileenPhrase] = useState(null);

  const levels = [
    { id: 'beginner', gd: 'Tòiseachadh', en: 'Beginner' },
    { id: 'intermediate', gd: 'Meadhanach', en: 'Intermediate' },
    { id: 'advanced', gd: 'Adhartach', en: 'Advanced' },
    { id: 'fluent', gd: 'Fileanta', en: 'Fluent' },
  ];

  const handleSpeak = (phrase) => {
    // Placeholder — will connect to Ceitidh audio files
    console.log('Playing audio for:', phrase.gd);
  };

  const handleAileen = (phrase) => {
    setAileenPhrase(aileenPhrase?.id === phrase.id ? null : phrase);
  };

  return (
    <div className="min-h-screen bg-gc-bg">

      {/* Hero — large locale photo */}
      <section className="relative h-56 md:h-72 bg-gc-dark">
        {data.image ? (
          <img
            src={data.image}
            alt={data.en}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gc-dark to-gc-mid" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gc-dark/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-3xl mx-auto">
          <Link
            href="/ionnsaich"
            className="text-white/60 hover:text-white text-sm mb-3 inline-flex items-center gap-2 transition-colors"
          >
            ← {language === 'gd' ? 'Air ais' : 'Back'}
          </Link>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-white">
            {language === 'gd' ? data.gd : data.en}
          </h1>
          <p className="text-white/60 text-sm mt-1 font-body">
            {language === 'gd' ? `Le ${data.character}` : `With ${data.character}`}
          </p>
        </div>
      </section>

      {/* Level Selector */}
      <div className="bg-white border-b border-gc-border sticky top-16 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {levels.map(level => (
              <button
                key={level.id}
                onClick={() => setActiveLevel(level.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium font-display whitespace-nowrap transition-all duration-200 ${
                  activeLevel === level.id
                    ? 'bg-tarheel text-white'
                    : 'text-gc-muted hover:text-gc-text hover:bg-gc-bg'
                }`}
              >
                {language === 'gd' ? level.gd : level.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Phrase List */}
      <section className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {data.phrases.map(phrase => (
            <div key={phrase.id}>

              {/* Phrase Bar */}
              <div className="bg-white rounded-xl border border-gc-border px-4 py-3 flex items-center gap-3 hover:border-tarheel/30 transition-colors">

                {/* Phrase Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-gc-dark">{phrase.gd}</p>
                  <p className={`text-sm font-body text-gc-muted mt-0.5 transition-all ${
                    activeLevel === 'advanced' || activeLevel === 'fluent' ? 'blur-sm select-none' : ''
                  }`}>
                    {phrase.en}
                  </p>
                </div>

                {/* Ceitidh Speaker Icon */}
                <button
                  onClick={() => handleSpeak(phrase)}
                  title={`${language === 'gd' ? 'Cluich le guth' : 'Play with'} ${data.character}`}
                  className="w-9 h-9 rounded-full bg-tarheel-pale border border-tarheel/20 flex items-center justify-center hover:bg-tarheel hover:text-white transition-all duration-200 flex-shrink-0"
                >
                  🔊
                </button>

                {/* Aileen Tutor Icon */}
                <button
                  onClick={() => handleAileen(phrase)}
                  title={language === 'gd' ? 'Faighnich Aileen' : 'Ask Aileen'}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center font-display font-bold text-sm transition-all duration-200 flex-shrink-0 ${
                    aileenPhrase?.id === phrase.id
                      ? 'bg-cobalt text-white border-cobalt'
                      : 'bg-cobalt-light border-cobalt/20 text-cobalt hover:bg-cobalt hover:text-white'
                  }`}
                >
                  A
                </button>
              </div>

              {/* Aileen Panel — expands below the phrase */}
              {aileenPhrase?.id === phrase.id && (
                <div className="bg-cobalt-light border border-cobalt/20 rounded-xl p-4 mt-1 ml-4">
                  <p className="text-xs font-display tracking-widest uppercase text-cobalt mb-2">Aileen</p>
                  <p className="text-gc-text font-body text-sm leading-relaxed">
                    {language === 'gd'
                      ? `"${phrase.gd}" — ${phrase.phonetic}. Cleachd seo nuair a tha thu...`
                      : `"${phrase.gd}" is pronounced "${phrase.phonetic}". Use this phrase when...`}
                  </p>
                  <p className="text-cobalt font-body text-sm font-medium mt-2">
                    {language === 'gd' ? 'Faighnich ceist...' : 'Ask a question...'}
                  </p>
                </div>
              )}

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
