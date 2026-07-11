'use client'

// Global Cèilidh Rèidio bot state — mounts a single persistent
// <audio> element at the app root so playback continues across
// route changes. Any component in the tree can read state /
// toggle playback / adjust volume via useRadio().
//
// Volume persists in localStorage so the user's preferred level
// carries between sessions.

import { createContext, useContext, useEffect, useRef, useState } from 'react'

// Direct MP3 stream URL for the Global Cèilidh Rèidio Live365 station
// (a11866). If the browser refuses to play this, the actual stream URL
// can be pulled from the Live365 station dashboard and swapped in
// here — the URL pattern varies by mount point / node.
const STREAM_URL = 'https://streaming.live365.com/a11866'

const RadioContext = createContext(null)

export function RadioProvider({ children }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.6)

  // Restore last-known volume on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('gc_radio_volume')
    if (saved !== null) {
      const v = Math.max(0, Math.min(1, parseFloat(saved)))
      if (!Number.isNaN(v)) setVolumeState(v)
    }
  }, [])

  // Keep the audio element's live volume in sync + persist to storage.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
    if (typeof window !== 'undefined') {
      localStorage.setItem('gc_radio_volume', String(volume))
    }
  }, [volume])

  const togglePlay = async () => {
    const el = audioRef.current
    if (!el) return
    if (isPlaying) {
      el.pause()
      setIsPlaying(false)
      return
    }
    try {
      await el.play()
      setIsPlaying(true)
    } catch (err) {
      // Autoplay policies + stream URL issues both surface here.
      // Log and stay in "off" state so the user can retry.
      // eslint-disable-next-line no-console
      console.error('[Reidio] Play failed:', err)
      setIsPlaying(false)
    }
  }

  const setVolume = (v) => {
    const clamped = Math.max(0, Math.min(1, v))
    setVolumeState(clamped)
  }

  return (
    <RadioContext.Provider value={{ isPlaying, volume, togglePlay, setVolume }}>
      {/* Hidden, persistent audio element. Living in the provider means
          it survives every route change; only a full page reload
          would tear it down. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="none"
        style={{ display: 'none' }}
      />
      {children}
    </RadioContext.Provider>
  )
}

export function useRadio() {
  const ctx = useContext(RadioContext)
  if (!ctx) {
    // Falls through as a no-op so components using the hook don't
    // crash if the provider hasn't been mounted yet (e.g. during a
    // deep-link warmup before the root layout hydrates).
    return {
      isPlaying: false,
      volume: 0.6,
      togglePlay: () => {},
      setVolume: () => {},
    }
  }
  return ctx
}
