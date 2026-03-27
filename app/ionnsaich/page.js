'use client';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function LearnPage() {
  const { language } = useLanguage();

  const apps = [
    {
      id: 'abair-de',
      gd: 'Abair De?',
      en: 'Abair De?',
      desc_en: 'Immersive Gàidhlig through real-world scenes',
      desc_gd: 'Gàidhlig bogadh tro shuidheachaidhean beatha làitheil',
      available: true,
    },
    {
      id: 'de-sin-de-seo',
      gd: 'Dè Sin \\ Dè Seo',
      en: 'Dè Sin \\ Dè Seo',
      desc_en: 'Coming soon',
      desc_gd: "A' tighinn a dh'aithghearr",
      available: false,
    },
    {
      id: 'fichead-ceist',
      gd: 'Fichead Ceist',
      en: 'Fichead Ceist',
      desc_en: 'Coming soon',
      desc_gd: "A' tighinn a dh'aithghearr",
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gc-bg">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gc-dark to-gc-mid text-white py-16">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/coffee-shop.png"
            alt="An Cafaidh Balla Cloiche"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gc-dark/85 to-gc-mid/75" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-label text-tarheel mb-2">GlobalCeilidh.com</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4 tracking-wide">
            {language === 'gd' ? 'Ionnsaich' : 'Learn'}
          </h1>
          <p className="text-white/70 font-body text-lg">
            {language === 'gd' ? 'Tagh an aplacaid agad' : 'Choose your learning app'}
          </p>
        </div>
      </section>

      {/* App Selector */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4">
            {apps.map(app => (
              app.available ? (
                <Link
                  key={app.id}
                  href={`/ionnsaich/${app.id}`}
                  className="bg-white rounded-2xl border-2 border-gc-border hover:border-tarheel p-6 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display font-semibold text-2xl text-gc-dark mb-2">
                        {language === 'gd' ? app.gd : app.en}
                      </h2>
                      <p className="text-gc-muted font-body">
                        {language === 'gd' ? app.desc_gd : app.desc_en}
                      </p>
                    </div>
                    <span className="text-tarheel text-2xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ) : (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border-2 border-gc-border p-6 opacity-50 cursor-not-allowed"
                >
                  <h2 className="font-display font-semibold text-2xl text-gc-dark mb-2">
                    {language === 'gd' ? app.gd : app.en}
                  </h2>
                  <p className="text-gc-muted font-body">
                    {language === 'gd' ? app.desc_gd : app.desc_en}
                  </p>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
