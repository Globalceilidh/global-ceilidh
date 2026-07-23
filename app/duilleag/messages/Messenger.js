'use client';

// app/duilleag/messages/Messenger.js
// The messenger. Two panes on desktop (threads | conversation), one at a
// time on a phone. v1 keeps sync honest with polling — the open thread
// every few seconds, the list a little slower — and does not pretend to be
// realtime. When the Clerk→Supabase presence bridge lands (the online dot's
// dependency) this swaps to a subscription without touching the shape.
//
// You reach a person here three ways: tap a thread, arrive with ?to=<handle>
// from a connection's Message button, or broadcast to a whole circle. The
// server is the only thing that decides you're allowed to — this UI just
// asks.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

const TIERS = [
  { key: 'connection', en: 'All connections', gd: 'Gach ceangal' },
  { key: 'close', en: 'Close', gd: 'Dlùth' },
  { key: 'family', en: 'Family', gd: 'Teaghlach' },
];

export default function Messenger({ meHandle }) {
  const { language } = useLanguage();
  const gd = language === 'gd';

  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);   // { id, handle, name }
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcast, setBroadcast] = useState(null); // tier key while composing
  const [castText, setCastText] = useState('');
  const [notice, setNotice] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const scrollRef = useRef(null);

  // One pane at a time on a phone; both side by side on a wider screen.
  useEffect(() => {
    const measure = () => setIsMobile(window.innerWidth < 760);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // ── data ────────────────────────────────────────────────────────────
  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      const json = await res.json();
      if (json.ok) setThreads(json.threads || []);
    } catch { /* keep what we have */ }
  }, []);

  const loadMessages = useCallback(async (threadId) => {
    if (!threadId) return;
    try {
      const res = await fetch(`/api/messages/${threadId}`);
      const json = await res.json();
      if (json.ok) {
        setMessages(json.messages || []);
        setActive((a) => (a && a.id === threadId ? { ...a, name: json.other?.displayName || a.name, handle: json.other?.handle || a.handle } : a));
      }
    } catch { /* keep what we have */ }
  }, []);

  // First load + ?to=<handle> deep link.
  useEffect(() => {
    loadThreads();
    if (typeof window !== 'undefined') {
      const to = new URLSearchParams(window.location.search).get('to');
      if (to) setActive({ id: null, handle: to.toLowerCase(), name: `@${to.toLowerCase()}` });
    }
  }, [loadThreads]);

  // If a deep-linked handle already has a thread, adopt it.
  useEffect(() => {
    if (active && !active.id && active.handle) {
      const t = threads.find((x) => x.person?.handle === active.handle);
      if (t) setActive({ id: t.id, handle: t.person.handle, name: t.person.displayName });
    }
  }, [threads, active]);

  // Load messages when the active thread changes.
  useEffect(() => { if (active?.id) loadMessages(active.id); }, [active?.id, loadMessages]);

  // Poll: the open thread quickly, the list slowly.
  useEffect(() => {
    const a = setInterval(loadThreads, 10000);
    const b = setInterval(() => { if (active?.id) loadMessages(active.id); }, 4000);
    return () => { clearInterval(a); clearInterval(b); };
  }, [active?.id, loadThreads, loadMessages]);

  // Keep the conversation pinned to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, active?.id]);

  // ── actions ─────────────────────────────────────────────────────────
  async function send() {
    const body = draft.trim();
    if (!body || sending || !active) return;
    setSending(true);
    try {
      const url = active.id ? `/api/messages/${active.id}` : '/api/messages';
      const payload = active.id ? { body } : { to: active.handle, body };
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) { setNotice(json.reason || (gd ? 'Cha b’ urrainn a chur.' : 'Couldn’t send.')); return; }
      setDraft('');
      setNotice(null);
      const threadId = active.id || json.threadId;
      if (!active.id && threadId) setActive((x) => ({ ...x, id: threadId }));
      await loadMessages(threadId);
      loadThreads();
    } finally {
      setSending(false);
    }
  }

  async function sendBroadcast() {
    const body = castText.trim();
    if (!body || !broadcast || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: broadcast, body }),
      });
      const json = await res.json();
      if (json.ok) {
        setNotice(json.sent > 0
          ? (gd ? `Air a chur gu ${json.sent}.` : `Sent to ${json.sent}.`)
          : (json.reason || (gd ? 'Chan eil duine sa chearcall sin fhathast.' : 'No one in that circle yet.')));
        setCastText(''); setBroadcast(null);
        loadThreads();
      } else {
        setNotice(json.reason || (gd ? 'Cha b’ urrainn a chur.' : 'Couldn’t send.'));
      }
    } finally {
      setSending(false);
    }
  }

  // On a phone show one pane at a time; on desktop show both.
  const showListPane = !isMobile || !active;
  const showConvoPane = !isMobile || !!active;

  return (
    <main style={s.root}>
      {/* ── Threads ─────────────────────────────────────────────── */}
      {showListPane && (
      <section style={{ ...s.listPane, ...(isMobile ? s.paneFull : null) }}>
        <header style={s.listHead}>
          <a href="/duilleag" style={s.back}>← {gd ? 'An Duilleag' : 'Duilleag'}</a>
          <h1 style={s.h1}>{gd ? 'Teachdaireachdan' : 'Messages'}</h1>
        </header>

        {/* Broadcast to a circle */}
        <div style={s.castBox}>
          <p style={s.castLabel}>{gd ? 'Sgaoil gu cearcall' : 'Message a circle'}</p>
          <div style={s.castTiers}>
            {TIERS.map((tier) => (
              <button
                key={tier.key}
                onClick={() => setBroadcast((b) => (b === tier.key ? null : tier.key))}
                style={{ ...s.castTier, ...(broadcast === tier.key ? s.castTierOn : null) }}
              >
                {gd ? tier.gd : tier.en}
              </button>
            ))}
          </div>
          {broadcast && (
            <div style={s.castCompose}>
              <textarea
                value={castText}
                onChange={(e) => setCastText(e.target.value)}
                placeholder={gd ? 'Sgrìobh gu do chearcall…' : 'Write to your circle…'}
                style={s.castInput}
                rows={2}
              />
              <button style={s.castSend} onClick={sendBroadcast} disabled={sending || !castText.trim()}>
                {gd ? 'Cuir' : 'Send'}
              </button>
            </div>
          )}
        </div>

        {notice && <p style={s.notice}>{notice}</p>}

        <div style={s.threadList}>
          {threads.length === 0 && (
            <p style={s.empty}>
              {gd
                ? 'Chan eil còmhradh agad fhathast. Tòisich fear bho cheangal.'
                : 'No conversations yet. Start one from a connection.'}
            </p>
          )}
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive({ id: t.id, handle: t.person.handle, name: t.person.displayName })}
              style={{ ...s.threadRow, ...(active?.id === t.id ? s.threadRowOn : null) }}
            >
              <span style={s.avatar}>{initials(t.person.displayName)}</span>
              <span style={s.threadMid}>
                <span style={s.threadName}>{t.person.displayName}</span>
                <span style={s.threadPrev}>
                  {t.preview ? `${t.preview.fromMe ? (gd ? 'Thu: ' : 'You: ') : ''}${t.preview.body}` : (gd ? 'Còmhradh ùr' : 'New conversation')}
                </span>
              </span>
              {t.unread > 0 && <span style={s.badge}>{t.unread}</span>}
            </button>
          ))}
        </div>
      </section>
      )}

      {/* ── Conversation ────────────────────────────────────────── */}
      {showConvoPane && (
      <section style={{ ...s.convoPane, ...(isMobile ? s.paneFull : null) }}>
        {!active ? (
          <div style={s.convoEmpty}>{gd ? 'Tagh còmhradh.' : 'Pick a conversation.'}</div>
        ) : (
          <>
            <header style={s.convoHead}>
              <button style={s.backBtn} onClick={() => setActive(null)} aria-label={gd ? 'Air ais' : 'Back'}>←</button>
              <span style={s.avatarSm}>{initials(active.name)}</span>
              <a href={`/u/${active.handle}`} style={s.convoName}>{active.name}</a>
            </header>

            <div style={s.messages} ref={scrollRef}>
              {messages.map((m) => (
                <div key={m.id} style={{ ...s.bubbleRow, justifyContent: m.fromMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ ...s.bubble, ...(m.fromMe ? s.bubbleMe : s.bubbleThem) }}>
                    <span style={s.bubbleBody}>{m.body}</span>
                    <span style={s.bubbleTime}>{clock(m.at)}</span>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p style={s.convoHint}>{gd ? 'Abair halò.' : 'Say hello.'}</p>
              )}
            </div>

            <div style={s.composer}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={gd ? 'Teachdaireachd…' : 'Message…'}
                style={s.input}
                rows={1}
              />
              <button style={s.sendBtn} onClick={send} disabled={sending || !draft.trim()}>
                {gd ? 'Cuir' : 'Send'}
              </button>
            </div>
          </>
        )}
      </section>
      )}
    </main>
  );
}

function initials(name) {
  return String(name || '?').replace(/^@/, '').split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}
function clock(iso) {
  try { return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); } catch { return ''; }
}

const GOLD = '#C9A047';
const SANS = '"IBM Plex Sans", system-ui, sans-serif';

const s = {
  root: { position: 'fixed', inset: 0, display: 'flex', background: '#07100C', color: '#FFFFFF' },

  listPane: {
    width: 'min(340px, 100%)', flexShrink: 0, display: 'flex', flexDirection: 'column',
    borderRight: '1px solid rgba(255,255,255,0.10)', boxSizing: 'border-box',
  },
  listHead: { padding: '18px 18px 10px' },
  back: { fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' },
  h1: { fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif', fontSize: 40, letterSpacing: '0.05em', margin: '8px 0 0' },

  castBox: { padding: '4px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  castLabel: { fontFamily: SANS, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', margin: '0 0 7px' },
  castTiers: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  castTier: {
    fontFamily: SANS, fontSize: 11.5, cursor: 'pointer', borderRadius: 999, padding: '4px 11px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.7)',
  },
  castTierOn: { background: 'rgba(201,160,71,0.16)', border: `1px solid ${GOLD}`, color: '#FFFFFF' },
  castCompose: { display: 'flex', gap: 7, marginTop: 8, alignItems: 'flex-end' },
  castInput: {
    flex: 1, boxSizing: 'border-box', resize: 'none', background: 'rgba(0,0,0,0.26)',
    border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '7px 9px', color: '#FFFFFF', fontFamily: SANS, fontSize: 13,
  },
  castSend: { background: GOLD, color: '#1A1206', border: 'none', borderRadius: 999, padding: '7px 14px', fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: 'pointer' },

  notice: { fontFamily: SANS, fontSize: 12.5, color: GOLD, margin: 0, padding: '8px 16px' },

  threadList: { flex: 1, overflowY: 'auto', padding: '6px 8px' },
  empty: { fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: 'rgba(255,255,255,0.45)', padding: '14px 10px' },
  threadRow: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left', cursor: 'pointer',
    background: 'none', border: 'none', borderRadius: 10, padding: '9px 10px', color: '#FFFFFF',
  },
  threadRowOn: { background: 'rgba(255,255,255,0.06)' },
  threadMid: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  threadName: { fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.92)' },
  threadPrev: { fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.48)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  badge: { background: GOLD, color: '#1A1206', borderRadius: 999, minWidth: 18, textAlign: 'center', padding: '1px 6px', fontFamily: SANS, fontSize: 11, fontWeight: 700 },

  convoPane: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  convoEmpty: { margin: 'auto', fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  convoHead: { display: 'flex', alignItems: 'center', gap: 11, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.10)' },
  backBtn: { background: 'none', border: 'none', color: '#FFFFFF', fontSize: 20, cursor: 'pointer', padding: 0 },
  convoName: { fontFamily: '"Fraunces", "EB Garamond", Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 17, color: '#FFFFFF', textDecoration: 'none' },

  messages: { flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 },
  convoHint: { margin: 'auto', fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  bubbleRow: { display: 'flex' },
  bubble: { maxWidth: '74%', borderRadius: 16, padding: '8px 13px', display: 'flex', flexDirection: 'column', gap: 3 },
  bubbleMe: { background: GOLD, color: '#1A1206', borderBottomRightRadius: 5 },
  bubbleThem: { background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', borderBottomLeftRadius: 5 },
  bubbleBody: { fontFamily: SANS, fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' },
  bubbleTime: { fontFamily: '"IBM Plex Mono", monospace', fontSize: 9.5, opacity: 0.6, alignSelf: 'flex-end' },

  composer: { display: 'flex', gap: 9, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.10)', alignItems: 'flex-end' },
  input: {
    flex: 1, boxSizing: 'border-box', resize: 'none', maxHeight: 120, background: 'rgba(0,0,0,0.26)',
    border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, padding: '10px 13px', color: '#FFFFFF', fontFamily: SANS, fontSize: 14, lineHeight: 1.4,
  },
  sendBtn: { background: GOLD, color: '#1A1206', border: 'none', borderRadius: 999, padding: '10px 18px', fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: 'pointer' },

  avatar: {
    width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: SANS, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)',
  },
  avatarSm: {
    width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)',
  },

  paneFull: { width: '100%', flex: 1, borderRight: 'none' },
};
