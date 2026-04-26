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
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { width: 100%; height: 100%; overflow: hidden; background: #111; }
          #sw {
            width: 100%; height: 100%;
            background: url('/sruth-signup-bg.png') center center / cover no-repeat;
            display: flex; align-items: center; justify-content: center;
          }
          #sp {
            background: rgba(0,0,0,0.55);
            border-radius: 18px;
            padding: 48px 40px;
            max-width: 520px;
            width: 90%;
            text-align: center;
            color: #fff;
          }
          #sp h1 {
            font-family: Georgia, serif; font-style: italic; font-weight: 800;
            font-size: clamp(56px, 10vw, 90px); line-height: 1;
            letter-spacing: -2px; text-decoration: underline;
            text-underline-offset: 8px; margin-bottom: 8px;
          }
          #sp h2 {
            font-family: Georgia, serif;
            font-size: clamp(24px, 4vw, 36px); font-weight: 400; margin-bottom: 12px;
          }
          #sp p {
            font-family: Georgia, serif; font-size: 15px; line-height: 1.6;
            color: rgba(255,255,255,0.8); margin-bottom: 28px;
          }
          #sp input {
            width: 100%; padding: 14px 18px; border-radius: 10px;
            border: 1.5px solid rgba(255,255,255,0.4);
            background: rgba(255,255,255,0.1); color: #fff;
            font-size: 16px; margin-bottom: 12px; outline: none;
          }
          #sp input::placeholder { color: rgba(255,255,255,0.5); }
          #sp button {
            width: 100%; padding: 16px; border-radius: 10px; border: none;
            background: #f5f0e8; color: #1a1209;
            font-family: Georgia, serif; font-size: clamp(18px, 3vw, 24px); cursor: pointer;
          }
          #sp button:disabled { opacity: 0.6; cursor: not-allowed; }
        `}</style>
      </Head>

      <div id="sw">
        <div id="sp">
          {status === 'success' ? (
            <>
              <h1>sruth.</h1>
              <h2>Mòran taing!</h2>
              <p>You are on the Sruth. We launch June 1st — watch your inbox.</p>
            </>
          ) : (
            <>
              <h1>sruth.</h1>
              <h2>Sin sibh!</h2>
              <p>A daily current of Gaelic language news, culture, learning, and events.</p>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                {status === 'error' && (
                  <p style={{ color: '#f4a0a0' }}>Something went wrong — please try again.</p>
                )}
                <button type="submit" disabled={status === 'loading'}>
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
