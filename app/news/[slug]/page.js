// /news/[slug] — per-item permalink page. Share-friendly URLs let users
// link to a specific story; Google indexes them; readers can bookmark.
//
// ISR: 5 minutes. Same caching policy as the list page.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchItemBySlug, fetchAllSlugs } from '../data';

export const revalidate = 300;

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

export async function generateStaticParams() {
  const rows = await fetchAllSlugs();
  return rows.map(r => ({ slug: r.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await fetchItemBySlug(slug);
  if (!item) return { title: 'Not found — Global Ceilidh' };
  const title = item.title_en || item.title_gd || 'News';
  const desc = (item.body_en || item.body_gd || '').slice(0, 180);
  return {
    title: `${title} — Global Ceilidh`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: item.image_url ? [{ url: item.image_url }] : undefined,
    },
  };
}

function fmtDate(s) {
  if (!s) return '';
  try {
    return new Date(s).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return ''; }
}

export default async function NewsItemPage({ params }) {
  const { slug } = await params;
  const item = await fetchItemBySlug(slug);
  if (!item) notFound();

  const title = item.title_en || item.title_gd || 'Untitled';
  const titleAlt = item.title_en && item.title_gd && item.title_en !== item.title_gd ? item.title_gd : null;
  const body = item.body_en || '';
  const bodyAlt = item.body_en && item.body_gd && item.body_en !== item.body_gd ? item.body_gd : null;

  const feedbackHref = `mailto:sruth_editors@globalceilidh.com?subject=${encodeURIComponent(`Feedback on: ${title}`)}&body=${encodeURIComponent(`I just read this on globalceilidh.com/news/${item.slug}.\n\n`)}`;

  return (
    <div style={{
      background: PALETTE.buffer, minHeight: '100vh', paddingBottom: 80,
      fontFamily: PALETTE.serif,
    }}>
      <nav style={{
        background: PALETTE.paper, borderBottom: `1px solid ${PALETTE.divider}`,
        padding: '14px 16px', textAlign: 'center',
      }}>
        <Link href="/news" style={{
          fontFamily: PALETTE.mono, fontSize: 11, letterSpacing: 2,
          color: PALETTE.accent, textTransform: 'uppercase', textDecoration: 'none',
        }}>← All News</Link>
      </nav>

      <article style={{
        maxWidth: 720, margin: '0 auto', padding: '40px 16px',
        background: PALETTE.paper, marginTop: 24, borderRadius: 6,
        border: `1px solid ${PALETTE.divider}`,
      }}>
        <div style={{ padding: '40px 36px 44px' }}>
          <p style={{
            fontFamily: PALETTE.mono, fontSize: 11, letterSpacing: 2.5,
            color: PALETTE.accent, textTransform: 'uppercase', margin: '0 0 16px',
          }}>
            <Link href={`/news?category=${item.category}`} style={{ color: PALETTE.accent, textDecoration: 'none' }}>
              {item.category || 'other'}
            </Link>
          </p>

          <h1 style={{
            fontFamily: PALETTE.serif, fontWeight: 700,
            fontSize: 36, lineHeight: 1.15, margin: '0 0 14px', color: PALETTE.ink,
          }}>{title}</h1>

          {titleAlt && (
            <p style={{
              fontFamily: PALETTE.serif, fontStyle: 'italic', fontSize: 20,
              color: PALETTE.accent, margin: '0 0 24px', lineHeight: 1.3,
            }}>{titleAlt}</p>
          )}

          <p style={{
            fontFamily: PALETTE.mono, fontSize: 11, color: PALETTE.muted,
            letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 32px',
          }}>
            {item.source_name ? `${item.source_name} · ` : ''}
            {fmtDate(item.published_at)}
          </p>

          {item.image_url && (
            <div style={{
              marginBottom: 28,
              borderRadius: 4, overflow: 'hidden',
              background: PALETTE.divider,
            }}>
              <img
                src={item.image_url}
                alt=""
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </div>
          )}

          {body && (
            <div style={{
              fontFamily: PALETTE.serif, fontSize: 17, lineHeight: 1.7,
              color: PALETTE.ink, margin: '0 0 24px',
            }}>{body}</div>
          )}

          {bodyAlt && (
            <div style={{
              fontFamily: PALETTE.serif, fontStyle: 'italic', fontSize: 15,
              lineHeight: 1.7, color: PALETTE.accent,
              padding: '20px 0', borderTop: `1px solid ${PALETTE.divider}`,
              margin: '24px 0',
            }}>{bodyAlt}</div>
          )}

          {item.source_url && (
            <div style={{
              padding: '20px 0', borderTop: `1px solid ${PALETTE.divider}`,
              marginTop: 32,
            }}>
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', padding: '12px 24px',
                  background: PALETTE.accent, color: '#F0E6CC',
                  fontFamily: PALETTE.mono, fontSize: 11, letterSpacing: 2,
                  textTransform: 'uppercase', textDecoration: 'none', borderRadius: 4,
                  fontWeight: 500,
                }}
              >Read at the source ↗</a>
            </div>
          )}

          <div style={{
            padding: '24px 0 0', borderTop: `1px solid ${PALETTE.divider}`,
            marginTop: 32, textAlign: 'center',
          }}>
            <a href={feedbackHref} style={{
              fontFamily: PALETTE.mono, fontSize: 10, letterSpacing: 2,
              color: PALETTE.accent, textTransform: 'uppercase', textDecoration: 'none',
            }}>Send feedback on this story →</a>
          </div>
        </div>
      </article>
    </div>
  );
}
