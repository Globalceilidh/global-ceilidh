'use client';

import { useState } from 'react';

export default function SruthSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

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
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img
          src="/sruth_sign_up_2.png"
          alt="sruth. — Sign up"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center center',
            display: 'block',
          }}
        />

        {/* Email form — positioned over the dashed placeholder rectangle */}
        <div style={{
          position: 'absolute',
          top: '57%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '52%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}>
          {status === 'success' ? (
            <p style={{
              color: '#fff',
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(14px, 1.8vw, 20px)',
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}>
              You&apos;re in the current. Watch your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              width: '100%',
              gap: '8px',
            }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: 'clamp(13px, 1.4vw, 17px)',
                  fontFamily: 'Georgia, serif',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  color: '#111',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  padding: '10px 20px',
                  fontSize: 'clamp(13px, 1.4vw, 17px)',
                  fontFamily: 'Georgia, serif',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: status === 'loading' ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {status === 'loading' ? '...' : 'Join'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p style={{
              color: '#ff6b6b',
              fontSize: 'clamp(11px, 1.2vw, 14px)',
              fontFamily: 'Georgia, serif',
              margin: 0,
            }}>
              Something went wrong — try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
