'use client';

// components/StracBar.js
// Site-wide Gàidhlig accent (stràc) helper. Mounted once in the root layout.
// Whenever any text <input> or <textarea> is focused, a cobalt "liquid glass"
// bar rises just above the on-screen keyboard offering the five grave-accented
// vowels — à è ì ò ù — plus a caps toggle for À È Ì Ò Ù.
//
// Scottish Gàidhlig uses the grave accent (an stràc throm) ONLY; the acute
// (á) is Irish. So the grave marks are the only ones offered.
//
// Insertion detail (the part that's easy to get wrong): our fields are React
// *controlled* inputs. Writing el.value directly gets clobbered on the next
// render. So we write through the native value setter and dispatch a bubbling
// 'input' event, which makes React's onChange fire and its state update for
// real. Buttons preventDefault on mousedown so the field never loses focus or
// caret. There are no contentEditable fields on the site, so input/textarea is
// the only path we need.

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const LOWER = ['à', 'è', 'ì', 'ò', 'ù'];
const UPPER = ['À', 'È', 'Ì', 'Ò', 'Ù'];

// Input types that take free text. Everything else (checkbox, range, file,
// date, number, password, …) is skipped.
const TEXTY_INPUT_TYPES = new Set(['text', 'search', 'url', 'email', 'tel', '']);

function isEditableTextField(el) {
  if (!el || el.disabled || el.readOnly) return false;
  if (el.dataset && el.dataset.noStrac != null) return false; // opt-out hook
  if (el.tagName === 'TEXTAREA') return true;
  if (el.tagName === 'INPUT') {
    return TEXTY_INPUT_TYPES.has((el.getAttribute('type') || '').toLowerCase());
  }
  return false;
}

export default function StracBar() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [caps, setCaps] = useState(false);
  const [bottom, setBottom] = useState(0);

  const fieldRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // Track the focused field. focusin/out bubble to document, so this also
  // catches fields inside portals/modals (Let's Talk, the radio modals, …).
  useEffect(() => {
    const onFocusIn = (e) => {
      if (isEditableTextField(e.target)) {
        fieldRef.current = e.target;
        setActive(true);
      }
    };
    const onFocusOut = (e) => {
      // Focus moving into the bar itself shouldn't dismiss it (its buttons
      // preventDefault so this normally won't fire, but guard anyway).
      if (barRef.current && barRef.current.contains(e.relatedTarget)) return;
      fieldRef.current = null;
      setActive(false);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  // Ride just above the on-screen keyboard. visualViewport shrinks when the
  // keyboard opens; the gap between its bottom and the layout viewport bottom
  // IS the keyboard height. On desktop that gap is 0 and the bar sits at the
  // window bottom.
  useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    const reposition = () => {
      if (vv) setBottom(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
      else setBottom(0);
    };
    reposition();
    if (vv) {
      vv.addEventListener('resize', reposition);
      vv.addEventListener('scroll', reposition);
    }
    window.addEventListener('resize', reposition);
    return () => {
      if (vv) {
        vv.removeEventListener('resize', reposition);
        vv.removeEventListener('scroll', reposition);
      }
      window.removeEventListener('resize', reposition);
    };
  }, [active]);

  const insert = useCallback((ch) => {
    const el = fieldRef.current;
    if (!el) return;
    let start = el.selectionStart;
    let end = el.selectionEnd;
    if (start == null) { start = el.value.length; end = el.value.length; }
    const proto = el.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, el.value.slice(0, start) + ch + el.value.slice(end));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    const caret = start + ch.length;
    // email/url/number inputs throw on setSelectionRange — ignore.
    try { el.setSelectionRange(caret, caret); } catch { /* not supported */ }
  }, []);

  if (!mounted || !active) return null;

  const letters = caps ? UPPER : LOWER;

  return createPortal(
    <div ref={barRef} style={{ ...S.bar, bottom: bottom + 8 }} role="toolbar" aria-label="Gàidhlig accents">
      <style>{`
        .gc-strac-key:active { transform: translateY(1px) scale(0.955); filter: brightness(1.12); }
        @media (prefers-reduced-motion: reduce) { .gc-strac-key { transition: none; } }
      `}</style>
      {letters.map((ch, i) => (
        <button
          key={i}
          type="button"
          tabIndex={-1}
          className="gc-strac-key"
          aria-label={`Insert ${ch}`}
          style={S.key}
          onMouseDown={(e) => { e.preventDefault(); insert(ch); }}
        >
          {ch}
        </button>
      ))}
      <button
        type="button"
        tabIndex={-1}
        className="gc-strac-key"
        aria-label="Toggle capitals"
        aria-pressed={caps}
        style={{ ...S.key, ...S.caps, ...(caps ? S.capsOn : null) }}
        onMouseDown={(e) => { e.preventDefault(); setCaps((v) => !v); }}
      >
        ⇧
      </button>
    </div>,
    document.body,
  );
}

// ── cobalt "liquid glass" ──────────────────────────────────────────────
const S = {
  bar: {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10000, // above the Let's Talk scrim (9999) so it works in overlays
    display: 'flex',
    gap: 6,
    padding: '7px 9px',
    borderRadius: 18,
    background:
      'linear-gradient(180deg, rgba(58,110,235,0.90) 0%, rgba(14,44,140,0.94) 55%, rgba(9,30,104,0.96) 100%)',
    border: '1px solid rgba(130,170,255,0.55)',
    boxShadow:
      '0 12px 40px rgba(8,26,92,0.55),' +      // outer depth
      '0 0 22px rgba(45,95,235,0.45),' +        // cobalt glow
      'inset 0 1px 0 rgba(255,255,255,0.45),' + // top gloss line
      'inset 0 -10px 18px -12px rgba(0,0,0,0.55)',
    backdropFilter: 'blur(16px) saturate(150%)',
    WebkitBackdropFilter: 'blur(16px) saturate(150%)',
  },
  key: {
    minWidth: 40,
    height: 42,
    padding: '0 8px',
    borderRadius: 12,
    border: '1px solid rgba(160,195,255,0.55)',
    background:
      'linear-gradient(180deg, rgba(120,165,255,0.60) 0%, rgba(40,82,205,0.55) 48%, rgba(22,58,175,0.62) 100%)',
    color: '#F5F8FF',
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    fontSize: 21,
    fontWeight: 600,
    lineHeight: 1,
    cursor: 'pointer',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -7px 10px -8px rgba(0,0,0,0.5)',
    textShadow: '0 1px 2px rgba(4,16,60,0.6)',
    transition: 'transform 120ms ease, filter 120ms ease',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  caps: { fontSize: 17, color: 'rgba(230,240,255,0.85)' },
  capsOn: {
    background: 'linear-gradient(180deg, rgba(190,215,255,0.90), rgba(90,140,250,0.82))',
    color: '#0A2A7A',
    borderColor: 'rgba(210,230,255,0.9)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 0 12px rgba(120,170,255,0.7)',
  },
};
