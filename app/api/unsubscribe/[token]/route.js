import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// One-click unsubscribe. Visiting the link flips unsubscribed_at and shows a
// confirmation page. GET (not POST) because email clients can't form-submit
// links and we want this to work the moment a recipient taps the footer link.
// The token is 32-byte high-entropy random; guessing one to unsubscribe
// someone else is computationally infeasible.

export async function GET(_request, { params }) {
  const token = params.token;
  if (!token) {
    return new NextResponse(renderPage({ ok: false, reason: 'no-token' }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  try {
    const { data, error } = await supabase
      .from('sruth_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('unsubscribe_token', token)
      .select('email');

    if (error) {
      console.error('[unsubscribe] db error:', error);
      return new NextResponse(renderPage({ ok: false, reason: 'db-error' }), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const found = Array.isArray(data) && data.length > 0;
    return new NextResponse(renderPage({ ok: found, email: found ? data[0].email : null, reason: found ? null : 'not-found' }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    console.error('[unsubscribe] exception:', e);
    return new NextResponse(renderPage({ ok: false, reason: 'exception' }), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

function renderPage({ ok, email, reason }) {
  const title = ok ? 'Unsubscribed' : 'Link Expired';
  const headline = ok
    ? 'You\'re unsubscribed.'
    : reason === 'not-found'
      ? 'This link has already been used.'
      : 'Something went wrong.';
  const body = ok
    ? `<p style="margin:0 0 16px;">Sruth will no longer reach <strong>${email || 'this address'}</strong>. Tha sinn duilich do bhith gad chall — sorry to see you go.</p>
       <p style="margin:0;font-size:13px;color:#666;">Changed your mind? You can subscribe again any time at <a href="https://www.globalceilidh.com/sruth" style="color:#6B4E1F;">globalceilidh.com/sruth</a>.</p>`
    : reason === 'not-found'
      ? `<p style="margin:0 0 16px;">This unsubscribe link has already been used, or it was never valid.</p>
         <p style="margin:0;font-size:13px;color:#666;">If you're still receiving Sruth and want to stop, email <a href="mailto:sruth_editors@globalceilidh.com?subject=Unsubscribe" style="color:#6B4E1F;">sruth_editors@globalceilidh.com</a> with the subject "Unsubscribe".</p>`
      : `<p style="margin:0;">Something went wrong on our end. Please email <a href="mailto:sruth_editors@globalceilidh.com?subject=Unsubscribe" style="color:#6B4E1F;">sruth_editors@globalceilidh.com</a> to unsubscribe.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Sruth — ${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
</head>
<body style="margin:0;background:#F2ECDC;font-family:'Fraunces',Georgia,serif;color:#1A1A1A;">
  <div style="max-width:520px;margin:64px auto;padding:48px 36px;background:#FCFCFC;border:1px solid #E8DCC8;border-radius:6px;">
    <p style="font-family:'IBM Plex Mono',Menlo,monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#6B4E1F;margin:0 0 24px;">SRUTH</p>
    <h1 style="font-size:24px;margin:0 0 16px;">${headline}</h1>
    ${body}
  </div>
</body>
</html>`;
}
