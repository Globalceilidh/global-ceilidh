'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const IMG_W = 1920;
const IMG_H = 1080;

// Hotspot zones in image pixel coordinates
const HOTSPOTS = [
  { top: 30,  left: 380, width: 1160, height: 190 }, // sruth. wordmark
  { top: 620, left: 280, width: 1360, height: 380 }, // entire lower text block
];

export default function ComingSoon() {
  const imgRef = useRef(null);
  const [zones, setZones] = useState([]);

  const compute = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const el = img.getBoundingClientRect();
    const scale = Math.min(el.width / IMG_W, el.height / IMG_H);
    const rw = IMG_W * scale;
    const rh = IMG_H * scale;
    const ox = el.left + (el.width - rw) / 2;
    const oy = el.top + (el.height - rh) / 2;
    setZones(HOTSPOTS.map(h => ({
      top:    oy + h.top * scale,
      left:   ox + h.left * scale,
      width:  h.width * scale,
      height: h.height * scale,
    })));
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) compute();
    else img.addEventListener('load', compute);
    window.addEventListener('resize', compute);
    return () => {
      img.removeEventListener('load', compute);
      window.removeEventListener('resize', compute);
    };
  }, [compute]);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000' }}>
      <img
        ref={imgRef}
        src="/GC-Comingsoon_2.png"
        alt="sruth. — GlobalCeilidh is coming soon"
        style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
      />
      {zones.map((z, i) => (
        <a key={i} href="/sruth" aria-label="Sign up for sruth."
          style={{
            position: 'fixed',
            top: z.top, left: z.left,
            width: z.width, height: z.height,
            display: 'block', cursor: 'pointer',
          }}
        />
      ))}
    </div>
  );
}
