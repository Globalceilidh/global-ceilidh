// Shared email templates for the Sruth signup + announcement flow.
// Both /api/subscribe and /api/preview/welcome render from welcomeHtml(),
// and /api/preview/announcement + scripts/send_announcement.py render from
// announcementHtml(). Keeping them here as one module means the preview
// routes and live sends are guaranteed to show identical output.
//
// Palette + fonts match the Sruth newsletter template (app/email/template.py)
// — cream paper, warm gold accent, Fraunces serif, IBM Plex Mono. Subscribers
// who get the newsletter will read this as part of the same brand voice.

const PAPER = '#FCFCFC';
const BUFFER = '#F2ECDC';
const INK = '#1A1A1A';
const ACCENT = '#6B4E1F';
const MUTED = '#999999';
const DIVIDER = '#E8DCC8';
const SERIF = "'Fraunces','Georgia',serif";
const MONO = "'IBM Plex Mono','Menlo','Consolas',monospace";

const ARCHIVE_URL = 'https://www.globalceilidh.com/sruth/archive';
const FEEDBACK_ADDR = 'sruth_editors@globalceilidh.com';
const FEEDBACK_SUBJECT = encodeURIComponent('Sruth — what I think');
const FEEDBACK_BODY = encodeURIComponent(
  "Tell us what you love, what you'd cut, and what you'd like to see more of. " +
  "Anything from a single sentence to a long letter — we read everything.\n\n"
);
const SITE_BASE = 'https://www.globalceilidh.com';

// Shared frame: outer buffer-colored page, inner cream paper card, fonts
// preconnected. Identical scaffold for welcome + announcement so they read
// as one consistent brand.
function frame({ title, inner }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:${BUFFER};">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BUFFER};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${PAPER};">
          ${inner}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href, label) {
  return `<table cellpadding="0" cellspacing="0" border="0" align="left" style="margin:8px 0 0 0;">
    <tr><td style="background:${ACCENT};border-radius:4px;">
      <a href="${href}" target="_blank" rel="noopener" style="display:inline-block;padding:14px 28px;font-family:${MONO};font-size:11px;letter-spacing:2px;color:#F0E6CC;text-transform:uppercase;text-decoration:none;font-weight:500;">
        ${label}
      </a>
    </td></tr>
  </table>`;
}

function masthead() {
  return `<tr>
    <td style="background:${BUFFER};border-bottom:1px solid ${ACCENT};padding:32px 48px 28px;text-align:center;">
      <p style="font-family:${MONO};font-size:10px;letter-spacing:3px;color:${INK};text-transform:uppercase;margin:0 0 12px;">A Daily Current</p>
      <h1 style="font-family:${SERIF};font-style:italic;font-weight:700;font-size:48px;color:${INK};margin:0;letter-spacing:-1px;">sruth.</h1>
      <p style="font-family:${SERIF};font-style:italic;font-weight:400;font-size:14px;color:${INK};margin:8px 0 0 0;">for the Scottish Gael — and anyone eavesdropping.</p>
    </td>
  </tr>`;
}

function footer(unsubscribeUrl) {
  const year = new Date().getFullYear();
  // Unsubscribe URL absent (announcement preview, etc.) → mailto fallback so
  // the link is still functional in any context the preview is shared.
  const unsubHref = unsubscribeUrl
    || `mailto:${FEEDBACK_ADDR}?subject=${encodeURIComponent('Unsubscribe')}`;
  return `<tr>
    <td style="background:${BUFFER};border-top:1px solid ${ACCENT};padding:28px 48px 32px;text-align:center;">
      <p style="font-family:${MONO};font-size:10px;letter-spacing:1.5px;color:${INK};text-transform:uppercase;margin:0 0 12px;">
        Daily &nbsp;·&nbsp; from Global Ceilidh &nbsp;·&nbsp; since 2026
      </p>
      <p style="font-family:${MONO};font-size:10px;letter-spacing:1.5px;margin:0 0 10px;">
        <a href="${ARCHIVE_URL}" target="_blank" style="color:${ACCENT};text-decoration:none;">Archive</a>
        &nbsp;·&nbsp;
        <a href="mailto:${FEEDBACK_ADDR}" style="color:${ACCENT};text-decoration:none;">Beachdan / Feedback</a>
        &nbsp;·&nbsp;
        <a href="${unsubHref}" style="color:${ACCENT};text-decoration:none;">Unsubscribe</a>
      </p>
      <p style="font-family:${MONO};font-size:9px;letter-spacing:1.5px;color:${MUTED};margin:0;text-transform:uppercase;">
        © ${year} Global Ceilidh &nbsp;·&nbsp; Tìr nan Gàidheal
      </p>
    </td>
  </tr>`;
}

// ── Welcome email ─────────────────────────────────────────────────────────────
//
// Fired the moment someone completes signup. Single opt-in: by signing up
// they're on the list. This email confirms, signposts the archive, and asks
// for feedback. No "click to confirm" button.

export function welcomeSubject(name) {
  return name
    ? `Fàilte, ${name}. You're in the current.`
    : `Fàilte. You're in the current.`;
}

export function welcomeHtml({ name, location } = {}) {
  const greeting = name
    ? `<h2 style="font-family:${SERIF};font-weight:700;font-size:26px;color:${INK};margin:0 0 20px 0;line-height:1.2;">Fàilte, ${escapeHtml(name)}.</h2>`
    : `<h2 style="font-family:${SERIF};font-weight:700;font-size:26px;color:${INK};margin:0 0 20px 0;line-height:1.2;">Fàilte.</h2>`;

  const locationLine = location
    ? `<p style="font-family:${SERIF};font-weight:400;font-size:15px;line-height:1.65;color:${INK};margin:0 0 18px 0;font-style:italic;">From ${escapeHtml(location)} — welcome.</p>`
    : '';

  const inner = `
    ${masthead()}
    <tr>
      <td style="background:${PAPER};padding:40px 48px 36px;">
        ${greeting}
        ${locationLine}
        <p style="font-family:${SERIF};font-weight:400;font-size:16px;line-height:1.7;color:${INK};margin:0 0 18px 0;">
          You're subscribed to Sruth — a daily current of news, music, language, and life
          from the Scottish Gaelic world and the diaspora that grew from it. Each issue is
          short, written in good company, and arrives quietly in your inbox.
        </p>
        <p style="font-family:${SERIF};font-weight:400;font-size:16px;line-height:1.7;color:${INK};margin:0 0 28px 0;">
          We've already shipped a handful of issues. Have a look at what you've been missing:
        </p>
        ${ctaButton(ARCHIVE_URL, 'Browse the Archive')}
      </td>
    </tr>
    <tr><td style="background:${PAPER};padding:0 48px;"><div style="border-top:1px solid ${DIVIDER};"></div></td></tr>
    <tr>
      <td style="background:${PAPER};padding:36px 48px 40px;">
        <p style="font-family:${MONO};font-size:10px;letter-spacing:2px;color:${ACCENT};text-transform:uppercase;margin:0 0 14px 0;">Beachdan / Your Voice</p>
        <p style="font-family:${SERIF};font-weight:400;font-size:16px;line-height:1.7;color:${INK};margin:0 0 22px 0;">
          Sruth is shaped by the people who read it. Tell us what you love, what you'd cut,
          and what you'd like more of — anything from a sentence to a long letter. We read
          everything.
        </p>
        ${ctaButton(`mailto:${FEEDBACK_ADDR}?subject=${FEEDBACK_SUBJECT}&body=${FEEDBACK_BODY}`, 'Send a Note')}
      </td>
    </tr>
    ${footer(null)}
  `;
  return frame({ title: 'Welcome to Sruth', inner });
}

// ── Announcement email (one-off to existing subscribers) ──────────────────────
//
// Fired once via scripts/send_announcement.py to subscribers who joined
// before the archive existed. Tells them about the archive, asks for
// feedback. Same scaffold + voice as the welcome so the brand reads
// consistent.

export const ANNOUNCEMENT_SUBJECT = "Sruth — the archive is live, and we're listening.";

export function announcementHtml({ name, unsubscribeUrl } = {}) {
  const greeting = name
    ? `<h2 style="font-family:${SERIF};font-weight:700;font-size:26px;color:${INK};margin:0 0 20px 0;line-height:1.2;">Fàilte, ${escapeHtml(name)} — a quick note.</h2>`
    : `<h2 style="font-family:${SERIF};font-weight:700;font-size:26px;color:${INK};margin:0 0 20px 0;line-height:1.2;">A quick note from the editors.</h2>`;

  const inner = `
    ${masthead()}
    <tr>
      <td style="background:${PAPER};padding:40px 48px 36px;">
        ${greeting}
        <p style="font-family:${SERIF};font-weight:400;font-size:16px;line-height:1.7;color:${INK};margin:0 0 18px 0;">
          You've been with Sruth since the early issues — taing mhòr for that. A couple of
          things worth telling you about.
        </p>
        <p style="font-family:${MONO};font-size:11px;letter-spacing:2px;color:${ACCENT};text-transform:uppercase;margin:24px 0 12px 0;">One — the archive is live</p>
        <p style="font-family:${SERIF};font-weight:400;font-size:16px;line-height:1.7;color:${INK};margin:0 0 22px 0;">
          Every issue we've sent is now permanently readable at globalceilidh.com/sruth/archive.
          Catch up on anything you missed, share an issue with a friend, or just see how the
          newsletter has been finding its voice.
        </p>
        ${ctaButton(ARCHIVE_URL, 'Browse the Archive')}
      </td>
    </tr>
    <tr><td style="background:${PAPER};padding:0 48px;"><div style="border-top:1px solid ${DIVIDER};"></div></td></tr>
    <tr>
      <td style="background:${PAPER};padding:36px 48px 40px;">
        <p style="font-family:${MONO};font-size:11px;letter-spacing:2px;color:${ACCENT};text-transform:uppercase;margin:0 0 12px 0;">Two — we want to hear from you</p>
        <p style="font-family:${SERIF};font-weight:400;font-size:16px;line-height:1.7;color:${INK};margin:0 0 22px 0;">
          Sruth is still finding its shape. What do you love? What would you cut? What
          would you like to see more of — more music, more diaspora stories, more language,
          longer pieces, shorter pieces, different sections altogether? Write us a sentence
          or a paragraph. We read everything.
        </p>
        ${ctaButton(`mailto:${FEEDBACK_ADDR}?subject=${FEEDBACK_SUBJECT}&body=${FEEDBACK_BODY}`, 'Send a Note')}
        <p style="font-family:${SERIF};font-weight:400;font-style:italic;font-size:14px;line-height:1.6;color:${MUTED};margin:32px 0 0 0;">
          Mòran taing.<br>
          <span style="color:${INK};">— The Editors</span>
        </p>
      </td>
    </tr>
    ${footer(unsubscribeUrl)}
  `;
  return frame({ title: 'Sruth — Archive Live', inner });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Constants exported so the API routes can reuse them without re-hardcoding.
export const EMAIL_CONSTANTS = {
  ARCHIVE_URL,
  FEEDBACK_ADDR,
  SITE_BASE,
  FROM_ADDR: 'Sruth <sruth@globalceilidh.com>',
};
