'use client';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';

const sections = [
  {
    id: 1,
    gd: 'Earrann 1',
    en: 'Section 1',
    units: [
      { id: 'cafaidh', gd: 'An Cafaidh Balla Cloiche', en: 'The Stone Wall Café', image: '/ceitidh-cafe-outside.png' },
      { id: 'dachaigh', gd: 'Dhachaigh Agus Teaghlach', en: 'Home & Family', image: '/dachaigh-family.png' },
      { id: 'slainte', gd: 'Slàinte Mhath', en: 'The Pub', image: '/slainte-bartender.png' },
      { id: 'pairc', gd: "A' Phàirc", en: 'The Park', image: '/pairc-baile-na-cuairteig.png' },
      { id: 'cidsin', gd: "Anns a' Chidsin", en: 'In the Kitchen', image: '/cidsin-parents-cooking.png' },
      { id: 'margaidh', gd: "Aig a' Mhargaidh", en: 'At the Market', image: '/margaidh-baile-na-cuairteig.png' },
    ],
  },
  {
    id: 2,
    gd: 'Earrann 2',
    en: 'Section 2',
    units: [
      { id: 's2-u1', gd: 'Àite 1', en: 'Place 1', image: null },
      { id: 's2-u2', gd: 'Àite 2', en: 'Place 2', image: null },
      { id: 's2-u3', gd: 'Àite 3', en: 'Place 3', image: null },
      { id: 's2-u4', gd: 'Àite 4', en: 'Place 4', image: null },
      { id: 's2-u5', gd: 'Àite 5', en: 'Place 5', image: null },
      { id: 's2-u6', gd: 'Ceòl', en: 'Music', image: null },
    ],
  },
  {
    id: 3,
    gd: 'Earrann 3',
    en: 'Section 3',
    units: [
      { id: 's3-u1', gd: 'Àite 1', en: 'Place 1', image: null },
      { id: 's3-u2', gd: 'Àite 2', en: 'Place 2', image: null },
      { id: 's3-u3', gd: 'Àite 3', en: 'Place 3', image: null },
      { id: 's3-u4', gd: 'Àite 4', en: 'Place 4', image: null },
      { id: 's3-u5', gd: 'Àite 5', en: 'Place 5', image: null },
      { id: 's3-u6', gd: 'Àite 6', en: 'Place 6', image: null },
    ],
  },
  {
    id: 4,
    gd: 'Earrann 4',
    en: 'Section 4',
    units: [
      { id: 's4-u1', gd: 'Àite 1', en: 'Place 1', image: null },
      { id: 's4-u2', gd: 'Àite 2', en: 'Place 2', image: null },
      { id: 's4-u3', gd: 'Àite 3', en: 'Place 3', image: null },
      { id: 's4-u4', gd: 'Àite 4', en: 'Place 4', image: null },
      { id: 's4-u5', gd: 'Àite 5', en: 'Place 5', image: null },
      { id: 's4-u6', gd: 'Àite 6', en: 'Place 6', image: null },
    ],
  },
];

export default function AbairDePage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gc-bg">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gc-dark to-gc-mid text-white py-12">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/ceitidh-cafe-outside.png"
            alt="Abair De?"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gc-dark/85 to-gc-mid/75" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/ionnsaich"
            className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center gap-2 transition-colors"
          >
            ← {language === 'gd' ? 'Air ais' : 'Back'}
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mb-2 tracking-wide">
            Abair De?
          </h1>
          <p className="text-white/70 font-body text-lg">
            {language === 'gd' ? 'Tagh aon de na h-aonadan agad' : 'Choose a unit to begin'}
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {sections.map(section => (
            <div key={section.id}>

              {/* Section Header */}
              <h2 className="text-xl font-display font-semibold text-gc-dark mb-6 pb-2 border-b border-gc-border">
                {language === 'gd' ? section.gd : section.en}
              </h2>

              {/* 2x3 Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {section.units.map(unit => (
                  <Link
                    key={unit.id}
                    href={`/ionnsaich/abair-de/${unit.id}`}
                    className="group rounded-xl overflow-hidden border border-gc-border hover:border-tarheel transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-28 bg-gc-dark overflow-hidden">
                      {unit.image ? (
                        <img
                          src={unit.image}
                          alt={unit.en}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gc-dark to-gc-mid">
                          <span className="text-3xl opacity-40">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gc-dark/60 to-transparent" />
                    </div>

                    {/* Label */}
                    <div className="p-3 bg-white">
                      <p className="font-display text-sm font-semibold text-gc-dark leading-snug">
                        {language === 'gd' ? unit.gd : unit.en}
                      </p>
                      {language === 'gd' && (
                        <p className="text-xs text-gc-muted mt-0.5">{unit.en}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Section Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`/downloads/earrann-${section.id}.pdf`}
                  download
                  className="flex-1 px-5 py-3 border border-tarheel text-tarheel-dark font-medium rounded-lg hover:bg-tarheel-pale transition-colors text-center text-sm font-display tracking-wide"
                >
                  📄 {language === 'gd' ? `Luchdaich sìos Earrann ${section.id}` : `Download Section ${section.id} Guide`}
                </a>
                <button className="flex-1 px-5 py-3 border border-gc-border text-gc-text font-medium rounded-lg hover:border-tarheel hover:bg-tarheel-pale transition-colors text-sm font-display tracking-wide">
                  📖 {language === 'gd' ? 'Ionnsaich mar Aon Aonad Iomlan' : 'Learn As One Complete Unit'}
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
