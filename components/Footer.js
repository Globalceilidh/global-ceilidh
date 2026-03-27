'use client';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gc-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-tarheel flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">GC</span>
              </div>
              <div>
                <div className="font-display text-sm font-semibold tracking-widest text-white uppercase">GlobalCeilidh.com</div>
                <div className="text-xs text-white/50 tracking-wide">A Lewis Highland Group LLC Platform</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              {t('home.tagline')}
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://www.facebook.com/GlobalCeilidh" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-tarheel flex items-center justify-center transition-colors text-xs font-bold">f</a>
              <a href="https://instagram.com/globalceilidh" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-tarheel flex items-center justify-center transition-colors text-xs font-bold">in</a>
              <a href="https://x.com/globalceilidh" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-tarheel flex items-center justify-center transition-colors text-xs font-bold">𝕏</a>
              <a href="https://youtube.com/@globalceilidh" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-tarheel flex items-center justify-center transition-colors text-xs font-bold">▶</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-display tracking-widest uppercase text-tarheel mb-4">
              {t('nav.learn')} & {t('nav.community')}
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/ionnsaich', label: t('nav.learn') },
                { href: '/tachartasan', label: t('nav.events') },
                { href: '/coimhearsnachd', label: t('nav.community') },
                { href: '/meadhanan', label: t('nav.media') },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-tarheel transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Lewis Highland Group */}
          <div>
            <h3 className="text-xs font-display tracking-widest uppercase text-tarheel mb-4">
              Lewis Highland Group
            </h3>
            <ul className="space-y-2">
              {[
                { href: 'https://lewishighlandgroup.com', label: 'LewisHighlandGroup.com' },
                { href: '/mu-dheidhinn', label: t('nav.about') },
                { href: '/naidheachd', label: t('nav.news') },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-tarheel transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40 leading-relaxed">
                All Gàidhlig verified against<br/>
                <a href="https://faclair.com" target="_blank" rel="noopener noreferrer" className="text-tarheel/60 hover:text-tarheel">
                  Am Faclair Beag — faclair.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40 tracking-wide">
            © 2026 Lewis Highland Group LLC — Cicero, New York. All rights reserved.
          </p>
          <p className="text-xs text-white/40 italic font-body">
            A' Fàs sa Ghàidhlig — Growing in Gaelic
          </p>
        </div>
      </div>
    </footer>
  );
}
