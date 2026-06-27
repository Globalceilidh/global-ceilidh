'use client'

// Flat list-view fallback for the An Tonn cylinder prototype.
//
// Three jobs:
//   1. Accessibility — screen readers can't navigate a <canvas>. This is
//      a fully semantic HTML mirror of the same data the cylinder shows.
//   2. SEO — Googlebot can index this; it can't index WebGL.
//   3. Reduced-motion / low-end devices — users who can't (or shouldn't)
//      use the 3D interface get the same content in a calm scrolling
//      grid.
//
// Renders as a fixed-position overlay above the canvas when toggled on,
// and is ALWAYS rendered as a hidden semantic block underneath the canvas
// (off-screen positioned, accessible to screen readers and crawlers).

import { useState } from 'react'
import DetailPanel from './DetailPanel'

const VERTICAL_LABELS = {
  music:    { gd: 'Ceòl', en: 'Music' },
  books:    { gd: 'Leabhraichean', en: 'Books' },
  podcasts: { gd: 'Podcasts', en: 'Podcasts' },
  film:     { gd: 'Film & TBh', en: 'Film & TV' },
  radio:    { gd: 'Rèidio', en: 'Radio' },
  tours:    { gd: 'Cuairtean', en: 'Tours' },
}

const VERTICAL_ACCENT = {
  music: '#C9A047', books: '#6B4E1F', podcasts: '#7A4A8C',
  film: '#A8323D', radio: '#3F6E2A', tours: '#1F4E6E',
}

// ── Visible list view (toggled on by the grid icon) ────────────────────

export function ListView({ issue, onClose, onTileSelect }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80,
      background: '#0a0d14',
      overflow: 'auto',
      color: '#F2ECDC',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '64px 24px 96px',
      }}>
        {/* Header */}
        <header style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 11, letterSpacing: 3, color: '#C9A047', marginBottom: 12 }}>
              AN TONN · LIST VIEW
            </div>
            <h1 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 600, margin: '0 0 8px' }}>
              {issue.date_gd}
            </h1>
            <div style={{ fontFamily: 'EB Garamond, Georgia, serif', fontSize: 18, fontStyle: 'italic', color: 'rgba(242, 236, 220, 0.7)' }}>
              Issue Nº {String(issue.number).padStart(3, '0')} · {issue.tagline}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: 999,
              background: 'rgba(201, 160, 71, 0.18)',
              border: '1px solid rgba(201, 160, 71, 0.5)',
              color: '#C9A047',
              fontFamily: '"IBM Plex Mono", Menlo, monospace',
              fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            ◯ Back to immersive view
          </button>
        </header>

        {/* Sections per vertical */}
        {['music', 'books', 'podcasts', 'film', 'radio'].map((vertical) => {
          const items = issue[vertical] || []
          if (items.length === 0) return null
          const label = VERTICAL_LABELS[vertical]
          const accent = VERTICAL_ACCENT[vertical]
          return (
            <section key={vertical} style={{ marginBottom: 56 }}>
              <h2 style={{
                fontFamily: 'Cinzel, Georgia, serif',
                fontSize: 26, fontWeight: 600,
                margin: '0 0 4px',
                color: accent,
                letterSpacing: 1,
              }}>
                {label.gd}
              </h2>
              <div style={{ fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 11, letterSpacing: 2, color: 'rgba(242, 236, 220, 0.5)', marginBottom: 24 }}>
                {label.en.toUpperCase()} · {items.length} this week
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onTileSelect?.(item, vertical)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '20px 22px',
                        background: 'rgba(15, 20, 30, 0.65)',
                        border: '1px solid rgba(242, 236, 220, 0.08)',
                        borderRadius: 6,
                        color: '#F2ECDC',
                        cursor: 'pointer',
                        transition: 'background 200ms ease, border-color 200ms ease, transform 200ms ease',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `rgba(${hexToRgb(accent)}, 0.08)`
                        e.currentTarget.style.borderColor = `rgba(${hexToRgb(accent)}, 0.4)`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(15, 20, 30, 0.65)'
                        e.currentTarget.style.borderColor = 'rgba(242, 236, 220, 0.08)'
                      }}
                    >
                      <div style={{ fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 10, letterSpacing: 1.5, color: accent, marginBottom: 6 }}>
                        {[(item.year), ...(item.tags || []).slice(0, 2)].filter(Boolean).join(' · ').toUpperCase()}
                      </div>
                      <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 18, fontWeight: 600, marginBottom: 2 }}>
                        {item.title}
                      </div>
                      <div style={{ fontFamily: 'EB Garamond, Georgia, serif', fontSize: 15, fontStyle: 'italic', color: 'rgba(242, 236, 220, 0.7)', marginBottom: 8 }}>
                        {item.creator}
                      </div>
                      {item.blurb && (
                        <p style={{ fontFamily: 'EB Garamond, Georgia, serif', fontSize: 14, lineHeight: 1.5, color: 'rgba(242, 236, 220, 0.6)', margin: 0 }}>
                          {item.blurb.length > 140 ? item.blurb.slice(0, 137) + '…' : item.blurb}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}

        {/* Tours marquee (compact list at the bottom) */}
        {(issue.tours || []).length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 24, color: VERTICAL_ACCENT.tours, margin: '0 0 4px' }}>
              {VERTICAL_LABELS.tours.gd}
            </h2>
            <div style={{ fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 11, letterSpacing: 2, color: 'rgba(242, 236, 220, 0.5)', marginBottom: 16 }}>
              {VERTICAL_LABELS.tours.en.toUpperCase()} · ON THE ROAD
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {issue.tours.map((t) => (
                <li key={t.id} style={{ padding: '14px 0', borderBottom: '1px solid rgba(242, 236, 220, 0.08)', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 18 }}>{t.artist}</div>
                    <div style={{ fontFamily: 'EB Garamond, Georgia, serif', fontSize: 14, color: 'rgba(242, 236, 220, 0.6)' }}>{t.cities}</div>
                  </div>
                  <div style={{ fontFamily: '"IBM Plex Mono", Menlo, monospace', fontSize: 11, color: VERTICAL_ACCENT.tours, alignSelf: 'center' }}>
                    {t.dates.toUpperCase()}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: '1px solid rgba(242, 236, 220, 0.08)',
          fontFamily: '"IBM Plex Mono", Menlo, monospace',
          fontSize: 10, letterSpacing: 1.5,
          color: 'rgba(242, 236, 220, 0.4)',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <span>AN TONN · CHRONICLE OF THE GÀIDHLIG CURRENT</span>
          <span>TÌR NAN GÀIDHEAL · EVERYWHERE</span>
        </footer>
      </div>
    </div>
  )
}

// ── Off-screen SEO + a11y mirror (always present in DOM) ───────────────

// This is what Googlebot and screen readers see. Lives below the canvas
// in the DOM but is visually clipped out. Same content, no styling, no
// interactions — just semantic HTML so the page IS indexable and accessible.
//
// The off-screen technique (clip-path + height:1px) is preferred over
// `display: none` because some screen readers skip display:none entirely.

export function SEOMirror({ issue }) {
  return (
    <div
      aria-label={`An Tonn issue ${issue.number}, published ${issue.date_en}`}
      style={{
        position: 'absolute',
        width: 1, height: 1,
        padding: 0, margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      <h1>An Tonn — Issue Nº {String(issue.number).padStart(3, '0')}, {issue.date_en}</h1>
      <p>{issue.tagline}</p>

      {['music', 'books', 'podcasts', 'film', 'radio'].map((vertical) => {
        const items = issue[vertical] || []
        if (items.length === 0) return null
        return (
          <section key={vertical}>
            <h2>{VERTICAL_LABELS[vertical].en}</h2>
            <ol>
              {items.map((item) => (
                <li key={item.id}>
                  <article>
                    <h3>{item.title}</h3>
                    <p>by {item.creator}{item.year ? ` (${item.year})` : ''}</p>
                    {item.tags && <p>Tags: {item.tags.join(', ')}</p>}
                    {item.blurb && <p>{item.blurb}</p>}
                    {item.links && (
                      <ul>
                        {Object.entries(item.links).map(([kind, url]) => (
                          <li key={kind}>
                            <a href={url}>{kind}: {url}</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          </section>
        )
      })}

      {issue.tours?.length > 0 && (
        <section>
          <h2>Tours</h2>
          <ul>
            {issue.tours.map((t) => (
              <li key={t.id}>{t.artist} — {t.dates} — {t.cities}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`
}
