'use client';
import { useState } from 'react';

export default function SruthClient() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundImage: 'url(/sruth-bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#0d1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: '12px',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '90%',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{
          fontSize: '52px',
          fontWeight: '700',
          letterSpacing: '-1px',
          marginBottom: '8px',
          lineHeight: 1,
        }}>
          sruth<span style={{ color: '#7BAFD4' }}>.</span>
        </div>

        <div style={{
          fontSize: '12px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '32px',
        }}>
          A Scottish Gaelic Newsletter
        </div>

        {submitted ? (
          <div>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>Sin sibh!</div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.6 }}>
              You&apos;re on the list. We&apos;ll be in touch when sruth. launches.
            </p>
          </div>
        ) : (
          <>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '15px',
              lineHeight: 1.7,
              marginBottom: '32px',
            }}>
              Scottish Gaelic culture, language, and community — delivered to your inbox.
              Be first to know when we launch.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: '15px',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#7BAFD4',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                }}
              >
                Clàraich — Sign Up
              </button>
            </form>
          </>
        )}

        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '1px',
        }}>
          GLOBALCEILIDH.COM
        </div>
      </div>
    </div>
  );
}
