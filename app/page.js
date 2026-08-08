'use client';

// / — GlobalCeilidh.com front door.
//
// Concept (Scott, 2026-07-18): Alice-down-the-rabbit-hole × Wizard-of-Oz
// cyclone (L. Frank Baum was a Syracuse-area man). Black & white only. The
// site's cuairt-shruth chrome whirlpool is the way through; a cartoon wooden sign
// points into it. The caption is NOT baked into the sign art — it's overlaid
// here so it flips EN⇄GD with the pill.
//   • click the glowing core          → the welcome cinematic (members → /duilleag)
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

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import LanguagePill from '../components/LanguagePill';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent, pickContent } from '../lib/siteContent';

const VORTEX_VIDEO = '/gc-vortex-mercury.mp4'; // rotating mercury whirlpool (8s loop, fades to black)
const VORTEX_STILL = '/gc-vortex-center.png';  // still fallback: reduced-motion, video poster, load error
const SIGN_SRC   = '/gc-vortex-sign-2.png';   // cartoon arrow, transparent PNG
const REIDIO_ICON = '/AnTonn/test/reidio-icon.png';
const ANTONN_ICON = '/AnTonn/test/AnTonn.png';   // wave-heart emblem (An Tonn wing)

// LAUNCH — the cuairt-shruth stays STILL (dormant) until this instant, then the
// mercury whirlpool starts spinning: Global Ceilidh begins. Scott, 2026-08-07:
// 1 September 2026, 09:00 BST = 08:00 UTC. Month is 0-indexed (8 = September).
const LAUNCH_MS = Date.UTC(2026, 8, 1, 8, 0, 0);

const SRUTH = { ready: true, src: '/gc-sruth-logo.png' };

// The Jabberwocky verse — the hidden-head easter egg. Toggles EN/GD with the
// pill. (Public Gàidhlig still needs Lewis/Joe sign-off before it's "final".)
const POEM_EN = [
  `’Twas a slate-bright, glowing morning,`,
  `The old tracks were utterly lost,`,
  `I took a wild-bound through the ferocious woods,`,
  `While the road twisted off into the dark unknown.`,
  `“Keep on, for your own sake!” said the urisk,`,
  `“Over the streams and the peaks with speed!”`,
  `The path tangled up, made a sudden pivot,`,
  `And I came to an end in an entirely different ocean!`,
];
const POEM_GD = [
  `’S e madainn sglèatach, shoilleir a bh’ ann,`,
  `Chaidh na seann-cheuman gu tur air chall,`,
  `Thug mi spionn-leum tro na borb-choilltean,`,
  `’S an rathad a’ casadh don dall.`,
  `“Cùm ort, air do shon!” ars an ùruisg,`,
  `“Thar nan sruthan ’s nan sgùrran gu luath!”`,
  `Shnaidhmich an t-slighe, rinn i iom-chasadh,`,
  `’S thàinig mi gu crìoch anns an ath-chuan!`,
];

// All positions are % of the centred square "stage" (which tracks the vortex
// art exactly), so overlays stay glued at any viewport size.

// GLOW — the white-hot core of the whirlpool (this art: just left/below centre).
const GLOW = { top: '52%', left: '47%', size: '26%' };

// SIGN — the cartoon signpost block, upper-right. The new art points down-left,
// so no flip needed; it aims into the swirl from the upper-right corner.
// Placed so the base of the post sits on the 2-o'clock rim of the vortex.
const SIGN = { top: '15%', left: '68%', width: '33%', rotate: '0deg', flip: false };

// CAP — the toggling caption, over the blank plank *within* the sign block
// (tilts + tracks with the sign). Plank rises to the right → negative rotate.
const CAP = { top: '46%', left: '58%', width: 'auto', rotate: '-25deg' };

// HEAD — hidden easter-egg hotspot over the wee figure's head (the cluster of
// spheres at the base-right of the post). Silent: default cursor, no glow,
// nothing hints it's there. Clicking it reveals the Jabberwocky verse up top.
const HEAD = { top: '44%', left: '94%', size: '9%' };

export default function Home() {
  const [vortexError, setVortexError] = useState(false);
  const [signError, setSignError] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [poemOpen, setPoemOpen] = useState(false);
  const [now, setNow] = useState(null); // client clock for the launch countdown
  const { language } = useLanguage();
  // The easter-egg verse is editor-editable (home.easter_egg); falls back to
  // the in-code POEM_* when no edit has been published.
  const site = useSiteContent();

  // The vortex art is 16:9. Under objectFit:cover it's cropped to its churning
  // bright centre (reads as "spinning"); under objectFit:contain the whole calm
  // swirl shows, centred. We now render the CONTAIN view on every viewport, and
  // on desktop we show the still poster (non-spinning) — matching exactly what a
  // phone shows when autoplay is blocked (Scott's request, 2026-08-03).
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const on = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Honour reduced-motion: show the still swirl instead of the looping video.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const on = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Launch countdown: tick the client clock every second. `now` stays null on
  // the server + first paint (no hydration mismatch), so the still/dormant
  // cuairt-shruth is what renders until this resolves on the client.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Has the whirlpool woken? Before the launch instant the cuairt-shruth is a still
  // (dormant) image on every viewport; at/after it, the mercury video spins.
  const launched = now != null && now >= LAUNCH_MS;

  // Mobile browsers block <video autoPlay> unless `muted` is set as a DOM
  // PROPERTY — React's muted attribute alone is unreliable, so the video never
  // starts on phones. Set it on the element and explicitly kick play(). Also
  // re-runs when `launched` flips true, so a visitor sitting on the page at
  // 09:00 sees it start spinning without a reload.
  const videoRef = useRef(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduceMotion) return;
    v.muted = true;
    const tryPlay = () => { v.play?.().catch(() => {}); };
    tryPlay();
    v.addEventListener('canplay', tryPlay, { once: true });
    v.addEventListener('loadeddata', tryPlay, { once: true });
    // Autoplay-blocked phones: start on the first touch/tap anywhere.
    const onGesture = () => { tryPlay(); done(); };
    const done = () => {
      document.removeEventListener('touchstart', onGesture);
      document.removeEventListener('click', onGesture);
    };
    document.addEventListener('touchstart', onGesture, { once: true, passive: true });
    document.addEventListener('click', onGesture, { once: true });
    return () => {
      v.removeEventListener('canplay', tryPlay);
      v.removeEventListener('loadeddata', tryPlay);
      done();
    };
  }, [reduceMotion, isMobile, launched]);

  // Where the glowing core goes. Until Clerk has loaded we don't know, so
  // default to the story — that's correct for every first-time visitor,
  // and the worst case for a member is one extra click rather than a
  // flash of the wrong destination.
  const { isLoaded, isSignedIn } = useAuth();
  // Members drop into their own room; first-time visitors get the welcome
  // cinematic (the origins story), which is the entry mechanism into the
  // site. It lives in the Archives now — /saoghal itself is the hub you
  // explore once you're in, not the front-door funnel.
  const coreHref = isLoaded && isSignedIn ? '/duilleag' : '/saoghal/archives/Gael_1';

  // Countdown breakdown (days/hours/mins/secs remaining to launch). Only shown
  // once the client clock resolves and while we're still pre-launch.
  const cdDiff = Math.max(0, LAUNCH_MS - (now ?? LAUNCH_MS));
  const cdTotal = Math.floor(cdDiff / 1000);
  const showCountdown = now != null && !launched;
  const cdDays  = Math.floor(cdTotal / 86400);
  const cdHours = Math.floor((cdTotal % 86400) / 3600);
  const cdMins  = Math.floor((cdTotal % 3600) / 60);
  const cdSecs  = cdTotal % 60;
  // Each cell goes red at 10 and below (the "final stretch" cue). Because
  // hours/mins/secs cycle, they flip back to white the instant they roll
  // over (e.g. secs 10→…→0 red, then back to 59 white); days only counts
  // down, so once it hits 10 it stays red.
  const cdCells = [
    { v: cdDays,  n: String(cdDays),                     label: language === 'gd' ? 'Làithean'   : 'Days'  },
    { v: cdHours, n: String(cdHours).padStart(2, '0'),   label: language === 'gd' ? 'Uairean'    : 'Hours' },
    { v: cdMins,  n: String(cdMins).padStart(2, '0'),    label: language === 'gd' ? 'Mionaidean' : 'Mins'  },
    { v: cdSecs,  n: String(cdSecs).padStart(2, '0'),    label: language === 'gd' ? 'Diogan'     : 'Secs'  },
  ];

  const caption = language === 'gd' ? ['TÒISICHIBH', 'AN SEO'] : ['START', 'HERE'];
  // GD is much longer than EN — size it down so it stays on the plank.
  const capFont = language === 'gd'
    ? 'clamp(12px, 3.3vmin, 40px)'
    : 'clamp(13px, 3.6vmin, 44px)';

  return (
    <main style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* ── Centred square stage: vortex + core hotspot + signpost ──── */}
      <div
        style={{
          position: 'absolute', top: '56%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(100vw, 100vh)', height: 'min(100vw, 100vh)',
        }}
      >
        {(!launched || vortexError || reduceMotion) ? (
          // Pre-launch (and reduced-motion / video-error) = the still, DORMANT
          // swirl on every viewport — contain-fit, whole scene centred. The
          // whirlpool only wakes and spins at the launch instant (LAUNCH_MS);
          // until then the countdown below marks the wait.
          <img
            src={VORTEX_STILL}
            alt="A silver chrome whirlpool spiralling into a white-hot centre"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <video
            ref={videoRef}
            src={VORTEX_VIDEO}
            poster={VORTEX_STILL}
            autoPlay loop muted playsInline preload="auto"
            aria-label="A silver chrome whirlpool spiralling into a white-hot centre"
            onError={() => setVortexError(true)}
            // Mobile only: the whole tilted swirl shows (contain), not cropped
            // to its bright centre.
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        )}

        {/* Core → the origins story for a stranger, your own page once
            you've joined. The story is an introduction; meeting it again
            every single visit would make the front door a lecture you
            can't get past. It stays reachable from /saoghal/sgeulachdan. */}
        <a
          href={coreHref}
          aria-label={language === 'gd' ? 'Tòisichibh an seo' : 'Start here'}
          className="gc-core"
          style={{
            position: 'absolute', top: GLOW.top, left: GLOW.left,
            transform: 'translate(-50%, -50%)',
            width: GLOW.size, height: GLOW.size, borderRadius: '50%',
            cursor: 'pointer', zIndex: 5,
          }}
        />

        {/* Hidden easter egg: the wee figure's head → the Jabberwocky verse.
            No glow, default cursor — nothing signals it; you find it by chance. */}
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setPoemOpen((v) => !v)}
          className="gc-head"
          style={{
            position: 'absolute', top: HEAD.top, left: HEAD.left,
            transform: 'translate(-50%, -50%)',
            width: HEAD.size, aspectRatio: '1 / 1', borderRadius: '50%',
            zIndex: 7,
          }}
        />

        {/* Signpost block (art + caption). Also a click target for the verse —
            no glow, default cursor, so it stays a quiet easter egg. */}
        <div
          className="gc-sign"
          onClick={() => setPoemOpen((v) => !v)}
          style={{
            position: 'absolute', top: SIGN.top, left: SIGN.left,
            width: SIGN.width, aspectRatio: '1 / 1',
            transform: `rotate(${SIGN.rotate})`,
            transformOrigin: 'center center',
            zIndex: 6, pointerEvents: 'auto', cursor: 'default',
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
              <span key={i} className="gc-plank-line" style={{ fontSize: capFont }}>{line}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Launch countdown — the cuairt-shruth is dormant until 1 Sept 09:00 BST.
             Fixed overlay in the lower-centre (above the icon row); pointer-
             events:none so the core + signpost stay clickable through it. ── */}
      {showCountdown && (
        <div className="gc-countdown" aria-hidden="true">
          <div className="gc-cd-eyebrow">
            {language === 'gd' ? 'Tòisichidh an cuairt-shruth a’ snìomh' : 'The whirlpool begins to spin'}
          </div>
          <div className="gc-cd-clock">
            {cdCells.map((c, i) => (
              <div className="gc-cd-cell" key={i}>
                <span className={`gc-cd-num${c.v <= 10 ? ' gc-cd-hot' : ''}`}>{c.n}</span>
                <span className="gc-cd-label">{c.label}</span>
              </div>
            ))}
          </div>
          <div className="gc-cd-date">
            {language === 'gd' ? '1 DEN T-SULTAIN 2026 · 9M' : '1 SEPTEMBER 2026 · 9 AM'}
          </div>
        </div>
      )}

      {/* ── The Jabberwocky verse — revealed by the hidden head hotspot ── */}
      <div
        className={`gc-poem${poemOpen ? ' gc-poem-open' : ''}`}
        aria-hidden={!poemOpen}
        onClick={() => setPoemOpen(false)}
      >
        {pickContent(site, 'home.easter_egg', { en: POEM_EN.join('\n'), gd: POEM_GD.join('\n') }, language)
          .split('\n').filter((l) => l.trim().length)
          .map((line, i) => (
            <p key={i} className="gc-poem-line">{line}</p>
          ))}
      </div>

      {/* ── Bottom-left: reidio → /radio ────────────────────────────── */}
      <a
        href="/radio" aria-label="Global Ceilidh Radio" title="Global Ceilidh Radio"
        className="gc-reidio"
        style={{ position: 'fixed', bottom: 'clamp(44px, 9vh, 140px)',
          left: isMobile ? '16%' : 'clamp(28px, 5vw, 80px)',
          transform: isMobile ? 'translate(-50%, 50%)' : 'translateY(50%)',
          zIndex: 10, display: 'block', lineHeight: 0 }}
      >
        <span className="gc-icon-cap" aria-hidden="true">
          <span className="gc-cap-name">{language === 'gd' ? 'Rèidio Global Ceilidh' : 'Global Ceilidh Radio'}</span>
          <span className="gc-cap-status">{language === 'gd' ? 'ri fhaighinn a-nis — èist…' : 'available now — listen…'}</span>
        </span>
        <img src={REIDIO_ICON} alt="Global Ceilidh Radio"
          style={{ width: 'clamp(72px, 10.5vw, 126px)', height: 'auto', display: 'block' }} />
      </a>

      {/* ── Bottom-centre: An Tonn → /AnTonn (between reidio and sruth) ── */}
      <a
        href="/AnTonn" aria-label="An Tonn — the entertainment wing" title="An Tonn"
        className="gc-antonn"
        style={{ position: 'fixed', bottom: 'clamp(44px, 9vh, 140px)', left: '50%', transform: 'translate(-50%, 50%)', zIndex: 10, display: 'block', lineHeight: 0 }}
      >
        <span className="gc-icon-cap" aria-hidden="true">
          <span className="gc-cap-name">An Tonn</span>
          <span className="gc-cap-status">{language === 'gd' ? 'a’ tighinn a dh’aithghearr…' : 'coming soon…'}</span>
        </span>
        <img src={ANTONN_ICON} alt="An Tonn"
          style={{ width: 'clamp(94px, 13.5vw, 168px)', height: 'auto', display: 'block', mixBlendMode: 'screen' }} />
      </a>

      {/* ── Bottom-right: sruth wordplate → /sruth ──────────────────── */}
      <a
        href="/sruth/archive" aria-label="sruth. — read the archive" title="sruth."
        className="gc-sruth"
        style={{ position: 'fixed', bottom: 'clamp(44px, 9vh, 140px)',
          left: isMobile ? '84%' : 'auto',
          right: isMobile ? 'auto' : 'clamp(20px, 4vw, 44px)',
          transform: isMobile ? 'translate(-50%, 50%)' : 'translateY(50%)',
          zIndex: 10, display: 'block' }}
      >
        <span className="gc-icon-cap" aria-hidden="true">
          <span className="gc-cap-status">{language === 'gd' ? 'tasglann ri fhaighinn a-nis — leugh' : 'archives available now — read'}</span>
        </span>
        {SRUTH.ready ? (
          <span className="gc-sruth-logo" role="img" aria-label="sruth."
            style={{ '--sruth': `url(${SRUTH.src})` }}>
            <span className="gc-sruth-gleam" aria-hidden="true" />
          </span>
        ) : (
          <span className="gc-sruth-plate gc-sruth-ph" aria-hidden="true">sruth.</span>
        )}
      </a>

      {/* ── EN / GD pill, top-left (pure white on black) ────────────── */}
      <LanguagePill position="top-left" variant="white" className="gc-langpill" />

      {/* ── SEO: real, crawlable content (visually hidden) ──────────── */}
      <div className="gc-sr-only">
        <h1>Global Ceilidh — The Global Home of Scottish Gaelic Culture</h1>
        <p>
          Fàilte gu GlobalCeilidh.com. The gathering place for the global Gàidhlig
          diaspora — the story of the language and cultar nan Gàidheal, a living
          radio station, the Sruth culture newsletter, and An Saoghal, a map of the
          Gaelic world. Enter through the centre to begin.
        </p>
        <p>Global Ceilidh opens on 1 September 2026 at 9am.</p>
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
  // sameAs ties this Organization to its other verified identities so Google
  // treats them as one entity (and stops surfacing the raw Live365 listing
  // instead of us). Add Facebook / Instagram / YouTube URLs here as they come.
  sameAs: [
    'https://live365.com/station/Global-Ceilidh-Radio-a11866',
    'https://www.facebook.com/GlobalCeilidh',
    // Instagram + X to be appended when created (~Aug 2026).
  ],
};

const STYLES = `
  .gc-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  /* Hidden head hotspot — deliberately invisible + no pointer cursor, so the
     cursor never "does its thing" as you pass over it. Findable only by chance. */
  .gc-head { background: transparent; border: 0; padding: 0; margin: 0; outline: none;
    cursor: default; -webkit-appearance: none; appearance: none; }
  /* The Jabberwocky verse: white lettering across the top, fades in on reveal. */
  .gc-poem { position: fixed; top: clamp(14px, 3.5vh, 44px); left: 50%; z-index: 20;
    width: min(92vw, 720px); text-align: center;
    transform: translateX(-50%) translateY(-6px);
    opacity: 0; pointer-events: none; transition: opacity 750ms ease, transform 750ms ease;
    font-family: var(--font-fraunces), Georgia, "Times New Roman", serif; color: #ffffff; }
  .gc-poem-open { opacity: 1; pointer-events: auto; cursor: pointer;
    transform: translateX(-50%) translateY(0); }
  .gc-poem-line { margin: 0.16em 0; font-style: italic; font-weight: 500;
    font-size: clamp(11px, 1.9vmin, 20px); line-height: 1.5; letter-spacing: 0.01em;
    text-shadow: 0 1px 8px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.9); }
  .gc-core { transition: box-shadow 240ms ease; animation: gc-core-pulse 3.4s ease-in-out infinite; }
  .gc-core:hover { box-shadow: 0 0 70px 10px rgba(255,255,255,0.30); }
  @keyframes gc-core-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.06); }
    50%      { box-shadow: 0 0 40px 6px rgba(255,255,255,0.16); }
  }
  /* Caption on the blank plank — dark, carved/emboss look. */
  .gc-plank { display: flex; flex-direction: column; align-items: center; text-align: center;
    font-family: var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif;
    text-transform: uppercase; line-height: 0.82; letter-spacing: 0.04em; }
  .gc-plank-line { white-space: nowrap; font-size: clamp(13px, 3.6vmin, 44px); color: #2a2622;
    text-shadow: 0 1px 0 rgba(255,255,255,0.30), 0 -1px 1px rgba(0,0,0,0.55); }
  /* Corner icon hovers. */
  .gc-reidio img, .gc-antonn img, .gc-sruth-plate { transition: transform 220ms ease, filter 220ms ease; }
  .gc-reidio:hover img { transform: scale(1.08); filter: drop-shadow(0 0 14px rgba(255,255,255,0.35)); }
  /* An Tonn logo: screen-blended onto black, so no drop-shadow glow on hover. */
  .gc-antonn:hover img { transform: scale(1.08); }
  .gc-sruth-plate { position: relative; display: inline-block; overflow: hidden; }
  .gc-sruth-plate::after { content: ""; position: absolute; top: 0; left: -120%; width: 60%; height: 100%;
    background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 65%, transparent 100%);
    transform: skewX(-18deg); pointer-events: none; }
  .gc-sruth:hover .gc-sruth-plate::after { animation: gc-gleam 850ms ease-out; }
  @keyframes gc-gleam { from { left: -120%; } to { left: 160%; } }
  /* Real logo: glossy-black "sruth." on transparent — glow to lift it off the
     black page; gleam sweep masked to the letter shapes so it shines on the
     letters only, not the empty bounding box. */
  .gc-sruth-logo {
    display: block; position: relative;
    width: clamp(200px, 24vw, 372px); aspect-ratio: 1672 / 941;
    background: var(--sruth) center / contain no-repeat;
    filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)) drop-shadow(0 0 16px rgba(255,255,255,0.22));
    transition: filter 240ms ease, transform 240ms ease;
  }
  .gc-sruth:hover .gc-sruth-logo {
    filter: drop-shadow(0 0 9px rgba(255,255,255,0.85)) drop-shadow(0 0 24px rgba(255,255,255,0.42));
    transform: scale(1.04);
  }
  .gc-sruth-gleam {
    position: absolute; inset: 0;
    -webkit-mask: var(--sruth) center / contain no-repeat;
    mask: var(--sruth) center / contain no-repeat;
    background: linear-gradient(115deg, transparent 42%, rgba(255,255,255,0.95) 50%, transparent 58%);
    background-size: 250% 100%; background-position: 160% 0; opacity: 0;
  }
  .gc-sruth:hover .gc-sruth-gleam { opacity: 1; animation: gc-gleam2 900ms ease-out; }
  @keyframes gc-gleam2 { from { background-position: 160% 0; } to { background-position: -60% 0; } }
  .gc-sruth-ph { padding: 14px 30px; border-radius: 6px;
    background: linear-gradient(160deg, #2b2b2b 0%, #050505 45%, #1c1c1c 100%); border: 1px solid #333; color: #eaeaea;
    font-family: var(--font-fraunces), Georgia, serif; font-style: italic; font-weight: 700; font-size: clamp(24px, 4vw, 44px); line-height: 1;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.5); }
  /* ── Launch countdown — white chrome on the dormant black whirlpool ── */
  .gc-countdown { position: fixed; left: 50%; bottom: clamp(178px, 27vh, 340px);
    transform: translate(-50%, -4vh); z-index: 12; pointer-events: none;
    width: min(94vw, 760px); text-align: center; color: #fff; }
  /* Soft dark halo so the digits stay legible over the swirl's mid-ring. */
  .gc-countdown::before { content: ""; position: absolute; inset: -22% -14%;
    background: radial-gradient(58% 60% at 50% 50%, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.30) 46%, transparent 76%);
    z-index: -1; pointer-events: none; }
  .gc-cd-eyebrow { font-family: var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif;
    text-transform: uppercase; letter-spacing: 0.22em; line-height: 1.3; color: rgba(255,255,255,0.84);
    font-size: clamp(12px, 2.1vmin, 21px); margin-bottom: clamp(10px, 1.9vmin, 22px);
    text-shadow: 0 1px 10px rgba(0,0,0,0.85); }
  .gc-cd-clock { display: flex; justify-content: center; align-items: flex-start; gap: clamp(14px, 3.2vmin, 42px); }
  .gc-cd-cell { display: flex; flex-direction: column; align-items: center; min-width: clamp(46px, 11vmin, 96px); }
  .gc-cd-num { font-family: var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif;
    font-size: clamp(44px, 10.5vmin, 108px); line-height: 0.9; letter-spacing: 0.02em; color: #fff;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 24px rgba(255,255,255,0.30), 0 2px 14px rgba(0,0,0,0.75);
    transition: color 300ms ease, text-shadow 300ms ease; }
  /* Final stretch: a cell turns red at 10 and below (whites back out on roll-over). */
  .gc-cd-num.gc-cd-hot { color: #ff3b30;
    text-shadow: 0 0 26px rgba(255,59,48,0.50), 0 2px 14px rgba(0,0,0,0.78); }
  .gc-cd-label { font-family: var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif;
    text-transform: uppercase; letter-spacing: 0.18em; color: rgba(255,255,255,0.62);
    font-size: clamp(10px, 1.7vmin, 16px); margin-top: clamp(4px, 0.9vmin, 10px); }
  .gc-cd-date { font-family: var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif;
    text-transform: uppercase; letter-spacing: 0.28em; color: rgba(255,255,255,0.72);
    font-size: clamp(11px, 1.9vmin, 18px); margin-top: clamp(14px, 2.4vmin, 26px);
    text-shadow: 0 1px 10px rgba(0,0,0,0.85); }
  /* ── Signage above each bottom icon (name + status) ── */
  .gc-icon-cap { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
    margin-bottom: clamp(8px, 1.4vh, 18px); width: max-content; max-width: clamp(120px, 16vw, 200px);
    display: flex; flex-direction: column; align-items: center; gap: clamp(2px, 0.4vh, 5px);
    text-align: center; pointer-events: none; }
  .gc-cap-name { font-family: var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif;
    text-transform: uppercase; letter-spacing: 0.12em; line-height: 1; color: #fff;
    font-size: clamp(13px, 1.7vmin, 20px);
    text-shadow: 0 1px 8px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9); }
  .gc-cap-status { font-family: var(--font-fraunces), Georgia, serif; font-style: italic;
    line-height: 1.15; color: rgba(255,255,255,0.82); font-size: clamp(10px, 1.3vmin, 13px);
    text-shadow: 0 1px 6px rgba(0,0,0,0.92); }
  /* An Tonn + Sruth signage sits a little lower (closer to their icons). */
  .gc-antonn .gc-icon-cap, .gc-sruth .gc-icon-cap { margin-bottom: clamp(2px, 0.7vh, 9px); }
  @media (max-width: 768px) {
    /* Countdown sits a touch higher on phones so it clears the icon row. */
    .gc-countdown { bottom: clamp(150px, 24vh, 260px); transform: translate(-50%, -8vh); }
    .gc-cd-eyebrow { letter-spacing: 0.13em; }
    .gc-cd-date { letter-spacing: 0.16em; }
    /* Trim the EN/GD pill (its size is inline, so scale the whole thing). */
    .gc-langpill { transform: scale(0.66); transform-origin: top left; }
    /* Sruth wordmark — a touch bigger, still balanced against the two icons. */
    .gc-sruth-logo { width: clamp(122px, 33vw, 186px); }
    /* Icon signage: narrower + smaller so the three don't collide on phones. */
    .gc-icon-cap { max-width: 32vw; margin-bottom: clamp(6px, 1vh, 12px); }
    .gc-cap-name { font-size: clamp(11px, 3vw, 15px); letter-spacing: 0.08em; }
    .gc-cap-status { font-size: clamp(9px, 2.4vw, 12px); }
    /* Drop the Jabberwocky verse below the pill. */
    .gc-poem { top: clamp(64px, 13vh, 96px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .gc-core { animation: none; }
    .gc-sruth:hover .gc-sruth-plate::after { animation: none; }
    .gc-poem { transition: opacity 200ms ease; transform: translateX(-50%); }
  }
`;
