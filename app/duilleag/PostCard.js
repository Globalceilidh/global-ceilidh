'use client';

// app/duilleag/PostCard.js
// One post in the feed, now something you can answer rather than only
// read. A card carries four things the old inert <Post> didn't:
//
//   * a clickable author — the feed's only door back to a person's card
//   * reactions — one per person, tap your own to take it back
//   * comments — lazy-loaded when you open them, so a quiet feed is cheap
//   * an overflow menu — delete if it's yours, report if it isn't
//
// All the writes are optimistic-with-rollback: the UI moves at once and
// only steps back if the server refuses.

import { useState } from 'react';
import { REACTIONS, REACTION, NEUTRAL_BORDER } from './reactions';
import { AUDIENCES } from './Composer';

// Split a body into text and #hashtag links. Tags are letters/numbers/
// underscore (accented Gàidhlig letters included via \p{L}); the link goes
// to the visibility-safe tag page.
const TAG_RE = /(#[\p{L}\p{N}_]+)/gu;
function renderBody(text) {
  if (!text) return null;
  return String(text).split(TAG_RE).map((part, i) => {
    if (part[0] === '#' && part.length > 1) {
      const tag = part.slice(1).toLowerCase();
      return <a key={i} href={`/t/${encodeURIComponent(tag)}`} style={s.tag}>{part}</a>;
    }
    return part;
  });
}

// Cloudflare Stream player — a responsive 16:9 iframe keyed by the video
// UID. The customer subdomain is public (it's in every embed URL), so it
// rides in a NEXT_PUBLIC env var.
const STREAM_SUBDOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN;
function StreamVideo({ uid }) {
  if (!STREAM_SUBDOMAIN) return null;
  return (
    <div style={s.videoWrap}>
      <iframe
        src={`https://${STREAM_SUBDOMAIN}/${uid}/iframe`}
        style={s.videoFrame}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        title="Video"
      />
    </div>
  );
}

const REPORT_REASONS = [
  { value: 'spam',    label: { en: 'Spam',            gd: 'Spama' } },
  { value: 'abuse',   label: { en: 'Abuse or hate',   gd: 'Ana-cainnt' } },
  { value: 'other',   label: { en: 'Something else',  gd: 'Rud eile' } },
];

export default function PostCard({ post, gd, isOwner, onDeleted }) {
  const t = (o) => (gd ? o.gd : o.en);

  const [reactions, setReactions] = useState(post.reactions || { counts: {}, mine: null, total: 0 });
  const [palette, setPalette] = useState(false);
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const [sharing, setSharing] = useState(false);
  const [shareBody, setShareBody] = useState('');
  const [shareVis, setShareVis] = useState('connections');
  const [shareBusy, setShareBusy] = useState(false);
  const [shared, setShared] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null); // null = not loaded yet
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [commentText, setCommentText] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);

  const author = post.author || {};
  const authorName = author.displayName || (author.handle ? `@${author.handle}` : (gd ? 'Gàidheal' : 'Someone'));

  // ── reactions ─────────────────────────────────────────────────────
  async function pick(kind) {
    setPalette(false);
    const prev = reactions;
    // Optimistic: reflect the toggle before the round-trip.
    const optimistic = applyReaction(prev, kind);
    setReactions(optimistic);
    try {
      const res = await fetch(`/api/posts/${post.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind }),
      });
      const json = await res.json();
      if (json.ok && json.reactions) setReactions(json.reactions);
      else setReactions(prev);
    } catch {
      setReactions(prev);
    }
  }

  // ── comments ──────────────────────────────────────────────────────
  async function toggleComments() {
    const next = !showComments;
    setShowComments(next);
    if (next && comments === null) {
      try {
        const res = await fetch(`/api/posts/${post.id}/comments`);
        const json = await res.json();
        setComments(json.ok ? json.comments : []);
        if (json.ok) setCommentCount(json.comments.length);
      } catch {
        setComments([]);
      }
    }
  }

  async function addComment() {
    const body = commentText.trim();
    if (!body || commentBusy) return;
    setCommentBusy(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (json.ok) {
        setComments((c) => [...(c || []), json.comment]);
        setCommentCount((n) => n + 1);
        setCommentText('');
      }
    } finally {
      setCommentBusy(false);
    }
  }

  async function removeComment(id) {
    const prev = comments;
    setComments((c) => c.filter((x) => x.id !== id));
    setCommentCount((n) => Math.max(0, n - 1));
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.ok) { setComments(prev); setCommentCount((n) => n + 1); }
    } catch {
      setComments(prev); setCommentCount((n) => n + 1);
    }
  }

  // ── reshare ───────────────────────────────────────────────────────
  async function doShare() {
    if (shareBusy) return;
    setShareBusy(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reshareOf: post.id, body: shareBody.trim(), visibility: shareVis }),
      });
      const json = await res.json();
      if (json.ok) { setShared(true); setSharing(false); setShareBody(''); }
    } finally {
      setShareBusy(false);
    }
  }

  // ── delete / report ───────────────────────────────────────────────
  async function del() {
    setMenu(false);
    if (!window.confirm(gd ? 'Sguab às am post seo?' : 'Delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.ok) onDeleted?.(post.id);
    } catch { /* leave it in place */ }
  }

  async function report(reason) {
    setReporting(false);
    setMenu(false);
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'post', targetId: post.id, reason }),
      });
      setReported(true);
    } catch { /* swallow — a failed report shouldn't nag */ }
  }

  // The reaction with the most votes tints the whole post's border.
  let predominant = null;
  let topN = 0;
  for (const r of REACTIONS) {
    const n = reactions.counts[r.kind] || 0;
    if (n > topN) { topN = n; predominant = r; }
  }
  const borderColor = predominant ? predominant.color : NEUTRAL_BORDER;
  const summaryReactions = REACTIONS.filter((r) => reactions.counts[r.kind]).slice(0, 3);

  return (
    <article style={{ ...s.post, border: `3px solid ${borderColor}`, transition: 'border-color 350ms ease' }}>
      <header style={s.head}>
        {author.handle ? (
          <a href={`/u/${author.handle}`} style={s.author}>{authorName}</a>
        ) : (
          <span style={s.author}>{authorName}</span>
        )}
        <span style={s.meta}>{when(post.created_at, gd)}</span>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <button style={s.more} onClick={() => { setMenu((m) => !m); setReporting(false); }} aria-label={gd ? 'Barrachd' : 'More'}>⋯</button>
          {menu && (
            <div style={s.menu}>
              {isOwner ? (
                <button style={s.menuItem} onClick={del}>{gd ? 'Sguab às' : 'Delete'}</button>
              ) : reported ? (
                <span style={{ ...s.menuItem, color: 'rgba(255,255,255,0.45)' }}>{gd ? 'Air aithris' : 'Reported'}</span>
              ) : reporting ? (
                REPORT_REASONS.map((r) => (
                  <button key={r.value} style={s.menuItem} onClick={() => report(r.value)}>{t(r.label)}</button>
                ))
              ) : (
                <button style={s.menuItem} onClick={() => setReporting(true)}>{gd ? 'Dèan aithris' : 'Report'}</button>
              )}
            </div>
          )}
        </div>
      </header>

      {post.body && <p style={s.body}>{renderBody(post.body)}</p>}

      {Array.isArray(post.media) && post.media.length > 0 && (
        <div style={s.media}>
          {post.media.map((m, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={m.url} alt="" style={s.mediaImg} loading="lazy" />
          ))}
        </div>
      )}

      {post.video?.uid && <StreamVideo uid={post.video.uid} />}

      {post.reshareOf && (
        post.reshareOf.removed ? (
          <div style={s.quoteRemoved}>{gd ? 'Chaidh am post seo a thoirt air falbh.' : 'This post is no longer available.'}</div>
        ) : (
          <a href={post.reshareOf.author?.handle ? `/u/${post.reshareOf.author.handle}` : undefined} style={s.quote}>
            <span style={s.quoteAuthor}>{post.reshareOf.author?.displayName}</span>
            {post.reshareOf.body && <span style={s.quoteBody}>{renderBody(post.reshareOf.body)}</span>}
            {Array.isArray(post.reshareOf.media) && post.reshareOf.media.length > 0 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.reshareOf.media[0].url} alt="" style={s.quoteImg} loading="lazy" />
            )}
            {post.reshareOf.video?.uid && <StreamVideo uid={post.reshareOf.video.uid} />}
          </a>
        )
      )}

      <div style={s.bar}>
        <div style={{ position: 'relative' }}>
          <button
            style={{ ...s.act, ...(reactions.mine && REACTION[reactions.mine] ? { ...s.actOn, borderColor: `${REACTION[reactions.mine].color}88` } : null) }}
            onClick={() => setPalette((p) => !p)}
          >
            {reactions.mine && REACTION[reactions.mine]
              ? <img src={REACTION[reactions.mine].icon} alt="" style={s.reactIcon} />
              : <span aria-hidden="true">☺</span>}
            <span style={s.actLabel}>
              {reactions.mine && REACTION[reactions.mine] ? t(REACTION[reactions.mine].label) : (gd ? 'Freagair' : 'React')}
            </span>
          </button>
          {palette && (
            <div style={s.palette}>
              {REACTIONS.map((r) => (
                <button
                  key={r.kind}
                  style={{ ...s.pGlyph, ...(reactions.mine === r.kind ? { ...s.pGlyphOn, boxShadow: `inset 0 0 0 2px ${r.color}` } : null) }}
                  title={t(r.label)}
                  onClick={() => pick(r.kind)}
                >
                  <img src={r.icon} alt={t(r.label)} style={s.reactIcon} />
                </button>
              ))}
            </div>
          )}
        </div>

        {reactions.total > 0 && (
          <span style={s.count}>
            {summaryReactions.map((r) => (
              <img key={r.kind} src={r.icon} alt="" style={s.reactIconSm} />
            ))}
            {reactions.total}
          </span>
        )}

        <div style={{ flex: 1 }} />

        <button style={s.act} onClick={toggleComments}>
          <span style={s.actLabel}>
            {commentCount > 0
              ? `${commentCount} ${gd ? 'freagairt' : commentCount === 1 ? 'comment' : 'comments'}`
              : (gd ? 'Freagairtean' : 'Comment')}
          </span>
        </button>

        {post.visibility === 'global' && !post.reshareOf && (
          shared ? (
            <span style={{ ...s.act, ...s.actOn }}>{gd ? 'Air a roinn' : 'Shared'}</span>
          ) : (
            <button style={s.act} onClick={() => setSharing((v) => !v)}>
              <span style={s.actLabel}>{gd ? 'Roinn' : 'Share'}</span>
            </button>
          )
        )}
      </div>

      {sharing && (
        <div style={s.sharePanel}>
          <textarea
            value={shareBody}
            onChange={(e) => setShareBody(e.target.value)}
            placeholder={gd ? 'Cuir facal ris (roghainneil)…' : 'Add a word (optional)…'}
            style={s.shareInput}
            data-no-drag
          />
          <div style={s.shareBar}>
            <select value={shareVis} onChange={(e) => setShareVis(e.target.value)} style={s.shareSelect} data-no-drag>
              {AUDIENCES.filter((a) => a.value !== 'custom').map((a) => (
                <option key={a.value} value={a.value}>{gd ? a.label.gd : a.label.en}</option>
              ))}
            </select>
            <div style={{ flex: 1 }} />
            <button style={s.cancel} onClick={() => setSharing(false)}>{gd ? 'Sguir dheth' : 'Cancel'}</button>
            <button style={{ ...s.cSend, opacity: shareBusy ? 0.45 : 1 }} onClick={doShare} disabled={shareBusy}>
              {gd ? 'Roinn' : 'Share'}
            </button>
          </div>
        </div>
      )}

      {showComments && (
        <div style={s.comments}>
          {comments === null ? (
            <p style={s.cQuiet}>{gd ? 'A’ luchdadh…' : 'Loading…'}</p>
          ) : comments.length === 0 ? (
            <p style={s.cQuiet}>{gd ? 'Chan eil freagairt ann fhathast.' : 'No comments yet.'}</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} style={s.comment}>
                <div style={s.cHead}>
                  {c.author?.handle ? (
                    <a href={`/u/${c.author.handle}`} style={s.cAuthor}>{c.author.displayName}</a>
                  ) : (
                    <span style={s.cAuthor}>{c.author?.displayName}</span>
                  )}
                  <span style={s.cMeta}>{when(c.created_at, gd)}</span>
                  {(c.isMine || isOwner) && (
                    <button style={s.cDel} onClick={() => removeComment(c.id)} aria-label={gd ? 'Sguab às' : 'Delete'}>×</button>
                  )}
                </div>
                <p style={s.cBody}>{c.body}</p>
              </div>
            ))
          )}

          <div style={s.cComposer}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(); } }}
              placeholder={gd ? 'Sgrìobh freagairt…' : 'Write a reply…'}
              style={s.cInput}
              data-no-drag
            />
            <button
              style={{ ...s.cSend, opacity: commentText.trim() && !commentBusy ? 1 : 0.45 }}
              onClick={addComment}
              disabled={!commentText.trim() || commentBusy}
            >
              {gd ? 'Cuir' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function labelFor(kind) {
  const r = REACTIONS.find((x) => x.kind === kind);
  return r ? r.label : { en: 'React', gd: 'Freagair' };
}

// Optimistic reaction maths mirroring the server's toggle rule.
function applyReaction(summary, kind) {
  const counts = { ...summary.counts };
  const wasMine = summary.mine;
  let total = summary.total;
  if (wasMine) { counts[wasMine] = Math.max(0, (counts[wasMine] || 1) - 1); total -= 1; }
  if (wasMine === kind) return { counts: prune(counts), mine: null, total };
  counts[kind] = (counts[kind] || 0) + 1;
  return { counts: prune(counts), mine: kind, total: total + 1 };
}
function prune(counts) {
  const out = {};
  for (const k of Object.keys(counts)) if (counts[k] > 0) out[k] = counts[k];
  return out;
}

function when(iso, gd) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const mins = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (mins < 1) return gd ? 'an-dràsta' : 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 14) return `${days}d`;
  return new Date(iso).toLocaleDateString(gd ? 'gd-GB' : 'en-GB', { day: 'numeric', month: 'short' });
}

const GOLD = '#C9A047';
const SANS = '"IBM Plex Sans", system-ui, sans-serif';
const glass = {
  background: 'rgba(12,20,16,0.30)',
  backdropFilter: 'blur(22px) saturate(135%)',
  WebkitBackdropFilter: 'blur(22px) saturate(135%)',
  border: '1px solid rgba(255,255,255,0.13)',
  borderRadius: 14,
  boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
};

const s = {
  post: { ...glass, padding: '14px 16px' },
  head: { display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 6 },
  author: {
    fontFamily: '"Fraunces", "EB Garamond", Georgia, serif', fontStyle: 'italic',
    fontWeight: 700, fontSize: 15, color: '#FFFFFF', textDecoration: 'none',
  },
  meta: { fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.42)' },
  more: {
    background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1,
    color: 'rgba(255,255,255,0.5)', fontSize: 18, padding: '0 2px',
  },
  menu: {
    position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 40,
    minWidth: 150, padding: 4, borderRadius: 10,
    background: 'rgba(10,16,13,0.96)', border: '1px solid rgba(255,255,255,0.14)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 12px 36px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column',
  },
  menuItem: {
    textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.85)', padding: '8px 10px', borderRadius: 7,
  },
  body: {
    margin: '0 0 10px', fontFamily: SANS, fontSize: 14, lineHeight: 1.6,
    color: 'rgba(255,255,255,0.88)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  },
  media: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 },
  mediaImg: {
    width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.10)', display: 'block',
  },
  tag: { color: GOLD, textDecoration: 'none', fontWeight: 600 },
  videoWrap: {
    position: 'relative', width: '100%', paddingTop: '56.25%', marginBottom: 10,
    borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.10)',
    background: '#000',
  },
  videoFrame: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },

  // The embedded original inside a reshare.
  quote: {
    display: 'block', textDecoration: 'none', marginBottom: 10, padding: '10px 12px',
    borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.18)',
  },
  quoteAuthor: {
    display: 'block', fontFamily: '"Fraunces", "EB Garamond", Georgia, serif',
    fontStyle: 'italic', fontWeight: 700, fontSize: 13.5, color: '#FFFFFF', marginBottom: 3,
  },
  quoteBody: {
    display: 'block', fontFamily: SANS, fontSize: 13, lineHeight: 1.5,
    color: 'rgba(255,255,255,0.82)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  },
  quoteImg: { width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8, marginTop: 8, display: 'block' },
  quoteRemoved: {
    marginBottom: 10, padding: '10px 12px', borderRadius: 10,
    border: '1px dashed rgba(255,255,255,0.16)', fontFamily: SANS, fontSize: 12.5,
    color: 'rgba(255,255,255,0.45)',
  },

  sharePanel: { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 },
  shareInput: {
    width: '100%', minHeight: 52, resize: 'vertical', boxSizing: 'border-box',
    background: 'rgba(0,0,0,0.24)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 9, padding: 10, color: '#FFFFFF', fontFamily: SANS, fontSize: 13,
  },
  shareBar: { display: 'flex', alignItems: 'center', gap: 8 },
  shareSelect: {
    background: 'rgba(0,0,0,0.3)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 999, padding: '5px 10px', fontFamily: SANS, fontSize: 12,
  },
  cancel: { background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.55)' },

  bar: {
    display: 'flex', alignItems: 'center', gap: 10,
    paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  act: {
    display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 999, padding: '4px 11px', color: 'rgba(255,255,255,0.72)',
    fontFamily: SANS, fontSize: 12,
  },
  actOn: { background: 'rgba(201,160,71,0.16)', borderColor: `${GOLD}66`, color: '#FFFFFF' },
  actLabel: { fontFamily: SANS, fontSize: 12 },
  count: {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.6)',
  },
  reactIcon: { width: 40, height: 40, minWidth: 40, minHeight: 40, flexShrink: 0, display: 'block', objectFit: 'contain' },
  reactIconSm: { width: 28, height: 28, minWidth: 28, minHeight: 28, flexShrink: 0, display: 'block', objectFit: 'contain' },

  palette: {
    position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, zIndex: 40,
    display: 'flex', gap: 3, padding: 6, borderRadius: 999,
    background: 'rgba(10,16,13,0.96)', border: '1px solid rgba(255,255,255,0.14)',
    boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
  },
  pGlyph: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '5px 6px', borderRadius: 999, lineHeight: 1,
  },
  pGlyphOn: { background: 'rgba(255,255,255,0.10)' },

  comments: { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 },
  cQuiet: { margin: 0, fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.45)' },
  comment: { paddingBottom: 6 },
  cHead: { display: 'flex', alignItems: 'baseline', gap: 8 },
  cAuthor: { fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.88)', textDecoration: 'none' },
  cMeta: { fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.38)' },
  cDel: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1, padding: '0 2px' },
  cBody: { margin: '2px 0 0', fontFamily: SANS, fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.82)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  cComposer: { display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 },
  cInput: {
    flex: 1, boxSizing: 'border-box', background: 'rgba(0,0,0,0.24)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999,
    padding: '7px 12px', color: '#FFFFFF', fontFamily: SANS, fontSize: 13,
  },
  cSend: {
    flexShrink: 0, background: GOLD, border: 'none', borderRadius: 999,
    padding: '6px 14px', color: '#1A1206', cursor: 'pointer',
    fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
    fontSize: 14, letterSpacing: '0.06em',
  },
};
