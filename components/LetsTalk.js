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
import ImageZoom from './ImageZoom';

const CONTACT_EMAIL = 'globalceilidh@gmail.com';

// Vision statement — final wording supplied by Whitey (EN + GD).
const VISION_EN =
  'We are a global Gaelic language and cultural learning community where everyone with an interest in Gaelic is welcome. We celebrate the language, culture, identity, and heritage of the Gaels while opening pathways for learners, speakers, descendants, communities, and friends of Gaelic to connect, participate, and belong. Together, we foster pride, shared stewardship, and a living commitment to champion Gaelic around the globe.';
const VISION_GD =
  '’S e coimhearsnachd ionnsachaidh Cruinneil na Gàidhlig is a cultuir a th’unnainn far a bheil fàilte ro’n a h-uile duine aig a bheil suim anns an t-saoghal Ghàidhealach. Tha sinn a’ cumail suas cànan, cultur, féin-aithne, agus dualchas nan Gàidheal fhad ’s a thathas a’ fosgladh shlighean gus luchd-ionnsachaidh, luchd-bruidhinn, sliochdan, coimhearsnachdan, is caraidean dha’n Ghàidhig a cheangal r’a chéile is iad a bhios r’am compàirteachadh, is a’ buntainn dh’a chèile. Bidh sinn ag àrachadh pròis, stiùbhartachd chompàirtichte, is sinne a tha an geall ri bhith ri fìor-bhrosnachadh an t-saoghail Ghàidhealaich air feadh na Cruinne.';

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
      <div style={{ ...S.prose, maxWidth: 620, margin: '0 0 34px' }}>
        <p>{t(
          'Global Ceilidh is the online gathering place for the Gaelic world — the culture, language, history, heritage and the people living it now, in order to ensure it continues on.',
          'Is e Global Ceilidh an t-àite-cruinneachaidh air-loidhne do shaoghal na Gàidhlig — an cultar, an cànan, an eachdraidh, an dualchas agus na daoine a tha ga bheò an-diugh, gus dèanamh cinnteach gun lean e air adhart.'
        )}</p>
        <p>{t(
          'The largest Gaelic community was never just one place. It has been on the move for centuries with stops here and there. Its numbers have swelled and ebbed, and we now find ourselves spread out all over the globe once again, yearning for a sense of community.',
          'Cha b’ e a-riamh dìreach aon àite a bh’ anns a’ choimhearsnachd Ghàidhlig as motha. Tha i air a bhith air imrich fad linntean, a’ stad an siud ’s an seo. Tha na h-àireamhan aice air at is air traoghadh, agus tha sinn a-nis sgapte air feadh na cruinne a-rithist, ag iarraidh mothachadh air coimhearsnachd.'
        )}</p>
        <p>{t(
          'Whatever has brought you to Global Ceilidh, we hope you feel welcome and at home, and that you’ve found what you’ve been searching for. If not, let us know what it is and we’ll help you bring it to life. This culture is yours, this language is yours, this life is yours… live it!',
          'Ge b’ e dè a thug gu Global Ceilidh thu, tha sinn an dòchas gum bi thu a’ faireachdainn fàilte is aig an taigh, agus gun do lorg thu na bha thu a’ sireadh. Mura do lorg, innis dhuinn dè a th’ ann agus cuidichidh sinn thu gus a thoirt beò. Is leatsa an cultar seo, is leatsa an cànan seo, is leatsa a’ bheatha seo… bi beò innte!'
        )}</p>
      </div>
      <div style={S.grid}>
        <Card
          tag={t('JOIN US', 'AN SÀS')}
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
    role: 'Founding Council Member · Contributing Editor · Gàidhlig Language & Cultural Advisor',
    epithet: 'An Ridire Bàn', gloss: 'The White Knight',
    bio: [
      'Some people find Gàidhlig by visiting the Hebrides. Gàidhlig found Richard in Wyoming.',
      'He began learning the language at seven years old from a Scottish immigrant who had made his way to the Rocky Mountains. In 1989, Richard found what he describes as his “new family” among the Gaels of Vancouver and Victoria. He has lived deeply within the language ever since — as an educator, a learner, and a tireless Ambassador of the Ghàidhealtachd.',
      'Richard is a founder of Slighe nan Gàidheal and Féis Seattle, an instructor with Colaisde na Gàidhlig, and a familiar voice within Seattle’s early-music scene.',
      'As a Founding Council Member, Contributing Editor and Gàidhlig and Cultural Advisor to Global Ceilidh, Richard brings knowledge without pretence, wisdom without solemnity and the firm belief that Gàidhlig belongs wherever people gather to speak it, sing it and pass it onward.',
      'The Gàidhlig language is not a relic to Richard. He lives it and carries it into every room and invites everyone else to join in.',
    ],
  },
  {
    name: 'Lewis “Lodaidh” MacKinnon', img: '/people/lewis-mackinnon.png',
    role: 'Founding Council Member · Contributing Editor · Gàidhlig Language & Cultural Advisor',
    epithet: 'An Guth Beò', gloss: 'The Living Voice',
    bio: [
      'Most people inherit one language and heritage. Lewis MacKinnon inherited three.',
      'Born in Inverness, Cape Breton, and raised in Antigonish County, Lodaidh is the son of a Gaelic-speaking Gael and an Acadian French-speaking mother. That meeting of languages, identities and traditions has shaped a life spent building connections rather than borders.',
      'He is a Gaelic speaker, singer, musician and published poet. In 2011, Lodaidh received the Scottish Bardic Crown, becoming the first official Bard of the Royal National Mòd born outside Scotland. He has released albums in both Gaelic and English, published four bilingual collections of Gaelic poetry and serves as Executive Director of Gaelic Affairs for the Province of Nova Scotia.',
      'As a Founding Council Member, Contributing Editor and Cultural Advisor to Global Ceilidh, Lodaidh brings the strength of a tradition firmly planted — and the generosity to share it freely.',
      'For him, culture is not something inherited and quietly preserved. It is something spoken, sung, questioned, renewed and handed onward.',
    ],
  },
  {
    name: 'Scott Lewis White', img: '/people/scott-white.png',
    role: 'Founder · Creator · Executive Director',
    epithet: 'Fear an Taighe', gloss: 'The Host',
    bio: [
      'Scott Lewis White is a self-described imagineologist — chronically sleep-deprived, and the person who asked the question the rest of Global Ceilidh is an answer to: what if the whole Gaelic world had one home you could walk into from anywhere?',
      'He is the founder, creator and executive director of Global Ceilidh — the one who imagined it, built it, and stayed up far too late making it real. Nearly every room, wing and stray idea that became a feature began as something he simply couldn’t stop thinking about.',
      'As Founder, Creator and Executive Director, Scott brings the conviction that a living culture needs a gathering more than a museum — and the stubbornness to build the place where the gathering can happen.',
      'Fear an Taighe — the man of the house. He didn’t come to keep the tradition behind glass. He came to open the door, put the kettle on, and make sure everyone who arrives feels like they were expected.',
    ],
  },
];

function About({ t, show }) {
  return (
    <div>
      <button style={S.back} onClick={() => show('panels')}>← {t('Back', 'Air ais')}</button>
      <h2 style={S.h2}>{t('Who we are, and why we’re here…', 'Cò sinn, agus carson a tha sinn an seo…')}</h2>
      <div style={{ ...S.vision, maxWidth: 620 }}>
        <span style={S.visionLabel}>{t('Our Vision', 'Ar n-Aithris-Rùin')}</span>
        <p style={S.visionText}>{t(VISION_EN, VISION_GD)}</p>
      </div>
      <button style={S.textLink} onClick={() => show('involved')}>
        {t('Want to help build it? →', 'A bheil thu airson cuideachadh ga thogail? →')}
      </button>

      <h3 style={S.peopleHead}>{t('The people', 'Na Daoine')}</h3>
      <div style={S.peopleStack}>
        {PEOPLE.map((p) => (
          <div key={p.name} style={S.personRow}>
            <div style={S.personFigure}>
              <ImageZoom src={p.img} alt={p.name} title={p.name} imgStyle={{ mixBlendMode: 'screen', boxShadow: 'none' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={p.name} style={S.personImg} loading="lazy" />
              </ImageZoom>
            </div>
            <div style={S.personInfo}>
              <span style={S.personName}>{p.name}</span>
              <span style={S.personEpithet}>{p.epithet}{p.gloss ? ` · ${p.gloss}` : ''}</span>
              <span style={S.personRole}>{p.role}</span>
              {p.bio && p.bio.map((para, i) => <p key={i} style={S.personBio}>{para}</p>)}
            </div>
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

  vision: { margin: '-8px 0 34px', padding: '20px 24px', borderLeft: '3px solid #C9A047',
    background: 'rgba(201,160,71,0.06)', borderRadius: '0 12px 12px 0', maxWidth: 720 },
  visionLabel: { display: 'block', fontFamily: BEBAS, color: '#C9A047', fontSize: 17,
    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 },
  visionText: { fontFamily: SANS, fontSize: 16.5, lineHeight: 1.7, color: 'rgba(242,236,220,0.9)', margin: 0 },

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
  peopleStack: { display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 840 },
  personRow: { display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' },
  personFigure: { width: 168, flexShrink: 0 },
  personInfo: { flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column' },
  // The three figure PNGs are pre-normalized to one canvas (equal body
  // height, shared feet baseline + head line, hat rising into the headroom),
  // so natural aspect renders them consistently. 'screen' drops the black bg.
  personImg: {
    width: '100%', height: 'auto', display: 'block',
    mixBlendMode: 'screen',
  },
  personName: { fontFamily: SANS, fontSize: 19, fontWeight: 600, color: '#fff' },
  personEpithet: { fontFamily: '"EB Garamond", Georgia, serif', fontStyle: 'italic', fontSize: 16, color: '#C9A047', margin: '4px 0 6px' },
  personRole: { fontFamily: SANS, fontSize: 12.5, lineHeight: 1.5, color: 'rgba(242,236,220,0.6)' },
  personBio: { fontFamily: SANS, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(242,236,220,0.85)', margin: '14px 0 0' },

  footer: { marginTop: 48, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' },
  footLink: { fontFamily: SANS, fontSize: 13, color: 'rgba(242,236,220,0.6)', textDecoration: 'underline', textUnderlineOffset: 3 },
};
