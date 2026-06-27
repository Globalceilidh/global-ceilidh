'use client'

// Filter side-panel — slides in from the right with the same
// backdrop-blur treatment as Phantom's filter. Four filter axes:
//
//   By vertical    — Music · Books · Podcasts · Film/TV · Radio · Tours
//   By region      — Alba · Cape Breton · Nova Scotia · Global Diaspora
//   By language    — Gàidhlig-only · Bilingual · English w/ Gàidhlig content
//   By freshness   — This Week · Last 4 Weeks · All Time
//
// Selection lifts up to the parent (which dims non-matching tiles in the
// cylinder).

import { useEffect, useState } from 'react'
import CloseButton from './CloseButton'

export const FILTER_GROUPS = [
  {
    id: 'vertical',
    title: 'Cuibhle / Vertical',
    options: [
      { id: 'music', label: 'Ceòl · Music' },
      { id: 'books', label: 'Leabhraichean · Books' },
      { id: 'podcasts', label: 'Podcasts' },
      { id: 'film', label: 'Film & TV' },
      { id: 'radio', label: 'Rèidio · Radio' },
      { id: 'tours', label: 'Cuairtean · Tours' },
    ],
  },
  {
    id: 'region',
    title: 'Sgìre / Region',
    options: [
      { id: 'alba', label: 'Alba' },
      { id: 'cape-breton', label: 'Cape Breton' },
      { id: 'nova-scotia', label: 'Nova Scotia' },
      { id: 'diaspora', label: 'Global Diaspora' },
    ],
  },
  {
    id: 'language',
    title: 'Cànan / Language',
    options: [
      { id: 'gaidhlig-only', label: 'Gàidhlig only' },
      { id: 'bilingual', label: 'Bilingual' },
      { id: 'english', label: 'English w/ Gàidhlig content' },
    ],
  },
  {
    id: 'freshness',
    title: 'Ùire / Freshness',
    options: [
      { id: 'this-week', label: 'This week' },
      { id: 'four-weeks', label: 'Last 4 weeks' },
      { id: 'all', label: 'All time' },
    ],
  },
]

const DEFAULT_FILTERS = () => Object.fromEntries(FILTER_GROUPS.map((g) => [g.id, new Set()]))

export default function FilterPanel({ open, filters, onChange, onClose }) {
  const [visible, setVisible] = useState(false)
  const f = filters || DEFAULT_FILTERS()

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 16)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function toggle(groupId, optionId) {
    const next = { ...f }
    const set = new Set(next[groupId] || [])
    if (set.has(optionId)) set.delete(optionId)
    else set.add(optionId)
    next[groupId] = set
    onChange?.(next)
  }

  function clearAll() {
    onChange?.(DEFAULT_FILTERS())
  }

  if (!open) return null

  const totalSelected = Object.values(f).reduce((n, s) => n + (s?.size || 0), 0)

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: visible ? 'rgba(2, 4, 9, 0.4)' : 'rgba(2, 4, 9, 0)',
          backdropFilter: visible ? 'blur(8px)' : 'blur(0)',
          WebkitBackdropFilter: visible ? 'blur(8px)' : 'blur(0)',
          transition: 'background 320ms ease, backdrop-filter 320ms ease, -webkit-backdrop-filter 320ms ease',
        }}
      />

      {/* Sliding panel from right */}
      <aside
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(420px, 92vw)',
          zIndex: 71,
          background: 'rgba(12, 16, 24, 0.92)',
          backdropFilter: 'blur(22px) saturate(130%)',
          WebkitBackdropFilter: 'blur(22px) saturate(130%)',
          borderLeft: '1px solid rgba(242, 236, 220, 0.12)',
          color: '#F2ECDC',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <CloseButton onClick={onClose} size="md" position="top-right" />

        <div style={{ padding: '64px 32px 32px' }}>
          <div style={{
            fontFamily: '"IBM Plex Mono", Menlo, monospace',
            fontSize: 11, letterSpacing: 2.5, color: '#C9A047',
            marginBottom: 16,
          }}>
            ● FILTER
          </div>
          <h2 style={{
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: 30, lineHeight: 1.15, fontWeight: 600,
            margin: '0 0 8px',
          }}>
            Shape the wave.
          </h2>
          <p style={{
            fontFamily: 'EB Garamond, Georgia, serif',
            fontSize: 15, lineHeight: 1.5,
            color: 'rgba(242, 236, 220, 0.65)',
            margin: '0 0 32px',
          }}>
            Choose what current you want to ride. Selections combine across groups.
          </p>

          {FILTER_GROUPS.map((group) => {
            const set = f[group.id] || new Set()
            return (
              <section key={group.id} style={{ marginBottom: 28 }}>
                <div style={{
                  fontFamily: '"IBM Plex Mono", Menlo, monospace',
                  fontSize: 10, letterSpacing: 2,
                  color: 'rgba(242, 236, 220, 0.5)',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                }}>
                  {group.title}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {group.options.map((opt) => {
                    const active = set.has(opt.id)
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggle(group.id, opt.id)}
                        style={{
                          padding: '8px 14px', borderRadius: 999,
                          background: active ? 'rgba(201, 160, 71, 0.22)' : 'rgba(242, 236, 220, 0.05)',
                          border: `1px solid ${active ? 'rgba(201, 160, 71, 0.7)' : 'rgba(242, 236, 220, 0.18)'}`,
                          color: active ? '#C9A047' : '#F2ECDC',
                          fontFamily: 'EB Garamond, Georgia, serif',
                          fontSize: 14,
                          cursor: 'pointer',
                          transition: 'background 180ms ease, border-color 180ms ease, color 180ms ease',
                        }}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        {/* Footer actions */}
        <div style={{
          marginTop: 'auto',
          padding: '20px 32px 28px',
          borderTop: '1px solid rgba(242, 236, 220, 0.08)',
          display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(8, 12, 18, 0.65)',
        }}>
          <button
            type="button"
            onClick={clearAll}
            disabled={totalSelected === 0}
            style={{
              background: 'none', border: 'none', cursor: totalSelected ? 'pointer' : 'default',
              color: totalSelected ? 'rgba(242, 236, 220, 0.85)' : 'rgba(242, 236, 220, 0.3)',
              fontFamily: '"IBM Plex Mono", Menlo, monospace',
              fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
              padding: 0,
            }}
          >
            Clear ({totalSelected})
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '12px 22px', borderRadius: 999,
              background: '#C9A047', color: '#0a0a0a',
              border: 'none', cursor: 'pointer',
              fontFamily: '"IBM Plex Mono", Menlo, monospace',
              fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
            }}
          >
            Apply →
          </button>
        </div>
      </aside>
    </>
  )
}
