// The privacy policy. Linked from the Let's Talk overlay footer
// (components/LetsTalk.js), which is reachable from every public page — so
// this route MUST stay in middleware.js PUBLIC_PREFIXES or keyless visitors
// get bounced to "/" and the link 404s in a different way.
//
// Written against what the code actually does, not boilerplate. If you change
// what the site collects, change this page in the same breath:
//   - app/api/contact/route.js        sender IP is embedded in the email body
//   - app/api/subscribe/route.js      email + optional name/location, MX lookup
//   - app/api/radio/{vote,request,react}/route.js   IP-derived fingerprint
//   - components/PresenceBeat.js      gc_sid in localStorage -> gc_presence
//   - app/radio/RadioClient.js        third-party Live365 iframe
//   - middleware.js                   the gc_access cookie
//
// Deliberately English-only for now. Publishing a legal text in first-pass
// machine Gàidhlig would be worse than publishing none — the Gàidhlig version
// ships once Lewis/Joe have checked it (see the bilingual note below).
//
// NOTE FOR SCOTT: a postal address for Lewis Highland Group LLC is normally
// expected alongside the controller's name under UK/EU GDPR. Add it to
// CONTROLLER_ADDRESS below when you're happy to publish one.

const BEBAS = 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif';
const SANS = 'var(--font-ibm-plex-sans), system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';

const LAST_UPDATED = '18 August 2026';
const CONTACT_EMAIL = 'globalceilidh@gmail.com';
const CONTROLLER = 'Lewis Highland Group LLC';
const CONTROLLER_ADDRESS = null; // e.g. '123 Example St, City, State ZIP, USA'

export const metadata = {
  title: 'Privacy — GlobalCeilidh.com',
  description:
    'What GlobalCeilidh.com collects, why, who it is shared with, and the rights you have over it.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <main style={S.page}>
      <div style={S.inner}>
        <p style={S.eyebrow}>○ PRIVACY</p>
        <h1 style={S.h1}>What we collect, and why.</h1>

        <p style={S.updated}>
          Last updated {LAST_UPDATED} · Data controller: {CONTROLLER}
          {CONTROLLER_ADDRESS ? `, ${CONTROLLER_ADDRESS}` : ''}
        </p>

        <div style={S.note}>
          <span style={S.noteLabel}>Anns a’ Bheurla an-dràsta</span>
          <p style={S.noteText}>
            This page is in English for now. A Gàidhlig translation will follow once native
            speakers have checked it — a legal text is not something we will publish in
            first-pass translation. The English version is the authoritative one.
          </p>
        </div>

        <div style={S.summary}>
          <span style={S.summaryLabel}>The short version</span>
          <p style={S.summaryText}>
            We do not sell your data, we do not run advertising or tracking cookies, and we
            do not build a profile of you across other websites. Most of what we store is
            simply the thing you asked us to store — your email if you signed up for Sruth,
            your posts and messages if you have an account. You can ask us for a copy of it,
            or ask us to delete it, at any time.
          </p>
        </div>

        {SECTIONS.map((sec) => (
          <section key={sec.id} style={S.section}>
            <h2 style={S.h2}>{sec.title}</h2>
            {sec.body.map((block, i) =>
              typeof block === 'string' ? (
                <p key={i} style={S.p}>
                  {block}
                </p>
              ) : (
                <ul key={i} style={S.ul}>
                  {block.items.map((item, j) => (
                    <li key={j} style={S.li}>
                      {item.term ? <strong style={S.term}>{item.term}</strong> : null}
                      {item.term ? ' — ' : ''}
                      {item.text}
                    </li>
                  ))}
                </ul>
              ),
            )}
          </section>
        ))}

        <section style={S.section}>
          <h2 style={S.h2}>Getting in touch</h2>
          <p style={S.p}>
            For anything on this page — a copy of your data, a correction, a deletion, or a
            complaint — write to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={S.link}>
              {CONTACT_EMAIL}
            </a>
            . We will reply within 30 days.
          </p>
          <p style={S.p}>
            If you are in the UK you also have the right to complain to the Information
            Commissioner’s Office (ico.org.uk). If you are in the EU, you can complain to your
            national data protection authority. We would rather you came to us first, but the
            right is yours either way.
          </p>
        </section>

        <p style={S.foot}>
          <a href="/" style={S.link}>
            ← Back to GlobalCeilidh.com
          </a>
        </p>
      </div>
    </main>
  );
}

// ── the policy itself ───────────────────────────────────────────────────
// Kept as data rather than JSX so it reads like a document when you edit it.
const SECTIONS = [
  {
    id: 'no-account',
    title: 'If you are just visiting',
    body: [
      'You can listen to GC Radio, read Sruth and its archive, and use the contact form without an account. Here is everything that happens when you do.',
      {
        items: [
          {
            term: 'Analytics',
            text: 'We use Vercel Analytics and Vercel Speed Insights to count page views and measure how fast pages load. Both are cookieless — they do not set a cookie, do not use a device fingerprint, and cannot follow you to other websites. We see aggregate numbers, not individuals.',
          },
          {
            term: 'The radio player',
            text: 'Our stream is hosted by Live365, and their player is embedded on the radio page. That embed is a third party: Live365 receives your IP address and may set its own cookies, under their privacy policy rather than ours. If you would rather they did not, block third-party cookies for that page — the rest of the site works fine without it.',
          },
          {
            term: 'Voting, requests and reactions',
            text: 'These are open to everyone with no account, so to stop one person voting a thousand times we store a one-way fingerprint derived from your IP address, together with your vote or request. We do not store the IP address itself, and the fingerprint is not reversible into a name or an account. It is still information about you, so we treat it as personal data.',
          },
          {
            term: 'The contact form',
            text: 'Your name, email and message are emailed to our editor through Resend, our email provider, with your email set as the reply-to so a reply reaches you directly. Your IP address is included at the bottom of that email as a spam-tracing measure. The message lands in an ordinary mailbox and stays there until it is deleted.',
          },
          {
            term: 'The Sruth newsletter',
            text: 'Signing up stores your email address, and your name and location if you choose to give them. We check that your email’s domain can actually receive mail before accepting it. Every issue carries a one-click unsubscribe link; unsubscribing stops all sending immediately.',
          },
        ],
      },
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies and local storage',
    body: [
      'We do not use advertising cookies, tracking pixels, or third-party analytics cookies. There is no consent banner on this site because there is nothing on it that needs consent. What we do use:',
      {
        items: [
          {
            term: 'gc_access',
            text: 'A cookie set for 30 days when you enter an access key during the pre-launch period. It is what keeps the private parts of the site private, so it is strictly necessary and cannot be turned off while the door is shut.',
          },
          {
            term: 'Sign-in cookies',
            text: 'If you have an account, Clerk (our authentication provider) sets a session cookie so you stay signed in. Also strictly necessary.',
          },
          {
            term: 'Local storage',
            text: 'Your language choice, your radio volume, whether you have visited before, and a random session id used for the "who is here" count. These stay in your own browser. Clearing your browser data removes them, and nothing breaks.',
          },
        ],
      },
    ],
  },
  {
    id: 'members',
    title: 'If you have an account',
    body: [
      'An account adds the social side of Global Ceilidh — your Duilleag-cèilidh, the people you connect with, and the rooms. That means we store more, because the features are made of it.',
      {
        items: [
          {
            term: 'Your identity',
            text: 'Clerk handles sign-in and holds your email address and password. We keep a profile record — your handle, display name and avatar — in our own database.',
          },
          {
            term: 'What you post',
            text: 'Posts, comments, reactions, and any images or video you upload. Images are stored with Cloudflare R2 and video with Cloudflare Stream.',
          },
          {
            term: 'Who you are connected to',
            text: 'Your Ceangal connections, including requests you have sent and received.',
          },
          {
            term: 'Messages',
            text: 'Direct messages are stored in our database so they can be delivered and re-read. They are private between the people in the thread, but they are not end-to-end encrypted — we could technically read them, and would only ever do so to investigate a report of abuse or where the law required it. Please do not use them for anything you would not want an administrator to be able to see.',
          },
          {
            term: 'Presence',
            text: 'A heartbeat that records that a session is currently active, so the site can show how many people are about. It is deleted as it ages out.',
          },
          {
            term: 'Rooms',
            text: 'Ceilidh Rooms use LiveKit to carry audio and video between participants. We do not record rooms. LiveKit processes the stream in order to deliver it.',
          },
          {
            term: 'Reports',
            text: 'If you report a post, comment or person, we keep the report so it can be acted on.',
          },
        ],
      },
    ],
  },
  {
    id: 'audience',
    title: 'How your posts are shared — and what stays private',
    body: [
      'This is worth spelling out, because it is unusual and it is deliberate.',
      'When you approve a connection, you file that person privately under a category — connection, close, or family. That label is yours. It is never shown to the person you applied it to, and there is no screen anywhere that reveals it to them.',
      'Posts default to your connections, never to the public. What each person can see is decided on our server against the audience you chose, not in your browser — so it cannot be worked around by anyone poking at the site.',
      'If you send a message to a whole tier, it is delivered as separate one-to-one threads rather than a group chat. That is on purpose: a group chat would show everyone who else was in it, and that would leak the private categories above.',
      'Your public profile page shows only your handle, display name, avatar, and any posts you deliberately marked public.',
    ],
  },
  {
    id: 'processors',
    title: 'Who else handles your data',
    body: [
      'We keep this list short on purpose, and we do not sell or rent your data to anyone. Each of these companies processes data on our instructions in order to make part of the site work:',
      {
        items: [
          { term: 'Vercel', text: 'hosting and cookieless analytics.' },
          { term: 'Supabase', text: 'our database.' },
          { term: 'Clerk', text: 'sign-in and account security.' },
          { term: 'Resend', text: 'sending email — the newsletter, welcome emails, and contact messages.' },
          { term: 'Cloudflare', text: 'storage and delivery of uploaded images and video.' },
          { term: 'LiveKit', text: 'live audio and video in Ceilidh Rooms.' },
          { term: 'Live365', text: 'the radio stream and its embedded player.' },
        ],
      },
      'We may also disclose information if we are legally required to, or where it is necessary to protect someone’s safety.',
    ],
  },
  {
    id: 'international',
    title: 'Where your data goes',
    body: [
      'Global Ceilidh is run by Lewis Highland Group LLC, a company registered in the United States, and our providers are largely US-based. Many of the people we serve are in Scotland, elsewhere in the UK, and in the EU.',
      'That means your data is transferred to and stored in the United States. Where UK or EU data protection law applies to you, those transfers are made under the standard contractual clauses our providers offer, and the rights set out below apply to you in full regardless of where the data sits.',
    ],
  },
  {
    id: 'why',
    title: 'Why we are allowed to hold it',
    body: [
      'Under UK and EU data protection law we have to name a lawful basis for each thing we do. Ours are:',
      {
        items: [
          {
            term: 'Consent',
            text: 'the Sruth newsletter. You asked for it, and you can withdraw at any time from the link in any issue.',
          },
          {
            term: 'Performing our contract with you',
            text: 'everything your account is made of — your profile, posts, connections, messages and rooms. We cannot run the features without the data they consist of.',
          },
          {
            term: 'Legitimate interests',
            text: 'keeping the site up and secure, preventing spam and vote-stuffing, understanding roughly how many people visit, and replying to messages you send us. We have weighed these against your privacy and kept them as narrow as we can — which is why the vote guard stores a fingerprint rather than your IP address, and why our analytics are cookieless.',
          },
        ],
      },
    ],
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: [
      {
        items: [
          { term: 'Newsletter subscribers', text: 'until you unsubscribe or ask to be removed.' },
          { term: 'Account data', text: 'while your account exists, and deleted when you delete it.' },
          { term: 'Contact messages', text: 'they live in an ordinary email inbox and are kept while they are useful to reply to.' },
          { term: 'Presence records', text: 'minutes — they age out continuously.' },
          { term: 'Vote and request fingerprints', text: 'kept as long as the poll or playlog they belong to.' },
        ],
      },
    ],
  },
  {
    id: 'rights',
    title: 'Your rights',
    body: [
      'Wherever you live, we will honor all of these — we would rather apply one clear standard than work out which rules you fall under.',
      {
        items: [
          { term: 'Access', text: 'ask us for a copy of what we hold about you.' },
          { term: 'Correction', text: 'ask us to fix anything wrong.' },
          { term: 'Deletion', text: 'ask us to delete your account and its data.' },
          { term: 'Portability', text: 'ask for your data in a machine-readable form.' },
          { term: 'Objection', text: 'object to anything we do on the basis of legitimate interests.' },
          { term: 'Withdrawing consent', text: 'unsubscribe from the newsletter at any time.' },
        ],
      },
      'There is no self-service delete button yet — we are a small team and building one properly is on the list. Until it exists, email us and we will do it by hand.',
    ],
  },
  {
    id: 'children',
    title: 'Children',
    body: [
      'Global Ceilidh is not directed at children under 13, and we do not knowingly collect personal data from them. If you believe a child has given us their data, write to us and we will remove it.',
    ],
  },
  {
    id: 'security',
    title: 'Security, honestly stated',
    body: [
      'Traffic to the site is encrypted, passwords are handled by Clerk rather than by us, and private content is filtered on our server rather than in your browser. Direct messages are not end-to-end encrypted, and rooms are not recorded.',
      'No service can promise it will never have a breach. If one happens and it puts you at risk, we will tell you, and we will tell the relevant regulator within 72 hours as the law requires.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this page',
    body: [
      'When we change what we collect, we will change this page and move the date at the top. If a change is significant — a new kind of data, or a new reason for holding it — we will say so in Sruth rather than quietly editing the text.',
    ],
  },
];

// ── styles ──────────────────────────────────────────────────────────────
// Matches the Let's Talk overlay this page is linked from: dark ground,
// cream text, Bebas headings, gold accent.
const S = {
  page: { minHeight: '100vh', background: '#0A0D14', color: '#F2ECDC' },
  inner: { maxWidth: 760, margin: '0 auto', padding: '84px 28px 90px', boxSizing: 'border-box' },
  eyebrow: {
    fontFamily: MONO, fontSize: 12, letterSpacing: '0.22em',
    color: 'rgba(242,236,220,0.6)', margin: '0 0 18px',
  },
  h1: {
    fontFamily: BEBAS, color: '#fff', fontSize: 'clamp(40px, 7vw, 68px)', lineHeight: 0.98,
    letterSpacing: '0.01em', margin: '0 0 14px', fontWeight: 400,
  },
  updated: {
    fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em',
    color: 'rgba(242,236,220,0.5)', margin: '0 0 34px',
  },
  note: {
    margin: '0 0 28px', padding: '16px 20px', borderRadius: 12,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
  },
  noteLabel: {
    display: 'block', fontFamily: BEBAS, color: 'rgba(242,236,220,0.75)', fontSize: 15,
    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8,
  },
  noteText: { fontFamily: SANS, fontSize: 14.5, lineHeight: 1.65, color: 'rgba(242,236,220,0.78)', margin: 0 },
  summary: {
    margin: '0 0 44px', padding: '20px 24px', borderLeft: '3px solid #C9A047',
    background: 'rgba(201,160,71,0.06)', borderRadius: '0 12px 12px 0',
  },
  summaryLabel: {
    display: 'block', fontFamily: BEBAS, color: '#C9A047', fontSize: 17,
    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10,
  },
  summaryText: { fontFamily: SANS, fontSize: 16.5, lineHeight: 1.7, color: 'rgba(242,236,220,0.9)', margin: 0 },
  section: { margin: '0 0 40px' },
  h2: {
    fontFamily: BEBAS, color: '#fff', fontSize: 'clamp(26px, 4vw, 36px)',
    letterSpacing: '0.02em', margin: '0 0 14px', fontWeight: 400,
  },
  p: { fontFamily: SANS, fontSize: 16, lineHeight: 1.75, color: 'rgba(242,236,220,0.86)', margin: '0 0 14px' },
  ul: { listStyle: 'none', margin: '0 0 14px', padding: 0 },
  li: {
    fontFamily: SANS, fontSize: 16, lineHeight: 1.7, color: 'rgba(242,236,220,0.86)',
    margin: '0 0 14px', paddingLeft: 16, borderLeft: '2px solid rgba(255,255,255,0.14)',
  },
  term: { color: '#fff', fontWeight: 600 },
  link: { color: '#C9A047', textDecoration: 'underline', textUnderlineOffset: 3 },
  foot: {
    fontFamily: MONO, fontSize: 13, letterSpacing: '0.06em',
    margin: '50px 0 0', paddingTop: 26, borderTop: '1px solid rgba(255,255,255,0.12)',
  },
};
