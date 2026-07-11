'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { Canvas } from '@react-three/fiber';
import VortexBackground from '../preview/components/VortexBackground';
import LanguagePill from '../../../components/LanguagePill';
import { ARTISTS, FALLBACK, matchArtist } from './data/artists';

const LIVE365_POLL_MS = 5000; // 5s poll — API caches server-side for 4s so upstream still fires only ~15/min max

// Tiles are driven by Live365 metadata (Phase 3). Until that's wired,
// `featured` stays null and both tiles render the empty/placeholder
// state — the JS artist-rotation timer was removed because it was
// misleading (showing Ally while the stream played a totally
// different artist).
const PHOTO_CAROUSEL_MS = 8500;

const SPONSOR_TICKER_ITEM = {
  text: 'Fàilte gu Global Ceilidh Rèidio — sponsor a spot on our ticker at globalceilidh@gmail.com',
  href: 'mailto:globalceilidh@gmail.com',
};

// Ticker cycles through every artist WITH tour dates set, regardless
// of what's on screen or on the Live365 stream. Artists in the library
// without tourDates (i.e. added for photo rotation only) are matched
// on-air but stay out of the ticker so we don't render "Name · null".
const TICKER_ITEMS = [
  ...ARTISTS
    .filter((a) => a.tourDates)
    .flatMap((a) => [
      { text: `${a.emoji || ''} ${a.name} · ${a.tourDates}` },
      { text: '·' },
    ]),
  SPONSOR_TICKER_ITEM,
  { text: '·' },
];

const ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
const ADSENSE_SLOT_RADIO_TOP = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RADIO_TOP;

export default function RadioClient() {
  // Mouse tracking — feeds VortexBackground so the whirlpool follows
  // the cursor (An Tonn parity).
  const [mouseUv, setMouseUv] = useState({ x: 0.5, y: 0.5 });
  const [docHidden, setDocHidden] = useState(false);


  // Live365 sync — poll /api/live365/nowplaying every LIVE365_POLL_MS,
  // run the artist string through matchArtist(), set featured to the
  // ARTIST record if we own assets for them. If Live365 plays someone
  // not in the library, matchArtist returns null and both tiles fall
  // back to the EmptyTile (which shows FALLBACK.logo when present).
  const [featured, setFeatured] = useState(null);

  // Modals — Vote drives An Tonn's editorial pipeline. Request is an
  // open queue that surfaces in sruth-admin.
  const [showVote, setShowVote] = useState(false);
  const [showRequest, setShowRequest] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch('/api/live365/nowplaying', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data?.ok && data.artist) {
          const match = matchArtist(data.artist);
          setFeatured(match || null);
        } else {
          setFeatured(null);
        }
      } catch (_) {
        // Network hiccup — leave `featured` as-is until the next tick
      }
    };
    poll();
    const id = setInterval(poll, LIVE365_POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

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
          <div className="gc-radio-wrapper" style={contentWrapperStyle}>
            <header style={mastheadStyle}>
              <h1 style={titleStyle}>Global Cèilidh Rèidio</h1>
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

            {/* Three panels: photo · Live365 · video (or photo carousel).
                When featured is null (no Live365 match, or before Phase 3
                is wired) both flanking tiles render their empty state. */}
            <div style={featuredRowStyle}>
              <div style={playerFrameStyle}>
                <iframe
                  title="Global Ceilidh Radio — Live365 player"
                  frameBorder="0"
                  src="https://live365.com/embeds/v1/player/a11866?s=md&m=dark&c=mp3"
                  allow="autoplay; encrypted-media"
                  style={{ width: '100%', height: '100%', display: 'block', border: 0 }}
                />
              </div>
              {featured
                ? <PhotoTile artist={featured} offset={0} wide={true} />
                : <EmptyTile wide={true} />
              }
            </div>

            {/* Vote + Request pills — Vote drives An Tonn Top-10s (Best
                Artist / Song / Album). Requests land in sruth-admin. */}
            <div style={pillRowStyle}>
              <button type="button" style={pillStyle} onClick={() => setShowVote(true)}>
                <span style={pillDotStyle} aria-hidden="true">◆</span>
                Vote
              </button>
              <button type="button" style={pillStyle} onClick={() => setShowRequest(true)}>
                <span style={pillDotStyle} aria-hidden="true">♪</span>
                Request a Song
              </button>
            </div>

            {/* Ticker — INDEPENDENT of the featured tiles. Continuous
                scroll through every artist's tour dates + the sponsor
                CTA. Never re-mounts. */}
            <div style={tickerOuterStyle} aria-label="Global Ceilidh Radio — tour dates and sponsor ticker">
              <div style={tickerViewportStyle}>
                <div className="gc-ticker-track">
                  {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                    <TickerItem key={i} item={item} />
                  ))}
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
                animation: gc-ticker-scroll 110s linear infinite;
                will-change: transform;
              }
              .gc-ticker-track > * { flex: 0 0 auto; }
              .gc-ticker-track:hover {
                animation-play-state: paused;
              }
              @media (prefers-reduced-motion: reduce) {
                .gc-ticker-track { animation: none; }
              }
              /* Tighten vertical rhythm on phones — reclaim ~90px of
                 vertical space by trimming top/bottom padding and the
                 flex-column gap. Desktop untouched. */
              @media (max-width: 768px) {
                .gc-radio-wrapper {
                  padding: 24px 12px 32px !important;
                  gap: 20px !important;
                }
              }
              /* Wide fallback logo — the source image has generous
                 negative space baked in around the actual card. At
                 desktop tile size (450x316) that padding shows;
                 scaling up by 1.35 hides it. Phone crops naturally
                 via the narrow-tile aspect override so it stays out
                 of this zoom.
                 transform-origin at (60%, 40%) — scale expands from
                 upper-right of the tile, so the composition centre
                 shifts down-and-left by ~3.5% in each axis (~15px
                 left, ~11px down at 450x316). Whitey's "smidge". */
              @media (min-width: 769px) {
                .gc-fallback-logo-wide {
                  transform: scale(1.35);
                  /* Origin at 50% 10% shifts the composition centre
                     to (50%, 64%): no horizontal offset (undoes the
                     previous 15px left shift = 1 smidge right), and
                     ~44px down at 316 tall (3 smidges down). */
                  transform-origin: 50% 10%;
                }
              }
            `}</style>
          </div>
        </main>

        {/* EN/GD language toggle — top-left, opposite corner from Let's Talk. */}
        <LanguagePill position="top-left" variant="dark" />

        {/* Let's Talk pill — matches /AnTonn/marble corner pill (same
            style, same position). Anchors to pageOuterStyle. */}
        <a href="/contact" style={letsTalkStyle}>Let&apos;s Talk</a>

        {showVote && <VoteModal onClose={() => setShowVote(false)} />}
        {showRequest && <RequestModal onClose={() => setShowRequest(false)} />}
      </div>
    </>
  );
}

// ── Vote modal ────────────────────────────────────────────────────────
// Loads categories on mount, then nominees for the selected category.
// Radio buttons for nominees + a write-in text field at the bottom.
// Server enforces one-per-category-per-IP-per-day; a 409 turns into a
// friendly message.
// Categories are stable (3 rows, hand-curated). Hardcoding them here
// skips a network round-trip on modal open and — more importantly —
// stops the select from redrawing after the fetch resolves, which was
// causing the modal to visibly "switch" into its final state a beat
// after it opened.
const VOTE_CATEGORIES = [
  { id: 'best-artist', label: 'Best Artist' },
  { id: 'best-song',   label: 'Best Song'   },
  { id: 'best-album',  label: 'Best Album'  },
];

function VoteModal({ onClose }) {
  const [categoryId, setCategoryId] = useState('best-artist');
  const [nominees, setNominees] = useState([]);
  const [nomineesLoading, setNomineesLoading] = useState(true);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [writeIn, setWriteIn] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState({ kind: 'idle' });

  useEffect(() => {
    let alive = true;
    setNomineesLoading(true);
    setNominees([]);
    setSelectedTargetId(null);
    fetch(`/api/radio/vote?category=${encodeURIComponent(categoryId)}`)
      .then(r => r.json())
      .then(d => {
        if (!alive) return;
        if (d.ok) setNominees(d.nominees || []);
        setNomineesLoading(false);
      })
      .catch(() => { if (alive) setNomineesLoading(false); });
    return () => { alive = false; };
  }, [categoryId]);

  const submit = async () => {
    if (status.kind === 'submitting') return;

    let payload;
    if (writeIn.trim()) {
      payload = {
        category_id: categoryId,
        target_type: 'writein',
        writein_label: writeIn.trim(),
        honeypot,
      };
    } else if (selectedTargetId) {
      payload = {
        category_id: categoryId,
        target_type: 'nominee',
        target_id: selectedTargetId,
        honeypot,
      };
    } else {
      setStatus({ kind: 'error', message: 'Pick a nominee or type a write-in.' });
      return;
    }

    setStatus({ kind: 'submitting' });
    try {
      const res = await fetch('/api/radio/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus({
          kind: 'ok',
          message: data.promoted
            ? 'Vote recorded — your write-in just hit 5 votes and is now a nominee!'
            : 'Vote recorded. Come back tomorrow for another.',
        });
      } else {
        setStatus({ kind: 'error', message: data.error || 'Something went wrong.' });
      }
    } catch (err) {
      setStatus({ kind: 'error', message: 'Network error — try again.' });
    }
  };

  return (
    <ModalShell title="Vote — Top 10" onClose={onClose}>
      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>Category</label>
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setStatus({ kind: 'idle' }); }}
          style={modalSelectStyle}
        >
          {VOTE_CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>Nominees</label>
        <div style={nomineeListStyle}>
          {nomineesLoading ? (
            <div style={{ ...nomineeRowStyle, color: 'rgba(242,236,220,0.5)', fontStyle: 'italic' }}>
              Loading nominees…
            </div>
          ) : nominees.length === 0 ? (
            <div style={{ ...nomineeRowStyle, color: 'rgba(242,236,220,0.5)', fontStyle: 'italic' }}>
              No nominees yet — be the first with a write-in below.
            </div>
          ) : (
            nominees.map(n => (
              <label key={n.id} style={nomineeRowStyle}>
                <input
                  type="radio"
                  name="nominee"
                  value={n.id}
                  checked={selectedTargetId === n.id}
                  onChange={() => { setSelectedTargetId(n.id); setWriteIn(''); }}
                />
                <span>{n.label}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>Or write in a nominee</label>
        <input
          type="text"
          value={writeIn}
          onChange={(e) => { setWriteIn(e.target.value); if (e.target.value) setSelectedTargetId(null); }}
          placeholder={
            categoryId === 'best-artist' ? 'Artist name'
            : categoryId === 'best-song' ? 'Song title'
            : 'Album title'
          }
          maxLength={200}
          style={modalInputStyle}
        />
        <div style={modalHintStyle}>
          Write-ins become official nominees after 5 votes.
        </div>
      </div>

      {/* Honeypot — hidden field. Bots fill it, humans do not. */}
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={honeypotStyle}
        aria-hidden="true"
      />

      {status.kind === 'error' && (
        <div style={modalErrorStyle}>{status.message}</div>
      )}
      {status.kind === 'ok' && (
        <div style={modalOkStyle}>{status.message}</div>
      )}

      <div style={modalActionRowStyle}>
        <button type="button" style={modalCancelStyle} onClick={onClose}>
          {status.kind === 'ok' ? 'Close' : 'Cancel'}
        </button>
        {status.kind !== 'ok' && (
          <button
            type="button"
            style={modalSubmitStyle}
            onClick={submit}
            disabled={status.kind === 'submitting'}
          >
            {status.kind === 'submitting' ? 'Submitting…' : 'Cast vote'}
          </button>
        )}
      </div>
    </ModalShell>
  );
}

// ── Request modal ─────────────────────────────────────────────────────
// Open queue. Server throttles to 3 requests / 10 min per IP.
function RequestModal({ onClose }) {
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState({ kind: 'idle' });

  const submit = async () => {
    if (status.kind === 'submitting') return;
    if (!songTitle.trim()) {
      setStatus({ kind: 'error', message: 'Song title required.' });
      return;
    }
    setStatus({ kind: 'submitting' });
    try {
      const res = await fetch('/api/radio/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          song_title: songTitle,
          artist_name: artistName,
          album_name: albumName,
          notes,
          honeypot,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus({
          kind: 'ok',
          message: 'Request received — thanks! We\'ll queue it into the rotation.',
        });
      } else {
        setStatus({ kind: 'error', message: data.error || 'Something went wrong.' });
      }
    } catch {
      setStatus({ kind: 'error', message: 'Network error — try again.' });
    }
  };

  return (
    <ModalShell title="Request a Song" onClose={onClose}>
      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>Song title *</label>
        <input
          type="text"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          maxLength={300}
          style={modalInputStyle}
        />
      </div>
      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>Artist</label>
        <input
          type="text"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          maxLength={200}
          style={modalInputStyle}
        />
      </div>
      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>Album</label>
        <input
          type="text"
          value={albumName}
          onChange={(e) => setAlbumName(e.target.value)}
          maxLength={200}
          style={modalInputStyle}
        />
      </div>
      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={3}
          style={{ ...modalInputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={honeypotStyle}
        aria-hidden="true"
      />

      {status.kind === 'error' && <div style={modalErrorStyle}>{status.message}</div>}
      {status.kind === 'ok' && <div style={modalOkStyle}>{status.message}</div>}

      <div style={modalActionRowStyle}>
        <button type="button" style={modalCancelStyle} onClick={onClose}>
          {status.kind === 'ok' ? 'Close' : 'Cancel'}
        </button>
        {status.kind !== 'ok' && (
          <button
            type="button"
            style={modalSubmitStyle}
            onClick={submit}
            disabled={status.kind === 'submitting'}
          >
            {status.kind === 'submitting' ? 'Submitting…' : 'Send request'}
          </button>
        )}
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, children, onClose }) {
  return (
    <div style={modalBackdropStyle} onClick={onClose}>
      <div style={modalPanelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>{title}</h2>
          <button type="button" onClick={onClose} style={modalCloseXStyle} aria-label="Close">×</button>
        </div>
        <div style={modalBodyStyle}>{children}</div>
      </div>
    </div>
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

// Empty state — shown when Live365 plays an artist not in the ARTISTS
// library, or briefly on first page load. Solid dark tile bg (NOT
// translucent — the logo's transparent corners were letting the
// vortex bleed through as milky white). Picks logoWide vs logoNarrow
// so each tile aspect gets its purpose-designed image with no crop.
function EmptyTile({ wide }) {
  const base = wide ? videoTileStyle : photoTileStyle;
  const logo = wide ? FALLBACK.logoWide : FALLBACK.logoNarrow;
  return (
    <div
      style={{
        ...base,
        position: 'relative',
        background: '#050709',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      }}
    >
      {logo && (
        <img
          src={logo}
          alt="Global Ceilidh Radio"
          draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          // Class scopes the desktop-only zoom (see media query in
          // the style tag). Only wide fallback needs the zoom — narrow
          // logo is designed for portrait, no baked-in padding issue.
          className={wide ? 'gc-fallback-logo-wide' : ''}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            userSelect: 'none',
          }}
        />
      )}
    </div>
  );
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
            // Narrow (portrait) photos letterbox inside the landscape
            // panel; the tile's translucent bg lets the vortex show
            // through the letterbox borders. Landscape photos fill
            // exactly. Same rule for either aspect — no crop.
            objectFit: 'contain',
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 1400ms ease-in-out',
            userSelect: 'none',
          }}
        />
      ))}
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
  // overflowX only — allow vertical document scroll. `overflow: hidden`
  // was silently clipping the featured row (which extends past viewport
  // when fixed 450px tiles wrap on a 375px phone).
  overflowX: 'hidden',
};

// Static pill in the top-right corner — mirrors /AnTonn/marble.
const letsTalkStyle = {
  position: 'absolute',
  top: 26, right: 30,
  padding: '11px 26px',
  borderRadius: 999,
  background: '#F2ECDC',
  color: '#0A0D14',
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  letterSpacing: 0.3,
  textDecoration: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  zIndex: 30,
  transition: 'transform 220ms ease, box-shadow 220ms ease',
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
};

const contentWrapperStyle = {
  maxWidth: 1200,
  margin: '0 auto',
  // dvh = dynamic viewport height. Matches the currently-visible
  // viewport on mobile (100vh includes the collapsed address bar area,
  // making the wrapper taller than visible screen; dvh matches what
  // the user actually sees).
  minHeight: '100dvh',
  padding: '56px 20px 88px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
};

const mastheadStyle = {
  textAlign: 'center',
  padding: '8px 0 4px',
};

const titleStyle = {
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif',
  // Bebas Neue is display-weight by design (400 reads like a bold);
  // bumping to 700 lets the browser synthesize extra weight for the
  // "Bold" ask.
  fontSize: 'clamp(48px, 8vw, 78px)',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: '0 0 12px',
  color: '#F2ECDC',
  lineHeight: 1.0,
};

const taglineStyle = {
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
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
  // Grow to fill vertical slack in the wrapper flex column — ticker
  // + footer get pushed toward the bottom of the viewport instead of
  // clustering at the top with empty vortex below.
  flex: '1 1 auto',
};

const playerColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

// Player tile matches the media (right) tile dimensions so the two
// panels feel like a balanced pair — was noticeably smaller before
// because the frame's width was content-based.
const playerFrameStyle = {
  width: 'min(100%, 450px)',
  aspectRatio: '450 / 316',
  minHeight: 316,               // ← never shrink below Live365's native
                                //   content height, even on narrow
                                //   phones where the aspect calc would
                                //   otherwise give ~235px. Prevents
                                //   internal scroll inside the iframe.
  flexShrink: 0,
  background: 'rgba(0, 0, 0, 0.30)',
  border: '1px solid rgba(242, 236, 220, 0.10)',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
  boxSizing: 'border-box',
};

// Wide tile scales down to viewport on mobile; keeps its 450x316
// aspect ratio so nothing crushes vertically. Narrow tile is unused
// now that the left panel is dropped, but kept in case we ever want
// it back.
const photoTileStyle = {
  width: 'min(100%, 237px)',
  aspectRatio: '237 / 316',
  flexShrink: 0,
  background: 'rgba(0, 0, 0, 0.30)',
  border: '1px solid rgba(242, 236, 220, 0.10)',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
};

const videoTileStyle = {
  width: 'min(100%, 450px)',
  aspectRatio: '450 / 316',
  minHeight: 316,               // ← never shrink below Live365's native
                                //   content height, even on narrow
                                //   phones where the aspect calc would
                                //   otherwise give ~235px. Prevents
                                //   internal scroll inside the iframe.
  flexShrink: 0,
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

// ── Pills + modal styles ──────────────────────────────────────────────

const pillRowStyle = {
  display: 'flex',
  gap: 14,
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const pillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: '#F2ECDC',
  background: 'rgba(20, 30, 45, 0.72)',
  border: '1px solid rgba(201, 160, 71, 0.45)',
  borderRadius: 999,
  padding: '11px 22px',
  cursor: 'pointer',
  transition: 'background 200ms ease, border-color 200ms ease, transform 120ms ease',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
};

const pillDotStyle = {
  color: '#C9A047',
  fontSize: 14,
  lineHeight: 1,
};

const modalBackdropStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background: 'rgba(2, 4, 9, 0.78)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
};

const modalPanelStyle = {
  width: '100%',
  maxWidth: 520,
  maxHeight: '90dvh',
  overflowY: 'auto',
  background: '#0A1220',
  border: '1px solid rgba(201, 160, 71, 0.35)',
  borderRadius: 12,
  boxShadow: '0 20px 80px rgba(0,0,0,0.7)',
  color: '#F2ECDC',
};

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 22px 10px',
  borderBottom: '1px solid rgba(242, 236, 220, 0.08)',
};

const modalTitleStyle = {
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif',
  fontSize: 26,
  letterSpacing: '0.04em',
  fontWeight: 700,
  margin: 0,
  color: '#F2ECDC',
};

const modalCloseXStyle = {
  background: 'transparent',
  border: 'none',
  color: 'rgba(242, 236, 220, 0.6)',
  fontSize: 28,
  lineHeight: 1,
  cursor: 'pointer',
  padding: '4px 8px',
};

const modalBodyStyle = {
  padding: '18px 22px 22px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const modalFieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const modalLabelStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 11,
  letterSpacing: 1.4,
  color: 'rgba(242, 236, 220, 0.6)',
  textTransform: 'uppercase',
};

const modalInputStyle = {
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 15,
  color: '#F2ECDC',
  background: 'rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(242, 236, 220, 0.15)',
  borderRadius: 6,
  padding: '10px 12px',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};

const modalSelectStyle = {
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 15,
  color: '#F2ECDC',
  background: 'rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(242, 236, 220, 0.15)',
  borderRadius: 6,
  padding: '10px 12px',
  width: '100%',
  boxSizing: 'border-box',
};

const modalHintStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10.5,
  letterSpacing: 1.2,
  color: 'rgba(242, 236, 220, 0.4)',
  textTransform: 'uppercase',
};

const nomineeListStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 6,
  maxHeight: 240,
  overflowY: 'auto',
  padding: '4px 4px 4px 0',
  border: '1px solid rgba(242, 236, 220, 0.08)',
  borderRadius: 6,
  background: 'rgba(0, 0, 0, 0.25)',
};

const nomineeRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px',
  fontSize: 14,
  cursor: 'pointer',
};

const modalActionRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  marginTop: 8,
};

const modalCancelStyle = {
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(242, 236, 220, 0.75)',
  background: 'transparent',
  border: '1px solid rgba(242, 236, 220, 0.2)',
  borderRadius: 6,
  padding: '9px 18px',
  cursor: 'pointer',
};

const modalSubmitStyle = {
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#0A1220',
  background: '#C9A047',
  border: '1px solid #C9A047',
  borderRadius: 6,
  padding: '9px 22px',
  cursor: 'pointer',
};

const modalErrorStyle = {
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 13,
  color: '#F2A05B',
  padding: '8px 12px',
  background: 'rgba(242, 160, 91, 0.08)',
  border: '1px solid rgba(242, 160, 91, 0.3)',
  borderRadius: 6,
};

const modalOkStyle = {
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 13,
  color: '#8FCB9B',
  padding: '8px 12px',
  background: 'rgba(143, 203, 155, 0.08)',
  border: '1px solid rgba(143, 203, 155, 0.3)',
  borderRadius: 6,
};

// Off-screen honeypot input — bots that autofill every visible field
// will trip this and their submission gets silently dropped.
const honeypotStyle = {
  position: 'absolute',
  left: -10000,
  top: 'auto',
  width: 1,
  height: 1,
  overflow: 'hidden',
  opacity: 0,
};
