'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Mobile: image open area at ~58–78% of 1920px height
const MOBILE_IMG = { w: 1080, h: 1920, src: '/sruth_sign_up_2_mobile.png' };
const MOBILE_BOX = { top: 1060, left: 90, width: 900, height: 400 };

export default function SruthSignup() {
  const imgRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileFormPos, setMobileFormPos] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait), (max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const computeMobile = useCallback(() => {
    const img = imgRef.current;
    if (!img || !isMobile) return;
    const el = img.getBoundingClientRect();
    const scale = Math.min(el.width / MOBILE_IMG.w, el.height / MOBILE_IMG.h);
    const rw = MOBILE_IMG.w * scale;
    const rh = MOBILE_IMG.h * scale;
    const ox = el.left + (el.width - rw) / 2;
    const oy = el.top + (el.height - rh) / 2;
    const boxW = MOBILE_BOX.width * scale;
    const boxH = MOBILE_BOX.height * scale;
    setMobileFormPos({
      top:    oy + MOBILE_BOX.top * scale,
      left:   ox + MOBILE_BOX.left * scale,
      width:  boxW,
      height: boxH,
      cardW:  Math.min(boxW * 0.92, 380),
      inputH: Math.round(48 * scale),
      fontSize: Math.max(13, Math.round(14 * scale)),
    });
  }, [isMobile]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !isMobile) return;
    setMobileFormPos(null);
    if (img.complete) computeMobile();
    else img.addEventListener('load', computeMobile);
    window.addEventListener('resize', computeMobile);
    return () => {
      img.removeEventListener('load', computeMobile);
      window.removeEventListener('resize', computeMobile);
    };
  }, [computeMobile, isMobile]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  const form = (fontSize, inputH, cardW) => (
    status === 'success' ? (
      <p style={{ fontFamily: 'Georgia, serif', fontSize, color: '#111', margin: 0, textAlign: 'center', padding: '12px 0' }}>
        You&apos;re in the current. Watch your inbox.
      </p>
    ) : (
      <>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" required
            style={{ width: '100%', height: inputH, padding: '0 14px', fontSize, fontFamily: 'Georgia, serif',
              border: 'none', borderRadius: '6px 6px 0 0', background: '#f7f7f7', color: '#111',
              outline: 'none', boxSizing: 'border-box', display: 'block' }}
          />
          <button type="submit" disabled={status === 'loading'}
            style={{ width: '100%', height: inputH, fontSize, fontFamily: 'Georgia, serif',
              background: '#111', color: '#fff', border: 'none', borderRadius: '0 0 6px 6px',
              cursor: status === 'loading' ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.02em' }}
          >
            {status === 'loading' ? '...' : <>Join the&nbsp;<span style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: fontSize + 3 }}>s<span style={{ textDecoration: 'underline' }}>ru</span>th.</span></>}
          </button>
        </form>
        {status === 'error' && <p style={{ color: '#c0392b', fontSize: fontSize - 1, fontFamily: 'Georgia, serif', margin: '6px 0 0', textAlign: 'center' }}>Something went wrong — try again.</p>}
      </>
    )
  );

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000' }}>
      <img
        ref={imgRef}
        src={isMobile ? MOBILE_IMG.src : '/sruth_sign_up_2.png'}
        alt="sruth. — Sign up"
        style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
      />

      {/* Desktop form */}
      {!isMobile && (
        <div style={{ position: 'absolute', bottom: 179, left: '49.5%', transform: 'translateX(-50%)',
          width: 520, padding: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 10,
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)' }}>
          {form(14, 42, 520)}
        </div>
      )}

      {/* Mobile form — JS-positioned over open area */}
      {isMobile && mobileFormPos && (
        <div style={{ position: 'fixed', top: mobileFormPos.top, left: mobileFormPos.left,
          width: mobileFormPos.width, height: mobileFormPos.height,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: mobileFormPos.cardW, padding: 10, background: 'rgba(255,255,255,0.92)',
            borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)' }}>
            {form(mobileFormPos.fontSize, mobileFormPos.inputH, mobileFormPos.cardW)}
          </div>
        </div>
      )}
    </div>
  );
}
