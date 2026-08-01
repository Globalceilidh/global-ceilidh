'use client';

// components/LetsTalk.js
// The global "Let's Talk" overlay — Contact AND About are the same surface.
// Mounted once in the root layout; it opens over ANY page (page blurs behind)
// when the "Let's Talk" pill is clicked. Rather than rewire the seven scattered
// pills, we intercept clicks on any `href="/contact"` link and open the overlay
// instead — the pills keep their href as a no-JS / crawlable fallback (the
// /contact route still renders on its own).
//
// Three panels, phantom.land style: Get Involved · About · Contact.
//   Get Involved / Contact → a short form → /api/contact (Resend), intent-tagged.
//   About                  → the who-we-are story, in-overlay.
//
// Gàidhlig copy is first-draft — wants Lewis/Joe before it's treated as final.

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';

const CONTACT_EMAIL = 'sruth_editors@globalceilidh.com';

const BEBAS = 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif';
const SANS = 'var(--font-ibm-plex-sans), system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';

export default function LetsTalk() {
  const { language } = useLanguage();
  const gd = language === 'gd';
  const t = (en, g) => (gd ? g : en);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('panels'); // panels | involved | contact | about

  useEffect(() => setMounted(true), []);
  const close = useCallback(() => { setOpen(false); setView('panels'); }, []);
  const show = useCallback((v = 'panels') => { setView(v); setOpen(true); }, []);

  // Upgrade every /contact pill into the overlay. Capture phase so we beat both
  // native anchors and Next <Link>.
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest?.('a[href="/contact"], a[href^="/contact?"], a[href^="/contact#"]');
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      show('panels');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [show]);

  // Esc closes; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, close]);

  if (!mounted || !open) return null;

  return createPortal(
    <div style={S.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <style>{`
        .gc-lt-card:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.3) !important; }
        .gc-lt-card:hover .gc-lt-arrow { border-color:#fff; }
        .gc-lt-send:hover { transform: scale(1.03); transition: transform 180ms ease; }
        .gc-lt-send:disabled { opacity: 0.6; cursor: default; }
      `}</style>
      <button style={S.close} onClick={close} aria-label={t('Close', 'Dùin')}>×</button>

      <div style={S.inner}>
        <p style={S.eyebrow}>○ {t("LET'S TALK", 'THIG, BRUIDHINN')}</p>

        {view === 'panels' && <Panels t={t} show={show} />}
        {(view === 'involved' || view === 'contact') && (
          <TalkForm intent={view} t={t} gd={gd} onBack={() => setView('panels')} />
        )}
        {view === 'about' && <About t={t} show={show} />}

        <div style={S.footer}>
          <a href="/privacy" style={S.footLink}>{t('Privacy', 'Prìobhaideachd')}</a>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── panels ────────────────────────────────────────────────────────────
function Panels({ t, show }) {
  return (
    <>
      <h2 style={S.h1}>{t('Fàilte — it’s good to meet you.', 'Fàilte — ’s math ur coinneachadh.')}</h2>
      <div style={S.grid}>
        <Card
          tag={t('GET INVOLVED', 'AN SÀS')}
          title={t('I’m interested in getting involved.', 'Tha ùidh agam a bhith an sàs.')}
          onClick={() => show('involved')}
        />
        <Card
          tag={t('ABOUT', 'MU AR DEIDHINN')}
          title={t('Who we are, and why.', 'Cò sinn, agus carson.')}
          onClick={() => show('about')}
        />
        <Card
          tag={t('CONTACT', 'FIOS THUGAINN')}
          title={t('Just saying hello.', 'Dìreach a’ cur fàilte.')}
          onClick={() => show('contact')}
        >
          <a href={`mailto:${CONTACT_EMAIL}`} style={S.chip} onClick={(e) => e.stopPropagation()}>
            <span style={S.chipTag}>{t('EMAIL', 'POST-D')}</span>
            <span style={S.chipVal}>{CONTACT_EMAIL}</span>
          </a>
        </Card>
      </div>
    </>
  );
}

function Card({ tag, title, onClick, children }) {
  return (
    <button style={S.card} onClick={onClick} className="gc-lt-card">
      <span style={S.cardTag}><span style={S.dot} />{tag}</span>
      <span style={S.cardTitle}>{title}</span>
      <div style={{ flex: 1 }} />
      {children || <span style={S.arrow} className="gc-lt-arrow" aria-hidden="true">→</span>}
    </button>
  );
}

// ── about ─────────────────────────────────────────────────────────────
// Roles are shown in English for now; Gàidhlig role copy wants Lewis/Joe.
// Bios are intentionally omitted until supplied — see the `bio` slot below.
const PEOPLE = [
  {
    name: 'Richard Hill', img: '/people/richard-hill.png',
    role: 'Founding Council Member · Contributing Editor · Gàidhlig & Cultural Advisor',
    epithet: 'An Lasair Gheal', gloss: 'The White Flame', bio: null,
  },
  {
    name: 'Lewis MacKinnon', img: '/people/lewis-mackinnon.png',
    role: 'Founding Council Member · Contributing Editor · Cultural Advisor',
    epithet: 'An Guth Beò', gloss: 'The Living Voice', bio: null,
  },
  {
    name: 'Scott Lewis White', img: '/people/scott-white.png',
    role: 'Founder · Creator · Executive Director',
    epithet: 'Fear an Taighe', gloss: 'The Host', bio: null,
  },
];

function About({ t, show }) {
  return (
    <div>
      <button style={S.back} onClick={() => show('panels')}>← {t('Back', 'Air ais')}</button>
      <h2 style={S.h2}>{t('Global Ceilidh', 'Global Ceilidh')}</h2>
      <div style={{ ...S.prose, maxWidth: 620 }}>
        <p>{t(
          'Global Ceilidh is the gathering place for the global Gàidhlig world — the language, the music, and the diaspora that carry them.',
          'Is e Global Ceilidh àite-cruinneachaidh do shaoghal na Gàidhlig air feadh an t-saoghail — an cànan, an ceòl, agus an sgapadh a tha gan giùlan.'
        )}</p>
        <p>{t(
          'The largest Gaelic community was never one place. It’s everyone, everywhere, at once — and now it has a home you can walk into from anywhere in the world.',
          'Cha b’ e aon àite a-riamh an coimhearsnachd Ghàidhlig as motha. ’S e a h-uile duine, anns gach àite, aig an aon àm — agus a-nis tha dachaigh aice as urrainn dhut tighinn a-steach thuice à àite sam bith air an t-saoghal.'
        )}</p>
        <p>{t(
          'Come in through Sruth for the news, the Radio for the sound of it, An Tonn for the music, An Saoghal to see the Gaelic world on the map, and the Ceilidh Rooms to sit with people — then make it your own on your Duilleag.',
          'Thig a-steach tro Sruth airson na naidheachdan, an Rèidio airson an fhuaim, An Tonn airson a’ chiùil, An Saoghal gus saoghal na Gàidhlig fhaicinn air a’ mhapa, agus na Seòmraichean Cèilidh gus suidhe còmhla ri daoine — an uair sin dèan agad fhèin e air an Duilleag agad.'
        )}</p>
      </div>
      <button style={S.textLink} onClick={() => show('involved')}>
        {t('Want to help build it? →', 'A bheil thu airson cuideachadh ga thogail? →')}
      </button>

      <h3 style={S.peopleHead}>{t('The people', 'Na Daoine')}</h3>
      <div style={S.peopleGrid}>
        {PEOPLE.map((p) => (
          <div key={p.name} style={S.person}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.img} alt={p.name} style={S.personImg} loading="lazy" />
            <span style={S.personName}>{p.name}</span>
            <span style={S.personEpithet}>{p.epithet}{p.gloss ? ` · ${p.gloss}` : ''}</span>
            <span style={S.personRole}>{p.role}</span>
            {p.bio && <p style={S.personBio}>{p.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── form (Get Involved / Contact) ──────────────────────────────────────
function TalkForm({ intent, t, gd, onBack }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus('sending'); setError('');
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, intent: intent === 'involved' ? 'Getting involved' : 'Contact' }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Could not send.');
      setStatus('sent');
    } catch (err) {
      setError(err.message || 'Could not send.');
      setStatus('error');
    }
  }

  const heading = intent === 'involved'
    ? t('Let’s build it together.', 'Togamaid còmhla e.')
    : t('Get in touch.', 'Cuir fios thugainn.');
  const intro = intent === 'involved'
    ? t('Speakers, learners, makers, teachers, technologists — there’s a place for you. Tell us how you’d like to help.',
        'Luchd-labhairt, luchd-ionnsachaidh, luchd-ciùird, tidsearan, luchd-teicneòlais — tha àite ann dhut. Innis dhuinn mar a bu mhath leat cuideachadh.')
    : t('Questions, ideas, corrections, or a hand needed — this is the door. We read everything.',
        'Ceistean, beachdan, ceartachaidhean, no cuideachadh a dhìth — seo an doras. Bidh sinn a’ leughadh a h-uile càil.');

  return (
    <div style={S.pane}>
      <button style={S.back} onClick={onBack}>← {t('Back', 'Air ais')}</button>
      <h2 style={S.h2}>{heading}</h2>

      {status === 'sent' ? (
        <div style={{ paddingTop: 8 }}>
          <p style={S.sentH}>{t('Thank you — message sent.', 'Tapadh leibh — chaidh a chur.')}</p>
          <p style={S.sentP}>{t('We’ll be in touch.', 'Bidh sinn ann an conaltradh.')}</p>
        </div>
      ) : (
        <form onSubmit={submit} style={S.form}>
          <p style={S.formIntro}>{intro}</p>
          <input type="text" name="website" value={form.website} onChange={set('website')}
            tabIndex={-1} autoComplete="off" aria-hidden="true" style={S.hp} />
          <label style={S.label}>
            <span style={S.labelText}>{t('Name', 'Ainm')}</span>
            <input style={S.input} value={form.name} onChange={set('name')} maxLength={120}
              placeholder={t('Your name', 'Ur n-ainm')} />
          </label>
          <label style={S.label}>
            <span style={S.labelText}>{t('Email', 'Post-d')} *</span>
            <input style={S.input} type="email" required value={form.email} onChange={set('email')} maxLength={160}
              placeholder={t('you@example.com', 'sibhse@eisimpleir.com')} />
          </label>
          <label style={S.label}>
            <span style={S.labelText}>{t('Message', 'Teachdaireachd')} *</span>
            <textarea style={{ ...S.input, ...S.textarea }} required value={form.message} onChange={set('message')}
              rows={5} maxLength={5000}
              placeholder={intent === 'involved'
                ? t('How would you like to get involved?', 'Ciamar a bu mhath leat a bhith an sàs?')
                : t('How can we help?', 'Ciamar as urrainn dhuinn cuideachadh?')} />
          </label>
          {status === 'error' && <p style={S.err}>{error}</p>}
          <button type="submit" style={S.send} disabled={status === 'sending'} className="gc-lt-send">
            {status === 'sending' ? t('Sending…', 'A’ cur…') : t('Send', 'Cuir')}
          </button>
        </form>
      )}
      <p style={S.or}>
        {t('Or email us directly:', 'No cuir post-d thugainn:')}{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} style={S.mail}>{CONTACT_EMAIL}</a>
      </p>
    </div>
  );
}

const S = {
  scrim: {
    position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto',
    background: 'rgba(6,8,12,0.72)',
    backdropFilter: 'blur(16px) saturate(120%)', WebkitBackdropFilter: 'blur(16px) saturate(120%)',
    color: '#F2ECDC',
  },
  close: {
    position: 'fixed', top: 22, right: 24, zIndex: 2, width: 52, height: 52, borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff', fontSize: 26, lineHeight: 1, cursor: 'pointer',
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
  },
  inner: { maxWidth: 1180, margin: '0 auto', padding: '84px 28px 48px', boxSizing: 'border-box' },
  eyebrow: { fontFamily: MONO, fontSize: 12, letterSpacing: '0.22em', color: 'rgba(242,236,220,0.6)', margin: '0 0 18px' },
  h1: {
    fontFamily: BEBAS, color: '#fff', fontSize: 'clamp(40px, 7vw, 76px)', lineHeight: 0.98,
    letterSpacing: '0.01em', margin: '0 0 40px', fontWeight: 400,
  },
  h2: { fontFamily: BEBAS, color: '#fff', fontSize: 'clamp(34px, 5vw, 54px)', letterSpacing: '0.02em', margin: '14px 0 18px', fontWeight: 400 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(258px, 1fr))', gap: 18 },
  card: {
    display: 'flex', flexDirection: 'column', textAlign: 'left', cursor: 'pointer',
    minHeight: 300, padding: '22px 22px 20px',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14,
    color: '#F2ECDC', transition: 'background 180ms ease, border-color 180ms ease',
  },
  cardTag: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', color: 'rgba(242,236,220,0.6)', marginBottom: 26 },
  dot: { width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'inline-block' },
  cardTitle: { fontFamily: SANS, fontSize: 22, lineHeight: 1.25, color: '#fff', fontWeight: 400 },
  arrow: {
    width: 46, height: 46, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff',
  },
  chip: {
    display: 'flex', flexDirection: 'column', gap: 2, textDecoration: 'none',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8, padding: '10px 12px', color: '#F2ECDC',
  },
  chipTag: { fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', color: 'rgba(242,236,220,0.55)' },
  chipVal: { fontFamily: SANS, fontSize: 13, color: '#fff' },

  pane: { maxWidth: 620 },
  back: { background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(242,236,220,0.7)', fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', padding: 0, marginBottom: 6 },
  prose: { fontFamily: SANS, fontSize: 16, lineHeight: 1.7, color: 'rgba(242,236,220,0.86)', display: 'flex', flexDirection: 'column', gap: 14 },
  textLink: { background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontFamily: SANS, fontSize: 15, textDecoration: 'underline', textUnderlineOffset: 3, padding: 0, marginTop: 22 },

  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  formIntro: { fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: 'rgba(242,236,220,0.75)', margin: '0 0 4px' },
  label: { display: 'flex', flexDirection: 'column', gap: 7 },
  labelText: { fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(242,236,220,0.6)' },
  input: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(242,236,220,0.22)', borderRadius: 10,
    padding: '13px 15px', color: '#fff', fontSize: 15, fontFamily: SANS, outline: 'none',
  },
  textarea: { resize: 'vertical', minHeight: 120, lineHeight: 1.5 },
  hp: { position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 },
  send: {
    marginTop: 6, alignSelf: 'flex-start', background: '#FFFFFF', color: '#0A0D14', border: 'none',
    borderRadius: 999, padding: '13px 40px', cursor: 'pointer', fontFamily: BEBAS, fontSize: 20,
    letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  },
  err: { color: '#ff9a8a', fontSize: 14, margin: 0, fontFamily: SANS },
  sentH: { fontFamily: BEBAS, color: '#fff', fontSize: 28, letterSpacing: '0.03em', textTransform: 'uppercase', margin: '0 0 8px' },
  sentP: { fontFamily: SANS, fontSize: 15, color: 'rgba(242,236,220,0.8)', margin: 0 },
  or: { marginTop: 28, fontSize: 14, color: 'rgba(242,236,220,0.6)', fontFamily: SANS },
  mail: { color: '#fff', textDecoration: 'underline', textUnderlineOffset: 3 },

  peopleHead: {
    fontFamily: MONO, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase',
    color: 'rgba(242,236,220,0.6)', margin: '48px 0 20px', paddingTop: 28,
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  peopleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 26, maxWidth: 900 },
  person: { display: 'flex', flexDirection: 'column' },
  // The figures are light-on-black art; 'screen' drops the black background
  // so they float on the overlay instead of sitting in a visible black box.
  // The three figure PNGs are pre-normalized to one canvas (equal body
  // height, shared feet baseline + head line, hat rising into the headroom),
  // so natural aspect renders them consistently. 'screen' drops the black bg.
  personImg: {
    width: '100%', height: 'auto', display: 'block',
    mixBlendMode: 'screen', marginBottom: 8,
  },
  personName: { fontFamily: SANS, fontSize: 17, fontWeight: 600, color: '#fff' },
  personEpithet: { fontFamily: '"EB Garamond", Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#C9A047', margin: '3px 0 8px' },
  personRole: { fontFamily: SANS, fontSize: 12.5, lineHeight: 1.5, color: 'rgba(242,236,220,0.6)' },
  personBio: { fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(242,236,220,0.82)', margin: '10px 0 0' },

  footer: { marginTop: 48, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' },
  footLink: { fontFamily: SANS, fontSize: 13, color: 'rgba(242,236,220,0.6)', textDecoration: 'underline', textUnderlineOffset: 3 },
};
