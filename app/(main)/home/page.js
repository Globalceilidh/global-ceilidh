'use client';
import { useState } from 'react';
import Link from 'next/link';
import AileenVideo from '@/components/AileenVideo';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const [videoComplete, setVideoComplete] = useState(false);
  const { t, language } = useLanguage();

  const features = [
    {
      icon: '📚',
      title: language === 'gd' ? 'Ionnsaich Gàidhlig' : 'Learn Scottish Gaelic',
      desc: language === 'gd'
        ? 'Teagasg AI le Aileen — ionnsachadh tro shuidheachaidhean beatha làitheil'
        : 'AI-powered tuition with Aileen — learn through real everyday situations',
      href: '/ionnsaich',
      color: 'bg-tarheel-pale border-tarheel/30',
    },
    {
      icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      title: language === 'gd' ? 'Coimhearsnachd Cruinneil' : 'Global Community',
      desc: language === 'gd'
        ? 'Ceangail ri Gàidheil air feadh an t-saoghail — buidhnean, iomairtean, naidheachdan'
        : 'Connect with Gaels worldwide — organisations, initiatives, news',
      href: '/coimhearsnachd',
      color: 'bg-cobalt-light border-cobalt/20',
    },
    {
      icon: '📅',
      title: language === 'gd' ? 'Tachartasan' : 'Events',
      desc: language === 'gd'
        ? 'Lorg tachartasan Gàidhlig air feadh an t-saoghail — no cuir do thachartas fhèin a-steach'
        : 'Find Gaelic events worldwide — or submit your own for free',
      href: '/tachartasan',
      color: 'bg-tarheel-pale border-tarheel/30',
    },
    {
      icon: '🎙️',
      title: language === 'gd' ? 'Meadhanan' : 'Media',
      desc: language === 'gd'
        ? 'Podcast A\' Fàs sa Ghàidhlig — bhideothan, naidheachdan, agus barrachd'
        : 'A\' Fàs sa Ghàidhlig podcast — videos, news and more',
      href: '/meadhanan',
      color: 'bg-cobalt-light border-cobalt/20',
    },
  ];

  const stats = [
    { number: '60-70%', label: language === 'gd' ? 'de luchd-ionnsachaidh taobh a-muigh an UK' : 'of learners outside the UK' },
    { number: '5', label: language === 'gd' ? 'coimhearsnachdan diaspora' : 'diaspora communities' },
    { number: '∞', label: language === 'gd' ? 'fhaclan ri ionnsachadh' : 'words to discover' },
  ];

  return (
    <>
      {/* Aileen Welcome Video */}
      <AileenVideo onComplete={() => setVideoComplete(true)} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gc-dark via-gc-mid to-tarheel/20" />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #7BAFD4 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Decorative spiral */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 opacity-5">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 10 C55 10, 10 55, 10 100 C10 145, 55 190, 100 190 C145 190, 190 145, 190 100 C190 60, 155 25, 115 20 C80 15, 45 45, 40 80 C35 115, 60 145, 90 150 C120 155, 145 135, 148 110"
              stroke="#7BAFD4" strokeWidth="3" fill="none"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Overline */}
          <p className="text-tarheel text-xs font-display tracking-widest uppercase mb-6 opacity-0 animate-fade-up delay-100">
            GlobalCeilidh.com
          </p>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold text-white mb-4 tracking-wide leading-tight opacity-0 animate-fade-up delay-200">
            {language === 'gd' ? (
              <>Fàilte gu<br /><span className="text-tarheel">GlobalCeilidh.com</span></>
            ) : (
              <>Welcome to<br /><span className="text-tarheel">GlobalCeilidh.com</span></>
            )}
          </h1>

          {/* Gaelic subtitle */}
          <p className="text-white/60 text-lg md:text-xl font-body italic mb-8 opacity-0 animate-fade-up delay-300">
            {language === 'gd'
              ? 'Dachaigh cruinneil cànan, cultar agus coimhearsnachd na Gàidhlig'
              : 'The global home of Scottish Gaelic language, culture and community'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up delay-400">
            <Link href="/ionnsaich"
              className="px-8 py-4 bg-tarheel text-white font-medium rounded-lg hover:bg-tarheel-dark transition-colors duration-200 tracking-wide text-sm font-display">
              {language === 'gd' ? 'Tòisich ag Ionnsachadh' : 'Start Learning Gàidhlig'}
            </Link>
            <Link href="/coimhearsnachd"
              className="px-8 py-4 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors duration-200 tracking-wide text-sm font-display">
              {language === 'gd' ? 'Bi nad bhall' : 'Join the Community'}
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <span className="text-white text-xs font-display tracking-widest uppercase">
              {language === 'gd' ? 'Sìos' : 'Scroll'}
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-white to-transparent animate-pulse"/>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-tarheel py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-4xl font-display font-bold text-white mb-1">{stat.number}</div>
                <div className="text-white/80 text-xs md:text-sm tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label">{language === 'gd' ? 'Ar n-amas' : 'Our Mission'}</p>
              <h2 className="section-title mb-6">
                {language === 'gd'
                  ? 'Àite Cruinneachaidh airson a\' Ghàidheil Cruinneil'
                  : 'A Gathering Place for the Global Gael'}
              </h2>
              <p className="text-gc-text font-body text-lg leading-relaxed mb-6">
                {language === 'gd'
                  ? 'Tha seasgad gu seachdad sa cheud de na daoine a tha a\' com-pàirteachadh le cultar na Gàidhlig air-loidhne taobh a-muigh na Rìoghachd Aonaichte. Chaidh an làrach-lìn seo a thogail airson na daoine sin.'
                  : 'Sixty to seventy percent of people engaging with Scottish Gaelic culture online are outside the United Kingdom. This platform was built for them — for you — wherever in the world your journey has taken you.'}
              </p>
              <p className="text-gc-muted font-body leading-relaxed">
                {language === 'gd'
                  ? 'Ma mhothaich thu riamh an tarraing sin — an dùthchas — tha thu san àite cheart.'
                  : 'If you\'ve ever felt that pull — that dùthchas — toward the Gaelic world, you are in the right place.'}
              </p>
              <div className="mt-4 p-4 bg-tarheel-pale rounded-lg border-l-4 border-tarheel">
                <p className="text-cobalt font-body font-medium text-lg">Dùthchas</p>
                <p className="text-gc-muted text-sm italic">DOO-khkhas — a hereditary connection to the land and people of your ancestors</p>
              </div>
            </div>
            <div className="relative">
              {/* Aileen placeholder card */}
              <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gc-dark to-gc-mid aspect-[3/4] flex flex-col items-center justify-center shadow-xl">
                <div className="w-20 h-20 rounded-full bg-tarheel/20 border-2 border-tarheel/40 flex items-center justify-center mb-4">
                  <span className="text-3xl text-white font-display">A</span>
                </div>
                <p className="text-tarheel font-display tracking-widest uppercase text-sm mb-2">Aileen</p>
                <p className="text-white/50 text-xs text-center px-8">
                  {language === 'gd' ? 'Do thidsear Gàidhlig AI' : 'Your AI Gàidhlig tutor'}
                </p>
                <Link href="/ionnsaich"
                  className="mt-6 px-6 py-2.5 bg-tarheel text-white text-sm font-medium rounded-lg hover:bg-tarheel-dark transition-colors">
                  {language === 'gd' ? 'Coinnich ri Aileen' : 'Meet Aileen'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gc-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label">{language === 'gd' ? 'Na tha sinn a\' tabhann' : 'What We Offer'}</p>
            <h2 className="section-title">
              {language === 'gd' ? 'Gach nì a tha a dhìth ort' : 'Everything You Need'}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <Link key={i} href={feature.href}
                className={`card border ${feature.color} group hover:shadow-lg`}>
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-display text-gc-dark font-semibold mb-2 group-hover:text-tarheel-dark transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gc-muted text-sm leading-relaxed font-body">{feature.desc}</p>
                <div className="mt-4 text-tarheel text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                  {language === 'gd' ? 'Ionnsaich tuilleadh →' : 'Learn more →'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gc-dark to-gc-mid text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-tarheel font-display tracking-widest uppercase text-xs mb-4">
            {language === 'gd' ? 'Tòisich an-diugh' : 'Start Today'}
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-6 tracking-wide">
            {language === 'gd'
              ? 'Tha thu air do chuireadh'
              : 'You Are Welcome Here'}
          </h2>
          <p className="text-white/70 font-body text-lg leading-relaxed mb-8">
            {language === 'gd'
              ? 'Ge b\'e càit an tug do thuras thu — tha do dhachaigh Ghàidhlig an seo.'
              : 'Wherever in the world your journey has taken you — your Gaelic home is here.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ionnsaich"
              className="px-8 py-4 bg-tarheel text-white font-medium rounded-lg hover:bg-tarheel-dark transition-colors font-display tracking-wide text-sm">
              {language === 'gd' ? 'Tòisich ag Ionnsachadh' : 'Start Learning Free'}
            </Link>
            <Link href="/tachartasan"
              className="px-8 py-4 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors font-display tracking-wide text-sm">
              {language === 'gd' ? 'Lorg Tachartasan' : 'Find Events Near You'}
            </Link>
          </div>
          <p className="mt-8 text-white/40 font-body italic text-lg">
            Ceud mìle fàilte — A hundred thousand welcomes
          </p>
        </div>
      </section>
    </>
  );
}
