'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import VortexBackground from '../AnTonn/preview/components/VortexBackground';
import LanguagePill from '../../components/LanguagePill';
import { useLanguage } from '../../context/LanguageContext';
import { ARTISTS, FALLBACK, matchArtist } from './data/artists';

const LIVE365_POLL_MS = 5000; // 5s poll — API caches server-side for 4s so upstream still fires only ~15/min max

// Tiles are driven by Live365 metadata (Phase 3). Until that's wired,
// `featured` stays null and both tiles render the empty/placeholder
// state — the JS artist-rotation timer was removed because it was
// misleading (showing Ally while the stream played a totally
// different artist).
const PHOTO_CAROUSEL_MS = 8500;

// The ticker features ONE artist's tour dates. Swap FEATURED_ID to change
// who's on the strip. The dates string is split into segments, and the
// rèidio icon (not an emoji/bullet) separates them.
const FEATURED_ID = 'ally-the-piper';
const FEATURED = ARTISTS.find((a) => a.id === FEATURED_ID);
const FEATURED_PHOTO = FEATURED?.photos?.[0] || null;
const FEATURED_POSTER = FEATURED?.poster || FEATURED_PHOTO;   // ticker frame art
const FEATURED_TICKETS = FEATURED?.tickets || null;           // click-through
const REIDIO_ICON = '/AnTonn/test/reidio-icon.png';
const TICKER_STOPS = FEATURED?.tour || [];

export default function RadioClient() {
  const { t, language } = useLanguage();

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

  // Mobile-only: which single tile is visible — the Live365 player or the
  // decorative photo/logo. Keeps the phone on one screen while still
  // reaching both. Desktop shows both side by side and ignores this.
  // isMobile is set from a matchMedia listener after mount.
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('player'); // 'player' | 'image'

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

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const onPointerMove = (e) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    setMouseUv({ x: e.clientX / w, y: e.clientY / h });
  };

  return (
    <>
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
              <h1 className="gc-radio-title" style={titleStyle}>
                {language === 'gd' ? 'Rèidio Cèilidh na Cruinne' : 'Global Ceilidh Radio'}
              </h1>
              <p className="gc-radio-tagline" style={taglineStyle}>{t('radio.tagline')}</p>
            </header>

            {/* Mobile: a small toggle to swap the single visible tile
                between the player and the photo so the page stays on one
                screen. The player iframe is only display:none'd (never
                unmounted) when hidden, so audio keeps playing while the
                photo is shown. Hidden on desktop, where both tiles show. */}
            {isMobile && (
              <div style={mobileTabsStyle} role="tablist" aria-label="Radio view">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobileView === 'player'}
                  onClick={() => setMobileView('player')}
                  style={mobileTabStyle(mobileView === 'player')}
                >
                  {language === 'gd' ? 'Inneal-chlàr' : 'Player'}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobileView === 'image'}
                  onClick={() => setMobileView('image')}
                  style={mobileTabStyle(mobileView === 'image')}
                >
                  {language === 'gd' ? 'Dealbh' : 'Photo'}
                </button>
              </div>
            )}

            {/* Live365 player + decorative photo. Desktop: side by side.
                Mobile: one at a time, chosen by the toggle above. */}
            <div className="gc-featured-row" style={featuredRowStyle}>
              <div
                className="gc-radio-tile"
                style={{
                  ...playerFrameStyle,
                  ...(isMobile && mobileView !== 'player' ? { display: 'none' } : null),
                }}
              >
                <iframe
                  title="Global Ceilidh Radio — Live365 player"
                  frameBorder="0"
                  src="https://live365.com/embeds/v1/player/a11866?s=md&m=dark&c=mp3"
                  allow="autoplay; encrypted-media"
                  style={{ width: '100%', height: '100%', display: 'block', border: 0 }}
                />
              </div>
              {/* Decorative now-playing photo / logo tile. On mobile shown
                  only when the Photo tab is active (JS-controlled); on
                  desktop display:contents keeps it a transparent wrapper so
                  the flex layout is unchanged. */}
              <span
                className="gc-media-tile"
                style={{ display: (isMobile && mobileView !== 'image') ? 'none' : 'contents' }}
              >
                {featured
                  ? <PhotoTile artist={featured} offset={0} wide={true} />
                  : <EmptyTile wide={true} />
                }
              </span>
            </div>

            {/* Vote + Request pills — Vote drives An Tonn Top-10s (Best
                Artist / Song / Album). Requests land in sruth-admin.
                Same cream pill styling as Let's Talk + language pill. */}
            <div style={pillRowStyle}>
              <button type="button" style={pillStyle} onClick={() => setShowVote(true)}>
                {t('radio.vote_pill')}
              </button>
              <button type="button" style={pillStyle} onClick={() => setShowRequest(true)}>
                {t('radio.request_pill')}
              </button>
            </div>

            {/* Ticker — the featured artist's tour dates only, with a photo
                frame on the left and the rèidio icon as the separator. */}
            <div style={tickerOuterStyle} aria-label={`Global Ceilidh Radio — ${FEATURED?.name || 'featured artist'} tour dates`}>
              {FEATURED_POSTER && (
                FEATURED_TICKETS ? (
                  <a href={FEATURED_TICKETS} target="_blank" rel="noopener noreferrer"
                    style={tickerFrameStyle} aria-label={`${FEATURED?.name || 'Artist'} — tickets`} title={`${FEATURED?.name || ''} — tickets`}>
                    <img src={FEATURED_POSTER} alt={`${FEATURED?.name || ''} — Tour Dates`} style={tickerFrameImgStyle} draggable={false} />
                  </a>
                ) : (
                  <div style={tickerFrameStyle}>
                    <img src={FEATURED_POSTER} alt={FEATURED?.name || ''} style={tickerFrameImgStyle} draggable={false} />
                  </div>
                )
              )}
              <div style={tickerViewportStyle}>
                <div className="gc-ticker-track">
                  {[...TICKER_STOPS, ...TICKER_STOPS].map((stop, i) => (
                    <span key={i} style={tickerUnitStyle}>
                      <img src={REIDIO_ICON} alt="" aria-hidden="true" style={tickerSepStyle} draggable={false} />
                      <span style={tickerStackStyle}>
                        <span className="gc-ticker-text" style={tickerDateStyle}>
                          {stop.date}{stop.city ? ` · ${stop.city}` : ''}
                        </span>
                        {stop.venue && <span style={tickerVenueStyle}>{stop.venue}</span>}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={footerStyle}>
              {t('radio.footer_ticker_ask')}
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
                gap: 30px;
                white-space: nowrap;
                width: max-content;
                flex-shrink: 0;
                animation: gc-ticker-scroll 240s linear infinite;
                will-change: transform;
              }
              .gc-ticker-track > * { flex: 0 0 auto; }
              .gc-ticker-track:hover {
                animation-play-state: paused;
              }
              @media (prefers-reduced-motion: reduce) {
                .gc-ticker-track { animation: none; }
              }
              /* Phones — stack the player above the media tile, let both
                 go full width, and bump the type that read too small
                 (tagline + ticker). Vertical rhythm tightened too. */
              @media (max-width: 768px) {
                .gc-radio-wrapper {
                  /* Lock the radio to exactly one viewport so it never
                     scrolls: fixed dvh height + hidden overflow. The
                     featured area below flexes to absorb any slack, so
                     shorter phones shrink the player instead of scrolling,
                     and this phone stays at the size that already fit.
                     Top padding clears the fixed gold EN/GD toggle in the
                     top-left corner. */
                  height: 100dvh !important;
                  min-height: 0 !important;
                  overflow: hidden !important;
                  padding: 52px 12px 24px !important;
                  gap: 12px !important;
                }
                .gc-letstalk {
                  /* On phones the radio doesn't need the Let's Talk pill —
                     drop it and let the EN/GD toggle take the top-right
                     corner instead (see .gc-langpill below). Still shown on
                     desktop. */
                  display: none !important;
                }
                .gc-langpill-desk {
                  /* Desktop white pill is hidden on phones — the bare gold
                     toggle (gc-langpill-mob) takes over. */
                  display: none !important;
                }
                .gc-featured-row {
                  flex-direction: column !important;
                  align-items: center !important;
                  /* Absorb the leftover vertical space and center the single
                     visible tile in it; min-height:0 lets it shrink on short
                     phones instead of pushing the page taller. */
                  flex: 1 1 auto !important;
                  min-height: 0 !important;
                  overflow: hidden !important;
                }
                .gc-radio-tile {
                  width: 100% !important;
                  max-width: 460px !important;
                  /* Cap at the player's established height (this phone looks
                     unchanged); flex-shrink + min-height:0 let it scale down
                     to fit shorter screens rather than forcing a scroll. */
                  height: 316px !important;
                  max-height: 316px !important;
                  min-height: 0 !important;
                  flex-shrink: 1 !important;
                }
                .gc-radio-title {
                  /* 52 wrapped awkwardly on 360-390px phones; 44 gives a
                     clean two-line lockup. */
                  font-size: 44px !important;
                }
                .gc-radio-tagline {
                  font-size: 18px !important;
                  line-height: 1.45 !important;
                  color: rgba(242, 236, 220, 0.9) !important;
                }
                .gc-ticker-text {
                  font-size: 17px !important;
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
                .gc-langpill-mob {
                  /* Bare gold toggle is mobile-only. */
                  display: none !important;
                }
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

        {/* Let's Talk pill — same white/Bebas Neue look as every other
            pill on this page. Bilingual: "Let's Talk" / "Thig, bruidhinneas". */}
        <a href="/contact" className="gc-letstalk" style={letsTalkStyle}>{t('common.lets_talk')}</a>

        {/* Language toggle — EN⇄GD slider on a white pill. Right
            viewport edge, 56px up from the bottom (mirrors Let's Talk's
            56px-from-top inset). */}
        {/* Language toggle. Desktop: white pill, bottom-right. Mobile:
            bare gold EN/GD switch, top-left (see media query show/hide). */}
        <LanguagePill
          className="gc-langpill-desk"
          position="bottom-right"
          layout="toggle"
          variant="white"
          fixed
          offsetBottom={24}
          offsetRight={20}
        />
        <LanguagePill
          className="gc-langpill-mob"
          position="top-left"
          layout="toggle"
          variant="gold"
          fixed
          offsetTop={16}
          offsetLeft={16}
        />

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
// after it opened. Labels resolved via t() so they follow the site language.
const VOTE_CATEGORY_IDS = ['best-artist', 'best-song', 'best-album'];
const VOTE_CATEGORY_LABEL_KEY = {
  'best-artist': 'radio.best_artist',
  'best-song':   'radio.best_song',
  'best-album':  'radio.best_album',
};
const VOTE_WRITEIN_PLACEHOLDER_KEY = {
  'best-artist': 'radio.writein_artist',
  'best-song':   'radio.writein_song',
  'best-album':  'radio.writein_album',
};

function VoteModal({ onClose }) {
  const { t } = useLanguage();
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
      setStatus({ kind: 'error', message: t('radio.pick_or_writein') });
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
            ? t('radio.vote_promoted')
            : t('radio.vote_recorded'),
        });
      } else {
        setStatus({ kind: 'error', message: data.error || t('radio.generic_error') });
      }
    } catch (err) {
      setStatus({ kind: 'error', message: t('radio.network_error') });
    }
  };

  return (
    <ModalShell title={t('radio.vote_title')} onClose={onClose}>
      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>{t('radio.category')}</label>
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setStatus({ kind: 'idle' }); }}
          style={modalSelectStyle}
        >
          {VOTE_CATEGORY_IDS.map(id => (
            <option key={id} value={id}>{t(VOTE_CATEGORY_LABEL_KEY[id])}</option>
          ))}
        </select>
      </div>

      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>{t('radio.nominees')}</label>
        <div style={nomineeListStyle}>
          {nomineesLoading ? (
            <div style={{ ...nomineeRowStyle, color: 'rgba(242,236,220,0.5)', fontStyle: 'italic' }}>
              {t('radio.loading_nominees')}
            </div>
          ) : nominees.length === 0 ? (
            <div style={{ ...nomineeRowStyle, color: 'rgba(242,236,220,0.5)', fontStyle: 'italic' }}>
              {t('radio.no_nominees')}
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
        <label style={modalLabelStyle}>{t('radio.writein_label')}</label>
        <input
          type="text"
          value={writeIn}
          onChange={(e) => { setWriteIn(e.target.value); if (e.target.value) setSelectedTargetId(null); }}
          placeholder={t(VOTE_WRITEIN_PLACEHOLDER_KEY[categoryId])}
          maxLength={200}
          style={modalInputStyle}
        />
        <div style={modalHintStyle}>
          {t('radio.writein_hint')}
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
          {status.kind === 'ok' ? t('radio.close') : t('radio.cancel')}
        </button>
        {status.kind !== 'ok' && (
          <button
            type="button"
            style={modalSubmitStyle}
            onClick={submit}
            disabled={status.kind === 'submitting'}
          >
            {status.kind === 'submitting' ? t('radio.submitting') : t('radio.cast_vote')}
          </button>
        )}
      </div>
    </ModalShell>
  );
}

// ── Request modal ─────────────────────────────────────────────────────
// Open queue. Server throttles to 3 requests / 10 min per IP.
function RequestModal({ onClose }) {
  const { t } = useLanguage();
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState({ kind: 'idle' });

  const submit = async () => {
    if (status.kind === 'submitting') return;
    if (!songTitle.trim()) {
      setStatus({ kind: 'error', message: t('radio.song_title_error') });
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
          message: t('radio.request_received'),
        });
      } else {
        setStatus({ kind: 'error', message: data.error || t('radio.generic_error') });
      }
    } catch {
      setStatus({ kind: 'error', message: t('radio.network_error') });
    }
  };

  return (
    <ModalShell title={t('radio.request_title')} onClose={onClose}>
      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>{t('radio.song_title_required')}</label>
        <input
          type="text"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          maxLength={300}
          style={modalInputStyle}
        />
      </div>
      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>{t('radio.artist')}</label>
        <input
          type="text"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          maxLength={200}
          style={modalInputStyle}
        />
      </div>
      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>{t('radio.album')}</label>
        <input
          type="text"
          value={albumName}
          onChange={(e) => setAlbumName(e.target.value)}
          maxLength={200}
          style={modalInputStyle}
        />
      </div>
      <div style={modalFieldStyle}>
        <label style={modalLabelStyle}>{t('radio.notes_optional')}</label>
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
          {status.kind === 'ok' ? t('radio.close') : t('radio.cancel')}
        </button>
        {status.kind !== 'ok' && (
          <button
            type="button"
            style={modalSubmitStyle}
            onClick={submit}
            disabled={status.kind === 'submitting'}
          >
            {status.kind === 'submitting' ? t('radio.submitting') : t('radio.send_request')}
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
    <span className={item.text === '·' ? '' : 'gc-ticker-text'} style={item.text === '·' ? tickerBulletStyle : tickerTextStyle}>
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
  return (
    <div
      className="gc-radio-tile"
      style={{
        ...base,
        position: 'relative',
        background: '#050709',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      }}
    >
      {/* Unknown-artist fallback: the rèidio icon centered on the dark
          tile. The icon is square + transparent, so contain (not cover)
          with padding keeps it centered with breathing room instead of
          being cropped to fill the landscape tile. */}
      <img
        src={FALLBACK.icon}
        alt="Global Ceilidh Radio"
        draggable={false}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          padding: '12%',
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
      />
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
    <div className="gc-radio-tile" style={{ ...base, position: 'relative' }}>
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

// ── Styles ────────────────────────────────────────────────────────────

const pageOuterStyle = {
  position: 'relative',
  minHeight: '100dvh',
  background: '#020409',
  color: '#F2ECDC',
  // overflowX only — allow vertical document scroll. `overflow: hidden`
  // was silently clipping the featured row (which extends past viewport
  // when fixed 450px tiles wrap on a 375px phone).
  overflowX: 'hidden',
};

// Corner pills sit at the right viewport edge, with a modest vertical
// inset so they read as chrome rather than as page corners: 56px down
// from the top for Let's Talk, 56px up from the bottom for the
// language slider (see LanguagePill call).
const letsTalkStyle = {
  position: 'fixed',
  top: 24, right: 20,
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
  padding: '44px 20px 44px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
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
  display: 'flex',
  alignItems: 'stretch',
  background: 'rgba(0, 0, 0, 0.55)',
  border: '1px solid rgba(242, 236, 220, 0.08)',
  borderRadius: 8,
  overflow: 'hidden',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
};

// Featured-artist photo strip, flush to the left of the ticker, full height.
const tickerFrameStyle = {
  flexShrink: 0,
  display: 'block',
  width: 170,
  aspectRatio: '748 / 528',        // the poster's exact ratio — no crop
  alignSelf: 'center',
  position: 'relative',
  overflow: 'hidden',
  borderRight: '1px solid rgba(242, 236, 220, 0.15)',
  cursor: 'pointer',
  textDecoration: 'none',
};
const tickerFrameImgStyle = {
  position: 'absolute', inset: 0, width: '100%', height: '100%',
  objectFit: 'cover', userSelect: 'none',
};

// The rèidio icon used as the separator between ticker segments.
const tickerSepStyle = {
  height: 20, width: 'auto', display: 'block', opacity: 0.85, flexShrink: 0, userSelect: 'none',
};
const tickerUnitStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 12,
};
// Each stop is two stacked lines: date + city over the venue.
const tickerStackStyle = {
  display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, whiteSpace: 'nowrap',
};
const tickerDateStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 15, letterSpacing: 1.2,
  color: '#F2ECDC', textTransform: 'uppercase', lineHeight: 1.15,
};
const tickerVenueStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 11, letterSpacing: 1,
  color: 'rgba(201, 160, 71, 0.9)', textTransform: 'uppercase', lineHeight: 1.15,
};

const tickerViewportStyle = {
  overflow: 'hidden',
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',       // vertically centre the scrolling track
  padding: '0 0 0 8px',
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

// ── Pills + modal styles ──────────────────────────────────────────────

const pillRowStyle = {
  display: 'flex',
  gap: 14,
  justifyContent: 'center',
  flexWrap: 'wrap',
};

// Mobile-only segmented toggle to swap the visible tile (player / photo).
const mobileTabsStyle = {
  display: 'flex',
  gap: 8,
  justifyContent: 'center',
  alignSelf: 'center',
};

function mobileTabStyle(active) {
  return {
    padding: '6px 18px',
    borderRadius: 999,
    border: `1px solid ${active ? '#C9A047' : 'rgba(242, 236, 220, 0.22)'}`,
    background: active ? 'rgba(201, 160, 71, 0.14)' : 'transparent',
    color: active ? '#C9A047' : 'rgba(242, 236, 220, 0.6)',
    fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif',
    fontSize: 15,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'color 180ms ease, background 180ms ease, border-color 180ms ease',
  };
}

// Pure white pill in Bebas Neue — matches every other pill on the
// radio page (Let's Talk, language slider, Vote, Request). One
// consistent look across the surface.
const pillStyle = {
  padding: '11px 26px',
  borderRadius: 999,
  background: '#FFFFFF',
  color: '#0A0D14',
  border: 'none',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif',
  fontWeight: 400,
  fontSize: 18,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  transition: 'transform 220ms ease, box-shadow 220ms ease',
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
