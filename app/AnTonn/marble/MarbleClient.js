'use client'

// The marble scene — invisible sphere edition.
//
// Mental model:
//   The camera is at the exact center of an invisible sphere. The user
//   IS the camera. Four pill-buttons — stacked vertically, close
//   together — sit on the inside surface of that sphere directly in
//   front of the camera. Drag anywhere on screen to rotate the SPHERE
//   around the camera (yaw + pitch, both free, both wrap). The pills
//   move as a rigid group along the interior of the sphere.
//
// The marble itself is never drawn. The illusion of "you are inside
// something curved" comes entirely from how the pill stack foreshortens
// and tilts as it approaches the screen edges — CSS 3D perspective
// does the geometry.
//
// Layer stack (back to front):
//   0. Vortex canvas — the sea. Always visible everywhere the pills
//      aren't. Mouse steers the flow (unchanged from /preview).
//   10. 3D perspective stage. Camera at center of an invisible sphere
//       of radius R. The pill stack is placed at translateZ(-R) inside
//       a rotator; drag updates rotator's rotateY/rotateX. All four
//       pills orbit the sphere together as one plane, foreshortening
//       correctly at any angle.
//   15. Wordmark + help text.
//
// Each pill uses the SVG-mask trick: its label is a hole cut through
// the white capsule, so wherever the pill is on-screen, the vortex
// behind it shows through the letters.

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import VortexBackground from '../preview/components/VortexBackground'
import LanguagePill from '../../../components/LanguagePill'
import { useLanguage } from '../../../context/LanguageContext'

const PILLS = [
  { id: 'ceol',          label: 'Ceòl' },
  { id: 'bhidio',        label: 'Bhidio' },
  { id: 'podcraoladh',   label: 'Pod-chraoladh' },
  { id: 'leabhraichean', label: 'Leabhraichean' },
]

// Sphere geometry (all in px)
const R = 900              // radius of the invisible sphere
const PERSPECTIVE = 1200   // CSS perspective distance
// Screen displacement per radian ≈ P·R / (P+R) ≈ 514px, so drag→pill
// motion feels ~1:1 at 1/514 rad/px. Nudged slightly up so the sphere
// feels responsive without being twitchy.
const DRAG_RAD_PER_PX = 0.0022
const MOMENTUM_FRICTION = 0.945
const MOMENTUM_MIN = 0.00015
const DRAG_THRESHOLD_PX = 5

const PILL_W = 560
const PILL_H = 140
const PILL_GAP = 20
const PILL_FONT_SIZE = 62
const PILL_FONT_FAMILY = 'var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif'

// Orientation lock — clamp pitch so the sphere can never rotate over the
// "top" or "bottom" pole. Past ~80° the up-vector flips and the pills
// start appearing upside down; this holds them upright forever.
const PITCH_LIMIT = 1.35  // ~77°
const clampPitch = (p) => Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, p))

// Five fixed diaspora anchors — the cultural centres. The clock shows
// each city's local time + how far the current viewer is from it. On
// each row the ● glyph flips to ☾ when the city is in local night.
const DIASPORA = [
  { name: 'Inverness',  region: 'Scotland',      tz: 'Europe/London',       lat: 57.4778, lng:  -4.2247 },
  { name: 'Halifax',    region: 'Nova Scotia',   tz: 'America/Halifax',     lat: 44.6488, lng: -63.5752 },
  { name: 'Perth',      region: 'NY',            tz: 'America/New_York',    lat: 43.0009, lng: -74.1746 },
  { name: 'Seattle',    region: 'Washington',    tz: 'America/Los_Angeles', lat: 47.6062, lng:-122.3321 },
  { name: 'Auckland',   region: 'New Zealand',   tz: 'Pacific/Auckland',    lat:-36.8485, lng: 174.7633 },
]

// The user's location. Hardcoded to Whitey's Brewerton, NY for testing.
// Production: comes from Clerk sign-up address → geocoded server-side →
// stored on the Supabase users record → read at render. The same source
// will drive personalisation on /saoghal (globe pin, diaspora distances,
// nearby-Gàidhlig lookup, "start a revival where you are" prompt).
const USER = {
  name: 'YOU',
  region: 'Brewerton, NY',
  tz:     'America/New_York',
  lat:    43.2384,
  lng:   -76.1400,
}

// Great-circle distance (miles) via Haversine + 8-way cardinal bearing.
const EARTH_MI = 3958.8
const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const toRad = (d) => d * Math.PI / 180

function greatCircleMiles(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_MI * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function bearingCardinal(lat1, lng1, lat2, lng2) {
  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δλ = toRad(lng2 - lng1)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const deg = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
  return CARDINALS[Math.round(deg / 45) % 8]
}

export default function MarbleClient() {
  const { t } = useLanguage()
  const [mouseUv, setMouseUv] = useState({ x: 0.5, y: 0.5 })
  const [reduceMotion, setReduceMotion] = useState(false)
  const [docHidden, setDocHidden] = useState(false)
  const [viewport, setViewport] = useState({ w: 1920, h: 1080 })
  const [hovered, setHovered] = useState(null)
  const [yaw, setYaw] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const dragStart = useRef(null)
  const wasDraggingRef = useRef(false)
  const velSamples = useRef([])
  const momentumRaf = useRef(null)

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const handler = (e) => setReduceMotion(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  useEffect(() => {
    const handler = () => setDocHidden(document.hidden)
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  useEffect(() => {
    return () => {
      if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current)
    }
  }, [])

  const cancelMomentum = useCallback(() => {
    if (momentumRaf.current) {
      cancelAnimationFrame(momentumRaf.current)
      momentumRaf.current = null
    }
  }, [])

  const startMomentum = useCallback((vYaw, vPitch) => {
    let curYaw = vYaw
    let curPitch = vPitch
    const tick = () => {
      setYaw((y) => y + curYaw)
      setPitch((p) => {
        const next = clampPitch(p + curPitch)
        // If we hit the pitch clamp, kill momentum in this axis so the
        // sphere doesn't stubbornly push against the pole.
        if (next !== p + curPitch) curPitch = 0
        return next
      })
      curYaw *= MOMENTUM_FRICTION
      curPitch *= MOMENTUM_FRICTION
      if (Math.abs(curYaw) < MOMENTUM_MIN && Math.abs(curPitch) < MOMENTUM_MIN) {
        momentumRaf.current = null
        return
      }
      momentumRaf.current = requestAnimationFrame(tick)
    }
    momentumRaf.current = requestAnimationFrame(tick)
  }, [])

  const onPointerDown = (e) => {
    if (viewport.w && viewport.h) {
      setMouseUv({ x: e.clientX / viewport.w, y: e.clientY / viewport.h })
    }
    if (reduceMotion) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    cancelMomentum()
    setIsDragging(true)
    wasDraggingRef.current = false
    dragStart.current = {
      px: e.clientX, py: e.clientY,
      yaw, pitch,
    }
    velSamples.current = [{ t: performance.now(), x: e.clientX, y: e.clientY }]
  }

  const onPointerMove = (e) => {
    if (viewport.w && viewport.h) {
      setMouseUv({ x: e.clientX / viewport.w, y: e.clientY / viewport.h })
    }
    if (!isDragging || !dragStart.current) return
    const dx = e.clientX - dragStart.current.px
    const dy = e.clientY - dragStart.current.py
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
      wasDraggingRef.current = true
    }
    setYaw(dragStart.current.yaw + dx * DRAG_RAD_PER_PX)
    // Negative dy → pitch up. Positive dy (drag down) → sphere rotates
    // so pills fall toward the bottom. Equivalent: pitch decreases.
    // Clamp so pitch never crosses the pole (orientation lock).
    setPitch(clampPitch(dragStart.current.pitch - dy * DRAG_RAD_PER_PX))
    const now = performance.now()
    velSamples.current.push({ t: now, x: e.clientX, y: e.clientY })
    velSamples.current = velSamples.current.filter((s) => now - s.t < 80)
  }

  const onPointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    setIsDragging(false)
    dragStart.current = null
    if (reduceMotion) return
    const samples = velSamples.current
    if (samples.length >= 2 && wasDraggingRef.current) {
      const first = samples[0]
      const last = samples[samples.length - 1]
      const dt = Math.max(last.t - first.t, 1)
      // px/ms → rad/frame (×16ms/frame × rad/px)
      const vYaw = ((last.x - first.x) / dt) * 16 * DRAG_RAD_PER_PX
      const vPitch = -((last.y - first.y) / dt) * 16 * DRAG_RAD_PER_PX
      if (Math.abs(vYaw) >= MOMENTUM_MIN || Math.abs(vPitch) >= MOMENTUM_MIN) {
        startMomentum(vYaw, vPitch)
      }
    }
  }

  const intensity = hovered ? 0.55 : (isDragging ? 0.42 : 0.28)

  const onPillClick = (pill) => {
    if (wasDraggingRef.current) return
    // eslint-disable-next-line no-console
    console.log('[marble]', pill.id, 'clicked — chamber transition not built yet')
  }

  return (
    <div
      style={{ ...containerStyle, cursor: isDragging ? 'grabbing' : 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Vortex canvas — the sea (always visible as background) */}
      <div style={canvasLayerStyle}>
        <Canvas
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 0.01], fov: 90, near: 0.01, far: 100 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <VortexBackground
            intensity={intensity}
            mouseUv={mouseUv}
            paused={docHidden || reduceMotion}
          />
        </Canvas>
      </div>

      {/* 3D stage — camera at center of invisible sphere of radius R */}
      <div style={stageStyle}>
        <div style={cameraStyle}>
          <div
            style={{
              position: 'absolute',
              transformStyle: 'preserve-3d',
              transform: `rotateX(${-pitch}rad) rotateY(${yaw}rad) translateZ(-${R}px)`,
              willChange: 'transform',
            }}
          >
            <div style={pillStackStyle}>
              {PILLS.map((pill) => (
                <Pill
                  key={pill.id}
                  label={pill.label}
                  hovered={hovered === pill.id}
                  onEnter={() => setHovered(pill.id)}
                  onLeave={() => setHovered((h) => (h === pill.id ? null : h))}
                  onClick={() => onPillClick(pill)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top strip — masthead centred, clock right-of-centre, Let's
          Talk pill in the corner. All static; do not orbit the sphere. */}
      <div style={mastheadStyle}>AN TONN</div>
      <div style={clockPositionStyle}><Clock /></div>
      <a href="/contact" style={letsTalkStyle}>{t('common.lets_talk')}</a>

      {/* Language toggle — EN⇄GD slider on a white pill. Right viewport
          edge, 56px up from the bottom (mirrors Let's Talk's 56px-from-top
          inset). Same treatment as /AnTonn/radio. */}
      <LanguagePill
        position="bottom-right"
        layout="toggle"
        variant="white"
        offsetBottom={56}
        offsetRight={30}
      />

      {/* Center point — a small anchor marker at the sphere's origin so
          the user always knows where "straight ahead" is. Non-interactive. */}
      <div style={centerPointStyle} aria-hidden="true" />

      <div style={helpStyle}>{t('marble.help')}</div>
    </div>
  )
}

// Diaspora clock — five fixed cultural centres, distance from the user
// on each. Sixth row = user, marked ← home with their own coord instead
// of a distance. All rows refresh every 30s. IBM Plex Mono for the
// tabular feel, right-aligned times.
function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto auto',
      columnGap: 14,
      rowGap: 3,
      fontFamily: 'var(--font-ibm-plex-mono), "IBM Plex Mono", Menlo, monospace',
      fontSize: 10,
      letterSpacing: 1,
      color: 'rgba(242,236,220,0.82)',
      lineHeight: 1.4,
    }}>
      {DIASPORA.map((c) => {
        const { hhmm, offset, isDay } = formatCity(c.tz, now)
        const miles = greatCircleMiles(USER.lat, USER.lng, c.lat, c.lng)
        const dir = bearingCardinal(USER.lat, USER.lng, c.lat, c.lng)
        return (
          <ClockRow
            key={c.name}
            city={c.name}
            region={c.region}
            hhmm={hhmm}
            offset={offset}
            isDay={isDay}
            trailing={`${formatMiles(miles)} mi ${dir}`}
          />
        )
      })}
      {(() => {
        const { hhmm, offset, isDay } = formatCity(USER.tz, now)
        return (
          <ClockRow
            key="you"
            city={USER.name}
            region={USER.region}
            hhmm={hhmm}
            offset={offset}
            isDay={isDay}
            trailing={formatCoord(USER.lat, USER.lng)}
            isUser
          />
        )
      })()}
    </div>
  )
}

// Diaspora row shows city + local time + distance-from-you.
// User row shows YOU + local time + your coord, tinted gold so it reads
// as "the anchor" in the list.
function ClockRow({ city, region, hhmm, offset, isDay, trailing, isUser }) {
  const dim = { color: 'rgba(242,236,220,0.42)' }
  const goldName = { color: '#C9A047', textTransform: 'uppercase' }
  const plainName = { color: 'rgba(242,236,220,0.82)', textTransform: 'uppercase' }
  return (
    <>
      <span style={{
        fontSize: 11, lineHeight: 1, marginTop: 1,
        color: isUser ? '#C9A047' : 'inherit',
      }}>
        {isDay ? '●' : '☾'}
      </span>
      <span style={isUser ? goldName : plainName}>
        {city}{region ? `, ${region}` : ''}
      </span>
      <span style={{ textAlign: 'right' }}>{hhmm}</span>
      <span style={dim}>{offset}</span>
      <span />
      <span style={dim}>{trailing}</span>
      <span />
      <span />
    </>
  )
}

function formatMiles(mi) {
  return mi >= 1000
    ? mi.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : Math.round(mi).toString()
}
function formatCoord(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}°${latDir}  ${Math.abs(lng).toFixed(2)}°${lngDir}`
}

// Format a city's current time + GMT offset via Intl. isDay flips when
// the city's local hour is in [6, 18) — good enough as a glyph cue
// without any solar-position math.
function formatCity(tz, now) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'shortOffset',
  }).formatToParts(now)
  const hour = Number(parts.find((p) => p.type === 'hour').value)
  const minute = parts.find((p) => p.type === 'minute').value
  const hhmm = `${String(hour).padStart(2, '0')}:${minute}`
  let offset = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT'
  offset = offset.replace('GMT+0', 'GMT+').replace(/^UTC/, 'GMT')
  const isDay = hour >= 6 && hour < 18
  return { hhmm, offset, isDay }
}

function Pill({ label, hovered, onEnter, onLeave, onClick }) {
  const maskId = useMemo(
    () => `pill-mask-${label.replace(/[^a-z0-9]/gi, '').toLowerCase()}`,
    [label]
  )
  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onClick}
      aria-label={label}
      style={{
        border: 'none', background: 'transparent', padding: 0,
        cursor: 'pointer', display: 'block',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        transformOrigin: 'center',
        transition: 'transform 260ms ease, filter 260ms ease',
        filter: hovered
          ? 'drop-shadow(0 0 26px rgba(255,255,255,0.6))'
          : 'drop-shadow(0 8px 28px rgba(0,0,0,0.45))',
        // Backface culling — when the pill rotates past 90° yaw/pitch,
        // its face turns away from the camera and it should disappear.
        // Without this, CSS 3D happily renders the back side as a
        // mirrored plane crossing in front of the viewer, which breaks
        // the "you're at the centre" illusion. Now the pills correctly
        // orbit AROUND you and vanish when they pass behind.
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <svg
        width={PILL_W} height={PILL_H}
        viewBox={`0 0 ${PILL_W} ${PILL_H}`}
        style={{ display: 'block' }}
      >
        <defs>
          <mask id={maskId}>
            <rect
              x="0" y="0" width={PILL_W} height={PILL_H}
              rx={PILL_H / 2} ry={PILL_H / 2}
              fill="white"
            />
            <text
              x="50%" y="50%"
              textAnchor="middle" dominantBaseline="central"
              style={{ fontFamily: PILL_FONT_FAMILY }}
              fontSize={PILL_FONT_SIZE}
              fontWeight="400"
              letterSpacing="6"
              fill="black"
            >
              {label.toUpperCase()}
            </text>
          </mask>
        </defs>
        <rect
          x="0" y="0" width={PILL_W} height={PILL_H}
          rx={PILL_H / 2} ry={PILL_H / 2}
          fill="rgba(255,255,255,0.96)"
          mask={`url(#${maskId})`}
        />
      </svg>
    </button>
  )
}

const containerStyle = {
  position: 'fixed', inset: 0,
  background: '#020409',
  overflow: 'hidden',
  touchAction: 'none',
  userSelect: 'none',
}
const canvasLayerStyle = { position: 'absolute', inset: 0, zIndex: 0 }
const stageStyle = {
  position: 'absolute', inset: 0,
  perspective: `${PERSPECTIVE}px`,
  perspectiveOrigin: '50% 50%',
  zIndex: 10,
  // pointerEvents auto so pill clicks land; container's pointer handlers
  // still fire because events bubble from children to the container.
}
const cameraStyle = {
  position: 'absolute',
  left: '50%', top: '50%',
  transformStyle: 'preserve-3d',
}
const pillStackStyle = {
  transform: 'translate(-50%, -50%)',
  display: 'flex', flexDirection: 'column', gap: `${PILL_GAP}px`,
  transformStyle: 'preserve-3d',
}
const mastheadStyle = {
  position: 'absolute',
  top: 36, left: '50%', transform: 'translateX(-50%)',
  color: '#F2ECDC',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, system-ui, sans-serif',
  fontWeight: 400,
  fontSize: 44,
  letterSpacing: 10,
  lineHeight: 1,
  zIndex: 25,
  pointerEvents: 'none',
}
// Positioned midway between the horizontal centre and the right edge —
// left:75% then shift back by half the clock's own width so it centres
// on x=75%. Vertically aligned to the masthead.
const clockPositionStyle = {
  position: 'absolute',
  top: 36, left: '75%', transform: 'translateX(-50%)',
  zIndex: 25,
  pointerEvents: 'none',
}
// Static pill in the top-right corner. Pure white + Bebas Neue —
// matches /AnTonn/radio's pill visual so both surfaces feel like the
// same product. 56px down from the top so it doesn't hug the edge.
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
// Tiny anchor dot at screen centre — visual reference for the sphere's
// "straight ahead" while the pill stack orbits around it.
const centerPointStyle = {
  position: 'absolute',
  left: '50%', top: '50%',
  width: 6, height: 6,
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  background: 'rgba(242,236,220,0.55)',
  boxShadow: '0 0 6px rgba(242,236,220,0.35)',
  zIndex: 12,
  pointerEvents: 'none',
}
const helpStyle = {
  position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)',
  fontFamily: 'var(--font-ibm-plex-mono), "IBM Plex Mono", Menlo, monospace',
  fontSize: 10, letterSpacing: 1.5,
  color: 'rgba(242,236,220,0.42)',
  pointerEvents: 'none', zIndex: 15,
}
