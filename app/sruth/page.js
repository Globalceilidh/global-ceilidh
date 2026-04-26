'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const IMG_W = 1920;
const IMG_H = 1080;
const BOX = { top: 720, left: 535, width: 850, height: 160 };

export default function SruthSignup() {
  const imgRef = useRef(null);
  const [formPos, setFormPos] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const computePos = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const el = img.getBoundingClientRect();
    const scale = Math.min(el.width / IMG_W, el.height / IMG_H);
    const rw = IMG_W * scale;
    const rh = IMG_H * scale;
    const ox = el.left + (el.width - rw) / 2;
    const oy = el.top + (el.height - rh) / 2;
    setFormPos({
      top:   oy + BOX.top * scale,
      left:  ox + BOX.left * scale,
      width: BOX.width * scale,
      height: BOX.height * scale,
    });
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) computePos();
    else img.addEventListener('load', computePos);
    window.addEventListener('resize', computePos);
    return () => {
      img.removeEventListener('load', computePos);
      window.removeEventListener('resize', computePos);
    };
  }, [computePos]);

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

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000' }}>
      <img
        ref={imgRef}
        src="/sruth_sign_up_2.png"
        alt="sruth. — Sign up"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          display: 'block',
        }}
      />

      {formPos && (
        <div style={{
          position: 'fixed',
          top:    formPos.top,
          left:   formPos.left,
          width:  formPos.width,
          height: formPos.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {status === 'success' ? (
            <p style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: 18, textAlign: 'center', margin: 0 }}>
              You&apos;re in the current. Watch your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              width: '100%',
            }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%',
                  height: 56,
                  padding: '0 18px',
                  fontSize: 16,
                  fontFamily: 'Georgia, serif',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  height: 56,
                  fontSize: 16,
                  fontFamily: 'Georgia, serif',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: status === 'loading' ? 'wait' : 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                {status === 'loading' ? '...' : 'Join the sruth'}
              </button>
              {status === 'error' && (
                <p style={{ color: '#ff6b6b', fontSize: 13, fontFamily: 'Georgia, serif', margin: 0, textAlign: 'center' }}>
                  Something went wrong — try again.
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
