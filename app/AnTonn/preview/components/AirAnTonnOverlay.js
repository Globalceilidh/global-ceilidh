'use client'

// "Air an Tonn" (On the Wave) overlay — the An Tonn equivalent of Phantom's
// "Let's Talk" overlay. Three cards: TIP (add an artist), VOTE (shape next
// week's wave), JUST SAYING HI (community contact). Each card animates in
// with staggered timing so they feel composed, not blasted.

import { useEffect, useState } from 'react'
import CloseButton from './CloseButton'

const CARDS = [
  {
    id: 'tip',
    label: 'TIP',
    title: 'I know an artist /\nbook /\nshow.',
    description: 'Send it to us. If it carries Gàidhlig culture, the wave wants to know.',
    cta: 'Submit a tip →',
    href: 'mailto:antonn@globalceilidh.com?subject=Tip%20for%20An%20Tonn',
    accent: '#C9A047',
  },
  {
    id: 'vote',
    label: 'VOTE',
    title: 'I want to shape\nnext week\'s wave.',
    description: 'The Vote queue opens every Friday and stays open until Monday midnight.',
    cta: 'Open the vote →',
    href: '/AnTonn/vote?key=6776',
    accent: '#7A4A8C',
  },
  {
    id: 'hi',
    label: 'JUST SAYING HI',
    title: 'Just here to\nlisten.',
    description: 'Welcome. The current carries everyone.',
    cta: 'Hello →',
    href: 'mailto:hi@globalceilidh.com',
    accent: '#3F6E2A',
  },
]

export default function AirAnTonnOverlay({ open, onClose }) {
  const [visible, setVisible] = useState(false)

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

  if (!open) return null

  const stagger = (i) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 480ms cubic-bezier(0.16, 1, 0.3, 1) ${180 + i * 100}ms, transform 480ms cubic-bezier(0.16, 1, 0.3, 1) ${180 + i * 100}ms`,
  })

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: visible ? 'rgba(2, 4, 9, 0.62)' : 'rgba(2, 4, 9, 0)',
        backdropFilter: visible ? 'blur(22px) saturate(120%)' : 'blur(0px)',
        WebkitBackdropFilter: visible ? 'blur(22px) saturate(120%)' : 'blur(0px)',
        transition: 'background 420ms ease, backdrop-filter 420ms ease, -webkit-backdrop-filter 420ms ease',
        padding: '90px 32px 64px',
        overflow: 'auto',
      }}
    >
      <CloseButton onClick={onClose} size="lg" position="top-right" />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 1180, margin: '0 auto',
          color: '#F2ECDC',
        }}
      >
        {/* Eyebrow */}
        <div style={{
          ...stagger(0),
          fontFamily: '"IBM Plex Mono", Menlo, monospace',
          fontSize: 11, letterSpacing: 3, color: '#C9A047',
          marginBottom: 18,
        }}>
          ● AIR AN TONN
        </div>

        {/* Headline */}
        <h1 style={{
          ...stagger(0),
          fontFamily: 'Cinzel, Georgia, serif',
          fontSize: 'clamp(36px, 6vw, 64px)',
          lineHeight: 1.1, fontWeight: 600,
          margin: '0 0 56px',
        }}>
          Fàilte. It's the wave.
        </h1>

        {/* Three cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18,
        }}>
          {CARDS.map((card, i) => (
            <a
              key={card.id}
              href={card.href}
              target={card.href.startsWith('http') || card.href.startsWith('mailto') ? '_blank' : undefined}
              rel="noreferrer"
              style={{
                ...stagger(i + 1),
                display: 'flex', flexDirection: 'column',
                padding: '28px 26px',
                background: 'rgba(15, 20, 30, 0.55)',
                border: '1px solid rgba(242, 236, 220, 0.12)',
                borderRadius: 8,
                color: '#F2ECDC',
                textDecoration: 'none',
                minHeight: 320,
                cursor: 'pointer',
                transition: 'background 250ms ease, border-color 250ms ease, transform 250ms ease',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `rgba(${hexToRgb(card.accent)}, 0.10)`
                e.currentTarget.style.borderColor = `rgba(${hexToRgb(card.accent)}, 0.55)`
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 20, 30, 0.55)'
                e.currentTarget.style.borderColor = 'rgba(242, 236, 220, 0.12)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                fontFamily: '"IBM Plex Mono", Menlo, monospace',
                fontSize: 11, letterSpacing: 2.5,
                color: card.accent,
                marginBottom: 22,
              }}>
                ● {card.label}
              </div>
              <div style={{
                fontFamily: 'Cinzel, Georgia, serif',
                fontSize: 'clamp(22px, 2.4vw, 30px)',
                lineHeight: 1.2, fontWeight: 500,
                whiteSpace: 'pre-line',
                marginBottom: 16,
              }}>
                {card.title}
              </div>
              <p style={{
                fontFamily: 'EB Garamond, Georgia, serif',
                fontSize: 15, lineHeight: 1.55,
                color: 'rgba(242, 236, 220, 0.7)',
                margin: '0 0 28px',
              }}>
                {card.description}
              </p>
              <div style={{
                marginTop: 'auto',
                fontFamily: '"IBM Plex Mono", Menlo, monospace',
                fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase',
                color: card.accent,
              }}>
                {card.cta}
              </div>
            </a>
          ))}
        </div>

        {/* Footer line */}
        <div style={{
          ...stagger(4),
          marginTop: 64,
          paddingTop: 22,
          borderTop: '1px solid rgba(242, 236, 220, 0.08)',
          fontFamily: '"IBM Plex Mono", Menlo, monospace',
          fontSize: 10, letterSpacing: 1.5,
          color: 'rgba(242, 236, 220, 0.4)',
          display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <span>AN TONN · CHRONICLE OF THE GÀIDHLIG CURRENT · SINCE 2026</span>
          <span>TÌR NAN GÀIDHEAL · EVERYWHERE</span>
        </div>
      </div>
    </div>
  )
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`
}
