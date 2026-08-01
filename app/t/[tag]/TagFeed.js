'use client';

// app/t/[tag]/TagFeed.js
// Client renderer for a hashtag page. Fetches /api/tags/<tag>, renders the
// posts with the same PostCard the Duilleag feed uses, and pages with
// nextBefore. Ownership (delete control) is decided by handle match.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';
import PostCard from '../../duilleag/PostCard';

export default function TagFeed({ tag, viewerHandle }) {
  const { language } = useLanguage();
  const gd = language === 'gd';

  const [posts, setPosts] = useState([]);
  const [nextBefore, setNextBefore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (before) => {
    const url = `/api/tags/${encodeURIComponent(tag)}${before ? `?before=${encodeURIComponent(before)}` : ''}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.ok) {
      setPosts((prev) => (before ? [...prev, ...json.posts] : json.posts));
      setNextBefore(json.nextBefore);
    }
  }, [tag]);

  useEffect(() => {
    setLoading(true);
    load(null).finally(() => setLoading(false));
  }, [load]);

  async function more() {
    if (!nextBefore || loadingMore) return;
    setLoadingMore(true);
    try { await load(nextBefore); } finally { setLoadingMore(false); }
  }

  return (
    <main style={s.page}>
      <div style={s.column}>
        <header style={s.header}>
          <Link href="/duilleag" style={s.back}>← {gd ? 'Air ais dhan Duilleag' : 'Back to your Duilleag'}</Link>
          <h1 style={s.title}>#{tag}</h1>
        </header>

        {loading ? (
          <p style={s.quiet}>{gd ? 'A’ luchdadh…' : 'Loading…'}</p>
        ) : posts.length === 0 ? (
          <p style={s.quiet}>
            {gd ? 'Chan eil post sam bith leis an taga seo fhathast a chì thu.' : 'No posts with this tag that you can see yet.'}
          </p>
        ) : (
          <div style={s.feed}>
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                gd={gd}
                isOwner={p.author?.handle === viewerHandle}
                onDeleted={(id) => setPosts((f) => f.filter((x) => x.id !== id))}
              />
            ))}
            {nextBefore && (
              <button style={s.more} onClick={more} disabled={loadingMore}>
                {loadingMore ? (gd ? 'A’ luchdadh…' : 'Loading…') : (gd ? 'Barrachd' : 'More')}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const SANS = '"IBM Plex Sans", system-ui, sans-serif';
const s = {
  page: {
    minHeight: '100dvh',
    background: 'radial-gradient(ellipse 120% 90% at 50% 12%, #0b1220 0%, #05070d 55%, #000000 100%)',
    fontFamily: SANS, padding: '6vh 20px 12vh',
  },
  column: { maxWidth: 620, margin: '0 auto' },
  header: { marginBottom: 22 },
  back: {
    fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
  },
  title: {
    fontFamily: '"Fraunces", "EB Garamond", Georgia, serif', fontWeight: 700,
    fontSize: 'clamp(30px,5vw,44px)', color: '#C9A047', margin: '14px 0 0',
  },
  feed: { display: 'flex', flexDirection: 'column', gap: 12 },
  quiet: { fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  more: {
    alignSelf: 'center', marginTop: 6, background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, padding: '8px 22px',
    color: 'rgba(255,255,255,0.8)', fontFamily: SANS, fontSize: 13, cursor: 'pointer',
  },
};
