'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLanguage } from '../context/LanguageContext';

const AileenVideo = dynamic(() => import('../components/AileenVideo'), { ssr: false });

export default function HomePage() {
  const { language } = useLanguage();
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem('gc_visited');
    if (!visited) {
      setShowVideo(true);
      localStorage.setItem('gc_visited', 'true');
    }
  }, []);

  const features = [
    {
      icon: '🎓',
      title_en: 'Immersive Learning',
      title_gd: 'Ionnsachadh Bogaidh',
      desc_en: 'Learn Gàidhlig through real-world scenes with AI tutor Aileen',
      desc_gd: 'Ionnsaich Gàidhlig tro shuidheachaidhean beatha làitheil le Aileen',
    },
    {
      icon: '🌍',
      title_en: 'Global Community',
      title_gd: 'Coimhearsnachd Cruinneil',
      desc_en: 'Connect with Gaels across Scotland, North America, Australia and beyond',
      desc_gd: 'Ceangail le Gàidheil air feadh na cruinne',
    },
    {
      icon: '📅',
      title_en: 'Events & News',
      title_gd: 'Tachartasan & Naidheachdan',
      desc_en: 'Stay connected with the global Gàidhlig calendar and latest news',
      desc_gd: 'Fuirich ceangailte ri tachartasan is naidheachdan Gàidhlig',
    },
    {
      icon: '🎵',
      title_en: 'Culture & Media',
      title_gd: 'Cultar & Meadhanan',
      desc_en: 'Music, literature, podcasts, and the living culture of the Gael',
      desc_gd: 'Ceòl, litreachas, podcastan, agus cultar beò nan Gàidheal',
    },
  ];

  return (
    <div className="min-h-screen bg-gc-bg">

      {/* Aileen Video Overlay */}
      {showVideo && (
        <AileenVideo onDismiss={() => setShowVideo(false)} language={language} />
      )}

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-gc-dark overflow-hidden">

        {/* Animated swirl background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          <svg viewBox="0 0 800 800" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="spiralGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7BAFD4" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#7BAFD4" stopOpacity="0"/>
              </radialGradient>
            </defs>
            {/* Spiral rings */}
            {[400, 340, 280, 220, 160, 100, 60, 30].map((r, i) => (
              <circle
                key={i}
                cx="400"
                cy="400"
                r={r}
                fill="none"
                stroke="url(#spiralGrad)"
                strokeWidth={i === 0 ? "2" : "1.5"}
                strokeOpacity={0.6 - i * 0.06}
              />
            ))}
            {/* Spiral arms */}
            <path
              d="M400,400 Q500,300 600,400 Q700,500 600,600 Q500,700 400,600 Q300,500 400,400"
              fill="none"
              stroke="#7BAFD4"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            <path
              d="M400,400 Q300,300 200,400 Q100,500 200,600 Q300,700 400,600 Q500,500 400,400"
              fill="none"
              stroke="#7BAFD4"
              strokeWidth="1.5"
              strokeOpacity="0.3"
            />
          </svg>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gc-dark/60 via-transparent to-gc-dark/80" />

        {/* Hero content */}
        <div className="relative text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <p className="text-tarheel font-display tracking-widest text-sm uppercase mb-4">
            GlobalCeilidh.com
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-semibold text-white mb-6 tracking-wide leading-tight">
            {language === 'gd' ? 'Fàilte gu' : 'Welcome to'}
            <br />
            <span className="text-tarheel">GlobalCeilidh.com</span>
          </h1>
          <p className="text-white/70 font-body text-xl mb-10 italic">
            {language === 'gd'
              ? 'Dachaigh cruinneil dualchas, cultar, agus coimhearsnachd na Gàidhlig'
              : 'The global home of Scottish Gaelic heritage, culture, and community'}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/ionnsaich"
              className="px-8 py-4 bg-tarheel text-white font-display font-medium rounded-lg hover:bg-tarheel-dark transition-colors tracking-wide"
            >
              {language === 'gd' ? 'Tòisich Ionnsachadh Gàidhlig' : 'Start Learning Gàidhlig'}
            </Link>
            <Link
              href="/coimhearsnachd"
              className="px-8 py-4 border border-white/30 text-white font-display font-medium rounded-lg hover:bg-white/10 transition-colors tracking-wide"
            >
              {language === 'gd' ? 'Còmhla ris a\' Choimhearsnachd' : 'Join the Community'}
            </Link>
          </div>

          {/* Scroll indicator — below buttons */}
          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="text-xs font-display tracking-widest uppercase">Scroll</span>
            <div className="w-px h-8 bg-white/20 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-tarheel py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-display font-bold mb-1">~57,000</div>
              <div className="text-sm font-body text-white/80">
                {language === 'gd'
                  ? 'fileantaich anns an RA — 60-70% de luchd-ionnsachaidh air feadh an t-saoghail'
                  : 'fluent speakers in the UK — 60-70% of all learners live outside it'}
              </div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold mb-1">5</div>
              <div className="text-sm font-body text-white/80">
                {language === 'gd' ? 'coimhearsnachdan diaspora eachdraidheil' : 'historic diaspora communities'}
              </div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold mb-1">∞</div>
              <div className="text-sm font-body text-white/80">
                {language === 'gd' ? 'saoghaileann Gàidhlig ri lorg' : 'Scottish Gaelic worlds to discover'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-display tracking-widest uppercase text-tarheel mb-3">
                {language === 'gd' ? 'Ar Misean' : 'Our Mission'}
              </p>
              <h2 className="text-4xl font-display font-semibold text-gc-dark mb-6 leading-tight">
                {language === 'gd'
                  ? 'Àite Cruinneachaidh airson a\' Ghàidheil Chruinneil'
                  : 'A Gathering Place for the Global Gael'}
              </h2>
              <p className="text-gc-text font-body leading-relaxed mb-4">
                {language === 'gd'
                  ? 'Ged a tha meadhan saoghal na Gàidhlig daonnan anns na Gàidhealtachd agus Eileanan na h-Alba, tha 60-70% de na daoine a tha an sàs ann an cultar Gàidhlig air-loidhne a\' fuireach taobh a-muigh an Rìoghachd Aonaichte. Chaidh an àrd-ùrlar seo a thogail airson a h-uile fear dhiubh — airson tusa — ge b\'e àite san t-saoghal don deach do thuras.'
                  : 'While the epicentre of the Scottish Gaelic world has always been — and will always be — the Highlands and Islands of Scotland, sixty to seventy percent of people engaging with Gàidhlig culture online live outside the United Kingdom. This platform was built for all of them — for you — wherever in the world your journey has taken you.'}
              </p>
              <p className="text-gc-text font-body leading-relaxed mb-6">
                {language === 'gd'
                  ? 'Ma dh\'fhairich thu riamh an tarraing sin — an dùthchas — a dh\'ionnsaigh saoghal na Gàidhlig, tha thu anns an àite cheart.'
                  : 'If you\'ve ever felt that pull — that dùthchas — toward the Gaelic world, you are in the right place.'}
              </p>
              <div className="bg-tarheel-pale border-l-4 border-tarheel p-4 rounded-r-lg">
                <p className="font-display font-semibold text-tarheel-dark text-sm mb-1">Dùthchas</p>
                <p className="text-gc-muted font-body text-sm italic">
                  DOO-khkhas — a hereditary connection to the land and people of your ancestors
                </p>
              </div>
            </div>

            {/* Aileen card */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-gc-border">
                <img
                  src="/aileen-headshot.png"
                  alt="Aileen — Your AI Gàidhlig tutor"
                  className="w-full h-80 object-cover object-top"
                />
                <div className="bg-white p-4">
                  <p className="text-xs font-display tracking-widest uppercase text-tarheel mb-1">Aileen</p>
                  <p className="text-gc-muted font-body text-sm">
                    {language === 'gd' ? 'Do thidsear Gàidhlig AI' : 'Your AI Gàidhlig tutor'}
                  </p>
                  <Link
                    href="/ionnsaich"
                    className="mt-3 inline-block px-4 py-2 bg-tarheel-pale text-tarheel-dark text-sm font-medium rounded-lg hover:bg-tarheel hover:text-white transition-colors font-display"
                  >
                    {language === 'gd' ? 'Coinnich ri Aileen' : 'Meet Aileen'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gc-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-display tracking-widest uppercase text-tarheel mb-3">
              {language === 'gd' ? 'Na th\'againn' : 'What We Offer'}
            </p>
            <h2 className="text-4xl font-display font-semibold text-gc-dark">
              {language === 'gd' ? 'Gach nì a th\'a dhìth ort' : 'Everything You Need'}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gc-border p-6 shadow-sm hover:shadow-md hover:border-tarheel transition-all duration-200">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-display font-semibold text-gc-dark text-lg mb-2">
                  {language === 'gd' ? feature.title_gd : feature.title_en}
                </h3>
                <p className="text-gc-muted font-body text-sm leading-relaxed">
                  {language === 'gd' ? feature.desc_gd : feature.desc_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gc-dark text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-semibold mb-4">
            {language === 'gd' ? 'Tha sinn an seo' : 'We Are Here'}
          </h2>
          <p className="text-white/70 font-body text-lg mb-8">
            {language === 'gd'
              ? 'Ceud mìle fàilte — a hundred thousand welcomes'
              : 'Ceud mìle fàilte — a hundred thousand welcomes'}
          </p>
          <Link
            href="/ionnsaich"
            className="inline-block px-8 py-4 bg-tarheel text-white font-display font-medium rounded-lg hover:bg-tarheel-dark transition-colors tracking-wide"
          >
            {language === 'gd' ? 'Tòisich an-diugh' : 'Begin Today'}
          </Link>
        </div>
      </section>

    </div>
  );
}
