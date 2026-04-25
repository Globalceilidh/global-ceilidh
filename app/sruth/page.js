'use client';
import { useState } from 'react';

export default function SruthSignup() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

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
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.65) 100%), url(/sruth-signup-bg.png) center top / cover no-repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 720,
        padding: '32px 24px 60px',
        minHeight: '100vh',
      }}>

        {/* ── Wordmark ── */}
        <div style={{ marginBottom: 'auto', paddingTop: 28, textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            fontWeight: 800,
            fontSize: 'clamp(72px, 10vw, 108px)',
            color: '#0d0d0d',
            lineHeight: 1,
            margin: 0,
            letterSpacing: '-2px',
            textDecoration: 'underline',
            textUnderlineOffset: '8px',
            textDecorationThickness: '2px',
          }}>sruth.</h1>
        </div>

        {/* ── Main content ── */}
        <div style={{ textAlign: 'center', width: '100%', paddingTop: 32 }}>

          {status === 'success' ? (
            <div style={{ padding: '40px 0' }}>
              <p style={{ ...gaelicStyle, fontSize: 'clamp(32px, 5vw, 52px)', fontStyle: 'normal', marginBottom: 20 }}>
                Sin sibh!
              </p>
              <p style={{ ...gaelicStyle, fontSize: 18, marginBottom: 10 }}>
                Mòran taing — you're on the Sruth.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontStyle: 'italic' }}>
                We launch June 1st. Watch your inbox.
              </p>
            </div>
          ) : (
            <>
              {/* Sin sibh! */}
              <h2 style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(36px, 5vw, 56px)',
                color: '#fff',
                fontWeight: 400,
                margin: '0 0 24px',
                textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              }}>Sin sibh!</h2>

              {/* Gaelic body */}
              <p style={gaelicStyle}>
                'S math gu bheil sibh an seo. Cuir do chasan anns an uisge bhlàth…
                gabh snàmh beag. Tha e saor an-asgaidh 's chan eil duine
                a' coimhead (fhathast). Bidh an Cèilidh a' tòiseachadh
                a dh'aithghearr—agus gus an uairsin, rach leis an t-sruth!
              </p>

              {/* English subtitle */}
              <p style={{
                color: 'rgba(255,255,255,0.88)',
                fontSize: 16,
                lineHeight: 1.6,
                marginBottom: 36,
                fontFamily: 'Georgia, serif',
              }}>
                A daily current of Gàidhlig language news, culture, learning, and events.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    marginBottom: 14,
                    borderRadius: 10,
                    border: '1.5px solid rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: 16,
                    boxSizing: 'border-box',
                    outline: 'none',
                    backdropFilter: 'blur(4px)',
                  }}
                />

                {status === 'error' && (
                  <p style={{ color: '#f4a0a0', fontSize: 13, marginBottom: 10 }}>{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#f5f0e8',
                    color: '#1a1209',
                    fontSize: 'clamp(20px, 3vw, 28px)',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 400,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    letterSpacing: '-0.3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    opacity: status === 'loading' ? 0.7 : 1,
                  }}
                >
                  {status === 'loading' ? 'Clàradh...' : (
                    <>
                      Join the{' '}
                      <em style={{
                        fontStyle: 'italic',
                        fontWeight: 800,
                        textDecoration: 'underline',
                        textUnderlineOffset: '4px',
                      }}>sruth.</em>
                    </>
                  )}
                </button>
              </form>

              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 20 }}>
                No noise. Just the current. Daily.
              </p>

              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 32, fontStyle: 'italic' }}>
                Globalceilidh.com launches soon.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const gaelicStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  color: '#fff',
  fontSize: 'clamp(15px, 2vw, 18px)',
  lineHeight: 1.75,
  marginBottom: 28,
  textShadow: '0 1px 8px rgba(0,0,0,0.5)',
};
