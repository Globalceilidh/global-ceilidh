'use client'

// /AnTonn/test — sandbox surface. Solid black canvas with the standard
// AnTonn chrome (Sniomh homepage icon top-left, Let's Talk pill top-right,
// EN/GD language slider bottom-right). Plus a WebGL wave shader in the
// background that trails ripples from the cursor.

import Link from 'next/link'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import LanguagePill from '../../../components/LanguagePill'
import RadioBot from '../../../components/RadioBot'
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

      {/* An Tonn masthead — the heart-wave icon (replaces the letter wordmark).
          Square glow-on-black PNG; screen-blended so its backing melts into the
          page and no halo box shows. */}
      <div className="antonn-title-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/AnTonn/test/AnTonn.png"
          alt="An Tonn"
          className="antonn-title-img"
          draggable={false}
        />
      </div>

      {/* Four category columns across the middle. Each column is
          graphic-on-top + static ring beneath. Two clickable hotspots
          per column: a small circular target over the bright vortex
          centre of the graphic, and the whole name-ring — both link
          to the vertical's own sandbox surface. */}
      <div className="tiles-row">
        <TileWithPlinth
          src="/AnTonn/test/music-ceol.png"
          alt="Ceòl — Music"
          ringSrc="/AnTonn/test/ring-ceol.png"
          href="/AnTonn/ceol/test"
        />
        <TileWithPlinth
          src="/AnTonn/test/film-bhidio.png"
          alt="Bhidio — Film"
          ringSrc="/AnTonn/test/ring-bhidio.png"
          href="/AnTonn/bhidio/test"
        />
        <TileWithPlinth
          src="/AnTonn/test/books-leabhraichean.png"
          alt="Leabhraichean — Books"
          ringSrc="/AnTonn/test/ring-leabhraichean.png"
          href="/AnTonn/leabhraichean/test"
        />
        <TileWithPlinth
          src="/AnTonn/test/podcast.png"
          alt="Pod-chraoladh — Podcasts"
          ringSrc="/AnTonn/test/ring-podcraoladh.png"
          href="/AnTonn/podcraoladh/test"
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

      {/* Reidio bot — persistent radio control, bottom-left. Reads
          state from RadioProvider at the app root, so playback
          survives navigation to another test page. */}
      <RadioBot />

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

        /* An Tonn masthead — the heart-wave icon (square glow-on-black PNG).
           mix-blend-mode:screen blends its black backing into the page so no
           halo shows; sized as a masthead sitting near the top. */
        .antonn-title-wrap {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: min(40vw, 310px);
          z-index: 20;
          line-height: 0;
        }
        .antonn-title-img {
          width: 100%;
          height: auto;
          display: block;
          user-select: none;
          /* screen blend = the black backing reads as see-through over the page. */
          mix-blend-mode: screen;
          transition: filter 500ms ease;
        }
        /* Hover: colour-wave the heart — a shimmer unique to this icon, distinct
           from the rest of the page. Cycles ocean-teal → blue → violet → magenta. */
        .antonn-title-wrap { cursor: pointer; }
        .antonn-title-wrap:hover .antonn-title-img {
          animation: antonn-colourwave 5s linear infinite;
        }
        @keyframes antonn-colourwave {
          0%   { filter: sepia(0.7) saturate(3)   hue-rotate(150deg); }
          25%  { filter: sepia(0.7) saturate(3)   hue-rotate(210deg); }
          50%  { filter: sepia(0.7) saturate(3.5) hue-rotate(270deg); }
          75%  { filter: sepia(0.7) saturate(3)   hue-rotate(330deg); }
          100% { filter: sepia(0.7) saturate(3)   hue-rotate(150deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .antonn-title-wrap:hover .antonn-title-img {
            animation: none; filter: sepia(0.7) saturate(3) hue-rotate(210deg);
          }
        }

        /* Four category columns across the middle. Row is vertically
           centred in the viewport; each column takes equal flex share.
           The column stacks tile-on-top + spinning name-plinth beneath. */
        .tiles-row {
          position: absolute;
          top: 50%;
          left: 50%;
          /* Nudged left so the heart masthead centres over the Bhidio–
             Leabhraichean gap. */
          transform: translate(calc(-50% - 3vw), -50%);
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
          max-width: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        /* Positioned so the vortex hotspot can anchor to it. */
        .tile-wrap {
          position: relative;
          width: 100%;
          line-height: 0;
        }
        .tile {
          width: 100%;
          height: auto;
          display: block;
          user-select: none;
          filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0));
          transform: translate3d(0, 0, 0) scale(1);
          transition:
            transform 320ms cubic-bezier(0.2, 0.7, 0.3, 1),
            filter   320ms ease;
        }
        /* Hover: brighten + lift slightly forward. Fires on the whole
           column so hovering the ring or the vortex hotspot both lift
           the graphic — reads as "the whole column is one thing". */
        .tile-column:hover .tile,
        .tile-column:focus-within .tile {
          transform: translate3d(0, -14px, 0) scale(1.05);
          filter:
            brightness(1.28)
            drop-shadow(0 22px 34px rgba(0,0,0,0.55))
            drop-shadow(0 0 22px rgba(255,255,255,0.35));
        }

        /* Bright-centre vortex hotspot — small circle over the graphic's
           bright core. Kept transparent so the artwork underneath shows
           through; cursor + hover halo signal that it's the click target. */
        .tile-hotspot {
          position: absolute;
          left: 41%;
          top: 56%;
          width: 18%;
          height: 18%;
          border-radius: 50%;
          cursor: pointer;
          z-index: 5;
          transition: box-shadow 220ms ease, background 220ms ease;
        }
        .tile-hotspot:hover,
        .tile-hotspot:focus-visible {
          outline: none;
          background: radial-gradient(
            circle,
            rgba(255,255,255,0.28) 0%,
            rgba(255,255,255,0.10) 55%,
            rgba(255,255,255,0.00) 80%
          );
          box-shadow: 0 0 26px rgba(255,255,255,0.28);
        }

        /* Ring is wrapped in a Link that carries the clickable width
           so anywhere on the ring image counts as a hit. */
        .ring-link {
          display: block;
          width: 78%;
          margin-top: -140px;
          cursor: pointer;
          line-height: 0;
        }
        /* Static name-ring tucked up under the graphic. Alpha-keyed
           PNG, so the wave shader shows through around the ring. Spin
           returns once the 24-frame renders arrive. */
        .ring-static {
          display: block;
          width: 100%;
          height: auto;
          user-select: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .sniomh-glint { animation: none; }
        }
      `}</style>
    </div>
  )
}

// One column of the tiles row: the graphic image + a static metallic
// ring image tucked up underneath it. Two clickable hotspots — a small
// circle over the bright vortex centre of the graphic, and the whole
// name-ring — both linking to `href` (the vertical's sandbox surface).
// The rest of the graphic is intentionally NOT clickable; the entrances
// to each vertical are the vortex and the word.
function TileWithPlinth({ src, alt, ringSrc, href }) {
  return (
    <div className="tile-column">
      <div className="tile-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="tile" draggable={false} />
        {/* Bright-centre vortex hotspot. All four graphics have their
            bright vortex point at roughly (50%, 65%) of the image, so
            one hotspot geometry works for all. */}
        <Link href={href} className="tile-hotspot" aria-label={`Enter ${alt}`} />
      </div>
      <Link href={href} className="ring-link" aria-label={alt}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ringSrc}
          alt=""
          aria-hidden="true"
          className="ring-static"
          draggable={false}
        />
      </Link>
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
