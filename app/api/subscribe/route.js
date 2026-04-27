import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


// In-memory rate limit: 5 requests per IP per hour
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

export async function POST(request) {
  const RESEND_KEY = process.env.RESEND_API_KEY || 're_g4SrEbQ2_FqfvrEW5fcuWabHnPzDH7YWK';
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { email, name } = await request.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('sruth_subscribers')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          name: name?.trim() || null,
          language_pref: 'both',
        },
        { onConflict: 'email' }
      );

    if (error) throw error;

    // Send welcome email — failure here must not break the signup response
    const firstName = name?.trim().split(' ')[0] || null;
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
      from: 'sruth. <sruth@globalceilidh.com>',
      to: email.toLowerCase().trim(),
      subject: 'Tha an sruth a\' tighinn. — You\'re in.',
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;padding:48px 24px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding-bottom:32px;text-align:center;">
          <span style="font-family:'Georgia',serif;font-style:italic;font-weight:bold;font-size:48px;color:#ffffff;letter-spacing:-1px;">sruth.</span>
        </td></tr>
        <tr><td style="background:#0f2040;border-radius:12px;padding:40px 40px 48px;">
          <p style="color:#7eb8d4;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px;">A bheil sibh deiseil?</p>
          <p style="color:#ffffff;font-size:22px;font-weight:bold;margin:0 0 16px;line-height:1.3;">${firstName ? `${firstName}, the` : 'The'} current is coming.</p>
          <p style="color:#c8d8e8;font-size:15px;line-height:1.7;margin:0 0 24px;">You're on the list for <strong style="color:#ffffff;">sruth.</strong> — a daily current of Scottish Gàidhlig language, culture, and community, launching <strong style="color:#ffffff;">May 15th</strong>.</p>
          <p style="color:#c8d8e8;font-size:15px;line-height:1.7;margin:0 0 32px;">We'll bring you news, stories, and voices from across the Gàidhlig world — every morning, in your inbox.</p>
          <div style="border-top:1px solid #1e3a5f;padding-top:32px;margin-top:8px;">
            <p style="color:#7eb8d4;font-size:13px;line-height:1.6;margin:0;font-style:italic;">Tha an sruth a' tighinn.<br><span style="color:#4a6b8a;">The current is coming.</span></p>
          </div>
        </td></tr>
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="color:#2a4a6a;font-size:11px;margin:0;">You're receiving this because you signed up at globalceilidh.com<br>© 2026 Lewis Highland Group LLC</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    }).then(r => r.json()).then(r => console.log('Resend response:', JSON.stringify(r))).catch(err => console.error('Welcome email failed:', err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
