'use client';
import { useLanguage } from '../../context/LanguageContext';

export default function NewsPage() {
  const { language } = useLanguage();
  return (
    <div className="min-h-screen bg-gc-bg">
      <section className="bg-gradient-to-br from-gc-dark to-gc-mid text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-tarheel text-xs font-display tracking-widest uppercase mb-2">GlobalCeilidh.com</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4 tracking-wide">
            {language === 'gd' ? 'Naidheachd' : 'News'}
          </h1>
          <p className="text-white/70 font-body text-lg">
            {language === 'gd' ? 'Naidheachdan às an t-saoghal Ghàidhlig' : 'News from the Gaelic world'}
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl border border-gc-border p-12">
            <p className="text-4xl mb-4">📰</p>
            <h2 className="font-display text-gc-dark text-xl mb-2">
              {language === 'gd' ? 'A\' tighinn gu luath' : 'Coming Soon'}
            </h2>
            <p className="text-gc-muted font-body">
              {language === 'gd'
                ? 'Bidh naidheachdan às an t-saoghal Ghàidhlig an seo gu luath.'
                : 'Gaelic world news will be arriving here shortly. Check back soon.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
