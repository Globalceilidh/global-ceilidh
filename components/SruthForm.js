'use client';
import { useState } from 'react';

// Positioned over the email/button area of sruth_sign_up.png (1536x1024)
// Form area is roughly 60–80% from top, centred horizontally
export default function SruthForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div style={{
      position: 'absolute',
      top: '62%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '46%',
      minWidth: '240px',
      maxWidth: '560px',
    }}>
      {done ? (
        <p style={{
          textAlign: 'center',
          color: '#fff',
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          fontStyle: 'italic',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}>
          Tapadh leat! We&rsquo;ll be in touch.
        </p>
      ) : (
        <form onSubmit={e => { e.preventDefault(); if (email) setDone(true); }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              display: 'block',
              width: '100%',
              padding: '11px 16px',
              borderRadius: '6px',
              border: '1.5px solid rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '15px',
              fontFamily: 'Georgia, serif',
              marginBottom: '9px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              display: 'block',
              width: '100%',
              padding: '13px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#f5f0e8',
              color: '#111',
              fontSize: '19px',
              fontFamily: 'Georgia, serif',
              cursor: 'pointer',
            }}
          >
            Join the <em style={{ fontWeight: '900', textDecoration: 'underline', textUnderlineOffset: '3px' }}>sruth.</em>
          </button>
        </form>
      )}
    </div>
  );
}
