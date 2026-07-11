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

      {/* Four category columns across the middle. Each column is
          tile-on-top + spinning name-plinth beneath. The plinth is a
          white ring with the vertical's Gàidhlig name punched through
          in Bebas Neue block caps — the wave shader shows through the
          letter cutouts. Ring rotates clockwise (left-to-right) at
          ~22s per revolution; graphic above stays put. */}
      <div className="tiles-row">
        <TileWithPlinth
          src="/AnTonn/test/music-ceol.png"
          alt="Ceòl — Music"
          ringText="CEÒL"
          ringSlug="ceol"
        />
        <TileWithPlinth
          src="/AnTonn/test/film-bhidio.png"
          alt="Bhidio — Film"
          ringText="BHIDIO"
          ringSlug="bhidio"
        />
        <TileWithPlinth
          src="/AnTonn/test/books-leabhraichean.png"
          alt="Leabhraichean — Books"
          ringText="LEABHRAICHEAN"
          ringSlug="leabhraichean"
        />
        <TileWithPlinth
          src="/AnTonn/test/podcast.png"
          alt="Pod-chraoladh — Podcasts"
          ringText="POD-CHRAOLADH"
          ringSlug="podcraoladh"
        />
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

        /* An Tonn wordmark — page header. The source PNG is a square-ish
           canvas with the wordmark centred; the surrounding black padding
           matches the page bg, so we just shift the whole image up with a
           negative top. Letters land near the top of the viewport; the
           invisible black padding sits above the viewport line. */
        .antonn-title-wrap {
          position: absolute;
          top: -140px;
          left: 50%;
          transform: translateX(-50%);
          width: min(56vw, 520px);
          z-index: 20;
          line-height: 0;
        }
        .antonn-title-img {
          width: 100%;
          height: auto;
          display: block;
          user-select: none;
        }

        /* Four category columns across the middle. Row is vertically
           centred in the viewport; each column takes equal flex share.
           The column stacks tile-on-top + spinning name-plinth beneath. */
        .tiles-row {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          gap: 32px;
          align-items: flex-start;
          justify-content: center;
          width: min(94vw, 1500px);
          z-index: 15;
        }
        .tile-column {
          flex: 1 1 0;
          min-width: 0;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tile {
          width: 100%;
          height: auto;
          display: block;
          user-select: none;
          cursor: pointer;
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

        /* Spinning name-plinth beneath each tile. The SVG viewBox is
           200x200 and the ring lives at r=70 with a 40-unit stroke, so
           it occupies inner r=50 → outer r=90. The mask cuts the ring
           into letter-shaped holes; wave shader shows through. Rotation
           applied to the whole SVG — the ring's own shape is
           rotationally symmetric, so the visible effect is text moving
           clockwise around a static-looking band. */
        .plinth-svg {
          width: 78%;
          height: auto;
          display: block;
          margin-top: -34px;
          animation: plinth-spin 22s linear infinite;
          pointer-events: none;
        }
        @keyframes plinth-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .sniomh-glint,
          .plinth-svg { animation: none; }
        }
      `}</style>
    </div>
  )
}

// One column of the tiles row: the graphic image + the spinning name
// plinth beneath. The plinth's ring text is repeated to fill the
// circumference — short names loop more times than long ones.
function TileWithPlinth({ src, alt, ringText, ringSlug }) {
  return (
    <div className="tile-column">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="tile" draggable={false} />
      <PlinthRing text={ringText} slug={ringSlug} />
    </div>
  )
}

// SVG spinning-plinth ring. The ring is a white stroked circle;
// a mask paints the text on a circular path in BLACK — so the text
// appears as holes cut through the ring. The whole SVG rotates via
// CSS animation, and because the ring's shape is rotationally
// symmetric, only the punched letters visually move.
function PlinthRing({ text, slug }) {
  const maskId = `plinth-mask-${slug}`
  const pathId = `plinth-path-${slug}`
  // Repeat count tuned so short words (CEÒL) fill the ring several
  // times while long ones (LEABHRAICHEAN) don't overrun themselves.
  const reps = text.length <= 6 ? 5 : text.length <= 10 ? 3 : 2
  const bannerText = Array(reps).fill(text).join(' · ') + ' · '
  return (
    <svg viewBox="0 0 200 200" className="plinth-svg" aria-hidden="true">
      <defs>
        {/* Circle at r=70, traced clockwise from top so text on it
            reads left→right at the top of the ring. */}
        <path
          id={pathId}
          d="M 100,30 A 70,70 0 1,1 100,170 A 70,70 0 1,1 100,30"
          fill="none"
        />
        <mask id={maskId} maskUnits="userSpaceOnUse">
          {/* White = visible band. */}
          <rect width="200" height="200" fill="white" />
          {/* Black text on circular path = holes cut through the ring. */}
          <text
            fill="black"
            style={{
              fontFamily:
                'var(--font-bebas-neue), "Bebas Neue", Impact, "Arial Black", sans-serif',
              fontSize: 20,
              fontWeight: 400,
              letterSpacing: 3,
            }}
          >
            <textPath href={`#${pathId}`} startOffset="0">
              {bannerText}
            </textPath>
          </text>
        </mask>
      </defs>
      {/* The ring: r=70 with stroke-width=40 → inner r=50, outer r=90. */}
      <circle
        cx="100"
        cy="100"
        r="70"
        fill="none"
        stroke="white"
        strokeWidth="40"
        mask={`url(#${maskId})`}
      />
    </svg>
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
