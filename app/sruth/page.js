'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const IMG_W = 1920;
const IMG_H = 1080;
const BOX = { top: 720, left: 535, width: 850, height: 160 };
const CARD_W = 660;

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
      top:    oy + BOX.top * scale,
      left:   ox + BOX.left * scale,
      width:  BOX.width * scale,
      height: BOX.height * scale,
      cardW:  CARD_W * scale,
      pad:    12 * scale,
      inputH: 52 * scale,
      fontSize: Math.max(12, Math.round(14 * scale)),
      btnFontSize: Math.max(12, Math.round(15 * scale)),
      wordmarkH: Math.round(24 * scale),
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
        /* BOX overlay — centers the card over the dashed guide */
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
            <div style={{
              width: formPos.cardW,
              padding: formPos.pad,
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 10,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(4px)',
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: formPos.btnFontSize, color: '#111', margin: 0 }}>
                You&apos;re in the current. Watch your inbox.
              </p>
            </div>
          ) : (
            /* White card — covers the dashed guide box */
            <div style={{
              width: formPos.cardW,
              padding: formPos.pad,
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 10,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: '100%',
                    height: formPos.inputH,
                    padding: `0 14px`,
                    fontSize: formPos.fontSize,
                    fontFamily: 'Georgia, serif',
                    border: 'none',
                    borderRadius: '6px 6px 0 0',
                    background: '#f7f7f7',
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
                    fontSize: formPos.btnFontSize,
                    fontFamily: 'Georgia, serif',
                    background: '#111',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0 0 6px 6px',
                    cursor: status === 'loading' ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    letterSpacing: '0.02em',
                  }}
                >
                  {status === 'loading' ? '...' : (
                    <>
                      Join the&nbsp;
                      <span style={{
                        fontFamily: 'Georgia, serif',
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        fontSize: formPos.wordmarkH,
                        lineHeight: 1,
                        verticalAlign: 'middle',
                        marginLeft: 4,
                      }}>
                        sruth.
                      </span>
                    </>
                  )}
                </button>
              </form>
              {status === 'error' && (
                <p style={{ color: '#c0392b', fontSize: formPos.fontSize - 1, fontFamily: 'Georgia, serif', margin: '8px 0 0', textAlign: 'center' }}>
                  Something went wrong — try again.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
