'use client';
import { useState } from 'react';

export default function SruthSignupModal({ onClose }) {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#0d1b2a',
        borderRadius: 18,
        padding: '44px 48px',
        maxWidth: 460,
        width: '100%',
        color: '#fff',
        position: 'relative',
        border: '1px solid rgba(123,175,212,0.2)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 20,
            background: 'none', border: 'none',
            color: '#556', fontSize: 26, cursor: 'pointer', lineHeight: 1,
          }}
          aria-label="Close"
        >×</button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🌊</div>
            <h2 style={{
              fontFamily: 'Georgia, serif', fontStyle: 'italic',
              fontSize: 32, fontWeight: 800, marginBottom: 10,
              letterSpacing: '-0.5px',
            }}>Mòran taing!</h2>
            <p style={{ color: '#7BAFD4', marginBottom: 6, fontSize: 15 }}>
              Thank you — you're on the Sruth.
            </p>
            <p style={{ color: '#556e85', fontSize: 13, fontStyle: 'italic' }}>
              We launch June 1st. Watch your inbox.
            </p>
          </div>
        ) : (
          <>
            {/* Wordmark */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 800,
                fontSize: 40,
                letterSpacing: '-1px',
                lineHeight: 1,
                marginBottom: 6,
              }}>
                sruth<span style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>.</span>
              </div>
              <p style={{ color: '#7BAFD4', fontSize: 13, fontStyle: 'italic', marginTop: 4 }}>
                Our daily Gàidhlig current — launching June 1st
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
              />

              {status === 'error' && (
                <p style={{ color: '#e07070', fontSize: 13, marginBottom: 12, marginTop: -4 }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 10,
                  border: 'none',
                  background: status === 'loading' ? '#4a7a9b' : '#7BAFD4',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.3px',
                  transition: 'background 0.2s',
                }}
              >
                {status === 'loading' ? 'Clàradh...' : 'Join the Sruth →'}
              </button>

              <p style={{ textAlign: 'center', color: '#334a5e', fontSize: 11, marginTop: 14, fontStyle: 'italic' }}>
                No spam. Unsubscribe any time.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  marginBottom: 14,
  borderRadius: 10,
  border: '1px solid #1e3448',
  background: '#111f2e',
  color: '#dde',
  fontSize: 15,
  boxSizing: 'border-box',
  outline: 'none',
};
