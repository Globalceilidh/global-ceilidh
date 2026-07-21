'use client';

// SruthMain — the news mothership. The Oz colour payoff: the site outside
// (/, /saoghal) is black-and-white; here the current runs in colour.
//
// Layout (hybrid model, per Scott 2026-07-20):
//   • An-diugh  — top stories from sruth_website_queue (aggregated) plus
//                 first-party GC originals (origin='original', gold-badged).
//   • An Tonn   — a snippet of the Sruth music charts; full version /AnTonn/ceol.
//   • Bhon t-Sruth — the same section types the newsletter editor uses,
//                 rendered by an extensible registry (add a renderer to add a
//                 section type — every Sruth-editor option can live here).
//   • Archive   — real past issues (sruth_newsletters.html_archive).
//   • Portal    — signup ("land in the current").
//
// Colours are a token system (swap a hex, the page follows). Type uses the
// site's real brand fonts via CSS vars. Gàidhlig strings here are drafts —
// they need the Lewis/Joe stamp before this ships to the public.

import { useState } from 'react';
import LanguagePill from '../../components/LanguagePill';
import { useLanguage } from '../../context/LanguageContext';

// Bilingual pick: prefer the active language, fall back to the other.
const useL = () => {
  const { language } = useLanguage();
  return (en, gd) => (language === 'gd' && gd ? gd : (en || gd || ''));
};

// Category → coordinated accent. News-teal and An-Tonn-teal are the same
// "channel" so the page reads as one system rather than a pile of colours.
const CAT = {
  news:      { c: 'var(--teal)',   en: 'News',      gd: 'Naidheachdan' },
  events:    { c: 'var(--coral)',  en: 'Events',    gd: 'Tachartasan' },
  community: { c: 'var(--violet)', en: 'Community', gd: 'Coimhearsnachd' },
  language:  { c: 'var(--gold)',   en: 'Language',  gd: 'Cànan' },
  music:     { c: 'var(--coral)',  en: 'Music',     gd: 'Ceòl' },
  history:   { c: 'var(--gold)',   en: 'History',   gd: 'Eachdraidh' },
  sport:     { c: 'var(--teal)',   en: 'Sport',     gd: 'Spòrs' },
  food:      { c: 'var(--green)',  en: 'Food',      gd: 'Biadh' },
  arts:      { c: 'var(--violet)', en: 'Arts',      gd: 'Ealain' },
  diaspora:  { c: 'var(--violet)', en: 'Diaspora',  gd: 'Diaspora' },
};
const catOf = (k) => CAT[k] || CAT.news;

function timeAgo(iso, gd) {
  if (!iso) return '';
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const h = Math.floor(s / 3600), d = Math.floor(s / 86400);
  if (d >= 1) return gd ? `${d} là` : `${d}d ago`;
  if (h >= 1) return gd ? `${h} uair` : `${h}h ago`;
  const m = Math.floor(s / 60);
  return gd ? `${Math.max(1, m)} mion` : `${Math.max(1, m)}m ago`;
}

// ── An Tonn snippet (placeholder data — wires to the real chart source
// later; the full four-chart version lives on /AnTonn/ceol). ────────────
const TRAD_ROCK = [
  ['Tide Lines', 'up', 12], ['Skerryvore', 'down', 18], ['Skipinnish', 'up', 9],
  ['Mànran', 'up', 6], ['Runrig', 'down', 22], ['Peat & Diesel', 'up', 8],
  ['Trail West', 'hold', 15],
];
const MOVING = [
  ['var(--teal)', 34, 'Trad-Rock'], ['var(--green)', 28, 'Acoustic & Folk'],
  ['var(--coral)', 19, 'Modern & Electronic'], ['var(--gold)', 11, 'Gaelic Song'],
  ['var(--violet)', 8, 'Heavy / Metal'],
];
const TREND = { up: ['▲', 'up'], down: ['▼', 'down'], hold: ['~', 'hold'], new: ['★', 'new'] };

// ── Section registry (the "every editor option" hook) ───────────────────
// Each newsletter section type maps to a web renderer. Adding an editor
// section == adding an entry here. Seeded with a demo spine; a
// mapIssueSections(sections_config) adapter will feed real issue data next.
function ModuleShell({ accent, label, children }) {
  return (
    <div className="mod" style={{ '--m': accent }}>
      <div className="l">{label}</div>
      {children}
    </div>
  );
}
const SECTION_RENDERERS = {
  facal_an_la: ({ L, d }) => (
    <ModuleShell accent="var(--gold)" label={L('Facal an Là · Word of the day', 'Facal an Là')}>
      <h4>{d.word}</h4>
      <div className="gd">{d.ipa}</div>
      <p>{L(d.en, d.gd)}</p>
    </ModuleShell>
  ),
  oran: ({ L, d }) => (
    <ModuleShell accent="var(--coral)" label={L('Òran na Seachdain · Song of the week', 'Òran na Seachdain')}>
      <h4>{d.title}</h4>
      <div className="gd">{d.artist}</div>
      <p>{L(d.en, d.gd)}</p>
    </ModuleShell>
  ),
  diaspora: ({ L, d }) => (
    <ModuleShell accent="var(--teal)" label={L('Diaspora · A letter from afar', 'Diaspora · Litir à cèin')}>
      <h4>{L(d.titleEn, d.titleGd)}</h4>
      <div className="gd">{d.place}</div>
      <p>{L(d.en, d.gd)}</p>
    </ModuleShell>
  ),
};
const SPINE = [
  { type: 'facal_an_la', d: { word: 'sruth', ipa: '/ˈs̪t̪ɾu/ · noun',
    en: 'A current, a stream, a flow of water — and the name we give the daily tide of Gàidhlig that carries you along.',
    gd: 'Sruth-uisge — agus an t-ainm a bheir sinn air an làn Gàidhlig a ghiùlaineas thu leis gach latha.' } },
  { type: 'oran', d: { title: 'An Ataireachd Àrd', artist: 'Julie Fowlis',
    en: 'The eternal surge of the sea against Uist — a lament for the emptied townships. Play it and read the full translation.',
    gd: 'Ataireachd bhuan na mara ri Uibhist — cumha do na bailtean a chaidh fhalamhachadh.' } },
  { type: 'diaspora', d: { titleEn: 'A letter from Waipu', titleGd: 'Litir à Waipu', place: 'New Zealand · Northland',
    en: 'Descendants of the Nova Scotia Highlanders mark 170 years since the migration ships — in Gàidhlig, still.',
    gd: 'Sliochd Ghàidheil na h-Albann Nuaidh a’ comharrachadh 170 bliadhna — sa Ghàidhlig fhathast.' } },
];

export default function SruthMain({ news = [], issues = [] }) {
  const L = useL();
  const { language } = useLanguage();
  const gd = language === 'gd';

  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState('idle');

  async function subscribe(e) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch { setStatus('error'); }
  }

  const lead = news[0] || null;
  const rest = news.slice(1, 5);
  const monthsGd = ['Faoi', 'Gearr', 'Màrt', 'Gibl', 'Cèit', 'Ògmh', 'Iuch', 'Lùna', 'Sult', 'Dàmh', 'Samh', 'Dùbh'];
  const issueLine = (iso) => {
    if (!iso) return '';
    const dt = new Date(iso);
    return `${dt.getDate()} ${(gd ? monthsGd : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])[dt.getMonth()]}`.toUpperCase();
  };
  const today = new Date();
  const dateLine = `${['Diluain','Dimàirt','Diciadain','Diardaoin','Dihaoine','Disathairne','Didòmhnaich'][ (today.getDay()+6)%7 ]} · ${today.getDate()} ${monthsGd[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <div className="sruth-bg">
      <div className="sruth">

        {/* ── MASTHEAD ─────────────────────────────────────── */}
        <header className="mast">
          <div className="mast-left">
            <svg className="knot" viewBox="0 0 52 52" fill="none" aria-hidden="true">
              <circle cx="26" cy="26" r="24" stroke="#C9932A" strokeWidth="1.5" opacity=".5" />
              <path d="M6 32 C 14 20, 20 20, 26 30 S 38 40, 46 28" stroke="#E4B23C" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <path d="M6 24 C 14 12, 20 12, 26 22 S 38 32, 46 20" stroke="#2FC0CE" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".9" />
              <path d="M6 40 C 14 30, 20 30, 26 38 S 38 46, 46 36" stroke="#E4B23C" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".6" />
            </svg>
            <div>
              <div className="wordmark">s<span className="u">ru</span>th<span style={{ color: 'var(--gold)' }}>.</span></div>
              <p className="tagline">{L('The daily current of Gàidhlig news, culture & community.', 'An sruth làitheil de naidheachdan, cultar is coimhearsnachd na Gàidhlig.')}</p>
            </div>
          </div>
          <div className="mast-right">
            <LanguagePill position="inline" variant="dark" />
            <span className="datechip">{dateLine}</span>
            <span className="issue-tag">{L('THE DAILY CURRENT', 'AN SRUTH LÀITHEIL')}</span>
          </div>
        </header>
        <div className="current" />

        {/* ── AN-DIUGH · TODAY ─────────────────────────────── */}
        <div className="sec">
          <span className="accent" style={{ background: 'var(--teal)' }} />
          <h2>{gd ? 'An-diugh' : 'Today'}</h2>
          <span className="gd">{L('The top of the current', 'Bàrr an t-srutha')}</span>
          <a className="more" href="/news">{L('All news →', 'Gach naidheachd →')}</a>
        </div>

        {lead ? (
          <section className="news">
            <a className="lead" href={`/news/${lead.slug}`} target="_blank" rel="noopener noreferrer">
              <div className="ph" style={lead.image_url ? { backgroundImage: `url("${lead.image_url}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
              <div className="body">
                {lead.origin === 'original'
                  ? <div className="orig">{L('◆ A Sruth Original', '◆ Ùr-sgeul le Sruth')}{lead.byline ? ` · ${lead.byline}` : ''}</div>
                  : <div className="kicker">{gd ? (lead.title_gd || '') : (lead.title_en ? '' : (lead.title_gd || ''))}</div>}
                <h3>{L(lead.title_en, lead.title_gd)}</h3>
                {(lead.body_en || lead.body_gd) && <p>{L(lead.body_en, lead.body_gd)}</p>}
                <div className="meta">{[lead.source_name, timeAgo(lead.published_at, gd), catOf(lead.category)[gd ? 'gd' : 'en']].filter(Boolean).join(' · ').toUpperCase()}</div>
              </div>
            </a>

            <div className="stack">
              {rest.map((it) => {
                const cat = catOf(it.category);
                const orig = it.origin === 'original';
                return (
                  <a className="story" key={it.id} href={`/news/${it.slug}`} target="_blank" rel="noopener noreferrer">
                    <div className="rail" style={{ background: orig ? 'var(--gold)' : cat.c }} />
                    <div className="txt">
                      <h4>{L(it.title_en, it.title_gd)}</h4>
                      {it.title_gd && it.title_en && <div className="gd">{gd ? it.title_en : it.title_gd}</div>}
                      <div className="row">
                        <span className="chip" style={{ color: orig ? 'var(--gold)' : cat.c }}>{orig ? L('Original', 'Ùr-sgeul') : cat[gd ? 'gd' : 'en']}</span>
                        <span className="src">{[it.source_name, timeAgo(it.published_at, gd)].filter(Boolean).join(' · ').toUpperCase()}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ) : (
          <p className="empty">{L('The current is gathering. Check back shortly.', 'Tha an sruth a’ cruinneachadh. Till a-rithist a dh’aithghearr.')}</p>
        )}

        {/* ── AN TONN · THE COLOUR BURST ───────────────────── */}
        <div className="sec">
          <span className="accent" style={{ background: 'var(--coral)' }} />
          <h2>An Tonn</h2>
          <span className="gd">{L('The music charts · this week', 'Na clàran-ciùil · an t-seachdain seo')}</span>
          <a className="more" href="/AnTonn/ceol">{L('Full charts →', 'Na clàran gu lèir →')}</a>
        </div>

        <section className="antonn">
          <div className="top">
            <div className="brand"><b>AN TONN</b><span>{L('The Sruth Music Charts', 'Clàran-ciùil an t-Srutha')}</span></div>
            <span className="wk">{L('Week ending', 'Seachdain gu')} · {today.getDate()} {monthsGd[today.getMonth()]} {today.getFullYear()}</span>
          </div>
          <div className="grid">
            <div className="chart">
              <div className="ct"><span className="w" style={{ background: 'var(--teal)' }} /><b>Trad-Rock 10</b></div>
              {TRAD_ROCK.map(([artist, tr, wk], i) => {
                const [glyph, cls] = TREND[tr];
                return (
                  <div className="trow" key={artist}>
                    <span className="r">{i + 1}</span><span className="a">{artist}</span>
                    <span className={`t ${cls}`}>{glyph}</span><span className="wks">{wk}</span>
                  </div>
                );
              })}
            </div>
            <div className="moving">
              <div className="h">{L('Where the current is moving', 'Càit a bheil an sruth a’ dol')}</div>
              <div className="bar">{MOVING.map(([c, w]) => <span key={c} style={{ width: `${w}%`, background: c }} />)}</div>
              {MOVING.map(([c, w, label]) => (
                <div className="mstat" key={label}><span className="sw" style={{ background: c }} /><b>{w}%</b><span>{label}</span></div>
              ))}
            </div>
          </div>
          <div className="foot">
            <div className="legend">
              <span><b className="up">▲</b> {L('Cresting', 'A’ briseadh')}</span>
              <span><b className="hold">~</b> {L('Holding', 'A’ cumail')}</span>
              <span><b className="down">▼</b> {L('Falling', 'A’ tuiteam')}</span>
              <span><b className="new">★</b> {L('New', 'Ùr')}</span>
            </div>
            <a className="btn" href="/AnTonn/ceol">{L('See all four charts →', 'Na ceithir clàran →')}</a>
          </div>
        </section>

        {/* ── BHON T-SRUTH · the email spine, in colour ──────── */}
        <div className="sec">
          <span className="accent" style={{ background: 'var(--gold)' }} />
          <h2>{gd ? 'Bhon t-Sruth' : 'From the Sruth'}</h2>
          <span className="gd">{L('The same sections as the email — in colour', 'Na h-aon roinnean ’s a tha sa phost-d — ann an dath')}</span>
        </div>
        <section className="spine">
          {SPINE.map((s, i) => {
            const R = SECTION_RENDERERS[s.type];
            return R ? <R key={i} L={L} d={s.d} /> : null;
          })}
        </section>

        {/* ── ARCHIVE ─────────────────────────────────────── */}
        <div className="sec">
          <span className="accent" style={{ background: 'var(--violet)' }} />
          <h2>{gd ? 'Na seann àireamhan' : 'Past issues'}</h2>
          <span className="gd">{L('The archive', 'An tasglann')}</span>
          <a className="more" href="/sruth/archive">{L('Full archive →', 'An tasglann gu lèir →')}</a>
        </div>
        {issues.length > 0 ? (
          <section className="arch">
            {issues.slice(0, 8).map((is) => (
              <a className="iss" key={is.slug} href={`/sruth/archive/${is.slug}`}>
                <div className="n">Nº{String(is.number).padStart(2, '0')}</div>
                <div className="d">{issueLine(is.sentAt)}</div>
              </a>
            ))}
          </section>
        ) : (
          <p className="empty">{L('The archive fills as issues are sent.', 'Lìonaidh an tasglann mar a thèid àireamhan a-mach.')}</p>
        )}

        {/* ── SIGNUP PORTAL ────────────────────────────────── */}
        <section className="portal">
          <h3>{L('Get the current in your inbox, every morning.', 'Faigh an sruth nad bhogsa a-steach, gach madainn.')}</h3>
          <p className="gd">{L('Free. No noise — just the current, daily.', 'Saor an-asgaidh. Gun fhuaim — dìreach an sruth, gach latha.')}</p>
          {status === 'success' ? (
            <p className="ok">{L('You’re in the current. Watch your inbox.', 'Tha thu san t-sruth. Cùm sùil air do bhogsa.')}</p>
          ) : (
            <form className="subs" onSubmit={subscribe}>
              <input type="text" name="website" tabIndex="-1" autoComplete="off" value={website}
                onChange={(e) => setWebsite(e.target.value)} aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required aria-label={L('Email address', 'Seòladh puist-d')} />
              <button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? '…' : <>{L('Join the', 'Gabh an')} s<span style={{ textDecoration: 'underline' }}>ru</span>th.</>}
              </button>
            </form>
          )}
          {status === 'error' && <p className="err">{L('Something went wrong — try again.', 'Chaidh rudeigin ceàrr — feuch a-rithist.')}</p>}
          <div className="fine">GlobalCeilidh.com</div>
        </section>

        <footer className="foot-bar">
          <div className="b">{L('Tìr nan Gàidheal · Everywhere.', 'Tìr nan Gàidheal · Anns gach àite.')}</div>
        </footer>

      </div>
      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.sruth-bg{
  --ground:#0A1420; --ground-2:#0F1D2B; --ground-3:#12212F; --line:#22384A;
  --ink:#F3ECDD; --ink-2:#AEC2CE; --ink-3:#7C93A2;
  --gold:#E4B23C; --gold-deep:#C9932A; --teal:#2FC0CE; --green:#4CB25C;
  --coral:#F0803C; --violet:#9A7BEA;
  --serif:var(--font-eb-garamond),Georgia,serif;
  --sans:var(--font-ibm-plex-sans),system-ui,sans-serif;
  --mono:'IBM Plex Mono',var(--font-ibm-plex-sans),ui-monospace,Menlo,monospace;
  --disp:var(--font-bebas-neue),Impact,'Arial Narrow',sans-serif;
  min-height:100vh; width:100%;
  background:
    radial-gradient(1200px 520px at 78% -8%, rgba(47,192,206,0.10), transparent 60%),
    radial-gradient(900px 500px at 8% 4%, rgba(228,178,60,0.07), transparent 55%),
    var(--ground);
  color:var(--ink); font-family:var(--sans); line-height:1.5;
}
.sruth{ max-width:1180px; margin:0 auto; padding:clamp(14px,3vw,34px); }
.sruth *{ box-sizing:border-box; }
.sruth ::selection{ background:rgba(47,192,206,0.30); }
.sruth a{ color:inherit; text-decoration:none; }
.sruth .eyebrow{ font-family:var(--mono); font-size:11px; letter-spacing:.24em; text-transform:uppercase; color:var(--ink-3); }
.sruth .chip{ font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; padding:3px 8px; border-radius:2px; border:1px solid currentColor; white-space:nowrap; }
.sruth .empty{ font-family:var(--serif); font-style:italic; color:var(--ink-3); font-size:16px; padding:10px 2px; }

.mast{ display:flex; align-items:flex-end; justify-content:space-between; gap:20px; flex-wrap:wrap; padding-bottom:14px; }
.mast-left{ display:flex; align-items:center; gap:16px; }
.knot{ width:52px; height:52px; flex:0 0 auto; }
.wordmark{ font-family:var(--serif); font-style:italic; font-weight:700; font-size:clamp(46px,8vw,84px); line-height:.86; letter-spacing:-.01em; color:var(--ink); position:relative; }
.wordmark .u{ text-decoration:underline; text-decoration-thickness:.06em; text-underline-offset:.08em; text-decoration-color:var(--gold); }
.tagline{ font-family:var(--serif); font-style:italic; color:var(--ink-2); font-size:clamp(13px,1.5vw,16px); margin-top:10px; max-width:34ch; }
.mast-right{ display:flex; flex-direction:column; align-items:flex-end; gap:10px; }
.datechip{ font-family:var(--mono); font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--gold); }
.issue-tag{ font-family:var(--disp); font-size:15px; letter-spacing:.16em; color:var(--ink-3); }

.current{ height:2px; margin:6px 0 26px; border-radius:2px;
  background:linear-gradient(90deg,var(--gold) 0%,var(--teal) 34%,var(--green) 58%,var(--coral) 78%,var(--violet) 100%);
  background-size:220% 100%; animation:sruthflow 9s linear infinite; opacity:.85; }
@keyframes sruthflow{ to{ background-position:220% 0; } }

.sec{ margin:34px 0 16px; display:flex; align-items:baseline; gap:14px; flex-wrap:wrap; }
.sec h2{ font-family:var(--disp); font-weight:400; letter-spacing:.04em; font-size:clamp(22px,3.4vw,30px); margin:0; color:var(--ink); text-transform:uppercase; }
.sec .gd{ font-family:var(--serif); font-style:italic; color:var(--ink-3); font-size:15px; }
.sec .accent{ width:34px; height:3px; border-radius:2px; align-self:center; }
.sec .more{ margin-left:auto; font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--teal); }

.news{ display:grid; grid-template-columns:1.35fr 1fr; gap:22px; }
.lead{ position:relative; overflow:hidden; border-radius:10px; border:1px solid var(--line); background:var(--ground-2); display:flex; flex-direction:column; transition:transform .2s ease, border-color .2s ease; }
.lead:hover{ transform:translateY(-2px); border-color:var(--teal); }
.lead .ph{ aspect-ratio:16/9; background:linear-gradient(120deg,#123043,#0c1b28 60%),radial-gradient(420px 200px at 70% 20%, rgba(47,192,206,0.28), transparent 60%); }
.lead .body{ padding:18px 20px 20px; display:flex; flex-direction:column; gap:9px; }
.lead .kicker{ font-family:var(--serif); font-style:italic; color:var(--teal); font-size:14px; }
.lead .orig{ font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--gold); }
.lead h3{ font-family:var(--serif); font-weight:700; font-size:clamp(21px,2.8vw,29px); line-height:1.15; margin:0; color:var(--ink); text-wrap:balance; }
.lead p{ margin:0; color:var(--ink-2); font-size:15px; max-width:52ch; }
.lead .meta{ font-family:var(--mono); font-size:11px; letter-spacing:.08em; color:var(--ink-3); margin-top:2px; }

.stack{ display:flex; flex-direction:column; }
.story{ display:flex; gap:14px; padding:15px 2px; border-top:1px solid var(--line); transition:transform .18s ease; }
.story:first-child{ border-top:0; padding-top:0; }
.story:hover{ transform:translateX(3px); }
.story .rail{ width:3px; border-radius:2px; flex:0 0 auto; }
.story .txt{ display:flex; flex-direction:column; gap:6px; }
.story h4{ margin:0; font-family:var(--serif); font-weight:700; font-size:17px; line-height:1.22; color:var(--ink); }
.story .gd{ font-family:var(--serif); font-style:italic; color:var(--ink-3); font-size:13px; }
.story .row{ display:flex; align-items:center; gap:10px; margin-top:2px; flex-wrap:wrap; }
.story .src{ font-family:var(--mono); font-size:10.5px; letter-spacing:.06em; color:var(--ink-3); }

.antonn{ margin-top:14px; background:linear-gradient(180deg,#0b1a29,#0a1420); border:1px solid #1d3b4d; border-radius:12px; overflow:hidden; }
.antonn .top{ display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding:18px 22px; border-bottom:1px solid #16303f; background:radial-gradient(600px 160px at 88% -20%, rgba(47,192,206,0.16), transparent); }
.antonn .brand{ display:flex; align-items:baseline; gap:12px; }
.antonn .brand b{ font-family:var(--disp); font-size:34px; letter-spacing:.06em; color:var(--ink); font-weight:400; }
.antonn .brand span{ font-family:var(--mono); font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--teal); }
.antonn .wk{ font-family:var(--mono); font-size:11px; letter-spacing:.12em; color:var(--gold); text-transform:uppercase; }
.antonn .grid{ display:grid; grid-template-columns:1.15fr .85fr; }
.chart{ padding:16px 22px; }
.chart .ct{ display:flex; align-items:center; gap:9px; margin-bottom:10px; }
.chart .ct b{ font-family:var(--disp); font-size:19px; letter-spacing:.05em; font-weight:400; }
.chart .ct .w{ width:10px; height:10px; border-radius:50%; }
.trow{ display:grid; grid-template-columns:20px 1fr auto auto; gap:12px; align-items:center; padding:7px 0; border-top:1px solid #17303f; }
.trow:first-of-type{ border-top:0; }
.trow .r{ font-family:var(--disp); font-size:18px; color:var(--ink-3); text-align:right; }
.trow .a{ font-family:var(--sans); font-size:14px; color:var(--ink); }
.trow .t{ font-family:var(--mono); font-size:14px; width:20px; text-align:center; }
.trow .wks{ font-family:var(--mono); font-size:12px; color:var(--ink-3); font-variant-numeric:tabular-nums; }
.up{ color:var(--green); } .down{ color:#E5644B; } .hold{ color:var(--ink-3); } .new{ color:var(--gold); }
.moving{ padding:16px 22px; border-left:1px solid #16303f; background:rgba(255,255,255,0.015); }
.moving .h{ font-family:var(--serif); font-style:italic; color:var(--ink); font-size:16px; margin-bottom:12px; }
.bar{ display:flex; height:12px; border-radius:6px; overflow:hidden; margin-bottom:12px; }
.mstat{ display:flex; align-items:center; gap:9px; padding:5px 0; font-size:13px; }
.mstat .sw{ width:9px; height:9px; border-radius:2px; }
.mstat b{ font-family:var(--mono); font-variant-numeric:tabular-nums; color:var(--ink); min-width:34px; }
.mstat span{ color:var(--ink-2); }
.antonn .foot{ display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; padding:14px 22px; border-top:1px solid #16303f; }
.legend{ display:flex; gap:16px; flex-wrap:wrap; font-family:var(--mono); font-size:11px; color:var(--ink-3); }
.legend b{ font-weight:400; }
.btn{ display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; padding:9px 15px; border-radius:999px; border:1px solid var(--teal); color:var(--teal); transition:background .18s,color .18s; }
.btn:hover{ background:var(--teal); color:var(--ground); }

.spine{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.mod{ padding:16px 18px; border-radius:8px; border:1px solid var(--line); background:var(--ground-3); border-top:3px solid var(--m,var(--gold)); }
.mod .l{ font-family:var(--mono); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--m,var(--gold)); }
.mod h4{ margin:8px 0 6px; font-family:var(--serif); font-weight:700; font-size:19px; color:var(--ink); }
.mod .gd{ font-family:var(--serif); font-style:italic; color:var(--ink-3); font-size:13px; }
.mod p{ margin:8px 0 0; color:var(--ink-2); font-size:14px; }

.arch{ display:flex; gap:12px; overflow-x:auto; padding:4px 2px 10px; }
.iss{ flex:0 0 auto; width:150px; padding:14px; border-radius:8px; border:1px solid var(--line); background:linear-gradient(180deg,var(--ground-2),var(--ground-3)); transition:border-color .18s ease; }
.iss:hover{ border-color:var(--gold); }
.iss .n{ font-family:var(--disp); font-size:30px; letter-spacing:.05em; color:var(--gold); }
.iss .d{ font-family:var(--mono); font-size:11px; color:var(--ink-3); margin-top:3px; }

.portal{ margin-top:34px; border-radius:14px; padding:30px clamp(20px,4vw,40px); border:1px solid #1d3b4d; position:relative; overflow:hidden;
  background:radial-gradient(700px 300px at 12% 120%, rgba(47,192,206,0.18), transparent 60%),radial-gradient(600px 300px at 92% -40%, rgba(228,178,60,0.16), transparent 60%),linear-gradient(180deg,#0c1d2c,#0a1622); }
.portal h3{ font-family:var(--serif); font-weight:700; font-size:clamp(22px,3.2vw,30px); margin:0 0 6px; color:var(--ink); text-wrap:balance; }
.portal .gd{ font-family:var(--serif); font-style:italic; color:var(--gold); font-size:16px; margin:0 0 18px; }
.subs{ display:flex; gap:10px; flex-wrap:wrap; max-width:520px; position:relative; }
.subs input[type=email]{ flex:1 1 240px; min-width:0; height:48px; padding:0 16px; border-radius:8px; border:1px solid var(--line); background:#0a151f; color:var(--ink); font-family:var(--sans); font-size:15px; }
.subs input[type=email]::placeholder{ color:var(--ink-3); }
.subs input[type=email]:focus{ outline:2px solid var(--teal); outline-offset:1px; }
.subs button{ height:48px; padding:0 24px; border-radius:8px; border:0; cursor:pointer; font-family:var(--serif); font-weight:700; font-size:16px; color:var(--ground); background:linear-gradient(92deg,var(--teal),var(--gold)); }
.subs button:disabled{ opacity:.6; cursor:wait; }
.portal .ok{ font-family:var(--serif); font-size:17px; color:var(--teal); margin:0; }
.portal .err{ font-family:var(--mono); font-size:12px; color:#E5644B; margin:8px 0 0; }
.portal .fine{ font-family:var(--mono); font-size:11px; letter-spacing:.06em; color:var(--ink-3); margin-top:14px; }

.foot-bar{ margin-top:30px; padding-top:16px; border-top:1px solid var(--line); }
.foot-bar .b{ font-family:var(--serif); font-style:italic; font-size:18px; color:var(--ink-2); }

@media (max-width:820px){
  .news{ grid-template-columns:1fr; }
  .antonn .grid{ grid-template-columns:1fr; }
  .moving{ border-left:0; border-top:1px solid #16303f; }
  .spine{ grid-template-columns:1fr; }
  .mast-right{ align-items:flex-start; }
}
@media (prefers-reduced-motion:reduce){ .current{ animation:none; } }
`;
