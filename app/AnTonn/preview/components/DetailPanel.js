'use client'

// Tile detail panel — full-viewport overlay with backdrop-blur on the
// cylinder behind. Slides up from below with a staggered reveal of:
// 1) the tag strip, 2) the title + creator, 3) the blurb prose,
// 4) the action pills (Spotify / YouTube / buy / listen / watch).
//
// Cribs the Phantom "Let's Talk" pattern — opaque blur over the live
// canvas, spinning-X close in the top-right.

import { useEffect, useState } from 'react'
import CloseButton from './CloseButton'

const VERTICAL_ACCENT = {
  music: '#C9A047', books: '#6B4E1F', podcasts: '#7A4A8C',
  film: '#A8323D', radio: '#3F6E2A', tours: '#1F4E6E',
}

const LINK_LABELS = {
  spotify:  'Listen on Spotify',
  youtube:  'Watch on YouTube',
  bandcamp: 'Bandcamp',
  buy:      'Buy the book',
  listen:   'Listen now',
  watch:    'Watch now',
  apple:    'Apple Music',
}

export default function DetailPanel({ tile, vertical, onClose }) {
  const [visible, setVisible] = useState(false)

  // Trigger entrance after mount so the CSS transitions actually run
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 16)
    return () => clearTimeout(t)
  }, [])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!tile) return null
  const accent = VERTICAL_ACCENT[vertical] || '#C9A047'

  const stagger = (i) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 420ms cubic-bezier(0.16, 1, 0.3, 1) ${120 + i * 80}ms, transform 420ms cubic-bezier(0.16, 1, 0.3, 1) ${120 + i * 80}ms`,
  })

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: visible ? 'rgba(2, 4, 9, 0.55)' : 'rgba(2, 4, 9, 0)',
        backdropFilter: visible ? 'blur(18px) saturate(120%)' : 'blur(0px)',
        WebkitBackdropFilter: visible ? 'blur(18px) saturate(120%)' : 'blur(0px)',
        transition: 'background 380ms ease, backdrop-filter 380ms ease, -webkit-backdrop-filter 380ms ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px',
      }}
    >
      <CloseButton onClick={onClose} size="lg" position="top-right" />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: 920, width: '100%',
          maxHeight: '88vh', overflow: 'auto',
          padding: '40px 44px',
          color: '#F2ECDC',
          display: 'grid',
          gridTemplateColumns: tile.cover_url ? 'minmax(220px, 320px) 1fr' : '1fr',
          gap: 36,
          alignItems: 'start',
        }}
      >
        {/* Cover art — only renders if a cover_url is set. Square crop
            with the same per-vertical accent frame as the cylinder tile,
            so the panel feels like a continuous zoom-in from the tap. */}
        {tile.cover_url && (
          <div style={{
            ...stagger(0),
            position: 'relative',
            aspectRatio: '1 / 1',
            background: '#0a0d14',
            border: `2px solid ${accent}`,
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: `0 10px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(${hexToRgb(accent)}, 0.15)`,
          }}>
            <img
              src={tile.cover_url}
              alt={tile.title}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}

        <div>
        {/* Tag strip */}
        <div style={{
          ...stagger(0),
          display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
        }}>
          {(tile.tags || []).map((tag) => (
            <span
              key={tag}
              style={{
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(242, 236, 220, 0.08)',
                border: '1px solid rgba(242, 236, 220, 0.15)',
                fontFamily: '"IBM Plex Mono", Menlo, monospace',
                fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
                color: 'rgba(242, 236, 220, 0.85)',
              }}
            >
              {tag}
            </span>
          ))}
          {tile.year && (
            <span style={{
              padding: '4px 12px', borderRadius: 999,
              background: `rgba(${hexToRgb(accent)}, 0.15)`,
              border: `1px solid rgba(${hexToRgb(accent)}, 0.5)`,
              fontFamily: '"IBM Plex Mono", Menlo, monospace',
              fontSize: 10, letterSpacing: 1.5,
              color: accent,
            }}>
              {tile.year}
            </span>
          )}
        </div>

        {/* Title + creator */}
        <h1 style={{
          ...stagger(1),
          fontFamily: 'Cinzel, Georgia, serif',
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 600, lineHeight: 1.15,
          margin: '0 0 6px',
          color: '#F2ECDC',
        }}>
          {tile.title}
        </h1>
        <div style={{
          ...stagger(1),
          fontFamily: 'EB Garamond, Georgia, serif',
          fontSize: 'clamp(18px, 2.4vw, 22px)',
          fontStyle: 'italic',
          color: accent,
          marginBottom: 28,
        }}>
          {tile.creator}
        </div>

        {/* Blurb */}
        <p style={{
          ...stagger(2),
          fontFamily: 'EB Garamond, Georgia, serif',
          fontSize: 'clamp(16px, 1.8vw, 19px)',
          lineHeight: 1.65,
          color: 'rgba(242, 236, 220, 0.92)',
          marginBottom: 32,
        }}>
          {tile.blurb || 'No description available.'}
        </p>

        {/* Action pills */}
        <div style={{
          ...stagger(3),
          display: 'flex', gap: 10, flexWrap: 'wrap',
        }}>
          {Object.entries(tile.links || {}).map(([kind, url]) => (
            <a
              key={kind}
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '12px 18px',
                borderRadius: 999,
                background: `rgba(${hexToRgb(accent)}, 0.12)`,
                border: `1px solid rgba(${hexToRgb(accent)}, 0.6)`,
                color: accent,
                fontFamily: '"IBM Plex Mono", Menlo, monospace',
                fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'background 200ms ease, transform 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `rgba(${hexToRgb(accent)}, 0.25)`
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `rgba(${hexToRgb(accent)}, 0.12)`
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {LINK_LABELS[kind] || kind} →
            </a>
          ))}
        </div>

        {/* Provenance footer (small, faded) */}
        <div style={{
          ...stagger(4),
          marginTop: 40,
          paddingTop: 18,
          borderTop: '1px solid rgba(242, 236, 220, 0.08)',
          fontFamily: '"IBM Plex Mono", Menlo, monospace',
          fontSize: 10, letterSpacing: 1.2,
          color: 'rgba(242, 236, 220, 0.4)',
        }}>
          AN TONN · {(vertical || '').toUpperCase()} · curated this week
        </div>
        </div>{/* end right column */}
        </div>
      </div>
    </div>
  )
}

// Convert "#C9A047" → "201, 160, 71" for rgba()
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}
