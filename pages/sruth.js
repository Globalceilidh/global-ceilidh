import { useState } from 'react';
import Head from 'next/head';

export default function Sruth() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <Head>
        <title>sruth. — Join the daily Gàidhlig current</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url(/sruth-signup-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.60)',
          borderRadius: 18,
          padding: '48px 40px',
          maxWidth: 520,
          width: '90%',
          textAlign: 'center',
          color: '#fff',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>

          {status === 'success' ? (
            <>
              <div style={{ fontSize: 'clamp(48px, 9vw, 80px)', fontStyle: 'italic', fontWeight: 800, letterSpacing: '-2px', marginBottom: 16 }}>sruth.</div>
              <div style={{ fontSize: 28, fontWeight: 400, marginBottom: 12 }}>Moran taing!</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.6 }}>
                You are on the Sruth. We launch June 1st — watch your inbox.
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 'clamp(48px, 9vw, 80px)', fontStyle: 'italic', fontWeight: 800, letterSpacing: '-2px', marginBottom: 16 }}>sruth.</div>
              <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, marginBottom: 12 }}>Sin sibh!</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
                A daily current of Gaelic language news, culture, learning, and events.
              </p>

              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: 10,
                    border: '1.5px solid rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: 16,
                    marginBottom: 12,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'Georgia, serif',
                  }}
                />
                {status === 'error' && (
                  <p style={{ color: '#f4a0a0', fontSize: 13, marginBottom: 10 }}>Something went wrong — please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    width: '100%',
                    padding: 16,
                    borderRadius: 10,
                    border: 'none',
                    background: '#f5f0e8',
                    color: '#1a1209',
                    fontFamily: 'Georgia, serif',
                    fontSize: 'clamp(18px, 3vw, 24px)',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    opacity: status === 'loading' ? 0.6 : 1,
                  }}
                >
                  {status === 'loading' ? 'Claradh...' : 'Join the sruth.'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
