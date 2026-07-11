'use client'

// /AnTonn/test — sandbox surface. Solid black canvas with the standard
// AnTonn chrome (Sniomh homepage icon top-left, Let's Talk pill top-right,
// EN/GD language slider bottom-right). Plus a WebGL wave shader in the
// background that trails ripples from the cursor.

import Link from 'next/link'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import LanguagePill from '../../../components/LanguagePill'
import { useLanguage } from '../../../context/LanguageContext'

// SSR-off — the canvas uses WebGL which needs `window`. Also lazy-loads
// the R3F bundle so it doesn't block first paint.
const WaveBackground = dynamic(() => import('./WaveBackground'), { ssr: false })

export default function AnTonnTest() {
  const { t } = useLanguage()

  // Cursor position ref, mutated on every pointermove. The WaveBackground
  // reads this each frame; no React state = no re-renders while the mouse
  // moves. Initialised to -1 so no ripple emits before the first move.
  const mouseRef = useRef({ x: -1, y: -1 })
  const onPointerMove = (e) => {
    mouseRef.current.x = e.clientX
    mouseRef.current.y = e.clientY
  }

  return (
    <div style={pageStyle} onPointerMove={onPointerMove}>
      <WaveBackground mouseRef={mouseRef} />
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

      {/* An Tonn wordmark — page header. Cropped visible area via
          overflow:hidden + negative margin so we show only the letter
          band, not the source PNG's black padding above and below. */}
      <div className="antonn-title-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/AnTonn/test/antonn-wordmark.png"
          alt="An Tonn"
          className="antonn-title-img"
          draggable={false}
        />
      </div>

      {/* Four category tiles laid horizontally across the middle of
          the page: Ceòl (Music), Bhidio (Film), Leabhraichean (Books),
          Pod-chraoladh (Podcasts). Order matches the marble pill
          stack. Images are square 1:1.
          Outer wrapper flex-centers the row without needing `transform`
          on the row itself — transform would create a stacking context
          and trap the tiles' mix-blend-mode inside it. */}
      <div className="tiles-outer">
        <div className="tiles-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/AnTonn/test/music-ceol.png"        alt="Ceòl — Music"                className="tile" draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/AnTonn/test/film-bhidio.png"       alt="Bhidio — Film"               className="tile" draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/AnTonn/test/books-leabhraichean.png" alt="Leabhraichean — Books"     className="tile" draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/AnTonn/test/podcast.png"           alt="Pod-chraoladh — Podcasts"    className="tile" draggable={false} />
        </div>
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
          /* No z-index — creating a stacking context here would trap
             the sniomh-img's mix-blend-mode inside an empty context.
             DOM order alone keeps this above the wave canvas. */
          line-height: 0;
        }
        .sniomh-img {
          width: 100%;
          height: 100%;
          display: block;
          user-select: none;
          /* Screen blend makes the PNG's baked black background contribute
             nothing to the composite, so the wave shows through everything
             that isn't part of the spiral. */
          mix-blend-mode: screen;
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

        /* An Tonn wordmark — page header. The source PNG is a square-ish
           canvas with the wordmark centred; the surrounding black padding
           matches the page bg. We shift the whole image up with a negative
           top, and centre horizontally with auto margins (NOT transform —
           transform creates a stacking context and would trap the img's
           mix-blend-mode inside it). */
        .antonn-title-wrap {
          position: absolute;
          top: -140px;
          left: 0;
          right: 0;
          margin: 0 auto;
          width: min(56vw, 520px);
          line-height: 0;
        }
        .antonn-title-img {
          width: 100%;
          height: auto;
          display: block;
          user-select: none;
          /* Dissolve the PNG's black padding into the backdrop. */
          mix-blend-mode: screen;
        }

        /* Outer wrapper centres the tile row in the viewport using
           flexbox — this avoids a `transform` on .tiles-row (transform
           creates a stacking context, which would isolate the tiles'
           mix-blend-mode). */
        .tiles-outer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        /* Four category tiles across the middle. Row is a flex container
           so the tiles space evenly. No z-index or transform here — see
           .tiles-outer note. Larger sizing (up from 260 → 340 max). */
        .tiles-row {
          display: flex;
          gap: 32px;
          align-items: center;
          justify-content: center;
          width: min(94vw, 1500px);
          pointer-events: auto;
        }
        .tile {
          flex: 1 1 0;
          min-width: 0;
          aspect-ratio: 1 / 1;
          max-width: 340px;
          height: auto;
          display: block;
          object-fit: contain;
          user-select: none;
          cursor: pointer;
          /* Screen blend dissolves each tile's black card background
             into the wave; only the figure + spiral + glow remain
             visible. */
          mix-blend-mode: screen;
          filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0));
          transform: translate3d(0, 0, 0) scale(1);
          transition:
            transform 320ms cubic-bezier(0.2, 0.7, 0.3, 1),
            filter   320ms ease;
        }
        /* Hover: brighten + lift slightly forward. translate3d nudges
           the tile up + toward camera (subtle z-cue via slight scale),
           filter adds a soft white glow so the whole graphic reads as
           "lit". */
        .tile:hover,
        .tile:focus-visible {
          transform: translate3d(0, -14px, 0) scale(1.05);
          filter:
            brightness(1.28)
            drop-shadow(0 22px 34px rgba(0,0,0,0.55))
            drop-shadow(0 0 22px rgba(255,255,255,0.35));
        }

        @media (prefers-reduced-motion: reduce) {
          .sniomh-glint { animation: none; }
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
  // Root isolation so mix-blend-mode on descendants blends against
  // the wave canvas + page bg, not against anything above this page.
  isolation: 'isolate',
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
