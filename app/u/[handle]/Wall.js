'use client';

// app/u/[handle]/Wall.js
// The Duilleag-cèilidh wall (gc_posts). Owner gets a composer at the top;
// everyone sees the visible public posts newest-first. Create + delete talk
// to /api/posts (auth() decides authorship server-side — the client only
// carries the same-origin Clerk session cookie).
//
// NOTE: Gàidhlig strings here are first-pass and need the Lewis/Joe stamp
// before public launch (see project_gc_social_nomenclature).

import { useState } from 'react';

const BODY_MAX = 5000;

export default function Wall({ initialPosts, isOwner, ownerName }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const trimmed = text.trim();
  const canPost = trimmed.length > 0 && trimmed.length <= BODY_MAX && !submitting;

  async function submit() {
    if (!canPost) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.reason || 'Could not post — try again.');
      } else {
        setPosts((prev) => [data.post, ...prev]);
        setText('');
      }
    } catch {
      setError('Could not post — check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Sguab às am post seo? · Delete this post?')) return;
    // Optimistic — drop it immediately, restore on failure.
    const prev = posts;
    setPosts((p) => p.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) setPosts(prev);
    } catch {
      setPosts(prev);
    }
  }

  function onKeyDown(e) {
    // Cmd/Ctrl+Enter posts.
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div style={wrap}>
      {isOwner && (
        <div style={composer}>
          <textarea
            style={textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Dè tha a’ dol? · What’s on your mind?"
            maxLength={BODY_MAX}
            rows={3}
          />
          <div style={composerFoot}>
            <span style={counter}>
              {trimmed.length > BODY_MAX - 300 ? `${BODY_MAX - trimmed.length}` : ''}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {error && <span style={errStyle}>{error}</span>}
              <button style={canPost ? postBtn : postBtnOff} onClick={submit} disabled={!canPost}>
                {submitting ? 'A’ postadh…' : 'Postaich · Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div style={empty}>
          {isOwner
            ? 'Sgrìobh a’ chiad phost agad · Write your first post.'
            : `Chan eil postaichean aig ${ownerName} fhathast · No posts yet.`}
        </div>
      ) : (
        <ul style={list}>
          {posts.map((p) => (
            <li key={p.id} style={postCard}>
              <p style={postBody}>{p.body}</p>
              <div style={postFoot}>
                <time style={postTime} dateTime={p.created_at}>{relTime(p.created_at)}</time>
                {isOwner && (
                  <button style={delBtn} onClick={() => remove(p.id)}>Sguab às · Delete</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Compact relative time: 30s → "an-dràsta", then m / h / d, then a date.
function relTime(iso) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 45) return 'an-dràsta · now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── styles (matches the /u/[handle] card palette) ─────────────────────
const SANS = '"IBM Plex Sans", system-ui, sans-serif';

const wrap = { width: '100%', marginTop: 26, borderTop: '1px solid #F0E8D8', paddingTop: 22 };
const composer = {
  width: '100%', background: '#FFFDF9', border: '1px solid #E7DEC9',
  borderRadius: 10, padding: 14, marginBottom: 20,
};
const textarea = {
  width: '100%', border: 'none', outline: 'none', resize: 'vertical',
  background: 'transparent', fontFamily: SANS, fontSize: 15, lineHeight: 1.5,
  color: '#3A3A3A', boxSizing: 'border-box', minHeight: 66,
};
const composerFoot = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginTop: 8, gap: 10,
};
const counter = { fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: '#B0A283' };
const errStyle = { fontFamily: SANS, fontSize: 12.5, color: '#9A2A2A' };
const postBtn = {
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontSize: 17, letterSpacing: '0.06em', textTransform: 'uppercase',
  color: '#F2ECDC', background: '#1A3A2A', border: 'none', borderRadius: 999,
  padding: '8px 20px', cursor: 'pointer',
};
const postBtnOff = { ...postBtn, background: '#C6BCA5', color: '#F5F0E8', cursor: 'default' };
const empty = {
  width: '100%', padding: '24px 20px', textAlign: 'center',
  fontFamily: SANS, fontSize: 14, color: '#9A8B6E',
};
const list = { listStyle: 'none', margin: 0, padding: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 14 };
const postCard = {
  background: '#FFFFFF', border: '1px solid #EFE7D5', borderRadius: 10, padding: '16px 18px',
};
const postBody = {
  fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: '#2C2C2C',
  margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
};
const postFoot = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginTop: 12, gap: 10,
};
const postTime = { fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: '#A0906F' };
const delBtn = {
  fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#9A6B6B',
  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
};
