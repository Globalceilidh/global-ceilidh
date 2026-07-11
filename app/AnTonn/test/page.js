'use client'

// /AnTonn/test — sandbox surface. Solid black canvas with the standard
// AnTonn chrome (Sniomh homepage icon top-left, Let's Talk pill top-right,
// EN/GD language slider bottom-right). Nothing else — intentionally blank
// as a jumping-off point for new experiments.

import Link from 'next/link'
import LanguagePill from '../../../components/LanguagePill'
import { useLanguage } from '../../../context/LanguageContext'

export default function AnTonnTest() {
  const { t } = useLanguage()

  return (
    <div style={pageStyle}>
      {/* Sniomh — the core GlobalCeilidh design motif. Links back to
          the homepage. Hover fires the light-glint sweep (see <style>). */}
      <Link
        href="/"
        className="sniomh-wrap"
        aria-label="GlobalCeilidh home"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/AnTonn/test/sniomh.png"
          alt="GlobalCeilidh — home"
          className="sniomh-img"
          draggable={false}
        />
        {/* Glint overlay — a rotating conic gradient masked to the
            spiral's own luminance, so the light appears only where the
            spiral rings are (not on the black background). Screen blend
            mode adds brightness rather than replacing pixels, so the
            spiral geometry stays visible under the glint. Idle: hidden
            + paused (zero cost). Hover: fade in + spin. */}
        <span className="sniomh-glint" aria-hidden="true" />
      </Link>

      {/* An Tonn wordmark — page title, centred horizontally at the
          top. Same glint-on-hover treatment as the sniomh (masked to
          the letterforms' own luminance so the light sweeps only
          through the letters, not the black background). */}
      <div className="antonn-title-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/AnTonn/test/antonn-wordmark.png"
          alt="An Tonn"
          className="antonn-title-img"
          draggable={false}
        />
        <span className="antonn-title-glint" aria-hidden="true" />
      </div>

      {/* Let's Talk pill — same treatment as /AnTonn/radio + /AnTonn/marble. */}
      <a href="/contact" style={letsTalkStyle}>{t('common.lets_talk')}</a>

      {/* EN ⇄ GD slider — bottom-right, mirroring the top-right pill. */}
      <LanguagePill
        position="bottom-right"
        layout="toggle"
        variant="white"
        offsetBottom={56}
        offsetRight={30}
      />

      <style>{`
        .sniomh-wrap {
          position: absolute;
          top: 30px;
          left: 30px;
          display: block;
          width: 180px;
          height: 180px;
          z-index: 30;
          line-height: 0;
        }
        .sniomh-img {
          width: 100%;
          height: 100%;
          display: block;
          user-select: none;
        }
        .sniomh-glint {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 330deg,
            rgba(255,255,255,0.65) 348deg,
            #FFFFFF 360deg,
            rgba(255,255,255,0.65) 12deg,
            transparent 30deg,
            transparent 360deg
          );
          -webkit-mask-image: url(/AnTonn/test/sniomh.png);
          mask-image: url(/AnTonn/test/sniomh.png);
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-source-type: luminance;
          mask-mode: luminance;
          mix-blend-mode: screen;
          filter: blur(4px);
          opacity: 0;
          animation: sniomh-spin 1.8s linear infinite;
          animation-play-state: paused;
          transition: opacity 320ms ease;
        }
        .sniomh-wrap:hover .sniomh-glint,
        .sniomh-wrap:focus-visible .sniomh-glint {
          opacity: 1;
          animation-play-state: running;
        }
        @keyframes sniomh-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* An Tonn wordmark — page title. Same glint pattern as sniomh,
           masked to the letterforms so the light only sweeps through
           the letters and not the black background. */
        .antonn-title-wrap {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: block;
          width: min(60vw, 560px);
          z-index: 20;
          line-height: 0;
          pointer-events: auto;
        }
        .antonn-title-img {
          width: 100%;
          height: auto;
          display: block;
          user-select: none;
        }
        .antonn-title-glint {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 330deg,
            rgba(255,255,255,0.65) 348deg,
            #FFFFFF 360deg,
            rgba(255,255,255,0.65) 12deg,
            transparent 30deg,
            transparent 360deg
          );
          -webkit-mask-image: url(/AnTonn/test/antonn-wordmark.png);
          mask-image: url(/AnTonn/test/antonn-wordmark.png);
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-source-type: luminance;
          mask-mode: luminance;
          mix-blend-mode: screen;
          filter: blur(4px);
          opacity: 0;
          animation: sniomh-spin 1.8s linear infinite;
          animation-play-state: paused;
          transition: opacity 320ms ease;
        }
        .antonn-title-wrap:hover .antonn-title-glint {
          opacity: 1;
          animation-play-state: running;
        }

        @media (prefers-reduced-motion: reduce) {
          .sniomh-glint,
          .antonn-title-glint { animation: none; }
        }
      `}</style>
    </div>
  )
}

const pageStyle = {
  position: 'fixed',
  inset: 0,
  background: '#000000',
  overflow: 'hidden',
}

// White pill matching /AnTonn/radio + /AnTonn/marble.
const letsTalkStyle = {
  position: 'absolute',
  top: 56, right: 30,
  padding: '11px 26px',
  borderRadius: 999,
  background: '#FFFFFF',
  color: '#0A0D14',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif',
  fontWeight: 400,
  fontSize: 18,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  zIndex: 30,
  transition: 'transform 220ms ease, box-shadow 220ms ease',
}
