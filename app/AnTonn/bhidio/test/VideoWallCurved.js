'use client'

// Video wall for /AnTonn/bhidio/test — full-viewport-width flex layout.
//
// Six category columns fill the width edge to edge. Each column has a
// sticky category header at the top and scrolls its own list of video
// cards independently — vertical wheel/touch on a column moves only
// that column, so users can browse deep down one category while the
// others sit still. "Free floating" per Whitey's brief.
//
// A subtle rotateY per column gives a gentle curve — not a cylinder,
// just a slight bend toward the viewer at the edges. No overlap,
// no cylinder-projection math.
//
// Card click → the whole wall replaces itself with a large video
// player that takes up the same footprint. Close returns to the grid.

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'

const CATEGORIES = [
  { slug: 'music',       en: 'Music',        gd: 'Ceòl' },
  { slug: 'educational', en: 'Educational',  gd: 'Foghlam' },
  { slug: 'comedy',      en: 'Comedy',       gd: 'Èibhinn' },
  { slug: 'drama',       en: 'Drama',        gd: 'Dràma' },
  { slug: 'documentary', en: 'Documentary',  gd: 'Aithriseachail' },
  { slug: 'live',        en: 'Live Sessions', gd: 'Seiseanan Beò' },
]

// Wall displays TOP_N real videos per category — the Billboard-Top-10
// slot. Empty slots pad up to MIN_CARDS so every column keeps a
// consistent visual weight even before the catalog fills.
//
// The full queue (all published videos in the category, not sliced)
// is what the player walks through; users clicking a top-10 card
// start the queue at that video and the player continues down the
// full list until interrupted or the session cap is reached.
const TOP_N = 100      // Music fills up to 100 by views (Top 20 + 80 more); others show what they have
const MIN_CARDS = 10   // placeholder floor so sparse columns keep visual weight

function getCards(catalog, slug) {
  const real = (catalog?.[slug] || []).slice(0, TOP_N)
  const padCount = Math.max(0, MIN_CARDS - real.length)
  const pads = Array.from({ length: padCount }, (_, i) => ({
    id: `${slug}-placeholder-${i + 1}`,
    title: `Coming soon · ${slug}`,
    duration: '—:—',
    source: 'placeholder',
  }))
  return [...real, ...pads]
}

function getQueue(catalog, slug) {
  return catalog?.[slug] || []
}

// YouTube gives us thumbnails free. hqdefault is 480x360 (16:9-ish
// after they crop the letterbox); maxresdefault is 1280x720 when
// available. hq works everywhere; max only exists for videos
// uploaded past some resolution threshold.
function youtubeThumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

// Inner-bend curve tuning. Wall curves TOWARD the viewer: the outer
// columns sit near the front, the middle columns recede — same shape
// as a wraparound cinema screen wrapping around the audience.
//
// Every column gets both a rotateY (tilt so it faces the viewer's
// centre) AND a translateZ (position along the depth axis). Both
// scale with distance from the row's centre:
//
//   TILT_PER_UNIT   — degrees of tilt per unit of distance from centre.
//                     Sign is inverted so outer columns face inward
//                     (right column tilts left, left column tilts right).
//   DEPTH_PER_UNIT² — px of depth per unit-distance SQUARED. Quadratic
//                     so the middle recedes smoothly rather than
//                     stepping; edges stay near Z=0.
//
// With 6 columns (index 0..5, centre at 2.5), MAX_OFFSET² = 6.25:
//   col 0 : dist 2.5 → tilt +10°, depth ~0px    (near the viewer)
//   col 1 : dist 1.5 → tilt  +6°, depth ~60px   behind
//   col 2 : dist 0.5 → tilt  +2°, depth ~90px   behind
//   col 3 : dist 0.5 → tilt  -2°, depth ~90px   behind
//   col 4 : dist 1.5 → tilt  -6°, depth ~60px   behind
//   col 5 : dist 2.5 → tilt -10°, depth ~0px    (near the viewer)
const TILT_PER_UNIT = 4
const DEPTH_PER_UNIT2 = 15

export default function VideoWallCurved({ catalog }) {
  const { language } = useLanguage()
  // selected shape: { queue: [videos], startIndex: number, categorySlug: string }
  const [selected, setSelected] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  // Below ~768px the six edge-to-edge columns collapse to unreadable
  // slivers. On a phone we drop the curve and let the wall scroll
  // horizontally, sizing each column so only ~2–3 categories show at a
  // time (swipe sideways for the rest).
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  if (selected) {
    return (
      <VideoPlayer
        queue={selected.queue}
        startIndex={selected.startIndex}
        onClose={() => setSelected(null)}
      />
    )
  }

  const centre = (CATEGORIES.length - 1) / 2
  const maxOffset2 = centre * centre

  // Mobile: horizontal-scroll strip, no perspective/curve, each column a
  // fixed slice (~42vw ⇒ a bit over two visible, so the third peeks and
  // invites the swipe). Desktop: the six-column curved wall unchanged.
  const wall = isMobile
    ? {
        ...wallStyle,
        overflowX: 'auto',
        overflowY: 'hidden',
        perspective: 'none',
        pointerEvents: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x proximity',
        gap: 10,
      }
    : wallStyle

  return (
    <div style={wall}>
      {CATEGORIES.map((cat, i) => {
        const offset = i - centre
        // Negative sign so left columns tilt right (positive rotateY)
        // and right columns tilt left — both facing inward toward the
        // viewer's centre.
        const tilt = -offset * TILT_PER_UNIT
        // Middle columns get the most depth; edges near Z=0. Same
        // quadratic ramp, just inverted around max² so the ramp
        // curves the middle back instead of the edges.
        const depth = (maxOffset2 - offset * offset) * DEPTH_PER_UNIT2
        const col = isMobile
          ? { ...columnStyle, flex: '0 0 42vw', minWidth: 150, scrollSnapAlign: 'start' }
          : columnStyle
        return (
          <div
            key={cat.slug}
            style={{
              ...col,
              transform: isMobile ? 'none' : `translateZ(${-depth}px) rotateY(${tilt}deg)`,
            }}
          >
            <div style={headerStyle}>
              {language === 'gd' ? cat.gd : cat.en}
            </div>
            <div style={cardsWrapStyle}>
              {getCards(catalog, cat.slug).map((card) => (
                <VideoCard
                  key={card.id}
                  {...card}
                  onSelect={() => {
                    // Real cards → open player with the FULL category queue
                    // starting at this card's position. Slot cards have
                    // source='placeholder' and short-circuit inside
                    // VideoCard so this handler doesn't even fire.
                    const queue = getQueue(catalog, cat.slug)
                    const idx = queue.findIndex((v) => v.id === card.id)
                    if (idx >= 0) {
                      setSelected({
                        queue,
                        startIndex: idx,
                        categorySlug: cat.slug,
                      })
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function VideoCard({ id, title, duration, source, poster, onSelect }) {
  // Empty slot: dashed 16:9 rectangle, no thumbnail, no title, no
  // click affordance. Reads as "future video goes here" rather than
  // as a real card users might try to interact with.
  if (source === 'placeholder') {
    return <div style={slotStyle} aria-hidden="true" />
  }

  // Real card: real image + real click behaviour. Poster wins over
  // the derived YouTube thumb.
  const thumbUrl =
    poster ||
    (source === 'youtube' ? youtubeThumb(id) : null)
  const thumbBg = thumbUrl
    ? { backgroundImage: `url(${thumbUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}
  return (
    <button type="button" onClick={onSelect} style={cardStyle}>
      <div style={{ ...thumbStyle, ...thumbBg }}>
        <span style={durationStyle}>{duration}</span>
      </div>
      <div style={titleStyle}>{title}</div>
    </button>
  )
}

// Queue-aware full-viewport video player. Walks a category's videos
// end-to-end using the YouTube IFrame Player API so we can hear the
// ENDED state event. Between videos, an overlay offers the two-pill
// choice — Back to Wall / Play Next Video — with a 10-sec autoplay
// countdown. After 60 min of continuous playback, the overlay flips
// to "Continue Watching?" with a 3-min timeout; if unanswered, the
// player returns to the wall.
//
// props:
//   queue      — array of video rows in play order (all real, no slots)
//   startIndex — which entry to start on
//   onClose    — called when the session ends or the user hits Back

const SESSION_HOUR_MS = 60 * 60 * 1000     // 1 hour session cap
const AUTOPLAY_COUNTDOWN_S = 10             // between-video prompt
const CONTINUE_COUNTDOWN_S = 3 * 60         // continue-watching prompt

function VideoPlayer({ queue, startIndex, onClose }) {
  const { language } = useLanguage()
  const [index, setIndex] = useState(startIndex)
  // phase: 'playing' | 'between' | 'continue' — controls the overlay.
  const [phase, setPhase] = useState('playing')
  const [countdown, setCountdown] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  // Phone turned sideways → let the video fill the whole screen. A
  // landscape viewport under ~500px tall is a phone in landscape (not a
  // tablet/desktop), so we blow the player out edge-to-edge over the
  // header/footer chrome.
  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape) and (max-height: 500px)')
    const sync = () => setFullscreen(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const ytContainerRef = useRef(null)
  const playerRef = useRef(null)
  const timerRef = useRef(null)
  const sessionStartRef = useRef(Date.now())

  const currentVideo = queue[index]
  const hasNext = index < queue.length - 1

  // Setup + teardown the YouTube player. Runs once on mount; the
  // player is reused across videos via loadVideoById in a separate
  // effect, so we don't tear down and rebuild the iframe every time.
  useEffect(() => {
    if (!currentVideo || currentVideo.source !== 'youtube') return
    let cancelled = false

    const init = () => {
      if (cancelled || !ytContainerRef.current || playerRef.current) return
      // eslint-disable-next-line no-undef
      playerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: currentVideo.id,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onStateChange: (e) => {
            // ENDED = 0 in YT.PlayerState.
            if (e?.data === 0) handleVideoEnd()
          },
        },
      })
    }

    if (window.YT?.Player) {
      init()
    } else {
      // Inject the API script once. onYouTubeIframeAPIReady is a
      // global YouTube looks for after script load; chain any prior
      // handler so we don't stomp on a coexisting player elsewhere.
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script')
        tag.id = 'yt-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
      const prevReady = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady()
        init()
      }
    }

    return () => {
      cancelled = true
      if (timerRef.current) clearInterval(timerRef.current)
      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy() } catch (_) { /* nothing to clean */ }
        playerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Switch to a new video when index changes — using loadVideoById
  // instead of recreating the whole player keeps the transition tight.
  useEffect(() => {
    if (!playerRef.current?.loadVideoById || !currentVideo) return
    if (currentVideo.source !== 'youtube') return
    playerRef.current.loadVideoById(currentVideo.id)
    setPhase('playing')
    setCountdown(0)
    if (timerRef.current) clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const handleVideoEnd = () => {
    const elapsed = Date.now() - sessionStartRef.current
    if (elapsed >= SESSION_HOUR_MS) {
      // Session cap hit — flip to continue prompt.
      setPhase('continue')
      startCountdown(CONTINUE_COUNTDOWN_S, onClose)
      return
    }
    if (!hasNext) {
      // Queue exhausted — nothing to auto-advance to.
      onClose()
      return
    }
    setPhase('between')
    startCountdown(AUTOPLAY_COUNTDOWN_S, playNext)
  }

  const startCountdown = (seconds, onZero) => {
    setCountdown(seconds)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current)
          timerRef.current = null
          onZero()
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const cancelCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setCountdown(0)
  }

  const playNext = () => {
    cancelCountdown()
    if (!hasNext) { onClose(); return }
    setIndex((i) => i + 1)
  }

  const continueWatching = () => {
    cancelCountdown()
    // Reset the session clock — the user asked for another hour.
    sessionStartRef.current = Date.now()
    setPhase('playing')
    // Advance to the next video if we're capable, otherwise close.
    if (hasNext) setIndex((i) => i + 1)
    else onClose()
  }

  // Render — non-YouTube sources fall back to the older behaviours
  // (HTML5 <video> for own/submitted, text-only for placeholders).
  const isYouTube = currentVideo?.source === 'youtube' && currentVideo?.id
  const isFile =
    (currentVideo?.source === 'own' || currentVideo?.source === 'submitted') &&
    currentVideo?.videoUrl

  return (
    <div style={fullscreen ? fullscreenPlayerStyle : playerStyle}>
      <button
        type="button"
        onClick={onClose}
        style={fullscreen
          ? { ...closeButtonStyle, position: 'absolute', top: 10, left: 10, zIndex: 5 }
          : closeButtonStyle}
      >
        ← {language === 'gd' ? 'Air ais dhan Bhalla' : 'Back to wall'}
      </button>

      <div style={fullscreen ? { ...playerScreenStyle, borderRadius: 0, border: 'none' } : playerScreenStyle}>
        {isYouTube ? (
          <div ref={ytContainerRef} style={playerIframeStyle} />
        ) : isFile ? (
          /* eslint-disable-next-line jsx-a11y/media-has-caption */
          <video
            src={currentVideo.videoUrl}
            poster={currentVideo.poster}
            controls
            autoPlay
            onEnded={handleVideoEnd}
            style={playerIframeStyle}
          />
        ) : (
          <div style={playerPlaceholderStyle}>
            <p style={playerLabelStyle}>Now playing</p>
            <h2 style={playerTitleStyle}>{currentVideo?.title}</h2>
            <p style={playerDurationStyle}>{currentVideo?.duration}</p>
          </div>
        )}

        {phase === 'between' && (
          <div style={overlayStyle}>
            <div style={overlayInnerStyle}>
              <p style={overlayEyebrowStyle}>
                {language === 'gd' ? 'Cluich a-rithist' : 'Up next'}
              </p>
              {queue[index + 1] && (
                <h3 style={overlayTitleStyle}>{queue[index + 1].title}</h3>
              )}
              <div style={overlayButtonsStyle}>
                <button type="button" style={pillButtonStyle} onClick={() => { cancelCountdown(); onClose() }}>
                  {language === 'gd' ? 'Air ais a Bhalla' : 'Back to Wall'}
                </button>
                <button type="button" style={pillButtonStyle} onClick={playNext}>
                  {language === 'gd' ? 'Cluich an Ath Bhidio' : 'Play Next Video'}
                </button>
              </div>
              <p style={overlayCountdownStyle}>
                {language === 'gd' ? 'Ath bhidio ann an' : 'Next in'} {countdown}s
              </p>
            </div>
          </div>
        )}

        {phase === 'continue' && (
          <div style={overlayStyle}>
            <div style={overlayInnerStyle}>
              <p style={overlayEyebrowStyle}>
                {language === 'gd' ? 'Uair a thìde de bhidiothan' : "You've been watching for an hour"}
              </p>
              <div style={overlayButtonsStyle}>
                <button type="button" style={pillButtonStyle} onClick={continueWatching}>
                  {language === 'gd' ? 'Cùm A\' Coimhead?' : 'Continue Watching?'}
                </button>
              </div>
              <p style={overlayCountdownStyle}>
                {language === 'gd' ? 'Cuairt a\' crìochnachadh ann an' : 'Session ends in'}{' '}
                {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────

// The wall fills the viewport. Top and bottom padding leave room for
// the wordmark header + brand strip on top and the language pill on
// bottom. Horizontal padding is minimal — Whitey wants edge-to-edge.
const wallStyle = {
  position: 'fixed',
  top: 203,
  bottom: 90,
  left: 12,
  right: 12,
  display: 'flex',
  gap: 12,
  // Perspective tighter now that outer columns actually recede on Z —
  // 1600 gives a visible ~6% shrink at the deepest columns without
  // fish-eyeing the middle.
  perspective: '1600px',
  perspectiveOrigin: '50% 45%',
  zIndex: 2,
  pointerEvents: 'none',
}

// Each column: equal flex share, own scroll container with sticky
// header inside. rotateY comes in per-column so we can vary it.
const columnStyle = {
  flex: '1 1 0',
  minWidth: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  transformOrigin: 'center 40%',
  background: 'rgba(46, 8, 18, 0.28)',
  border: '1px solid rgba(242, 236, 220, 0.06)',
  borderRadius: 6,
  boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(242,236,220,0.18) transparent',
  pointerEvents: 'auto',
}

// Sticky header keeps the category name pinned at the top of its
// column even as the card list scrolls beneath it.
const headerStyle = {
  position: 'sticky',
  top: 0,
  padding: '12px 8px',
  fontFamily: 'var(--font-bebas-neue), Impact, sans-serif',
  fontSize: 16,
  fontWeight: 400,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(242, 236, 220, 0.94)',
  textAlign: 'center',
  background: 'rgba(20, 4, 10, 0.82)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderBottom: '1px solid rgba(242, 236, 220, 0.14)',
  zIndex: 2,
}

const cardsWrapStyle = {
  padding: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const cardStyle = {
  display: 'block',
  width: '100%',
  padding: 0,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  color: 'inherit',
}

// Empty slot placeholder — 16:9 dashed rectangle. No thumbnail, no
// title, non-interactive. Reads visually as "reserved space for a
// future video" without competing with the real cards nearby.
const slotStyle = {
  width: '100%',
  aspectRatio: '16 / 9',
  border: '1px dashed rgba(242, 236, 220, 0.14)',
  borderRadius: 4,
  background: 'rgba(70, 12, 24, 0.12)',
}

const thumbStyle = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  background:
    'linear-gradient(160deg, rgba(70, 12, 24, 0.85), rgba(20, 4, 10, 0.95))',
  border: '1px solid rgba(242, 236, 220, 0.10)',
  borderRadius: 4,
  boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
  overflow: 'hidden',
}

const durationStyle = {
  position: 'absolute',
  right: 6,
  bottom: 6,
  padding: '2px 6px',
  background: 'rgba(0, 0, 0, 0.6)',
  color: 'rgba(242, 236, 220, 0.9)',
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  letterSpacing: 0.5,
  borderRadius: 2,
}

const titleStyle = {
  marginTop: 5,
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 12,
  color: 'rgba(242, 236, 220, 0.78)',
  lineHeight: 1.35,
  textAlign: 'center',
}

// ── Player (post-click) styles ───────────────────────────────────────

const playerStyle = {
  position: 'fixed',
  top: 170,
  bottom: 90,
  left: 12,
  right: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  zIndex: 3,
}

// Landscape-phone fullscreen: the player fills the entire viewport, over
// the wordmark header + language pill. Close button floats in the corner
// (absolute) so the video screen takes the whole frame.
const fullscreenPlayerStyle = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  background: '#000',
  zIndex: 50,
}

const closeButtonStyle = {
  alignSelf: 'flex-start',
  padding: '8px 16px',
  background: 'rgba(46, 8, 18, 0.7)',
  border: '1px solid rgba(242, 236, 220, 0.18)',
  borderRadius: 4,
  color: 'rgba(242, 236, 220, 0.94)',
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 12,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
}

// The screen that replaces the wall — spans the same footprint the
// grid did, so the transition reads as "the wall becomes the screen".
const playerScreenStyle = {
  position: 'relative',
  flex: '1 1 auto',
  background: 'linear-gradient(180deg, rgba(46, 8, 18, 0.5), rgba(10, 2, 6, 0.85))',
  border: '1px solid rgba(242, 236, 220, 0.10)',
  borderRadius: 6,
  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const playerIframeStyle = {
  width: '100%',
  height: '100%',
  display: 'block',
  border: 'none',
  background: '#000',
  borderRadius: 6,
}

const playerPlaceholderStyle = {
  textAlign: 'center',
  color: 'rgba(242, 236, 220, 0.9)',
}

// End-of-video overlay — semi-transparent scrim on top of the last
// frame of the video, centred pill buttons + countdown text.
const overlayStyle = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(10, 2, 6, 0.72)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  zIndex: 4,
}
const overlayInnerStyle = {
  textAlign: 'center',
  color: 'rgba(242, 236, 220, 0.98)',
  padding: '32px 40px',
  maxWidth: 720,
}
const overlayEyebrowStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 11,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: 'rgba(242, 236, 220, 0.6)',
  margin: '0 0 12px',
}
const overlayTitleStyle = {
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontSize: 34,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: '0 0 22px',
  lineHeight: 1.1,
}
const overlayButtonsStyle = {
  display: 'flex',
  gap: 14,
  justifyContent: 'center',
  flexWrap: 'wrap',
  margin: '0 0 18px',
}
const pillButtonStyle = {
  padding: '13px 28px',
  borderRadius: 999,
  background: '#FFFFFF',
  color: '#0A0D14',
  border: 'none',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontWeight: 400,
  fontSize: 18,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  transition: 'transform 220ms ease, box-shadow 220ms ease',
}
const overlayCountdownStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 12,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'rgba(242, 236, 220, 0.55)',
  margin: 0,
}

const playerLabelStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 11,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  color: 'rgba(242, 236, 220, 0.55)',
  margin: '0 0 8px',
}

const playerTitleStyle = {
  fontFamily: 'var(--font-bebas-neue), Impact, sans-serif',
  fontSize: 42,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: '0 0 12px',
  color: 'rgba(242, 236, 220, 0.98)',
}

const playerDurationStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 12,
  letterSpacing: '0.16em',
  color: 'rgba(242, 236, 220, 0.6)',
  margin: 0,
}
