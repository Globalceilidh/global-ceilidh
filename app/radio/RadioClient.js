'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Canvas } from '@react-three/fiber';
import VortexBackground from '../AnTonn/preview/components/VortexBackground';
import { ARTISTS, FALLBACK } from './data/artists';

// YouTube IFrame Player API — singleton loader. The API sets a global
// window.YT once its script finishes loading; we wrap the callback in
// a Promise so multiple sequencer instances share one load.
let ytApiReadyPromise = null;
function loadYouTubeAPI() {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (ytApiReadyPromise) return ytApiReadyPromise;
  ytApiReadyPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      document.head.appendChild(s);
    }
  });
  return ytApiReadyPromise;
}

// Only artists with at least one photo appear in the rotation. The
// right-tile picks video → photo-carousel-fallback → nothing based on
// what's available.
const READY_ARTISTS = ARTISTS.filter((a) => a.photos && a.photos.length > 0);
const ROTATION_MS = 18000;      // 18s per featured artist
const PHOTO_CAROUSEL_MS = 4500; // 4.5s per photo inside a tile carousel

const SPONSOR_TICKER_ITEM = {
  text: 'Fàilte gu Global Ceilidh Rèidio — sponsor a spot on our ticker at globalceilidh@gmail.com',
  href: 'mailto:globalceilidh@gmail.com',
};

function buildTickerItems(artist) {
  if (!artist) return [SPONSOR_TICKER_ITEM, { text: '·' }];
  return [
    { text: `${artist.emoji || ''} ${artist.name} · ${artist.tourDates}` },
    { text: '·' },
    SPONSOR_TICKER_ITEM,
    { text: '·' },
  ];
}

const ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
const ADSENSE_SLOT_RADIO_TOP = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RADIO_TOP;

export default function RadioClient() {
  // Mouse tracking — feeds VortexBackground so the whirlpool follows
  // the cursor (An Tonn parity).
  const [mouseUv, setMouseUv] = useState({ x: 0.5, y: 0.5 });
  const [docHidden, setDocHidden] = useState(false);

  const [featuredIdx, setFeaturedIdx] = useState(0);
  useEffect(() => {
    if (READY_ARTISTS.length < 2) return;
    const id = setInterval(() => {
      setFeaturedIdx((i) => (i + 1) % READY_ARTISTS.length);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, []);
  const featured = READY_ARTISTS[featuredIdx] || null;

  useEffect(() => {
    const handler = () => setDocHidden(document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const onPointerMove = (e) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    setMouseUv({ x: e.clientX / w, y: e.clientY / h });
  };

  return (
    <>
      {ADSENSE_PUB_ID && (
        <Script
          id="adsense-loader"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
          crossOrigin="anonymous"
        />
      )}

      <div style={pageOuterStyle} onPointerMove={onPointerMove}>
        {/* Vortex canvas — full viewport behind everything, follows cursor */}
        <div style={vortexLayerStyle}>
          <Canvas
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 0.01], fov: 90, near: 0.01, far: 100 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <VortexBackground
              intensity={0.24}
              mouseUv={mouseUv}
              paused={docHidden}
            />
          </Canvas>
        </div>

        {/* Content layer */}
        <main style={contentLayerStyle}>
          <div style={contentWrapperStyle}>
            <header style={mastheadStyle}>
              <h1 style={titleStyle}>Global Ceilidh Rèidio</h1>
              <p style={taglineStyle}>
                The soundtrack of an t-sruth streaming around the world.
              </p>
            </header>

            {/* AdSense above the panels */}
            <div style={adWrapperStyle}>
              <AdSenseUnit
                publisherId={ADSENSE_PUB_ID}
                slot={ADSENSE_SLOT_RADIO_TOP}
                label="Ad · above the wave"
              />
            </div>

            {/* Three panels: photo · Live365 · video (or photo carousel) */}
            <div style={featuredRowStyle}>
              {featured && <PhotoTile artist={featured} offset={0} wide={false} />}
              <div style={playerColumnStyle}>
                <div style={playerFrameStyle}>
                  <iframe
                    title="Global Ceilidh Radio — Live365 player"
                    width="450"
                    height="316"
                    frameBorder="0"
                    src="https://live365.com/embeds/v1/player/a11866?s=md&m=dark&c=mp3"
                    allow="autoplay; encrypted-media"
                    style={{ display: 'block', maxWidth: '100%' }}
                  />
                </div>
              </div>
              {featured && (
                featured.videos && featured.videos.length > 0
                  ? <VideoSequencerTile videos={featured.videos} name={featured.name} />
                  : featured.photos.length > 1
                    ? <PhotoTile artist={featured} offset={1} wide={true} />
                    : null
              )}
            </div>

            {/* Ticker — driven by featured artist; key on featured.id so the
                scroll animation restarts cleanly on every rotation. */}
            <div style={tickerOuterStyle} aria-label="Global Ceilidh Radio — featured artist tour dates and sponsor ticker">
              <div style={tickerViewportStyle}>
                <div className="gc-ticker-track" key={featured?.id || 'idle'}>
                  {(() => {
                    const items = buildTickerItems(featured);
                    return [...items, ...items].map((item, i) => (
                      <TickerItem key={i} item={item} />
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div style={footerStyle}>
              Interested in reserving your spot on the ticker? Email
              {' '}
              <a href="mailto:globalceilidh@gmail.com" style={footerLinkStyle}>
                globalceilidh@gmail.com
              </a>
              .
            </div>

            <style>{`
              @keyframes gc-ticker-scroll {
                0%   { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
              }
              .gc-ticker-track {
                display: flex;
                align-items: center;
                gap: 40px;
                white-space: nowrap;
                width: max-content;
                animation: gc-ticker-scroll 38s linear infinite;
                will-change: transform;
              }
              .gc-ticker-track > * { flex: 0 0 auto; }
              .gc-ticker-track:hover {
                animation-play-state: paused;
              }
              @media (prefers-reduced-motion: reduce) {
                .gc-ticker-track { animation: none; }
              }
            `}</style>
          </div>
        </main>
      </div>
    </>
  );
}

function TickerItem({ item }) {
  const body = item.logo ? (
    <span style={tickerLogoWrapStyle}>
      <img src={item.logo} alt={item.text || ''} style={tickerLogoStyle} />
      {item.text && <span style={tickerTextStyle}>{item.text}</span>}
    </span>
  ) : (
    <span style={item.text === '·' ? tickerBulletStyle : tickerTextStyle}>
      {item.text}
    </span>
  );

  if (item.href) {
    return (
      <a href={item.href} style={tickerLinkStyle}>
        {body}
      </a>
    );
  }
  return body;
}

function PhotoTile({ artist, offset = 0, wide = false }) {
  const photos = artist.photos || [];
  const [idx, setIdx] = useState(photos.length ? offset % photos.length : 0);
  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % photos.length);
    }, PHOTO_CAROUSEL_MS);
    return () => clearInterval(id);
  }, [photos.length]);

  if (photos.length === 0) return null;

  const base = wide ? videoTileStyle : photoTileStyle;
  return (
    <div style={{ ...base, position: 'relative' }}>
      {photos.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={artist.photoAlt || artist.name}
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 700ms ease-in-out',
            userSelect: 'none',
          }}
        />
      ))}
    </div>
  );
}

// Phase 2 sequencer — one persistent YouTube IFrame Player API
// instance that chains a `videos: [{ videoId, start, end }]` list.
// When the current clip reaches its `end`, YouTube fires the ENDED
// state; we `loadVideoById` the next clip immediately (no iframe
// reload, no black flash). When the sequence exhausts, wraps to 0.
// Controls fully suppressed via playerVars; click-eater on top.
function VideoSequencerTile({ videos, name }) {
  const [containerId] = useState(() => `yt-seq-${Math.random().toString(36).slice(2, 10)}`);
  const playerRef = useRef(null);
  const clipIdxRef = useRef(0);
  const videosRef = useRef(videos);

  useEffect(() => { videosRef.current = videos; }, [videos]);

  useEffect(() => {
    if (!videos || videos.length === 0) return;
    let cancelled = false;
    clipIdxRef.current = 0;

    loadYouTubeAPI().then((YT) => {
      if (cancelled) return;
      const outer = document.getElementById(containerId);
      if (!outer) return;
      // Fresh inner element each mount so YT's iframe replacement is clean
      outer.innerHTML = '';
      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      outer.appendChild(inner);

      const first = videos[0];
      const advance = (target) => {
        const N = videosRef.current.length;
        if (N === 0) return;
        const nextIdx = (clipIdxRef.current + 1) % N;
        clipIdxRef.current = nextIdx;
        const clip = videosRef.current[nextIdx];
        target.loadVideoById({
          videoId: clip.videoId,
          startSeconds: clip.start,
          endSeconds: clip.end,
        });
      };

      const player = new YT.Player(inner, {
        width: '100%',
        height: '100%',
        videoId: first.videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          start: first.start,
          end: first.end,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e) => {
            if (e.data === 0 /* ENDED */) advance(e.target);
          },
          onError: (e) => {
            // Unplayable / not-embeddable / removed — skip to next clip
            advance(e.target);
          },
        },
      });
      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
    };
  }, [videos, containerId]);

  if (!videos || videos.length === 0) return null;

  return (
    <div style={{ ...videoTileStyle, position: 'relative' }} aria-label={`${name} — video sequence`}>
      <div id={containerId} style={{ width: '100%', height: '100%' }} />
      {/* Click-eater — blocks residual YT click surfaces */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'auto',
          background: 'transparent',
          cursor: 'default',
        }}
      />
    </div>
  );
}

function AdSenseUnit({ publisherId, slot, label }) {
  useEffect(() => {
    if (!publisherId || !slot) return;
    try {
      // eslint-disable-next-line no-undef
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense not ready yet or blocked — silently ignore
    }
  }, [publisherId, slot]);

  if (!publisherId || !slot) {
    return (
      <div style={adPlaceholderStyle} aria-hidden="true">
        <div style={adPlaceholderInnerStyle}>
          {label} — set NEXT_PUBLIC_ADSENSE_PUBLISHER_ID and NEXT_PUBLIC_ADSENSE_SLOT_RADIO_TOP in Vercel to activate
        </div>
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', minHeight: 90 }}
      data-ad-client={publisherId}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const pageOuterStyle = {
  position: 'relative',
  minHeight: '100vh',
  background: '#020409',
  color: '#F2ECDC',
  overflow: 'hidden',
};

const vortexLayerStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
};

const contentLayerStyle = {
  position: 'relative',
  zIndex: 10,
  minHeight: '100vh',
  padding: '56px 20px 88px',
};

const contentWrapperStyle = {
  maxWidth: 1200,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
};

const mastheadStyle = {
  textAlign: 'center',
  padding: '8px 0 4px',
};

const titleStyle = {
  fontFamily: '"Cinzel", Georgia, serif',
  fontSize: 'clamp(38px, 6.5vw, 60px)',
  fontWeight: 600,
  letterSpacing: '0.04em',
  margin: '0 0 12px',
  color: '#F2ECDC',
  lineHeight: 1.05,
};

const taglineStyle = {
  fontFamily: '"EB Garamond", Georgia, serif',
  fontStyle: 'italic',
  fontSize: 'clamp(16px, 2vw, 20px)',
  color: 'rgba(242, 236, 220, 0.7)',
  margin: 0,
  maxWidth: 640,
  marginLeft: 'auto',
  marginRight: 'auto',
  lineHeight: 1.4,
};

const adWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  minHeight: 90,
};

const featuredRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 20,
};

const playerColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const playerFrameStyle = {
  background: 'rgba(0, 0, 0, 0.30)',
  border: '1px solid rgba(242, 236, 220, 0.10)',
  borderRadius: 8,
  padding: 8,
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
};

const TILE_H = 316;

const photoTileStyle = {
  width: 237,
  height: TILE_H,
  background: 'rgba(0, 0, 0, 0.30)',
  border: '1px solid rgba(242, 236, 220, 0.10)',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
};

const videoTileStyle = {
  width: 450,
  height: TILE_H,
  background: 'rgba(0, 0, 0, 0.30)',
  border: '1px solid rgba(242, 236, 220, 0.10)',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
};

const tickerOuterStyle = {
  padding: '18px 0',
  background: 'rgba(0, 0, 0, 0.55)',
  border: '1px solid rgba(242, 236, 220, 0.08)',
  borderRadius: 8,
  overflow: 'hidden',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
};

const tickerViewportStyle = {
  overflow: 'hidden',
  width: '100%',
};

const tickerTextStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 16,
  letterSpacing: 1.4,
  color: '#F2ECDC',
  textTransform: 'uppercase',
};

const tickerBulletStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 18,
  color: '#C9A047',
  padding: '0 6px',
};

const tickerLinkStyle = {
  textDecoration: 'none',
  transition: 'color 200ms ease',
};

const tickerLogoWrapStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 12,
};

const tickerLogoStyle = {
  height: 30,
  width: 'auto',
  display: 'block',
};

const footerStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 11,
  letterSpacing: 1.5,
  color: 'rgba(242, 236, 220, 0.5)',
  textAlign: 'center',
  textTransform: 'uppercase',
};

const footerLinkStyle = {
  color: '#C9A047',
  textDecoration: 'none',
  borderBottom: '1px solid rgba(201, 160, 71, 0.4)',
};

const adPlaceholderStyle = {
  width: '100%',
  maxWidth: 728,
  minHeight: 90,
  border: '1px dashed rgba(242, 236, 220, 0.2)',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 20px',
  background: 'rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
};

const adPlaceholderInnerStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  letterSpacing: 1.5,
  color: 'rgba(242, 236, 220, 0.4)',
  textTransform: 'uppercase',
  textAlign: 'center',
  lineHeight: 1.5,
};
