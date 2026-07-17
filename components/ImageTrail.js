'use client';

// Cursor image-trail. As the mouse moves, Global Ceilidh photos are torn
// into being along the path — each blooms, holds a beat, then dissolves —
// like dragging a finger through the fabric of space and pulling the
// community through. Rendered behind a translucent overlay so the photos
// glow faintly through it. Desktop/fine-pointer only (skipped on touch and
// prefers-reduced-motion for battery + focus). Purely decorative +
// pointer-transparent, so it never interferes with the form on top.

import { useEffect, useRef } from 'react';

// A curated pool of community + culture photos (lifestyle scenes + real
// Gàidhlig artists). Swap/extend freely — order is shuffled at start.
const DEFAULT_IMAGES = [
  '/ceitidh-cafe-outside.png',
  '/ceitidh-cafe-welcome.png',
  '/ceitidh-cafe-working.png',
  '/cidsin-parents-cooking.png',
  '/coffee-shop.png',
  '/dachaigh-family.png',
  '/dachaigh-grandson-bike.png',
  '/dachaigh-mom-son-daughter.png',
  '/dachaigh_granddaughter-basketball.png',
  '/margaidh-baile-na-cuairteig.png',
  '/pairc-baile-na-cuairteig.png',
  '/slainte-bartender.png',
  '/aileen-headshot.png',
  '/radio/ally-the-piper/photo-1.png',
  '/radio/ally-the-piper/photo-3.png',
  '/radio/bad_haggis/b_h_1.png',
  '/radio/beluga_lagoon/beluga_1.png',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ImageTrail({ images = DEFAULT_IMAGES }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Fine-pointer (mouse) + motion-OK only.
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduceMotion) return;

    const pool = shuffle(images);
    pool.forEach((src) => { const i = new Image(); i.src = src; }); // preload

    const THRESHOLD = 95;   // px the cursor must travel before the next photo
    const MAX_LIVE = 12;    // cap concurrent photos
    const live = new Set();
    let lastX = null, lastY = null, idx = 0;

    function spawn(x, y) {
      if (live.size >= MAX_LIVE) return;
      const src = pool[idx % pool.length];
      idx += 1;

      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      const w = 190 + Math.round(Math.random() * 80);   // 190–270
      const h = Math.round(w * 0.7);
      const rot = Math.random() * 14 - 7;               // -7°..+7°
      Object.assign(img.style, {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
        objectFit: 'cover',
        borderRadius: '10px',
        pointerEvents: 'none',
        willChange: 'transform, opacity',
        boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
        transform: 'translate(-50%, -50%)',
      });
      container.appendChild(img);
      live.add(img);

      const anim = img.animate(
        [
          { opacity: 0, transform: `translate(-50%,-50%) scale(0.55) rotate(${rot}deg)` },
          { opacity: 1, transform: `translate(-50%,-50%) scale(1) rotate(${rot}deg)`, offset: 0.18 },
          { opacity: 1, transform: `translate(-50%,-54%) scale(1) rotate(${rot}deg)`, offset: 0.5 },
          { opacity: 0, transform: `translate(-50%,-62%) scale(0.9) rotate(${rot}deg)` },
        ],
        { duration: 1100, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
      );
      anim.onfinish = () => { img.remove(); live.delete(img); };
    }

    function onMove(clientX, clientY) {
      if (lastX === null) { lastX = clientX; lastY = clientY; return; }
      const dist = Math.hypot(clientX - lastX, clientY - lastY);
      if (dist >= THRESHOLD) {
        spawn(clientX, clientY);
        lastX = clientX;
        lastY = clientY;
      }
    }

    const mm = (e) => onMove(e.clientX, e.clientY);
    window.addEventListener('mousemove', mm);
    return () => {
      window.removeEventListener('mousemove', mm);
      live.forEach((i) => i.remove());
      live.clear();
    };
  }, [images]);

  return <div ref={containerRef} aria-hidden style={containerStyle} />;
}

const containerStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 1,
  overflow: 'hidden',
  pointerEvents: 'none',
};
