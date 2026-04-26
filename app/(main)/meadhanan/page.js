'use client';
import { useLanguage } from '@/context/LanguageContext';

export default function MediaPage() {
  const { language } = useLanguage();
  return (
    <div className="min-h-screen bg-gc-bg">
      <section className="bg-gradient-to-br from-gc-dark to-gc-mid text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-tarheel text-xs font-display tracking-widest uppercase mb-2">GlobalCeilidh.com</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4 tracking-wide">
            {language === 'gd' ? 'Meadhanan' : 'Media'}
          </h1>
          <p className="text-white/70 font-body text-lg">
            {language === 'gd' ? 'Podcast, bhideothan agus barrachd' : 'Podcast, videos and more'}
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Podcast */}
            <div className="bg-white rounded-2xl border border-gc-border p-8 hover:border-tarheel hover:shadow-md transition-all">
              <div className="text-4xl mb-4">🎙️</div>
              <h2 className="font-display text-gc-dark font-semibold text-xl mb-2">
                A' Fàs sa Ghàidhlig
              </h2>
              <p className="text-gc-muted font-body italic mb-4">Growing in Gaelic</p>
              <p className="text-gc-text font-body text-sm leading-relaxed mb-6">
                {language === 'gd'
                  ? 'Podcast seachdaineil le naidheachdan, aoighean agus Facal na Seachdain. A\' tighinn Ògmhios 2026.'
                  : 'Weekly podcast with news, guests and a Word of the Week. Launching June 2026. Subscribe now to be notified.'}
              </p>
              <div className="flex gap-3">
                <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors">
                  Spotify
                </a>
                <a href="https://podcasts.apple.com" target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 transition-colors">
                  Apple Podcasts
                </a>
              </div>
            </div>
            {/* YouTube */}
            <div className="bg-white rounded-2xl border border-gc-border p-8 hover:border-tarheel hover:shadow-md transition-all">
              <div className="text-4xl mb-4">▶️</div>
              <h2 className="font-display text-gc-dark font-semibold text-xl mb-2">
                YouTube
              </h2>
              <p className="text-gc-muted font-body italic mb-4">GlobalCeilidh</p>
              <p className="text-gc-text font-body text-sm leading-relaxed mb-6">
                {language === 'gd'
                  ? 'Bhideothan ionnsachaidh, sgeulachdan dualchais agus barrachd. A\' tighinn gu luath.'
                  : 'Learning videos, heritage stories and more. Coming soon. Subscribe to be notified when we launch.'}
              </p>
              <a href="https://youtube.com/@globalceilidh" target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors inline-block">
                Subscribe on YouTube
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
