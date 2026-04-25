'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/ionnsaich', label: t('nav.learn') },
    { href: '/naidheachd', label: t('nav.news') },
    { href: '/tachartasan', label: t('nav.events') },
    { href: '/coimhearsnachd', label: t('nav.community') },
    { href: '/meadhanan', label: t('nav.media') },
  ];

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  if (pathname === '/sruth') return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — SVG swirl matching hero background */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex-shrink-0">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <radialGradient id="navSwirlBg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1a2744"/>
                    <stop offset="100%" stopColor="#0d1117"/>
                  </radialGradient>
                  <radialGradient id="navSwirlRings" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#7BAFD4" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#7BAFD4" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                {/* Dark background circle */}
                <circle cx="50" cy="50" r="50" fill="url(#navSwirlBg)"/>
                {/* Swirl rings */}
                {[38, 30, 22, 15, 9, 4].map((r, i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    stroke="url(#navSwirlRings)"
                    strokeWidth="1"
                    strokeOpacity={0.9 - i * 0.1}
                  />
                ))}
                {/* Spiral arm */}
                <path
                  d="M50,50 C65,35 78,42 78,55 C78,68 65,76 52,74 C39,72 30,62 32,50 C34,38 44,32 54,36"
                  fill="none"
                  stroke="#7BAFD4"
                  strokeWidth="1.2"
                  strokeOpacity="0.7"
                />
              </svg>
            </div>
            <div>
              <div className="font-display text-sm font-semibold tracking-widest text-gc-dark uppercase">
                GlobalCeilidh
              </div>
              <div className="text-xs text-gc-muted tracking-wide leading-none">.com</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium tracking-wide rounded-md transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-tarheel-dark bg-tarheel-pale font-semibold'
                    : 'text-gc-text hover:text-tarheel-dark hover:bg-tarheel-pale'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gc-border hover:border-tarheel transition-all duration-200"
              title={language === 'en' ? 'Switch to Gàidhlig' : 'Switch to English'}
            >
              <span className={`text-xs font-medium tracking-wide transition-colors ${
                language === 'en' ? 'text-tarheel-dark' : 'text-gc-muted'
              }`}>EN</span>
              <div className={`w-8 h-4 rounded-full transition-all duration-300 relative ${
                language === 'gd' ? 'bg-tarheel' : 'bg-gc-border'
              }`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${
                  language === 'gd' ? 'left-4' : 'left-0.5'
                }`}/>
              </div>
              <span className={`text-xs font-medium tracking-wide transition-colors ${
                language === 'gd' ? 'text-tarheel-dark' : 'text-gc-muted'
              }`}>GD</span>
            </button>

            <Link
              href="/ionnsaich"
              className="px-4 py-2 bg-tarheel text-white text-sm font-medium rounded-md hover:bg-tarheel-dark transition-colors duration-200 tracking-wide"
            >
              {t('nav.learn')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gc-text hover:bg-tarheel-pale transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
              <span className={`block h-0.5 bg-gc-text transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}/>
              <span className={`block h-0.5 bg-gc-text transition-all ${menuOpen ? 'opacity-0' : ''}`}/>
              <span className={`block h-0.5 bg-gc-text transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}/>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gc-border bg-white pb-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 text-sm font-medium tracking-wide transition-colors ${
                  isActive(link.href)
                    ? 'text-tarheel-dark bg-tarheel-pale'
                    : 'text-gc-text hover:text-tarheel-dark hover:bg-tarheel-pale'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-3 flex items-center justify-between border-t border-gc-border mt-2">
              <span className="text-sm text-gc-muted">
                {language === 'en' ? 'Switch to Gàidhlig' : 'Switch to English'}
              </span>
              <button onClick={toggleLanguage} className="flex items-center gap-2">
                <span className={`text-xs font-medium ${language === 'en' ? 'text-tarheel-dark' : 'text-gc-muted'}`}>EN</span>
                <div className={`w-8 h-4 rounded-full relative ${language === 'gd' ? 'bg-tarheel' : 'bg-gc-border'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${language === 'gd' ? 'left-4' : 'left-0.5'}`}/>
                </div>
                <span className={`text-xs font-medium ${language === 'gd' ? 'text-tarheel-dark' : 'text-gc-muted'}`}>GD</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
