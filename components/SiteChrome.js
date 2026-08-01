'use client';

// components/SiteChrome.js
// Global floating "Let's Talk" pill (top-right) + EN/GD LanguagePill
// (bottom-right), so every page carries them. Mounted once in the root
// layout. It renders per-pathname, skipping pages that already have their
// own pill (no duplicates) or their own full chrome:
//
//   NAV_PAGES   — render the (main) <Navigation> bar (EN/GD is in the nav;
//                 Let's Talk is added there too) → no floating pills.
//   NO_CHROME   — auth / onboarding / app shells / cinematics → nothing.
//   HAS_LETSTALK / HAS_LANGPILL — already render that specific pill.
//
// The "Let's Talk" pill is an <a href="/contact">, so the global overlay
// interceptor (components/LetsTalk.js) opens the panel over the page.

import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import LanguagePill from './LanguagePill';

const NAV_PAGES = ['/home', '/ionnsaich', '/naidheachd', '/tachartasan', '/feisean', '/coimhearsnachd', '/meadhanan'];
const NO_CHROME = ['/sign-in', '/sign-up', '/welcome', '/duilleag', '/rooms', '/saoghal/archives'];
const HAS_LETSTALK = ['/AnTonn', '/radio', '/contact'];
const HAS_LANGPILL = ['/AnTonn', '/radio', '/saoghal', '/sruth', '/news', '/contact', '/coming-soon-features'];

const match = (path, list) => list.some((p) => path === p || path.startsWith(p + '/'));

export default function SiteChrome() {
  const pathname = usePathname() || '/';
  const { language } = useLanguage();

  // Pages with their own nav bar or full chrome opt out entirely.
  if (match(pathname, NAV_PAGES) || match(pathname, NO_CHROME)) return null;

  const showLetsTalk = !match(pathname, HAS_LETSTALK);
  // The front door ('/') has its own EN/GD pill but no Let's Talk.
  const showLang = !match(pathname, HAS_LANGPILL) && pathname !== '/';

  if (!showLetsTalk && !showLang) return null;

  return (
    <>
      {showLetsTalk && (
        <a href="/contact" style={letsTalk}>
          {language === 'gd' ? 'Thig, bruidhinn' : "Let's Talk"}
        </a>
      )}
      {showLang && <LanguagePill position="bottom-right" variant="dark" fixed />}
    </>
  );
}

const letsTalk = {
  position: 'fixed', top: 26, right: 26, zIndex: 40,
  padding: '11px 26px', borderRadius: 999,
  background: '#FFFFFF', color: '#0A0D14', textDecoration: 'none',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif',
  fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 400,
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)', cursor: 'pointer', whiteSpace: 'nowrap',
};
