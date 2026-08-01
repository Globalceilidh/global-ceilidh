'use client';

// components/ImageZoom.js
// Click a thumbnail to open a larger version in-page (a lightbox over the
// current page — no new tab). Exit is deliberately easy: click anywhere,
// the × button, or Esc. Used for profile images on /duilleag and /u/<handle>.
//
// The trigger is whatever you pass as children (the existing thumbnail img),
// so each caller keeps its own styling; only the zoom behaviour is shared.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ImageZoom({ src, alt = '', title, children, imgStyle }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button type="button" data-no-drag onClick={() => setOpen(true)} title={title} style={trigger}>
        {children}
      </button>

      {mounted && open && createPortal(
        <div style={scrim} onClick={() => setOpen(false)}>
          <button style={close} onClick={() => setOpen(false)} aria-label="Close">×</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} style={{ ...img, ...imgStyle }} />
        </div>,
        document.body,
      )}
    </>
  );
}

const trigger = {
  display: 'block', padding: 0, border: 'none', background: 'none',
  cursor: 'zoom-in', lineHeight: 0, flexShrink: 0,
};

const scrim = {
  position: 'fixed', inset: 0, zIndex: 10000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5vh 5vw',
  background: 'rgba(0,0,0,0.86)',
  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
  cursor: 'zoom-out',
};

const close = {
  position: 'fixed', top: 22, right: 24, width: 52, height: 52, borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
  color: '#fff', fontSize: 26, lineHeight: 1, cursor: 'pointer',
};

const img = {
  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
  borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
};
