'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Dashed box position measured from the 1920×1080 source graphic
const IMG_W = 1920;
const IMG_H = 1080;
const BOX = { top: 605, left: 510, width: 895, height: 150 };

export default function SruthSignup() {
  const imgRef = useRef(null);
  const [formPos, setFormPos] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const computePos = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const el = img.getBoundingClientRect();
    // objectFit:contain — compute actual rendered image rect within the element
    const scale = Math.min(el.width / IMG_W, el.height / IMG_H);
    const rw = IMG_W * scale;
    const rh = IMG_H * scale;
    const ox = el.left + (el.width - rw) / 2;
    const oy = el.top + (el.height - rh) / 2;
    setFormPos({
      top:   oy + BOX.top * scale + (BOX.height * scale - 44) / 2,
      left:  ox + BOX.left * scale,
      width: BOX.width * scale,
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
          top:   formPos.top,
          left:  formPos.left,
          width: formPos.width,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          {status === 'success' ? (
            <p style={{
              color: '#fff',
              fontFamily: 'Georgia, serif',
              fontSize: 16,
              textAlign: 'center',
              margin: 0,
            }}>
              You&apos;re in the current. Watch your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', gap: '8px' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: 15,
                  fontFamily: 'Georgia, serif',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  color: '#111',
                  outline: 'none',
                  height: 44,
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  padding: '0 20px',
                  fontSize: 15,
                  fontFamily: 'Georgia, serif',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: status === 'loading' ? 'wait' : 'pointer',
                  height: 44,
                  whiteSpace: 'nowrap',
                }}
              >
                {status === 'loading' ? '...' : 'Join'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p style={{ color: '#ff6b6b', fontSize: 13, fontFamily: 'Georgia, serif', margin: 0 }}>
              Something went wrong — try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
