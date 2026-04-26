'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const CONFIGS = {
  desktop: {
    src: '/GC-Comingsoon_2.png',
    w: 1920, h: 1080,
    hotspots: [
      { top: 30,  left: 380,  width: 1160, height: 190 }, // sruth. wordmark
      { top: 620, left: 280,  width: 1360, height: 380 }, // lower text block
    ],
  },
  mobile: {
    src: '/GC-Comingsoon_2_mobile.png',
    w: 1080, h: 1920,
    hotspots: [
      { top: 50,  left: 100, width: 880, height: 230 }, // sruth. wordmark
      { top: 1050, left: 80, width: 940, height: 750 }, // lower text block
    ],
  },
};

export default function ComingSoon() {
  const imgRef = useRef(null);
  const [cfg, setCfg] = useState(CONFIGS.desktop);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait), (max-width: 768px)');
    const update = () => setCfg(mq.matches ? CONFIGS.mobile : CONFIGS.desktop);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const compute = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const el = img.getBoundingClientRect();
    const scale = Math.min(el.width / cfg.w, el.height / cfg.h);
    const rw = cfg.w * scale;
    const rh = cfg.h * scale;
    const ox = el.left + (el.width - rw) / 2;
    const oy = el.top + (el.height - rh) / 2;
    setZones(cfg.hotspots.map(h => ({
      top:    oy + h.top * scale,
      left:   ox + h.left * scale,
      width:  h.width * scale,
      height: h.height * scale,
    })));
  }, [cfg]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    setZones([]);
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
        src={cfg.src}
        alt="sruth. — GlobalCeilidh is coming soon"
        style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
      />
      {zones.map((z, i) => (
        <a key={i} href="/sruth" aria-label="Sign up for sruth."
          style={{ position: 'fixed', top: z.top, left: z.left, width: z.width, height: z.height, display: 'block', cursor: 'pointer' }}
        />
      ))}
    </div>
  );
}
