'use client';

// Contributor upload form. Validates the token against the backend on
// mount, then lets the contributor submit one video (file or YouTube
// link) or music file at a time. Everything lands 'pending' in the
// sruth-admin review queue — nothing here goes live directly.

import { useEffect, useState } from 'react';

const SRUTH_API =
  process.env.NEXT_PUBLIC_SRUTH_API ||
  'https://insightful-purpose-production-faf9.up.railway.app';

const VIDEO_CATEGORIES = [
  ['music', 'Music'],
  ['educational', 'Educational'],
  ['comedy', 'Comedy'],
  ['drama', 'Drama'],
  ['documentary', 'Documentary'],
  ['live', 'Live'],
];

export default function ContributeClient({ token }) {
  const [state, setState] = useState('loading'); // loading | invalid | ready | done
  const [contributor, setContributor] = useState(null);
  const [kind, setKind] = useState('video');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${SRUTH_API}/contribute/${token}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('invalid');
        const data = await res.json();
        if (cancelled) return;
        setContributor(data);
        setKind(data.kind === 'music' ? 'music' : 'video');
        setState('ready');
      } catch {
        if (!cancelled) setState('invalid');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (state === 'loading') {
    return <Shell><p style={muted}>Checking your link…</p></Shell>;
  }

  if (state === 'invalid') {
    return (
      <Shell>
        <h1 style={h1}>Link not valid</h1>
        <p style={{ ...muted, maxWidth: 420, textAlign: 'center' }}>
          This upload link isn’t active. It may have been turned off, or the
          address was mistyped. Get in touch and we’ll send you a fresh one.
        </p>
      </Shell>
    );
  }

  if (state === 'done') {
    return (
      <Shell>
        <h1 style={h1}>Tapadh leibh!</h1>
        <p style={{ ...muted, maxWidth: 440, textAlign: 'center', marginBottom: 22 }}>
          Your submission is in the queue. We’ll review it and add it to Global
          Ceilidh shortly. You can send another whenever you like.
        </p>
        <button type="button" style={primaryBtn} onClick={() => setState('ready')}>
          Submit another
        </button>
      </Shell>
    );
  }

  const canChoose = contributor?.kind === 'both';

  return (
    <Shell>
      <p style={eyebrow}>Global Ceilidh · Submissions</p>
      <h1 style={h1}>Fàilte, {contributor?.name?.split(' ')[0] || 'a charaid'}</h1>
      <p style={{ ...muted, maxWidth: 460, textAlign: 'center', marginBottom: 26 }}>
        Share a {contributor?.kind === 'music' ? 'track' : contributor?.kind === 'video' ? 'video' : 'video or track'} with
        the community. Everything is reviewed before it goes live.
      </p>

      {canChoose && (
        <div style={toggleRow}>
          <ToggleBtn active={kind === 'video'} onClick={() => setKind('video')}>Video</ToggleBtn>
          <ToggleBtn active={kind === 'music'} onClick={() => setKind('music')}>Music</ToggleBtn>
        </div>
      )}

      <UploadForm token={token} kind={kind} onDone={() => setState('done')} />
    </Shell>
  );
}

function UploadForm({ token, kind, onDone }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('music');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const isVideo = kind === 'video';

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError('Please give it a title.'); return; }
    if (!file && !(isVideo && youtubeUrl.trim())) {
      setError(isVideo ? 'Add a video file or paste a YouTube link.' : 'Choose a music file to upload.');
      return;
    }

    const fd = new FormData();
    fd.append('kind', kind);
    fd.append('title', title.trim());
    if (artist.trim()) fd.append('artist', artist.trim());
    if (description.trim()) fd.append('description', description.trim());
    if (isVideo) {
      fd.append('target_category', category);
      if (youtubeUrl.trim()) fd.append('youtube_url', youtubeUrl.trim());
    }
    if (file) fd.append('file', file);

    setBusy(true);
    try {
      const res = await fetch(`${SRUTH_API}/contribute/${token}/upload`, {
        method: 'POST',
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.detail || `Upload failed (${res.status})`);
      onDone();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={form}>
      <Field label="Title">
        <input style={input} value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder={isVideo ? 'e.g. Òran na Cloiche — live at the cèilidh' : 'e.g. Puirt-à-beul set'} />
      </Field>

      <Field label={isVideo ? 'Performer / band (optional)' : 'Artist (optional)'}>
        <input style={input} value={artist} onChange={(e) => setArtist(e.target.value)}
          placeholder="Defaults to your name" />
      </Field>

      {isVideo && (
        <Field label="Category">
          <select style={input} value={category} onChange={(e) => setCategory(e.target.value)}>
            {VIDEO_CATEGORIES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </Field>
      )}

      <Field label="A wee note (optional)">
        <textarea style={{ ...input, minHeight: 72, resize: 'vertical' }} value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Anything we should know — context, credits, links." />
      </Field>

      {isVideo && (
        <Field label="YouTube link (optional)">
          <input style={input} value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=…" />
        </Field>
      )}

      <Field label={isVideo ? 'Or upload a video file' : 'Music file'}>
        <input style={fileInput} type="file"
          accept={isVideo ? 'video/*' : 'audio/*'}
          onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <span style={hint}>Up to 100&nbsp;MB.{isVideo ? ' For larger videos, use a YouTube link.' : ''}</span>
      </Field>

      {error && <p style={errText}>{error}</p>}

      <button type="submit" style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }} disabled={busy}>
        {busy ? 'Sending…' : 'Submit for review'}
      </button>
    </form>
  );
}

// ── little presentational helpers ─────────────────────────────────────

function Shell({ children }) {
  return (
    <main style={wrap}>
      <div style={card}>{children}</div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function ToggleBtn({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      style={{ ...toggleBtn, ...(active ? toggleActive : {}) }}>
      {children}
    </button>
  );
}

// ── styles ────────────────────────────────────────────────────────────

const wrap = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '48px 20px',
  background: '#F5F0E8',
  fontFamily: 'Georgia, serif',
};
const card = {
  width: '100%',
  maxWidth: 520,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: '#FFFFFF',
  borderRadius: 8,
  padding: '36px 28px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
};
const eyebrow = {
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 11,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#6B4E1F',
  margin: '0 0 10px',
};
const h1 = {
  fontFamily: '"Fraunces", "EB Garamond", Georgia, serif',
  fontStyle: 'italic',
  fontWeight: 700,
  fontSize: 30,
  color: '#1A3A2A',
  margin: '0 0 6px',
  textAlign: 'center',
};
const muted = { color: '#4A4A4A', fontSize: 15, lineHeight: 1.5, margin: 0 };
const form = { width: '100%', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: 6 };
const fieldLabel = {
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: '#3A2A0C',
};
const input = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #D8CDB8',
  borderRadius: 4,
  fontSize: 15,
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  color: '#1A1A1A',
  background: '#FFFDF9',
  boxSizing: 'border-box',
};
const fileInput = { ...input, padding: '8px', background: '#FFFFFF' };
const hint = { fontSize: 12, color: '#8B6914', fontFamily: '"IBM Plex Sans", system-ui, sans-serif' };
const toggleRow = { display: 'flex', gap: 8, marginBottom: 20 };
const toggleBtn = {
  padding: '8px 20px',
  border: '1px solid #1A3A2A',
  background: '#FFFFFF',
  color: '#1A3A2A',
  borderRadius: 4,
  cursor: 'pointer',
  fontFamily: '"Bebas Neue", Impact, sans-serif',
  fontSize: 15,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};
const toggleActive = { background: '#1A3A2A', color: '#FFFFFF' };
const primaryBtn = {
  marginTop: 6,
  background: '#1A3A2A',
  color: '#FFFFFF',
  border: 'none',
  padding: '13px 28px',
  fontFamily: '"Bebas Neue", Impact, sans-serif',
  fontSize: 17,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  borderRadius: 4,
};
const errText = {
  color: '#B83232',
  fontSize: 14,
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  margin: 0,
};
