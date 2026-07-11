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
//   variant    — 'dark' (default, cream-on-black) | 'light' (pale backgrounds) |
//                'white' (pure #FFFFFF on Bebas Neue — matches the AnTonn radio
//                pills; use with layout='toggle' for the slider look).
//   layout     — 'toggle' (default, EN⇄GD slider switch) | 'solid' (single pill
//                with a text label showing the language you'd switch TO).
//   fixed      — use position:fixed instead of absolute. Use when the page
//                has multiple render branches (e.g. loading/error states)
//                or no obvious positioned ancestor. Ignored for 'inline'.
//   offsetTop / offsetLeft / offsetRight / offsetBottom — override the 26px default
export default function LanguagePill({
  position = 'top-left',
  variant = 'dark',
  layout = 'toggle',
  fixed = false,
  offsetTop,
  offsetLeft,
  offsetRight,
  offsetBottom,
}) {
  const { language, toggleLanguage } = useLanguage();

  const anchor = position === 'inline'
    ? {}
    : { position: fixed ? 'fixed' : 'absolute', zIndex: 30 };
  const D = 26;
  if (position === 'top-left') { anchor.top = offsetTop ?? D; anchor.left = offsetLeft ?? D; }
  if (position === 'top-right') { anchor.top = offsetTop ?? D; anchor.right = offsetRight ?? D; }
  if (position === 'bottom-left') { anchor.bottom = offsetBottom ?? D; anchor.left = offsetLeft ?? D; }
  if (position === 'bottom-right') { anchor.bottom = offsetBottom ?? D; anchor.right = offsetRight ?? D; }

  const isWhite = variant === 'white';
  const isDark = variant === 'dark';

  // Solid pill — matches the AnTonn "Let's Talk" style. Label is the
  // language you'd switch TO — reads as an invitation, not a state.
  if (layout === 'solid') {
    const label = language === 'en' ? 'Gàidhlig' : 'English';
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label={language === 'en' ? 'Switch to Gàidhlig' : 'Switch to English'}
        title={language === 'en' ? 'Switch to Gàidhlig' : 'Switch to English'}
        style={{
          ...anchor,
          padding: '11px 26px',
          borderRadius: 999,
          background: isWhite ? '#FFFFFF' : '#F2ECDC',
          color: '#0A0D14',
          border: 'none',
          fontFamily: isWhite
            ? 'var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif'
            : 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
          fontWeight: isWhite ? 400 : 500,
          fontSize: isWhite ? 18 : 14,
          letterSpacing: isWhite ? '0.08em' : 0.3,
          textTransform: isWhite ? 'uppercase' : 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          transition: 'transform 220ms ease, box-shadow 220ms ease',
        }}
      >
        {label}
      </button>
    );
  }

  // Toggle slider — EN ⇄ GD switch. `white` variant matches the pure
  // white pill styling used across /AnTonn/radio.
  const trackOff = isWhite ? 'rgba(10, 13, 20, 0.15)'
    : isDark ? 'rgba(242, 236, 220, 0.18)'
    : 'rgba(10, 13, 20, 0.15)';
  const trackOn = isWhite ? '#0A0D14'
    : isDark ? '#F2ECDC'
    : '#0A0D14';
  const knob = isWhite ? '#FFFFFF'
    : isDark ? '#0A0D14'
    : '#F2ECDC';
  const textActive = isWhite ? '#0A0D14'
    : isDark ? '#F2ECDC'
    : '#0A0D14';
  const textMuted = isWhite ? 'rgba(10, 13, 20, 0.4)'
    : isDark ? 'rgba(242, 236, 220, 0.55)'
    : 'rgba(10, 13, 20, 0.45)';
  const bg = isWhite ? '#FFFFFF'
    : isDark ? 'rgba(10, 13, 20, 0.55)'
    : 'rgba(242, 236, 220, 0.85)';
  const border = isWhite ? 'none'
    : isDark ? 'rgba(242, 236, 220, 0.22)'
    : 'rgba(10, 13, 20, 0.15)';

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
        gap: 10,
        padding: isWhite ? '11px 22px' : '8px 14px',
        borderRadius: 999,
        background: bg,
        border: isWhite ? 'none' : `1px solid ${border}`,
        cursor: 'pointer',
        fontFamily: isWhite
          ? 'var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif'
          : 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
        fontSize: isWhite ? 18 : 11,
        fontWeight: isWhite ? 400 : 600,
        letterSpacing: isWhite ? '0.08em' : '2px',
        textTransform: 'uppercase',
        backdropFilter: isWhite ? 'none' : 'blur(6px)',
        boxShadow: isWhite ? '0 8px 24px rgba(0,0,0,0.35)'
          : isDark ? '0 8px 24px rgba(0,0,0,0.35)'
          : '0 4px 16px rgba(0,0,0,0.15)',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
      }}
    >
      <span style={{ color: language === 'en' ? textActive : textMuted }}>EN</span>
      <span style={{
        display: 'inline-block',
        position: 'relative',
        width: 30,
        height: 15,
        borderRadius: 8,
        background: language === 'gd' ? trackOn : trackOff,
        transition: 'background 200ms ease',
      }}>
        <span style={{
          position: 'absolute',
          top: 1.5,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: knob,
          left: language === 'gd' ? 15 : 1.5,
          transition: 'left 200ms ease',
          boxShadow: isWhite ? '0 1px 3px rgba(0,0,0,0.25)' : 'none',
        }} />
      </span>
      <span style={{ color: language === 'gd' ? textActive : textMuted }}>GD</span>
    </button>
  );
}
