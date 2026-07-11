'use client';

import { useLanguage } from '../context/LanguageContext';

// Floating EN/GD toggle for pages that don't render the site Navigation
// (AnTonn wing, saoghal, sruth, news, rooms). Same visual language as
// the /saoghal in-map toggle so users see one consistent pill wherever
// it appears. Anchors to nearest positioned ancestor via position:
// absolute; drop it inside a pageOuter that is `position: relative`.
//
// Props:
//   position   — 'top-left' (default) | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline'
//                'inline' renders in normal document flow (no absolute/fixed) — use
//                for nav bars and existing flex layouts.
//   variant    — 'dark' (default, cream-on-black) | 'light' (for pale backgrounds)
//   fixed      — use position:fixed instead of absolute. Use when the page
//                has multiple render branches (e.g. loading/error states)
//                or no obvious positioned ancestor. Ignored for 'inline'.
//   offsetTop / offsetLeft / offsetRight / offsetBottom — override the 26px default
export default function LanguagePill({
  position = 'top-left',
  variant = 'dark',
  fixed = false,
  offsetTop,
  offsetLeft,
  offsetRight,
  offsetBottom,
}) {
  const { language, toggleLanguage } = useLanguage();

  const isDark = variant === 'dark';
  const trackOff = isDark ? 'rgba(242, 236, 220, 0.18)' : 'rgba(10, 13, 20, 0.15)';
  const trackOn = isDark ? '#F2ECDC' : '#0A0D14';
  const knob = isDark ? '#0A0D14' : '#F2ECDC';
  const textActive = isDark ? '#F2ECDC' : '#0A0D14';
  const textMuted = isDark ? 'rgba(242, 236, 220, 0.55)' : 'rgba(10, 13, 20, 0.45)';
  const bg = isDark ? 'rgba(10, 13, 20, 0.55)' : 'rgba(242, 236, 220, 0.85)';
  const border = isDark ? 'rgba(242, 236, 220, 0.22)' : 'rgba(10, 13, 20, 0.15)';

  const anchor = position === 'inline'
    ? {}
    : { position: fixed ? 'fixed' : 'absolute', zIndex: 30 };
  const D = 26;
  if (position === 'top-left') { anchor.top = offsetTop ?? D; anchor.left = offsetLeft ?? D; }
  if (position === 'top-right') { anchor.top = offsetTop ?? D; anchor.right = offsetRight ?? D; }
  if (position === 'bottom-left') { anchor.bottom = offsetBottom ?? D; anchor.left = offsetLeft ?? D; }
  if (position === 'bottom-right') { anchor.bottom = offsetBottom ?? D; anchor.right = offsetRight ?? D; }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={language === 'en' ? 'Switch to Gàidhlig' : 'Switch to English'}
      title={language === 'en' ? 'Switch to Gàidhlig' : 'Switch to English'}
      style={{
        ...anchor,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 999,
        background: bg,
        border: `1px solid ${border}`,
        cursor: 'pointer',
        fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        backdropFilter: 'blur(6px)',
        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 4px 16px rgba(0,0,0,0.15)',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
      }}
    >
      <span style={{ color: language === 'en' ? textActive : textMuted }}>EN</span>
      <span style={{
        display: 'inline-block',
        position: 'relative',
        width: 28,
        height: 14,
        borderRadius: 7,
        background: language === 'gd' ? trackOn : trackOff,
        transition: 'background 200ms ease',
      }}>
        <span style={{
          position: 'absolute',
          top: 1.5,
          width: 11,
          height: 11,
          borderRadius: '50%',
          background: knob,
          left: language === 'gd' ? 14 : 1.5,
          transition: 'left 200ms ease',
        }} />
      </span>
      <span style={{ color: language === 'gd' ? textActive : textMuted }}>GD</span>
    </button>
  );
}
