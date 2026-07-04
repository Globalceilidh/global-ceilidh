'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// Ticker items — replace via CMS later. Each item has:
//   { text?, logo?, href? }
// Text-only items render as serif text; logo items render as an image;
// items with both render as an image + label pair. Anything with an
// href becomes a link.
const TICKER_ITEMS = [
  { text: 'TIDE LINES · UK Tour · July 2026 · Glasgow, Edinburgh, Stornoway, Halifax NS, Boston', href: '#' },
  { text: '·' },
  { text: 'MÀNRAN · North American Tour · August 2026 · Inverness → Skye → Cape Breton → Toronto → NYC', href: '#' },
  { text: '·' },
  { text: 'SKERRYVORE · Autumn Tour · September 2026 · Tiree, Glasgow, Belfast, Halifax, NYC', href: '#' },
  { text: '·' },
  { text: 'Fàilte gu Rèidio Ceilidh Cruinne — sponsor a slot on the ticker at radio@globalceilidh.com', href: 'mailto:radio@globalceilidh.com' },
  { text: '·' },
];

const ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID; // e.g. ca-pub-xxxxxxxxxxxxxxxx
const ADSENSE_SLOT_RADIO_TOP = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RADIO_TOP;

export default function RadioClient() {
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

          {/* Live365 embed — verbatim from Whitey's dashboard snippet */}
          <div style={playerWrapperStyle}>
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
            <a href="mailto:radio@globalceilidh.com" style={sponsorLinkStyle}>
              radio@globalceilidh.com
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
              animation: gc-ticker-scroll 65s linear infinite;
              will-change: transform;
            }
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
  maxWidth: 720,
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

const playerWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 10,
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
