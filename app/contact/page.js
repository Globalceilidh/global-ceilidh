'use client';

// /contact — the "Let's Talk" destination. The pill on Radio / An Tonn / marble
// points here; the route never existed, so those all 404'd. This is the About +
// reach-out page: a short who-we-are, then a form that emails the editor via
// /api/contact (Resend), with a direct mailto fallback. Bilingual via the pill.
//
// NOTE: the Gàidhlig copy here is first-draft — wants Lewis/Joe's eye before
// it's treated as final public copy.

import { useState } from 'react';
import Link from 'next/link';
import LanguagePill from '../../components/LanguagePill';
import { useLanguage } from '../../context/LanguageContext';

const FEEDBACK_ADDR = 'sruth_editors@globalceilidh.com';

export default function Contact() {
  const { language } = useLanguage();
  const gd = language === 'gd';
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const t = (en, g) => (gd ? g : en);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus('sending'); setError('');
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Could not send.');
      setStatus('sent');
    } catch (err) {
      setError(err.message || 'Could not send.');
      setStatus('error');
    }
  }

  return (
    <main style={S.main}>
      <style>{CSS}</style>
      <LanguagePill position="top-left" variant="white" className="gc-contact-pill" />
      <Link href="/" style={S.home} aria-label={t('Global Ceilidh home', 'Dhachaigh')}>
        ← {t('Global Ceilidh', 'Global Ceilidh')}
      </Link>

      <div style={S.wrap}>
        <h1 style={S.h1}>{t("Let's Talk", 'Thig, bruidhinn')}</h1>
        <p style={S.lede}>
          {t(
            'Global Ceilidh is the gathering place for the global Gàidhlig world — the language, the music, the diaspora. Questions, ideas, corrections, a hand to offer, or a hand needed: this is the door. We read everything.',
            'Is e Global Ceilidh àite-cruinneachaidh do shaoghal na Gàidhlig air feadh an t-saoghail — an cànan, an ceòl, an sgapadh. Ceistean, beachdan, ceartachaidhean, no cuideachadh: seo an doras. Bidh sinn a’ leughadh a h-uile càil.'
          )}
        </p>

        {status === 'sent' ? (
          <div style={S.sent}>
            <p style={S.sentH}>{t('Thank you — message sent.', 'Tapadh leibh — chaidh an teachdaireachd a chur.')}</p>
            <p style={S.sentP}>{t("We'll be in touch.", 'Bidh sinn ann an conaltradh.')}</p>
          </div>
        ) : (
          <form onSubmit={submit} style={S.form}>
            {/* honeypot — visually hidden, bots fill it */}
            <input type="text" name="website" value={form.website} onChange={set('website')}
              tabIndex={-1} autoComplete="off" aria-hidden="true" style={S.hp} />

            <label style={S.label}>
              <span style={S.labelText}>{t('Name', 'Ainm')}</span>
              <input style={S.input} value={form.name} onChange={set('name')}
                placeholder={t('Your name', 'Ur n-ainm')} maxLength={120} />
            </label>

            <label style={S.label}>
              <span style={S.labelText}>{t('Email', 'Post-d')} *</span>
              <input style={S.input} type="email" required value={form.email} onChange={set('email')}
                placeholder={t('you@example.com', 'sibhse@eisimpleir.com')} maxLength={160} />
            </label>

            <label style={S.label}>
              <span style={S.labelText}>{t('Message', 'Teachdaireachd')} *</span>
              <textarea style={{ ...S.input, ...S.textarea }} required value={form.message}
                onChange={set('message')} rows={6} maxLength={5000}
                placeholder={t('How can we help?', 'Ciamar as urrainn dhuinn cuideachadh?')} />
            </label>

            {status === 'error' && <p style={S.err}>{error}</p>}

            <button type="submit" className="gc-send" style={S.send} disabled={status === 'sending'}>
              {status === 'sending' ? t('Sending…', 'A’ cur…') : t('Send', 'Cuir')}
            </button>
          </form>
        )}

        <p style={S.or}>
          {t('Or email us directly:', 'No cuir post-d thugainn:')}{' '}
          <a href={`mailto:${FEEDBACK_ADDR}`} style={S.mail}>{FEEDBACK_ADDR}</a>
        </p>
      </div>
    </main>
  );
}

const S = {
  main: { position: 'relative', minHeight: '100dvh', background: '#000', color: '#F2ECDC',
    padding: '96px 24px 64px', boxSizing: 'border-box' },
  home: { position: 'absolute', top: 26, right: 26, color: 'rgba(242,236,220,0.75)',
    textDecoration: 'none', fontFamily: 'var(--font-ibm-plex-sans), system-ui, sans-serif',
    fontSize: 14, letterSpacing: '0.02em', zIndex: 5 },
  wrap: { maxWidth: 560, margin: '0 auto' },
  h1: { fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif', color: '#fff',
    fontSize: 'clamp(44px, 9vw, 72px)', letterSpacing: '0.04em', textTransform: 'uppercase',
    margin: '0 0 20px', lineHeight: 0.95 },
  lede: { fontFamily: 'var(--font-ibm-plex-sans), system-ui, sans-serif', fontSize: 16,
    lineHeight: 1.7, color: 'rgba(242,236,220,0.85)', margin: '0 0 36px' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  label: { display: 'flex', flexDirection: 'column', gap: 7 },
  labelText: { fontFamily: 'var(--font-ibm-plex-sans), system-ui, sans-serif', fontSize: 12,
    letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(242,236,220,0.6)' },
  input: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(242,236,220,0.22)',
    borderRadius: 10, padding: '13px 15px', color: '#fff', fontSize: 15,
    fontFamily: 'var(--font-ibm-plex-sans), system-ui, sans-serif', outline: 'none' },
  textarea: { resize: 'vertical', minHeight: 130, lineHeight: 1.5 },
  hp: { position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 },
  send: { marginTop: 8, alignSelf: 'flex-start', background: '#FFFFFF', color: '#0A0D14',
    border: 'none', borderRadius: 999, padding: '13px 40px', cursor: 'pointer',
    fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
    fontSize: 20, letterSpacing: '0.08em', textTransform: 'uppercase',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)' },
  err: { color: '#ff9a8a', fontSize: 14, margin: 0, fontFamily: 'var(--font-ibm-plex-sans), system-ui, sans-serif' },
  sent: { padding: '28px 0' },
  sentH: { fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif', color: '#fff',
    fontSize: 28, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 8px' },
  sentP: { fontFamily: 'var(--font-ibm-plex-sans), system-ui, sans-serif', fontSize: 15,
    color: 'rgba(242,236,220,0.8)', margin: 0 },
  or: { marginTop: 34, fontSize: 14, color: 'rgba(242,236,220,0.6)',
    fontFamily: 'var(--font-ibm-plex-sans), system-ui, sans-serif' },
  mail: { color: '#fff', textDecoration: 'underline', textUnderlineOffset: 3 },
};

const CSS = `
  .gc-send:hover { transform: scale(1.03); transition: transform 200ms ease; }
  .gc-send:disabled { opacity: 0.6; cursor: default; }
  @media (max-width: 768px) { .gc-contact-pill { transform: scale(0.72); transform-origin: top left; } }
`;
