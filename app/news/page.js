// /news — public feed of editor-approved items from the Sruth ingestion
// pipeline. ISR: revalidates every 5 minutes so newly-approved items
// surface without a manual rebuild.
//
// Layout: optional featured card at top (single slot), then a chronological
// card grid filtered by tabs. Category tabs are server-side via the
// `?category=` query — keeps the page indexable and shareable per-tab.

import Link from 'next/link';
import { fetchPublishedItems } from './data';

export const revalidate = 300;

export const metadata = {
  title: 'News — Global Ceilidh',
  description:
    'Daily Scottish and Gàidhlig news, events, music, language, and community — curated from the Sruth ingestion pipeline.',
  openGraph: {
    title: 'News — Global Ceilidh',
    description: 'Scottish news, events, music, language, and diaspora — daily.',
  },
};

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'news',      label: 'News' },
  { key: 'events',    label: 'Events' },
  { key: 'community', label: 'Community' },
  { key: 'language',  label: 'Language' },
  { key: 'music',     label: 'Music' },
  { key: 'history',   label: 'History' },
  { key: 'sport',     label: 'Sport' },
  { key: 'food',      label: 'Food' },
  { key: 'arts',      label: 'Arts' },
];

const PALETTE = {
  paper: '#FCFCFC',
  buffer: '#F2ECDC',
  ink: '#1A1A1A',
  accent: '#6B4E1F',
  muted: '#999',
  divider: '#E8DCC8',
  serif: "'Fraunces', Georgia, serif",
  mono: "'IBM Plex Mono', Menlo, Consolas, monospace",
};

function fmtDate(s) {
  if (!s) return '';
  try {
    return new Date(s).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return ''; }
}

function Card({ item, featured = false }) {
  const href = item.slug ? `/news/${item.slug}` : '#';
  const title = item.title_en || item.title_gd || 'Untitled';
  const body = item.body_en || item.body_gd || '';

  return (
    <Link
      href={href}
      style={{
        display: 'block',
        background: PALETTE.paper,
        border: `1px solid ${PALETTE.divider}`,
        borderRadius: 6,
        overflow: 'hidden',
        textDecoration: 'none',
        color: PALETTE.ink,
        boxShadow: featured ? '0 4px 14px rgba(107,78,31,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {item.image_url && (
        <div style={{
          width: '100%',
          aspectRatio: featured ? '21/9' : '16/9',
          background: `${PALETTE.divider} center/cover no-repeat url(${JSON.stringify(item.image_url)})`,
        }} />
      )}
      <div style={{ padding: featured ? '24px 28px' : '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{
            fontFamily: PALETTE.mono, fontSize: 10, letterSpacing: 2,
            color: PALETTE.accent, textTransform: 'uppercase', fontWeight: 500,
          }}>{item.category || 'other'}</span>
          {featured && (
            <span style={{
              fontFamily: PALETTE.mono, fontSize: 9, letterSpacing: 2,
              color: PALETTE.accent, background: '#F8F0DC',
              padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', fontWeight: 600,
            }}>★ Featured</span>
          )}
        </div>
        <h3 style={{
          fontFamily: PALETTE.serif, fontWeight: 700,
          fontSize: featured ? 28 : 18, lineHeight: 1.25,
          margin: '0 0 10px 0', color: PALETTE.ink,
        }}>{title}</h3>
        {body && (
          <p style={{
            fontFamily: PALETTE.serif, fontSize: featured ? 16 : 14, lineHeight: 1.55,
            margin: '0 0 12px 0', color: PALETTE.ink,
          }}>{body.length > (featured ? 280 : 180) ? body.slice(0, featured ? 280 : 180) + '…' : body}</p>
        )}
        <div style={{
          fontFamily: PALETTE.mono, fontSize: 10, color: PALETTE.muted,
          letterSpacing: 1, textTransform: 'uppercase',
        }}>
          {item.source_name ? `${item.source_name} · ` : ''}{fmtDate(item.published_at)}
        </div>
      </div>
    </Link>
  );
}

export default async function NewsPage({ searchParams }) {
  const sp = await searchParams;
  const active = (sp?.category && TABS.find(t => t.key === sp.category)) ? sp.category : 'all';
  const items = await fetchPublishedItems({ category: active === 'all' ? null : active });

  // Featured slot only on the 'all' view — keeps the curated story at the
  // top of the main feed; category-specific views are pure chronological.
  const featured = active === 'all' ? items.find(i => i.featured) : null;
  const rest = featured ? items.filter(i => i.id !== featured.id) : items;

  return (
    <div style={{
      background: PALETTE.buffer,
      minHeight: '100vh',
      paddingBottom: 80,
      fontFamily: PALETTE.serif,
    }}>
      <header style={{
        background: PALETTE.paper,
        borderBottom: `1px solid ${PALETTE.divider}`,
        padding: '40px 24px 24px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: PALETTE.mono, fontSize: 11, letterSpacing: 3,
          color: PALETTE.accent, textTransform: 'uppercase', margin: '0 0 12px',
        }}>Global Ceilidh</p>
        <h1 style={{
          fontFamily: PALETTE.serif, fontWeight: 700, fontStyle: 'italic',
          fontSize: 56, margin: 0, color: PALETTE.ink, letterSpacing: -1,
        }}>News</h1>
        <p style={{
          fontFamily: PALETTE.serif, fontStyle: 'italic',
          fontSize: 15, color: PALETTE.ink, margin: '8px 0 0',
        }}>Scottish & Gàidhlig — daily.</p>
      </header>

      <nav style={{
        background: PALETTE.paper,
        borderBottom: `1px solid ${PALETTE.divider}`,
        position: 'sticky', top: 0, zIndex: 10,
        overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', gap: 4, padding: '12px 16px', whiteSpace: 'nowrap',
        }}>
          {TABS.map(t => {
            const isActive = t.key === active;
            const href = t.key === 'all' ? '/news' : `/news?category=${t.key}`;
            return (
              <Link key={t.key} href={href} style={{
                fontFamily: PALETTE.mono, fontSize: 11, letterSpacing: 2,
                textTransform: 'uppercase', fontWeight: isActive ? 700 : 500,
                color: isActive ? PALETTE.ink : PALETTE.accent,
                background: isActive ? PALETTE.buffer : 'transparent',
                padding: '8px 14px', borderRadius: 4, textDecoration: 'none',
              }}>{t.label}</Link>
            );
          })}
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        {items.length === 0 && (
          <div style={{
            background: PALETTE.paper, border: `1px solid ${PALETTE.divider}`,
            borderRadius: 6, padding: 48, textAlign: 'center',
            color: PALETTE.muted, fontFamily: PALETTE.serif, fontStyle: 'italic',
          }}>
            <p style={{ fontSize: 16, margin: 0 }}>
              Nothing in this category yet.
            </p>
            <p style={{ fontSize: 13, margin: '12px 0 0' }}>
              Items are added daily as the editors approve them. Check back tomorrow.
            </p>
          </div>
        )}

        {featured && (
          <div style={{ marginBottom: 32 }}>
            <Card item={featured} featured />
          </div>
        )}

        {rest.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}>
            {rest.map(item => <Card key={item.id} item={item} />)}
          </div>
        )}
      </main>

      <footer style={{
        textAlign: 'center', padding: '32px 16px', color: PALETTE.muted,
        fontFamily: PALETTE.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
      }}>
        <p style={{ margin: 0 }}>
          <Link href="/news/feed.xml" style={{ color: PALETTE.accent, textDecoration: 'none' }}>RSS</Link>
          {' · '}
          <Link href="/sruth/archive" style={{ color: PALETTE.accent, textDecoration: 'none' }}>Sruth Archive</Link>
          {' · '}
          <a href="mailto:sruth_editors@globalceilidh.com?subject=News%20page%20feedback" style={{ color: PALETTE.accent, textDecoration: 'none' }}>
            Feedback
          </a>
        </p>
      </footer>
    </div>
  );
}
