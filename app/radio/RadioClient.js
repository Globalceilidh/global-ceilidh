'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// Featured artists — three tiles rotate around the Live365 player:
//   left  = photo of the artist
//   right = video of the artist (muted YouTube autoplay)
// Artists without both `photo` AND `youtubeId` are skipped by the
// rotation, so we can pre-declare Skipinnish + Mànran and just fill
// their assets in later without touching the layout code.
const ARTISTS = [
  {
    id: 'ally-the-piper',
    name: 'Ally the Piper',
    tagline: 'Bagpipe-rock on the Thruway',
    photo: '/radio/ally-the-piper/photo-1.png',
    photoAlt: 'Ally the Piper — press photo',
    youtubeId: 'n2yFNWQRiU0',
  },
  { id: 'skipinnish', name: 'Skipinnish' },        // assets TBA
  { id: 'manran',     name: 'Mànran' },             // assets TBA
];

const READY_ARTISTS = ARTISTS.filter((a) => a.photo && a.youtubeId);
const ROTATION_MS = 18000; // 18s per featured artist

// Ticker items — replace via CMS later. Each item has:
//   { text?, logo?, href? }
// Text-only items render as serif text; logo items render as an image;
// items with both render as an image + label pair. Anything with an
// href becomes a link.
const TICKER_ITEMS = [
  { text: '🪈 Ally the Piper · US Club Tour · Jul 29 Albany NY (The Egg / Swyer Theatre) · Jul 30 Syracuse NY (Westcott Theater) · Aug 6 Ann Arbor MI (Blind Pig) · Aug 12 Grand Rapids MI (The Pyramid Scheme) · Aug 13–16 Milwaukee WI (Milwaukee Irish Fest)' },
  { text: '·' },
  { text: '🥁 Skipinnish · Sep 19 Gloucestershire, England · Nov 22–30 Germany Tour (Hamburg · Berlin · Cologne · Munich · Stuttgart) · Dec 3 Fort William (Nevis Centre) · Dec 4 Glasgow (Royal Concert Hall) · Dec 5 Glasgow (Barrowland Ballroom) · Dec 10 Perth (Perth Concert Hall) · Dec 11 Oban (Corran Halls)' },
  { text: '·' },
  { text: '🎸 Mànran · Jul 16 Isle of Lewis (HebCelt Festival) · Jul 26 Loon-Plage, France (Parc Galame) · Jul 30–Aug 1 Inverness (Belladrum Tartan Heart Festival) · Aug 14–15 York (The Magpies Festival) · Sep 4–6 Jedburgh (Edge Fest)' },
  { text: '·' },
  { text: 'Fàilte gu Rèidio Ceilidh Cruinne — sponsor a slot on the ticker at globalceilidh@gmail.com', href: 'mailto:globalceilidh@gmail.com' },
  { text: '·' },
];

const ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID; // e.g. ca-pub-xxxxxxxxxxxxxxxx
const ADSENSE_SLOT_RADIO_TOP = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RADIO_TOP;

export default function RadioClient() {
  // Rotate through artists with complete assets. If only 1 artist has
  // full data (photo + video), skip the timer and just show them.
  const [featuredIdx, setFeaturedIdx] = useState(0);
  useEffect(() => {
    if (READY_ARTISTS.length < 2) return;
    const id = setInterval(() => {
      setFeaturedIdx((i) => (i + 1) % READY_ARTISTS.length);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, []);
  const featured = READY_ARTISTS[featuredIdx] || null;

  return (
    <>
      {/* AdSense loader — only injected if a publisher ID is configured.
          The <ins> block below is a no-op until the loader runs. */}
      {ADSENSE_PUB_ID && (
        <Script
          id="adsense-loader"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
          crossOrigin="anonymous"
        />
      )}

      <main style={pageStyle}>
        <div style={contentWrapperStyle}>
          <header style={mastheadStyle}>
            <div style={eyebrowStyle}>● GLOBAL CEILIDH</div>
            <h1 style={titleGdStyle}>Rèidio Ceilidh Cruinne</h1>
            <div style={titleEnStyle}>Global Ceilidh Radio</div>
            <div style={taglineStyle}>
              Scottish Gaelic music, culture and community, streaming around the world.
            </div>
          </header>

          {/* Ad above the player */}
          <div style={adWrapperStyle}>
            <AdSenseUnit
              publisherId={ADSENSE_PUB_ID}
              slot={ADSENSE_SLOT_RADIO_TOP}
              label="Ad · above the wave"
            />
          </div>

          {/* Featured artist row: photo tile | Live365 player | video tile.
              Flex-wrap causes clean stacking below ~1150px viewport. */}
          {featured && (
            <div style={featuredEyebrowStyle}>
              ● NOW FEATURED · {featured.name.toUpperCase()}
              {featured.tagline && <span style={featuredTaglineStyle}> · {featured.tagline}</span>}
            </div>
          )}
          <div style={featuredRowStyle}>
            {featured && <PhotoTile artist={featured} />}
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
              <div style={playerCaptionStyle}>
                Broadcasting via Live365 · Powered by Global Ceilidh
              </div>
            </div>
            {featured && <VideoTile artist={featured} />}
          </div>

          {/* Ticker chyron */}
          <div style={tickerOuterStyle} aria-label="Global Ceilidh Radio — tour dates and sponsor ticker">
            <div style={tickerViewportStyle}>
              <div className="gc-ticker-track">
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                  <TickerItem key={i} item={item} />
                ))}
              </div>
            </div>
          </div>

          <div style={sponsorNoteStyle}>
            Groups, tours and businesses — sponsor a spot on the ticker at
            {' '}
            <a href="mailto:globalceilidh@gmail.com" style={sponsorLinkStyle}>
              globalceilidh@gmail.com
            </a>
            .
          </div>

          {/* Ticker keyframes + hover-pause + responsiveness */}
          <style>{`
            @keyframes gc-ticker-scroll {
              0%   { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .gc-ticker-track {
              display: flex;
              align-items: center;
              gap: 32px;
              white-space: nowrap;
              width: max-content;
              animation: gc-ticker-scroll 65s linear infinite;
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

function PhotoTile({ artist }) {
  return (
    <div style={photoTileStyle}>
      <img
        src={artist.photo}
        alt={artist.photoAlt || artist.name}
        style={photoImgStyle}
        draggable={false}
      />
    </div>
  );
}

function VideoTile({ artist }) {
  // Muted autoplay is browser-policy-safe. `loop=1` requires
  // `playlist=<same_id>` per YouTube's embed API.
  const src = `https://www.youtube.com/embed/${artist.youtubeId}` +
    `?autoplay=1&mute=1&loop=1&playlist=${artist.youtubeId}` +
    `&controls=1&modestbranding=1&rel=0&playsinline=1`;
  return (
    <div style={videoTileStyle}>
      <iframe
        title={`${artist.name} — video`}
        src={src}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
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
      // AdSense not ready yet, or blocked — silently ignore
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

const pageStyle = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at top, #17202b 0%, #0a0d14 55%, #050709 100%)',
  color: '#F2ECDC',
  padding: '48px 20px 80px',
  fontFamily: 'Georgia, serif',
};

const contentWrapperStyle = {
  maxWidth: 1200,   // wider than sruth-signup to fit the three-panel featured row
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 28,
};

const mastheadStyle = {
  textAlign: 'center',
  padding: '8px 0 12px',
};

const eyebrowStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 11,
  letterSpacing: 3,
  color: '#C9A047',
  marginBottom: 18,
};

const titleGdStyle = {
  fontFamily: '"Cinzel", Georgia, serif',
  fontSize: 'clamp(34px, 6vw, 52px)',
  fontWeight: 600,
  letterSpacing: '0.02em',
  margin: '0 0 6px',
  color: '#F2ECDC',
  lineHeight: 1.1,
};

const titleEnStyle = {
  fontFamily: '"EB Garamond", Georgia, serif',
  fontStyle: 'italic',
  fontSize: 'clamp(16px, 2vw, 20px)',
  color: 'rgba(242, 236, 220, 0.72)',
  marginBottom: 14,
};

const taglineStyle = {
  fontFamily: '"EB Garamond", Georgia, serif',
  fontSize: 15,
  lineHeight: 1.55,
  color: 'rgba(242, 236, 220, 0.65)',
  maxWidth: 520,
  margin: '0 auto',
};

const adWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  minHeight: 90,
};

const featuredEyebrowStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 11,
  letterSpacing: 3,
  color: '#C9A047',
  textAlign: 'center',
  marginTop: 4,
};

const featuredTaglineStyle = {
  color: 'rgba(242, 236, 220, 0.5)',
  letterSpacing: 2,
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
  gap: 10,
};

const TILE_H = 316;

const photoTileStyle = {
  width: 237,
  height: TILE_H,
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(242, 236, 220, 0.1)',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
};

const photoImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  userSelect: 'none',
};

const videoTileStyle = {
  width: 450,
  height: TILE_H,
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(242, 236, 220, 0.1)',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
};

const playerFrameStyle = {
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(242, 236, 220, 0.1)',
  borderRadius: 8,
  padding: 8,
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
};

const playerCaptionStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  letterSpacing: 2,
  color: 'rgba(242, 236, 220, 0.45)',
  textTransform: 'uppercase',
};

const tickerOuterStyle = {
  marginTop: 8,
  padding: '10px 0',
  background: 'rgba(0, 0, 0, 0.55)',
  border: '1px solid rgba(242, 236, 220, 0.08)',
  borderRadius: 6,
  overflow: 'hidden',
};

const tickerViewportStyle = {
  overflow: 'hidden',
  width: '100%',
};

const tickerTextStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 12,
  letterSpacing: 1.5,
  color: '#F2ECDC',
  textTransform: 'uppercase',
};

const tickerBulletStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 14,
  color: '#C9A047',
  padding: '0 4px',
};

const tickerLinkStyle = {
  textDecoration: 'none',
  transition: 'color 200ms ease',
};

const tickerLogoWrapStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
};

const tickerLogoStyle = {
  height: 26,
  width: 'auto',
  display: 'block',
};

const sponsorNoteStyle = {
  fontFamily: '"EB Garamond", Georgia, serif',
  fontStyle: 'italic',
  fontSize: 14,
  color: 'rgba(242, 236, 220, 0.55)',
  textAlign: 'center',
  marginTop: 4,
};

const sponsorLinkStyle = {
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
};

const adPlaceholderInnerStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  letterSpacing: 1.5,
  color: 'rgba(242, 236, 220, 0.35)',
  textTransform: 'uppercase',
  textAlign: 'center',
  lineHeight: 1.5,
};
