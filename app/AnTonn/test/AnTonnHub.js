'use client'

// /AnTonn/test — sandbox surface. Solid black canvas with the standard
// AnTonn chrome (Sniomh homepage icon top-left, Let's Talk pill top-right,
// EN/GD language slider bottom-right). Plus a WebGL wave shader in the
// background that trails ripples from the cursor.

import Link from 'next/link'
import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import LanguagePill from '../../../components/LanguagePill'
import RadioBot from '../../../components/RadioBot'
import { useLanguage } from '../../../context/LanguageContext'

// Easter-egg creed revealed by tapping the heart-wave icon. Bilingual.
const CREED_EN = 'An end will come upon the world, but love and music will endure.'
const CREED_GD = 'Thig crìoch air an t-saoghal, ach mairidh gaol is ceòl.'

// SSR-off — the canvas uses WebGL which needs `window`. Also lazy-loads
// the R3F bundle so it doesn't block first paint.
const WaveBackground = dynamic(() => import('./WaveBackground'), { ssr: false })

export default function AnTonnTest() {
  const { t, language } = useLanguage()
  const [showCreed, setShowCreed] = useState(false)

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
      <div
        className="antonn-title-wrap"
        role="button"
        tabIndex={0}
        aria-label="An Tonn"
        aria-pressed={showCreed}
        onClick={() => setShowCreed((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setShowCreed((v) => !v)
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/AnTonn/test/AnTonn-alpha.png"
          alt="An Tonn"
          className="antonn-title-img"
          draggable={false}
        />
        {/* Easter egg — tap the heart to reveal the creed just beneath it. */}
        <p className={`antonn-creed${showCreed ? ' show' : ''}`} aria-hidden={!showCreed}>
          {language === 'gd' ? CREED_GD : CREED_EN}
        </p>
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
          href="/AnTonn/ceol"
        />
        <TileWithPlinth
          src="/AnTonn/test/film-bhidio.png"
          alt="Bhidio — Film"
          ringSrc="/AnTonn/test/ring-bhidio.png"
          href="/AnTonn/bhidio"
        />
        <TileWithPlinth
          src="/AnTonn/test/books-leabhraichean.png"
          alt="Leabhraichean — Books"
          ringSrc="/AnTonn/test/ring-leabhraichean.png"
          href="/AnTonn/leabhraichean"
        />
        <TileWithPlinth
          src="/AnTonn/test/podcast.png"
          alt="Pod-chraoladh — Podcasts"
          ringSrc="/AnTonn/test/ring-podcraoladh.png"
          href="/AnTonn/podcraoladh"
        />
      </div>

      {/* Let's Talk pill — same treatment as /AnTonn/radio + /AnTonn/marble. */}
      <a href="/contact" className="lets-talk-pill">{t('common.lets_talk')}</a>

      {/* EN ⇄ GD slider — bottom-right, mirroring the top-right pill. */}
      <LanguagePill
        position="bottom-right"
        layout="toggle"
        variant="white"
        offsetBottom={56}
        offsetRight={30}
        className="antonn-langpill"
      />

      {/* Reidio bot — persistent radio control, bottom-left. Reads
          state from RadioProvider at the app root, so playback
          survives navigation to another test page. */}
      <RadioBot />

      <style>{`
        /* White "Let's Talk" pill — top-right. Class-based so a media query
           can shrink it on phones (was an inline style, un-shrinkable). */
        .lets-talk-pill {
          position: absolute;
          top: 56px;
          right: 30px;
          padding: 11px 26px;
          border-radius: 999px;
          background: #FFFFFF;
          color: #0A0D14;
          font-family: var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif;
          font-weight: 400;
          font-size: 18px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
          z-index: 30;
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
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
          /* true alpha PNG (luminance-keyed) — transparent backing on any bg. */
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

        /* Easter-egg creed — fades in just below the heart-wave icon on tap.
           top:100% anchors it to the bottom of the (positioned) title-wrap so
           it always sits directly under the icon whatever the icon's size. */
        .antonn-creed {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 14px;
          width: max(220px, 120%);
          max-width: 92vw;
          text-align: center;
          line-height: 1.5;
          font-family: 'Cormorant Garamond', 'Fraunces', Georgia, serif;
          font-style: italic;
          font-size: clamp(15px, 2.4vw, 20px);
          color: #FFFFFF;
          text-shadow: 0 1px 14px rgba(0, 0, 0, 0.55);
          opacity: 0;
          pointer-events: none;
          transition: opacity 700ms ease;
          z-index: 25;
        }
        .antonn-creed.show { opacity: 0.94; }

        /* Four category columns across the middle. Row is vertically
           centred in the viewport; each column takes equal flex share.
           The column stacks tile-on-top + spinning name-plinth beneath. */
        .tiles-row {
          position: absolute;
          top: 50%;
          left: 50%;
          /* Nudged left of centre and dropped down a touch. */
          transform: translate(calc(-50% - 2vw), calc(-50% + 5vh));
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

        /* ── Mobile / phone widths ─────────────────────────────────────
           Desktop chrome is sized for a big canvas; on a phone the
           sniomh, both pills and the 4-across tile row are all wrong.
           Shrink the chrome and re-flow the tiles into a 2x2 grid
           (Music · Bhidio / Books · Podcasts), larger, with each icon
           sitting ABOVE its name-ring (the desktop -140px ring pull
           dwarfs a small tile and floats the ring over it). */
        @media (max-width: 680px) {
          .sniomh-wrap { top: 14px; left: 14px; width: 62px; height: 62px; }

          .lets-talk-pill {
            top: 26px; right: 14px;
            padding: 6px 15px;
            font-size: 12px;
            letter-spacing: 0.06em;
          }

          /* Scale the EN/GD slider down from its anchored bottom-right corner,
             and nudge it down toward the edge (was sitting too high). */
          .antonn-langpill {
            transform: translateY(20px) scale(0.72);
            transform-origin: bottom right;
          }

          /* Masthead a touch smaller so it clears the shrunken chrome. */
          .antonn-title-wrap { top: 12px; width: min(52vw, 210px); }

          /* 4 columns -> 2x2 grid, centred and dropped clear of the masthead. */
          .tiles-row {
            top: 50%;
            transform: translate(-50%, calc(-50% + 3vh));
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0 6vw;
            width: min(90vw, 420px);
            align-items: start;
          }
          .tile-column { max-width: none; }
          /* Bring the two rows toward the vertical centre — top row down, bottom
             row up (~3% of height each). Dial the 3vh up to ~5vh for more. */
          .tiles-row .tile-column:nth-child(-n + 2) { transform: translateY(3vh); }
          .tiles-row .tile-column:nth-child(n + 3)  { transform: translateY(-3vh); }
          /* Icon above ring: pull the ring up under the tile. -15vw left too
             big a gap; -21vw matches the desktop ~47%-of-tile overlap. */
          .ring-link { width: 84%; margin-top: -21vw; }
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
