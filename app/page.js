'use client';

// / — GlobalCeilidh.com front door.
//
// Concept (Scott, 2026-07-18): Alice-down-the-rabbit-hole × Wizard-of-Oz
// cyclone (L. Frank Baum was a Syracuse-area man). Black & white only. The
// site's sniomh chrome whirlpool is the way through; a cartoon wooden sign
// points into it. The caption is NOT baked into the sign art — it's overlaid
// here so it flips EN⇄GD with the pill.
//   • click the glowing core          → /saoghal (the orientation)
//   • reidio icon, bottom-left         → /radio
//   • sruth wordplate, bottom-right    → /sruth  (gleams on hover)
//   • EN/GD pill, top-left
//
// This replaces the old coming-soon gate as the crawlable, real front door.
// SEO text is rendered (screen-reader-only) so Googlebot has real content
// instead of a placeholder image — that thin placeholder is why "global
// ceilidh" searches were surfacing the Live365 station page instead of us.
//
// TUNING: the constants below (GLOW, SIGN, CAP) position the click target,
// the signpost, and the caption over the art. They're eyeballed from the
// assets — nudge them once it's live if anything's a hair off.

import { useEffect, useState } from 'react';
import LanguagePill from '../components/LanguagePill';
import { useLanguage } from '../context/LanguageContext';

const VORTEX_SRC = '/gc-vortex-center.png';   // square, fades to black
const SIGN_SRC   = '/gc-vortex-sign.png';     // cartoon arrow, transparent PNG
const REIDIO_ICON = '/AnTonn/test/reidio-icon.png';

const SRUTH = {
  ready: false,                    // ← flip true once the still exists
  src: '/sruth/sruth-wordplate.png',
};

// All positions are % of the centred square "stage" (which tracks the vortex
// art exactly), so overlays stay glued at any viewport size.

// GLOW — the white-hot core of the whirlpool (this art: just left/below centre).
const GLOW = { top: '52%', left: '47%', size: '26%' };

// SIGN — the cartoon signpost block, upper-right. The new art points down-left,
// so no flip needed; it aims into the swirl from the upper-right corner.
const SIGN = { top: '-3%', left: '55%', width: '44%', rotate: '0deg', flip: false };

// CAP — the toggling caption, over the blank plank *within* the sign block
// (tilts + tracks with the sign). Plank rises to the right → negative rotate.
const CAP = { top: '41%', left: '56%', width: '48%', rotate: '-20deg' };

export default function Home() {
  const [vortexError, setVortexError] = useState(false);
  const [signError, setSignError] = useState(false);
  const { language } = useLanguage();

  const caption = language === 'gd' ? ['TÒISICHIBH', 'AN SEO'] : ['START', 'HERE'];

  return (
    <main style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* ── Centred square stage: vortex + core hotspot + signpost ──── */}
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(100vw, 100vh)', height: 'min(100vw, 100vh)',
        }}
      >
        {vortexError ? (
          <VortexPlaceholder />
        ) : (
          <img
            src={VORTEX_SRC}
            alt="A silver chrome whirlpool spiralling into a white-hot centre"
            onError={() => setVortexError(true)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        )}

        {/* Core → /saoghal */}
        <a
          href="/saoghal"
          aria-label={language === 'gd' ? 'Tòisichibh an seo' : 'Start here'}
          className="gc-core"
          style={{
            position: 'absolute', top: GLOW.top, left: GLOW.left,
            transform: 'translate(-50%, -50%)',
            width: GLOW.size, height: GLOW.size, borderRadius: '50%',
            cursor: 'pointer', zIndex: 5,
          }}
        />

        {/* Signpost block (art + caption) — upper-left, pointing in */}
        <div
          className="gc-sign"
          style={{
            position: 'absolute', top: SIGN.top, left: SIGN.left,
            width: SIGN.width, aspectRatio: '1 / 1',
            transform: `rotate(${SIGN.rotate})`,
            transformOrigin: 'center center',
            zIndex: 6, pointerEvents: 'none',
          }}
        >
          {!signError && (
            <img
              src={SIGN_SRC}
              alt=""
              aria-hidden="true"
              onError={() => setSignError(true)}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'contain',
                transform: SIGN.flip ? 'scaleX(-1)' : 'none',
              }}
            />
          )}
          {/* Carved caption on the blank plank (toggles EN/GD) */}
          <div
            aria-hidden="true"
            className="gc-plank"
            style={{
              position: 'absolute', top: CAP.top, left: CAP.left, width: CAP.width,
              transform: `translate(-50%, -50%) rotate(${CAP.rotate})`,
            }}
          >
            {caption.map((line, i) => (
              <span key={i} className="gc-plank-line">{line}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom-left: reidio → /radio ────────────────────────────── */}
      <a
        href="/radio" aria-label="Global Ceilidh Radio" title="Global Ceilidh Radio"
        className="gc-reidio"
        style={{ position: 'fixed', bottom: 'clamp(20px, 4vh, 44px)', left: 'clamp(20px, 4vw, 44px)', zIndex: 10, display: 'block', lineHeight: 0 }}
      >
        <img src={REIDIO_ICON} alt="Global Ceilidh Radio"
          style={{ width: 'clamp(52px, 8vw, 84px)', height: 'auto', display: 'block' }} />
      </a>

      {/* ── Bottom-right: sruth wordplate → /sruth ──────────────────── */}
      <a
        href="/sruth" aria-label="sruth. — sign up and read the archive" title="sruth."
        className="gc-sruth"
        style={{ position: 'fixed', bottom: 'clamp(20px, 4vh, 44px)', right: 'clamp(20px, 4vw, 44px)', zIndex: 10, display: 'block' }}
      >
        {SRUTH.ready ? (
          <span className="gc-sruth-plate gc-sruth-img">
            <img src={SRUTH.src} alt="sruth."
              style={{ width: 'clamp(120px, 18vw, 220px)', height: 'auto', display: 'block' }} />
          </span>
        ) : (
          <span className="gc-sruth-plate gc-sruth-ph" aria-hidden="true">sruth.</span>
        )}
      </a>

      {/* ── EN / GD pill, top-left (pure white on black) ────────────── */}
      <LanguagePill position="top-left" variant="white" />

      {/* ── SEO: real, crawlable content (visually hidden) ──────────── */}
      <div className="gc-sr-only">
        <h1>Global Ceilidh — The Global Home of Scottish Gaelic Culture</h1>
        <p>
          Fàilte gu GlobalCeilidh.com. The gathering place for the global Gàidhlig
          diaspora — the story of the language and cultar nan Gàidheal, a living
          radio station, the Sruth culture newsletter, and An Saoghal, a map of the
          Gaelic world. Enter through the centre to begin.
        </p>
        <nav aria-label="Global Ceilidh">
          <a href="/saoghal">An Saoghal — the map of the Gaelic world</a>
          <a href="/radio">Global Ceilidh Radio — Scottish Gaelic music, streaming</a>
          <a href="/sruth">Sruth — sign up for the Scottish Gaelic culture newsletter</a>
          <a href="/sruth/archive">Sruth archive — read past issues</a>
          <a href="/welcome">Join the Cèilidh — build your page</a>
        </nav>
      </div>

      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
    </main>
  );
}

function VortexPlaceholder() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(circle at 47% 52%, #ffffff 0%, #f2f2f2 5%, #9a9a9a 16%, #3a3a3a 34%, #0d0d0d 62%, #000000 100%)',
    }} />
  );
}

const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Global Ceilidh',
  alternateName: 'GlobalCeilidh.com',
  url: 'https://globalceilidh.com',
  description: 'The global home of Scottish Gaelic language, culture and community.',
  // TODO(scott): add sameAs → your Live365 station URL + socials.
  // sameAs: ['https://live365.com/station/...'],
};

const STYLES = `
  .gc-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  .gc-core { transition: box-shadow 240ms ease; animation: gc-core-pulse 3.4s ease-in-out infinite; }
  .gc-core:hover { box-shadow: 0 0 70px 10px rgba(255,255,255,0.30); }
  @keyframes gc-core-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.06); }
    50%      { box-shadow: 0 0 40px 6px rgba(255,255,255,0.16); }
  }
  /* Caption on the blank plank — dark, carved/emboss look. */
  .gc-plank { display: flex; flex-direction: column; align-items: center; text-align: center;
    font-family: var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif;
    text-transform: uppercase; line-height: 0.86; letter-spacing: 0.04em; }
  .gc-plank-line { font-size: clamp(13px, 3.4vmin, 40px); color: #2a2622;
    text-shadow: 0 1px 0 rgba(255,255,255,0.30), 0 -1px 1px rgba(0,0,0,0.55); }
  /* Corner icon hovers. */
  .gc-reidio img, .gc-sruth-plate { transition: transform 220ms ease, filter 220ms ease; }
  .gc-reidio:hover img { transform: scale(1.08); filter: drop-shadow(0 0 14px rgba(255,255,255,0.35)); }
  .gc-sruth-plate { position: relative; display: inline-block; overflow: hidden; }
  .gc-sruth-plate::after { content: ""; position: absolute; top: 0; left: -120%; width: 60%; height: 100%;
    background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 65%, transparent 100%);
    transform: skewX(-18deg); pointer-events: none; }
  .gc-sruth:hover .gc-sruth-plate::after { animation: gc-gleam 850ms ease-out; }
  @keyframes gc-gleam { from { left: -120%; } to { left: 160%; } }
  .gc-sruth-ph { padding: 14px 30px; border-radius: 6px;
    background: linear-gradient(160deg, #2b2b2b 0%, #050505 45%, #1c1c1c 100%); border: 1px solid #333; color: #eaeaea;
    font-family: var(--font-fraunces), Georgia, serif; font-style: italic; font-weight: 700; font-size: clamp(24px, 4vw, 44px); line-height: 1;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.5); }
  @media (prefers-reduced-motion: reduce) {
    .gc-core { animation: none; }
    .gc-sruth:hover .gc-sruth-plate::after { animation: none; }
  }
`;
