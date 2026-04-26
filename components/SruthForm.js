'use client';
import { useState } from 'react';

export default function SruthForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p style={{
        fontSize: '18px',
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        color: '#fff',
        textShadow: '0 1px 6px rgba(0,0,0,0.55)',
      }}>
        Tapadh leat! We&rsquo;ll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={e => { e.preventDefault(); if (email.trim()) setSubmitted(true); }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        style={{
          display: 'block',
          width: '100%',
          padding: '13px 20px',
          borderRadius: '6px',
          border: '1.5px solid rgba(255,255,255,0.75)',
          backgroundColor: 'rgba(255,255,255,0.07)',
          color: '#fff',
          fontSize: '16px',
          fontFamily: 'Georgia, serif',
          marginBottom: '10px',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        style={{
          display: 'block',
          width: '100%',
          padding: '16px 20px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: '#f5f0e8',
          color: '#111',
          fontSize: 'clamp(18px, 2.5vw, 26px)',
          fontFamily: 'Georgia, "Times New Roman", serif',
          cursor: 'pointer',
          letterSpacing: '0.01em',
        }}
      >
        Join the{' '}
        <em style={{
          fontWeight: '900',
          textDecoration: 'underline',
          textUnderlineOffset: '4px',
        }}>sruth.</em>
      </button>
    </form>
  );
}
