import { randomBytes } from 'node:crypto';
import { promises as dns } from 'node:dns';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { isDisposable } from '@/app/emails/disposable-domains';
import { welcomeHtml, welcomeSubject, EMAIL_CONSTANTS } from '@/app/emails/templates';
import { resendKey } from '../../../lib/resend';

// Force Node runtime — Edge runtime doesn't expose dns/crypto for MX lookups
// and token generation.
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Admin BCC — every welcome email also lands here so the editor sees a real
// copy of what the subscriber received, in the same client (Outlook), exactly
// as it renders. Lightweight visibility without needing a separate audit log.
const ADMIN_BCC = 'scott_whiteshouse@outlook.com';

// In-memory rate limit: 5 sign-up attempts per IP per hour. Resets when the
// serverless function cold-starts, which is fine — we just need to slow the
// most obvious abuse.
const rateLimitMap = new Map();
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

// Best-effort MX check: confirms the email's domain actually has mail servers.
// Eliminates fake domains entirely. Adds ~100-300ms to the signup; we cap
// the lookup so a slow DNS doesn't hang the user.
async function hasMxRecords(email) {
  const at = email.lastIndexOf('@');
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  try {
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, reject) => setTimeout(() => reject(new Error('mx-timeout')), 2500)),
    ]);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}

export async function POST(request) {
  const RESEND_KEY = resendKey();
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const email = (body.email || '').toLowerCase().trim();
    const name = (body.name || '').trim() || null;
    const location = (body.location || '').trim() || null;
    // Honeypot field: a real human leaves this blank. Bots fill every field
    // they find. If this comes in populated, we ACK with success (so the bot
    // doesn't realize) but write nothing and send nothing.
    const honeypot = (body.website || '').trim();

    if (honeypot) {
      console.log(`[subscribe] honeypot triggered from ${ip}, dropping`);
      return NextResponse.json({ success: true });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (isDisposable(email)) {
      // Don't tell the spammer why; generic message.
      return NextResponse.json({ error: 'Please use a permanent email address.' }, { status: 400 });
    }

    const mxOk = await hasMxRecords(email);
    if (!mxOk) {
      return NextResponse.json({ error: 'That email domain doesn\'t appear to receive mail.' }, { status: 400 });
    }

    // Length caps to keep the DB clean and prevent abuse.
    const cappedName = name ? name.slice(0, 100) : null;
    const cappedLocation = location ? location.slice(0, 100) : null;

    // unsubscribe_token: persistent random token for the one-click unsubscribe
    // link in every footer. Generated once on signup; never changes. URL-safe
    // base64 (32 bytes → 43 chars). On re-signup of an existing email we
    // preserve the existing token instead of rotating, so old footer links
    // keep working.
    const newToken = randomBytes(32).toString('base64url');

    // Use a select-then-decide pattern instead of upsert so we know whether
    // this is a NEW signup or a returning subscriber (changes welcome-email
    // behavior — returning ones shouldn't get the welcome again).
    const { data: existingRows } = await supabase
      .from('sruth_subscribers')
      .select('id, unsubscribe_token, unsubscribed_at')
      .eq('email', email)
      .limit(1);

    const existing = existingRows?.[0] || null;
    const isNew = !existing;

    if (existing) {
      // Returning sub: update name/location if they provided new values,
      // clear any unsubscribed_at (they're back), keep the existing token.
      const updates = { unsubscribed_at: null };
      if (cappedName) updates.name = cappedName;
      if (cappedLocation) updates.location = cappedLocation;
      if (!existing.unsubscribe_token) updates.unsubscribe_token = newToken;
      const { error } = await supabase
        .from('sruth_subscribers')
        .update(updates)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('sruth_subscribers')
        .insert({
          email,
          name: cappedName,
          location: cappedLocation,
          language_pref: 'both',
          unsubscribe_token: newToken,
        });
      if (error) throw error;
    }

    // ── Welcome email — AWAIT it so Vercel doesn't kill the function before
    //    the fetch completes. The previous fire-and-forget version is exactly
    //    why zero welcome emails have ever reached anyone. Returning users
    //    don't get re-welcomed (they've seen it).
    if (isNew && RESEND_KEY) {
      const html = welcomeHtml({ name: cappedName, location: cappedLocation });
      const subject = welcomeSubject(cappedName);
      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: EMAIL_CONSTANTS.FROM_ADDR,
            to: email,
            bcc: ADMIN_BCC,
            subject,
            html,
            reply_to: EMAIL_CONSTANTS.FEEDBACK_ADDR,
          }),
        });
        if (!r.ok) {
          const errText = await r.text();
          console.error(`[subscribe] Resend ${r.status}: ${errText.slice(0, 300)}`);
        }
      } catch (e) {
        console.error('[subscribe] welcome email exception:', e?.message || e);
      }
    } else if (isNew && !RESEND_KEY) {
      console.error('[subscribe] RESEND_API_KEY missing — welcome email skipped');
    }

    return NextResponse.json({ success: true, isNew });
  } catch (err) {
    console.error('[subscribe] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
