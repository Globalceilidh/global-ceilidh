// CeolCharts — the doctrine-v2 (tier × genre) music charts rendered inside
// the Ceòl TestSurface. Server component: the parent page fetches
// /antonn/ceol/charts and passes the payload in as `data`.
//
// TestSurface is position:fixed / overflow:hidden, so this panel owns its
// own scroll region (position:absolute + overflowY:auto) rather than relying
// on the page to scroll — which also keeps it sane on phone widths.

const GOLD = '#C49100'
const GOLD_SOFT = '#E4C56A'
const INK_ON_NAVY = '#EAF0FF'
const MUTED = '#93A6D8'
const CARD = 'rgba(9, 20, 52, 0.72)'
const CARD_BORDER = 'rgba(120, 150, 220, 0.22)'
const ROW_DIV = 'rgba(120, 150, 220, 0.14)'

// Gàidhlig gloss for each genre so the tier+genre reads bilingually.
const GENRE_GD = {
  trad: 'Traidiseanta', folk: 'Dùthchasach', rock: 'Roc',
  punk: 'Punc', rap: 'Rap', country: 'Dùthaich', gospel: 'Soisgeul',
}
const TIER_LABEL = { gael: 'Gael', celtic: 'Celtic' }

function ConfDot({ grade }) {
  const color = { A: '#4ADE80', B: '#A3E635', C: '#FBBF24', D: '#F87171' }[grade] || MUTED
  return (
    <span title={`Confidence ${grade || '—'}`} style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: 4,
      background: color, marginLeft: 8, flexShrink: 0,
    }} />
  )
}

function ChartCard({ list }) {
  return (
    <section style={cardStyle}>
      <header style={cardHeadStyle}>
        <h2 style={cardTitleStyle}>
          {TIER_LABEL[list.tier] || list.tier}{' '}
          <span style={{ color: GOLD_SOFT }}>{cap(list.genre)}</span>
        </h2>
        <span style={cardSubStyle}>
          {GENRE_GD[list.genre] || ''} · {list.total} {list.total === 1 ? 'artist' : 'artists'}
        </span>
      </header>
      <ol style={olStyle}>
        {list.entries.map((e) => (
          <li key={e.rank} style={rowStyle}>
            <span style={rankStyle}>{e.rank}</span>
            <span style={nameWrapStyle}>
              <span style={nameStyle}>{e.name}</span>
              {e.country ? <span style={countryStyle}>{e.country}</span> : null}
            </span>
            <span style={scoreStyle}>
              {Math.round(e.score)}
              <ConfDot grade={e.confidence_grade} />
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function CeolCharts({ data }) {
  const lists = data?.lists || []
  return (
    <div style={scrollStyle}>
      <div style={innerStyle}>
        <div style={introStyle}>
          <h1 style={h1Style}>Ceòl</h1>
          <p style={leadStyle}>
            The music currents of An Tonn — ranked from airplay, streaming and
            video across the Gaelic and Celtic world. Two tiers: <b style={{ color: GOLD_SOFT }}>Gael</b>{' '}
            (sung in Gaeilge, Gàidhlig or Manx) and <b style={{ color: GOLD_SOFT }}>Celtic</b>{' '}
            (rooted in the tradition, whatever the language).
          </p>
        </div>

        {lists.length === 0 ? (
          <p style={{ color: MUTED, textAlign: 'center', marginTop: 40 }}>
            The charts are warming up — check back shortly.
          </p>
        ) : (
          <div style={gridStyle}>
            {lists.map((l) => <ChartCard key={`${l.tier}-${l.genre}`} list={l} />)}
          </div>
        )}

        <p style={methoStyle}>
          Scored by the An Tonn ledger ({data?.scoring_version || '—'}) ·
          {' '}window {data?.period?.days ?? '—'} days ·
          {' '}<a href="/AnTonn/methodology" style={{ color: MUTED }}>methodology</a>
        </p>
      </div>
    </div>
  )
}

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s }

// ── styles ──────────────────────────────────────────────────────────────
const scrollStyle = {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  zIndex: 10,
  // clear the top-corner chrome (brand icons / Let's Talk pill) and the
  // bottom pills; the inner column adds the horizontal breathing room.
  padding: '132px 16px 96px',
}
const innerStyle = { maxWidth: 900, margin: '0 auto' }
const introStyle = { textAlign: 'center', marginBottom: 28 }
const h1Style = {
  fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(44px, 9vw, 76px)',
  letterSpacing: 2, color: INK_ON_NAVY, margin: '0 0 10px', lineHeight: 1,
}
const leadStyle = {
  fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 'clamp(13px, 3.4vw, 15px)',
  lineHeight: 1.6, color: MUTED, maxWidth: 620, margin: '0 auto',
}
const gridStyle = {
  display: 'grid', gap: 18,
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
}
const cardStyle = {
  background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 14,
  padding: '18px 18px 8px', backdropFilter: 'blur(4px)',
}
const cardHeadStyle = { marginBottom: 10 }
const cardTitleStyle = {
  fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 1,
  color: INK_ON_NAVY, margin: 0, lineHeight: 1.1,
}
const cardSubStyle = {
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: 1,
  textTransform: 'uppercase', color: MUTED,
}
const olStyle = { listStyle: 'none', margin: 0, padding: 0 }
const rowStyle = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '9px 0', borderTop: `1px solid ${ROW_DIV}`,
}
const rankStyle = {
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: GOLD,
  width: 22, textAlign: 'right', flexShrink: 0,
}
const nameWrapStyle = { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }
const nameStyle = {
  fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 15,
  color: INK_ON_NAVY, fontWeight: 600, whiteSpace: 'nowrap',
  overflow: 'hidden', textOverflow: 'ellipsis',
}
const countryStyle = {
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: MUTED,
  textTransform: 'uppercase', letterSpacing: 0.5,
}
const scoreStyle = {
  display: 'flex', alignItems: 'center', flexShrink: 0,
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: GOLD_SOFT,
}
const methoStyle = {
  textAlign: 'center', marginTop: 26,
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: 0.5,
  color: MUTED,
}
