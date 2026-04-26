'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const IMG_W = 1920;
const IMG_H = 1080;
const BOX = { top: 720, left: 535, width: 850, height: 160 };
const INNER_W = 620; // px in source image coordinates

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
    const boxW = BOX.width * scale;
    const boxH = BOX.height * scale;
    const innerW = INNER_W * scale;
    setFormPos({
      top:    oy + BOX.top * scale,
      left:   ox + BOX.left * scale,
      width:  boxW,
      height: boxH,
      innerW,
      inputH: 54 * scale,
      fontSize: Math.round(15 * scale),
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
        style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
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
            <p style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: formPos.fontSize, textAlign: 'center', margin: 0 }}>
              You&apos;re in the current. Watch your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              width: formPos.innerW,
            }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%',
                  height: formPos.inputH,
                  padding: '0 18px',
                  fontSize: formPos.fontSize,
                  fontFamily: 'Georgia, serif',
                  border: 'none',
                  borderRadius: '6px 6px 0 0',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                  display: 'block',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  height: formPos.inputH,
                  fontSize: formPos.fontSize,
                  fontFamily: 'Georgia, serif',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0 0 6px 6px',
                  cursor: status === 'loading' ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  letterSpacing: '0.02em',
                }}
              >
                {status === 'loading' ? '...' : (
                  <>
                    Join the{' '}
                    <span style={{
                      fontFamily: 'Georgia, serif',
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                      fontSize: Math.round(formPos.fontSize * 1.15),
                    }}>
                      sruth.
                    </span>
                  </>
                )}
              </button>
              {status === 'error' && (
                <p style={{ color: '#ff6b6b', fontSize: formPos.fontSize - 2, fontFamily: 'Georgia, serif', margin: '6px 0 0', textAlign: 'center' }}>
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
