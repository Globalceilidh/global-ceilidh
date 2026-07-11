'use client'

// /AnTonn/test — sandbox surface. Solid black canvas with the standard
// AnTonn chrome (Sniomh homepage icon top-left, Let's Talk pill top-right,
// EN/GD language slider bottom-right). Nothing else — intentionally blank
// as a jumping-off point for new experiments.

import Link from 'next/link'
import LanguagePill from '../../../components/LanguagePill'
import { useLanguage } from '../../../context/LanguageContext'

export default function AnTonnTest() {
  const { t } = useLanguage()

  return (
    <div style={pageStyle}>
      {/* Sniomh — the core GlobalCeilidh design motif. Links back to
          the homepage. */}
      <Link href="/" style={homeIconLinkStyle} aria-label="GlobalCeilidh home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/AnTonn/test/sniomh.png"
          alt="GlobalCeilidh — home"
          style={homeIconImgStyle}
          draggable={false}
        />
      </Link>

      {/* Let's Talk pill — same treatment as /AnTonn/radio + /AnTonn/marble. */}
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
  background: '#000000',
  overflow: 'hidden',
}

const homeIconLinkStyle = {
  position: 'absolute',
  top: 30,
  left: 30,
  display: 'block',
  lineHeight: 0,
  zIndex: 30,
}

const homeIconImgStyle = {
  width: 96,
  height: 96,
  display: 'block',
  userSelect: 'none',
}

// White pill matching /AnTonn/radio + /AnTonn/marble.
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
