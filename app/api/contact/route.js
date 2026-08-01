import { NextResponse } from 'next/server';
import { EMAIL_CONSTANTS } from '@/app/emails/templates';

// The "Let's Talk" contact form. Emails the message straight to the editor via
// Resend (same path the welcome email uses), reply_to set to the sender so a
// reply goes back to them directly. Node runtime for the fetch + headers.
export const runtime = 'nodejs';

// Where contact messages land. Same inbox the subscribe route BCCs.
const CONTACT_TO = 'scott_whiteshouse@outlook.com';

// In-memory rate limit: 5 messages per IP per hour (resets on cold start).
const rateLimitMap = new Map();
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
function checkRateLimit(ip) {
  const now = Date.now();
  const e = rateLimitMap.get(ip);
  if (!e || now - e.start > WINDOW_MS) { rateLimitMap.set(ip, { count: 1, start: now }); return true; }
  if (e.count >= LIMIT) return false;
  e.count++; return true;
}

const esc = (s) => String(s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

export async function POST(request) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const name = (body.name || '').trim().slice(0, 120);
    const email = (body.email || '').toLowerCase().trim().slice(0, 160);
    const message = (body.message || '').trim().slice(0, 5000);
    // Which Let's Talk panel it came from (Getting involved / Contact), for the
    // subject line. Whitelisted + length-capped so it can't inject anything.
    const intent = (body.intent || '').replace(/[^\w \-]/g, '').trim().slice(0, 40);
    // Honeypot — real humans leave this blank; ACK success but drop.
    if ((body.website || '').trim()) return NextResponse.json({ success: true });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Please include a message.' }, { status: 400 });
    }

    if (!RESEND_KEY) {
      console.error('[contact] RESEND_API_KEY missing — message not sent');
      return NextResponse.json({ error: 'Messaging is temporarily unavailable.' }, { status: 503 });
    }

    const subject = `Let's Talk${intent ? ` (${intent})` : ''} — ${name || 'someone'} via GlobalCeilidh.com`;
    const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
      <p><strong>From:</strong> ${esc(name) || '(no name)'} &lt;${esc(email)}&gt;</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${esc(message)}</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:16px 0">
      <p style="color:#888;font-size:12px">Sent from the Let's Talk form · ${ip}</p>
    </div>`;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: EMAIL_CONSTANTS.FROM_ADDR,
        to: CONTACT_TO,
        reply_to: email,
        subject,
        html,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error(`[contact] Resend ${r.status}: ${t.slice(0, 300)}`);
      return NextResponse.json({ error: 'Could not send just now — please try again.' }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact] error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
