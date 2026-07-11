'use client'

// Shared sandbox surface for the four AnTonn vertical test pages
// (Ceòl, Bhidio, Leabhraichean, Pod-chraoladh). Same chrome as the
// parent /AnTonn/test — Sniomh homepage icon top-left, Let's Talk pill
// top-right, EN/GD slider bottom-right — but with a per-vertical tonal
// background.
//
// One prop: `background` — any CSS colour string. Defaults to black so
// this stays a drop-in for the base test page if ever needed.

import Link from 'next/link'
import LanguagePill from '../../../components/LanguagePill'
import { useLanguage } from '../../../context/LanguageContext'

export default function TestSurface({ background = '#000000' }) {
  const { t } = useLanguage()

  return (
    <div style={{ ...pageStyle, background }}>
      {/* Sniomh — GlobalCeilidh design motif; homepage link. Reuses
          the alpha-keyed asset from the parent /AnTonn/test surface
          so we only ship one copy. */}
      <Link href="/" style={sniomhLinkStyle} aria-label="GlobalCeilidh home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/AnTonn/test/sniomh.png"
          alt="GlobalCeilidh — home"
          style={sniomhImgStyle}
          draggable={false}
        />
      </Link>

      {/* Let's Talk pill — matches /AnTonn/radio, /AnTonn/marble,
          /AnTonn/test. */}
      <a href="/contact" style={letsTalkStyle}>{t('common.lets_talk')}</a>

      {/* EN ⇄ GD slider — bottom-right, mirroring the top-right pill. */}
      <LanguagePill
        position="bottom-right"
        layout="toggle"
        variant="white"
        offsetBottom={56}
        offsetRight={30}
      />
    </div>
  )
}

const pageStyle = {
  position: 'fixed',
  inset: 0,
  overflow: 'hidden',
}

const sniomhLinkStyle = {
  position: 'absolute',
  top: 30,
  left: 30,
  display: 'block',
  width: 180,
  height: 180,
  lineHeight: 0,
  zIndex: 30,
}

const sniomhImgStyle = {
  width: '100%',
  height: '100%',
  display: 'block',
  userSelect: 'none',
}

// White pill matching every other AnTonn corner pill.
const letsTalkStyle = {
  position: 'absolute',
  top: 56,
  right: 30,
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
