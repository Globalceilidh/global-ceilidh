// Static list view — pure Server Component. No 'use client', no
// useState, no useEffect, no Canvas, no Three.js. The HTML for the
// full week's content is rendered on the server and ships to the
// browser as a single payload that displays instantly.
//
// Loads even if every script on the page fails (including Clerk).
// Per-tile detail expansion lives in a sibling Client Component if
// we add it later; the current view links externally to each item's
// canonical source.

import { issue } from './data/week-2026-06-23'

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

const LINK_LABELS = {
  spotify: 'Spotify', youtube: 'YouTube', bandcamp: 'Bandcamp',
  buy: 'Buy', listen: 'Listen', watch: 'Watch', apple: 'Apple Music',
}

export default function StaticListView() {
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        {/* Hero header */}
        <header style={headerStyle}>
          <div style={eyebrowStyle}>
            ● AN TONN · THE CHRONICLE OF THE GÀIDHLIG CURRENT
          </div>
          <h1 style={titleStyle}>{issue.date_gd}</h1>
          <div style={taglineStyle}>
            Issue Nº {String(issue.number).padStart(3, '0')} · {issue.date_en}
          </div>
          <p style={subtitleStyle}>{issue.tagline}</p>
        </header>

        {/* Sections per vertical */}
        {['music', 'books', 'podcasts', 'film', 'radio'].map((vertical) => {
          const items = issue[vertical] || []
          if (items.length === 0) return null
          const label = VERTICAL_LABELS[vertical]
          const accent = VERTICAL_ACCENT[vertical]
          return (
            <section key={vertical} style={sectionStyle}>
              <h2 style={{ ...sectionTitleStyle, color: accent }}>
                {label.gd}
              </h2>
              <div style={sectionCountStyle}>
                {label.en.toUpperCase()} · {items.length} this week
              </div>
              <ul style={gridStyle}>
                {items.map((item) => (
                  <li key={item.id} style={tileWrapStyle}>
                    <article style={tileStyle(accent)}>
                      <div style={tileMetaStyle(accent)}>
                        {[item.year, ...(item.tags || []).slice(0, 2)].filter(Boolean).join(' · ').toUpperCase()}
                      </div>
                      <h3 style={tileTitleStyle}>{item.title}</h3>
                      <div style={tileCreatorStyle}>{item.creator}</div>
                      {item.blurb && <p style={tileBlurbStyle}>{item.blurb}</p>}
                      {item.links && Object.keys(item.links).length > 0 && (
                        <div style={tileLinksStyle}>
                          {Object.entries(item.links).map(([kind, url]) => (
                            <a
                              key={kind}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              style={linkPillStyle(accent)}
                            >
                              {LINK_LABELS[kind] || kind} →
                            </a>
                          ))}
                        </div>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}

        {/* Tours marquee */}
        {(issue.tours || []).length > 0 && (
          <section style={sectionStyle}>
            <h2 style={{ ...sectionTitleStyle, color: VERTICAL_ACCENT.tours }}>
              {VERTICAL_LABELS.tours.gd}
            </h2>
            <div style={sectionCountStyle}>
              {VERTICAL_LABELS.tours.en.toUpperCase()} · ON THE ROAD
            </div>
            <ul style={toursListStyle}>
              {issue.tours.map((t) => (
                <li key={t.id} style={tourRowStyle}>
                  <div>
                    <div style={tourArtistStyle}>{t.artist}</div>
                    <div style={tourCitiesStyle}>{t.cities}</div>
                  </div>
                  <div style={{ ...tourDatesStyle, color: VERTICAL_ACCENT.tours }}>
                    {t.dates.toUpperCase()}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer */}
        <footer style={footerStyle}>
          <span>AN TONN · CHRONICLE OF THE GÀIDHLIG CURRENT · SINCE 2026</span>
          <span>TÌR NAN GÀIDHEAL · EVERYWHERE</span>
        </footer>
      </div>
    </main>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────

const pageStyle = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at top, #0a1a2a 0%, #020409 70%)',
  color: '#F2ECDC',
  padding: '64px 24px 96px',
}

const containerStyle = {
  maxWidth: 1100,
  margin: '0 auto',
}

const headerStyle = {
  marginBottom: 64,
  paddingBottom: 32,
  borderBottom: '1px solid rgba(242, 236, 220, 0.08)',
}

const eyebrowStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 11,
  letterSpacing: 3,
  color: '#C9A047',
  marginBottom: 16,
}

const titleStyle = {
  fontFamily: 'Cinzel, Georgia, serif',
  fontSize: 'clamp(36px, 6vw, 64px)',
  fontWeight: 600,
  lineHeight: 1.1,
  margin: '0 0 12px',
}

const taglineStyle = {
  fontFamily: 'EB Garamond, Georgia, serif',
  fontSize: 18,
  fontStyle: 'italic',
  color: 'rgba(242, 236, 220, 0.7)',
  marginBottom: 8,
}

const subtitleStyle = {
  fontFamily: 'EB Garamond, Georgia, serif',
  fontSize: 16,
  color: 'rgba(242, 236, 220, 0.55)',
  margin: 0,
}

const sectionStyle = { marginBottom: 64 }

const sectionTitleStyle = {
  fontFamily: 'Cinzel, Georgia, serif',
  fontSize: 32,
  fontWeight: 600,
  margin: '0 0 4px',
  letterSpacing: 1,
}

const sectionCountStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 11,
  letterSpacing: 2,
  color: 'rgba(242, 236, 220, 0.5)',
  marginBottom: 28,
}

const gridStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: 18,
}

const tileWrapStyle = { display: 'block' }

const tileStyle = (accent) => ({
  height: '100%',
  padding: '22px 24px',
  background: 'rgba(15, 20, 30, 0.65)',
  border: '1px solid rgba(242, 236, 220, 0.10)',
  borderLeft: `3px solid ${accent}`,
  borderRadius: 6,
})

const tileMetaStyle = (accent) => ({
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  letterSpacing: 1.5,
  color: accent,
  marginBottom: 8,
})

const tileTitleStyle = {
  fontFamily: 'Cinzel, Georgia, serif',
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.2,
  margin: '0 0 4px',
  color: '#F2ECDC',
}

const tileCreatorStyle = {
  fontFamily: 'EB Garamond, Georgia, serif',
  fontSize: 15,
  fontStyle: 'italic',
  color: 'rgba(242, 236, 220, 0.7)',
  marginBottom: 12,
}

const tileBlurbStyle = {
  fontFamily: 'EB Garamond, Georgia, serif',
  fontSize: 14,
  lineHeight: 1.55,
  color: 'rgba(242, 236, 220, 0.7)',
  margin: '0 0 14px',
}

const tileLinksStyle = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
}

const linkPillStyle = (accent) => ({
  padding: '5px 10px',
  borderRadius: 4,
  background: 'rgba(242, 236, 220, 0.05)',
  border: `1px solid ${accent}`,
  color: accent,
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  textDecoration: 'none',
})

const toursListStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
}

const tourRowStyle = {
  padding: '16px 0',
  borderBottom: '1px solid rgba(242, 236, 220, 0.08)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  alignItems: 'center',
}

const tourArtistStyle = {
  fontFamily: 'Cinzel, Georgia, serif',
  fontSize: 18,
  color: '#F2ECDC',
}

const tourCitiesStyle = {
  fontFamily: 'EB Garamond, Georgia, serif',
  fontSize: 14,
  color: 'rgba(242, 236, 220, 0.6)',
}

const tourDatesStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 11,
  letterSpacing: 1.5,
}

const footerStyle = {
  marginTop: 72,
  paddingTop: 28,
  borderTop: '1px solid rgba(242, 236, 220, 0.08)',
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  letterSpacing: 1.5,
  color: 'rgba(242, 236, 220, 0.4)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
}
