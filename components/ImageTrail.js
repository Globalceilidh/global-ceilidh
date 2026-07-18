'use client';

// Cursor image-trail. As the mouse moves, Global Ceilidh photos are torn
// into being along the path — each blooms, holds a beat, then dissolves —
// like dragging a finger through the fabric of space and pulling the
// community through. Each photo is sized to its OWN aspect (landscape or
// portrait), not forced to a box. Rendered behind a translucent overlay
// so the photos glow faintly through it. Desktop/fine-pointer only
// (skipped on touch + prefers-reduced-motion). Pointer-transparent, so it
// never interferes with the form on top.

import { useEffect, useRef } from 'react';

// A rich, varied pool — lifestyle scenes + real Gàidhlig artists. Order is
// shuffled at start. Swap/extend freely.
const DEFAULT_IMAGES = [
  // lifestyle / community scenes
  '/ceitidh-cafe-outside.png', '/ceitidh-cafe-welcome.png', '/ceitidh-cafe-working.png',
  '/cidsin-parents-cooking.png', '/coffee-shop.png', '/dachaigh-family.png',
  '/dachaigh-grandson-bike.png', '/dachaigh-mom-son-daughter.png',
  '/dachaigh_granddaughter-basketball.png', '/margaidh-baile-na-cuairteig.png',
  '/pairc-baile-na-cuairteig.png', '/slainte-bartender.png', '/aileen-headshot.png',
  // artists (a spread across the library)
  '/radio/ally-the-piper/photo-1.png', '/radio/ally-the-piper/photo-4.png',
  '/radio/bad_haggis/b_h_1.png', '/radio/bad_haggis/b_h_3.png',
  '/radio/beluga_lagoon/beluga_1.png', '/radio/beluga_lagoon/beluga_2.png',
  '/radio/hadrians-wall/hadrians_wall_1.png', '/radio/hadrians-wall/hadrians_wall_3.png',
  '/radio/isla_scott/isla-scott-1.png', '/radio/isla_scott/isla-scott-3.png',
  '/radio/josie_duncan/j-d-1.png', '/radio/josie_duncan/j-d-3.png',
  '/radio/julie_fowlis/jf_1.png', '/radio/julie_fowlis/jf_3.png',
  '/radio/kim_carnie/k-c-1.png', '/radio/kim_carnie/k-c-4.png',
  '/radio/manran/photo-1.png', '/radio/manran/photo-2.png',
  '/radio/proclaimers/proclaimers_1.png',
  '/radio/runrig/runrig-1.png', '/radio/runrig/runrig-2.png',
  '/radio/sian/Sian_1.png', '/radio/sian/Sian_3.png',
  '/radio/skerryvore/skerryvore_1.png', '/radio/skerryvore/skerryvore_2.png',
  '/radio/Mairi_McGillivray/m_m_1.png', '/radio/Mairi_McGillivray/m_m_2.png',
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

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduceMotion) return;

    const pool = shuffle(images);
    // Preload + remember each photo's aspect (width/height) so the trail
    // element can be landscape or portrait to match.
    const aspect = {};
    pool.forEach((src) => {
      const i = new Image();
      i.onload = () => { if (i.naturalHeight) aspect[src] = i.naturalWidth / i.naturalHeight; };
      i.src = src;
    });

    const THRESHOLD = 85;   // px the cursor must travel before the next photo
    const MAX_LIVE = 14;    // cap concurrent photos
    const live = new Set();
    let lastX = null, lastY = null, idx = 0;

    function spawn(x, y) {
      if (live.size >= MAX_LIVE) return;
      const src = pool[idx % pool.length];
      idx += 1;

      // Size to the image's own aspect (clamped so nothing gets silly).
      const a = Math.max(0.62, Math.min(1.62, aspect[src] || 1.4));
      const longSide = 205 + Math.round(Math.random() * 95); // 205–300
      let w, h;
      if (a >= 1) { w = longSide; h = Math.round(longSide / a); }
      else { h = longSide; w = Math.round(longSide * a); }

      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      const rot = Math.random() * 14 - 7;
      Object.assign(img.style, {
        position: 'absolute', left: `${x}px`, top: `${y}px`,
        width: `${w}px`, height: `${h}px`, objectFit: 'cover',
        borderRadius: '10px', pointerEvents: 'none', willChange: 'transform, opacity',
        boxShadow: '0 16px 40px rgba(0,0,0,0.55)', transform: 'translate(-50%, -50%)',
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
  position: 'fixed', inset: 0, zIndex: 1, overflow: 'hidden', pointerEvents: 'none',
};
