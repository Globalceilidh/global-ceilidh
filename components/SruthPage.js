'use client';
import { useState } from 'react';

export default function SruthPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundImage: 'url(/sruth_sign_up.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, "Times New Roman", serif',
    }}>

      {/* sruth. wordmark at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        textAlign: 'center',
        paddingTop: '2vh',
        lineHeight: 1,
      }}>
        <span style={{
          fontSize: 'clamp(64px, 11vw, 130px)',
          fontStyle: 'italic',
          fontWeight: '900',
          color: '#111',
          borderBottom: '3px solid #111',
          paddingBottom: '4px',
          display: 'inline-block',
        }}>sruth.</span>
      </div>

      {/* Main content */}
      <div style={{
        textAlign: 'center',
        color: '#fff',
        maxWidth: '660px',
        width: '90%',
        marginTop: '8vh',
        textShadow: '0 1px 6px rgba(0,0,0,0.55)',
      }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontStyle: 'italic',
          fontWeight: '400',
          margin: '0 0 18px',
        }}>Sin sibh!</h1>

        <p style={{
          fontSize: 'clamp(13px, 1.6vw, 17px)',
          fontStyle: 'italic',
          lineHeight: 1.75,
          margin: '0 0 16px',
        }}>
          &lsquo;S math gu bheil sibh an seo. Cuir do chasan anns an uisge bhlàth&hellip;<br />
          gabh snàmh beag. Tha e saor an-asgaidh &lsquo;s chan eil duine<br />
          a&rsquo; coimhead (fhathast). Bidh an Cèilidh a&rsquo; tòiseachadh<br />
          a dh&rsquo;aithghearr&mdash;agus gus an uairsin, rach leis an t-sruth!
        </p>

        <p style={{
          fontSize: 'clamp(12px, 1.4vw, 15px)',
          margin: '0 0 24px',
          opacity: 0.92,
        }}>
          A daily current of Gàidhlig language news, culture, learning, and events.
        </p>

        {submitted ? (
          <p style={{ fontSize: '18px', fontStyle: 'italic' }}>
            Tapadh leat! We&rsquo;ll be in touch.
          </p>
        ) : (
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
              }}
            >
              Join the{' '}
              <em style={{ fontWeight: '900', textDecoration: 'underline', textUnderlineOffset: '4px' }}>sruth.</em>
            </button>
          </form>
        )}

        <p style={{ marginTop: '14px', fontSize: '14px', opacity: 0.85 }}>
          No noise. Just the current. Daily.
        </p>

        <p style={{ marginTop: '28px', fontSize: '13px', opacity: 0.65 }}>
          Globalceilidh.com launches soon.
        </p>
      </div>
    </div>
  );
}
