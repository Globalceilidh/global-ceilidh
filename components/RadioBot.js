'use client'

// Reidio bot — persistent floating control at the bottom-left of
// every test surface. Two visual states:
//   dim    = radio off (paused)
//   bright = radio on  (playing)
//
// Interaction:
//   click             → toggles play/pause
//   hover             → volume slider fades in beside the icon
//   scroll wheel      → volume ±5% per tick (works even when the
//                       slider is hidden)
//   drag slider       → normal volume control
//
// State + audio element live at the app root in RadioContext so
// playback keeps going across route changes.

import { useState } from 'react'
import { useRadio } from '../context/RadioContext'

export default function RadioBot() {
  const { isPlaying, volume, togglePlay, setVolume } = useRadio()
  const [hovered, setHovered] = useState(false)

  const handleWheel = (e) => {
    e.preventDefault()
    // Wheel-down lowers, wheel-up raises. 5% per tick.
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    setVolume(volume + delta)
  }

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={togglePlay}
        onWheel={handleWheel}
        aria-label={isPlaying ? 'Turn radio off' : 'Turn radio on'}
        title={isPlaying ? 'Radio on — click to pause' : 'Radio off — click to play'}
        style={{
          ...iconButtonStyle,
          opacity: isPlaying ? 1 : 0.32,
          filter: isPlaying
            ? 'drop-shadow(0 0 14px rgba(255,255,255,0.35))'
            : 'grayscale(0.5)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/AnTonn/test/reidio-icon.png"
          alt=""
          aria-hidden="true"
          style={iconImgStyle}
          draggable={false}
        />
      </button>

      {/* Volume slider — reveals on hover. Kept in the DOM at rest
          (opacity 0 + pointer-events none) so the fade is smooth
          rather than a re-mount. */}
      <div
        style={{
          ...sliderWrapStyle,
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? 'auto' : 'none',
          transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
        }}
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          aria-label="Radio volume"
          style={sliderStyle}
        />
        <span style={sliderReadoutStyle}>{Math.round(volume * 100)}</span>
      </div>
    </div>
  )
}

const containerStyle = {
  position: 'absolute',
  bottom: 30,
  left: 30,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  zIndex: 30,
}

const iconButtonStyle = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  width: 64,
  height: 64,
  display: 'block',
  transition: 'opacity 260ms ease, filter 260ms ease',
}

const iconImgStyle = {
  width: '100%',
  height: '100%',
  display: 'block',
  userSelect: 'none',
}

const sliderWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 12px',
  background: 'rgba(10, 6, 12, 0.6)',
  border: '1px solid rgba(242, 236, 220, 0.14)',
  borderRadius: 999,
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  transition: 'opacity 220ms ease, transform 220ms ease',
}

const sliderStyle = {
  width: 120,
  height: 4,
  appearance: 'none',
  WebkitAppearance: 'none',
  background: 'rgba(242, 236, 220, 0.22)',
  borderRadius: 2,
  outline: 'none',
  cursor: 'pointer',
}

const sliderReadoutStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  letterSpacing: '0.14em',
  color: 'rgba(242, 236, 220, 0.85)',
  minWidth: 24,
  textAlign: 'right',
}
