'use client';

import { useState } from 'react';

export default function SruthSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

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
        src="/sruth_sign_up_2.png"
        alt="sruth. — Sign up"
        style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
      />

      <div style={{
        position: 'absolute',
        bottom: 180,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 660,
        padding: 12,
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 10,
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(4px)',
      }}>
        {status === 'success' ? (
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#111', margin: 0, textAlign: 'center', padding: '16px 0' }}>
            You&apos;re in the current. Watch your inbox.
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%',
                  height: 52,
                  padding: '0 14px',
                  fontSize: 14,
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
                  height: 52,
                  fontSize: 15,
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
                    <span style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: 18, lineHeight: 1, marginLeft: 4 }}>
                      sruth.
                    </span>
                  </>
                )}
              </button>
            </form>
            {status === 'error' && (
              <p style={{ color: '#c0392b', fontSize: 13, fontFamily: 'Georgia, serif', margin: '8px 0 0', textAlign: 'center' }}>
                Something went wrong — try again.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
