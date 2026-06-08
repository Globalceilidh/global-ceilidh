import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Two-step unsubscribe. GET renders a confirmation page; POST performs the
// state change. The reason this is split: email-security scanners
// (Mimecast, Microsoft Defender, Proofpoint, Comcast, etc.) automatically
// GET every link in an incoming email to vet it for malware. The previous
// design did the unsubscribe inside the GET handler, so a scanner GETting
// the footer link silently and instantly unsubscribed the recipient —
// usually within minutes of delivery, sometimes in batches when several
// recipients shared a mail provider.
//
// Scanners almost universally don't follow form submissions or do POSTs,
// so requiring an explicit form-submitted POST to actually update
// unsubscribed_at fixes the problem without changing what the user sees
// when they actually click the link in the email.
//
// The token in the URL is a 32-byte high-entropy random; we treat it as
// proof of intent for the POST (the recipient had to receive the email to
// have it), so there's no extra CSRF layer here — the URL is the auth.

export async function GET(_request, { params }) {
  const token = params.token;
  if (!token) {
    return new NextResponse(renderPage({ stage: 'error', reason: 'no-token' }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Look up the subscriber WITHOUT mutating anything. If the token doesn't
  // match anyone, render the "link expired" page; if it matches an already-
  // unsubscribed row, render the friendlier "already unsubscribed" variant.
  try {
    const { data, error } = await supabase
      .from('sruth_subscribers')
      .select('email, unsubscribed_at')
      .eq('unsubscribe_token', token)
      .limit(1);

    if (error) {
      console.error('[unsubscribe] GET db error:', error);
      return new NextResponse(renderPage({ stage: 'error', reason: 'db-error' }), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const row = data && data[0];
    if (!row) {
      return new NextResponse(renderPage({ stage: 'error', reason: 'not-found' }), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    if (row.unsubscribed_at) {
      return new NextResponse(renderPage({ stage: 'already', email: row.email, token }), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return new NextResponse(renderPage({ stage: 'confirm', email: row.email, token }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    console.error('[unsubscribe] GET exception:', e);
    return new NextResponse(renderPage({ stage: 'error', reason: 'exception' }), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

export async function POST(_request, { params }) {
  const token = params.token;
  if (!token) {
    return new NextResponse(renderPage({ stage: 'error', reason: 'no-token' }), {
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
      console.error('[unsubscribe] POST db error:', error);
      return new NextResponse(renderPage({ stage: 'error', reason: 'db-error' }), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    const row = Array.isArray(data) && data[0];
    if (!row) {
      return new NextResponse(renderPage({ stage: 'error', reason: 'not-found' }), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return new NextResponse(renderPage({ stage: 'done', email: row.email }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    console.error('[unsubscribe] POST exception:', e);
    return new NextResponse(renderPage({ stage: 'error', reason: 'exception' }), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function renderPage({ stage, email, token, reason }) {
  let title, headline, body;
  const emailHtml = escapeHtml(email);

  if (stage === 'confirm') {
    title = 'Confirm unsubscribe';
    headline = 'Are you sure?';
    body = `
      <p style="margin:0 0 16px;">You're about to unsubscribe <strong>${emailHtml}</strong> from Sruth.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#444;">No more daily letters, no more diaspora dispatches, no more Facal an Là. The archive at <a href="https://www.globalceilidh.com/sruth/archive" style="color:#6B4E1F;">globalceilidh.com/sruth/archive</a> stays available either way.</p>
      <form method="POST" action="/api/unsubscribe/${encodeURIComponent(token)}" style="margin:0;">
        <button type="submit" style="display:inline-block;font-family:'IBM Plex Mono',Menlo,monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;background:#1A3A2A;color:#FCFCFC;border:none;border-radius:4px;padding:12px 24px;cursor:pointer;">Confirm unsubscribe</button>
      </form>
      <p style="margin:24px 0 0;font-size:13px;color:#666;">Changed your mind? Just close this page. Nothing happens unless you click the button above.</p>`;
  } else if (stage === 'done') {
    title = 'Unsubscribed';
    headline = "You're unsubscribed.";
    body = `
      <p style="margin:0 0 16px;">Sruth will no longer reach <strong>${emailHtml}</strong>. Tha sinn duilich do bhith gad chall — sorry to see you go.</p>
      <p style="margin:0;font-size:13px;color:#666;">Changed your mind? You can subscribe again any time at <a href="https://www.globalceilidh.com/sruth" style="color:#6B4E1F;">globalceilidh.com/sruth</a>.</p>`;
  } else if (stage === 'already') {
    title = 'Already unsubscribed';
    headline = "You're already off the list.";
    body = `
      <p style="margin:0 0 16px;">${emailHtml ? `<strong>${emailHtml}</strong> is` : 'This address is'} already unsubscribed from Sruth. No action needed.</p>
      <p style="margin:0;font-size:13px;color:#666;">If you'd like to resubscribe, head to <a href="https://www.globalceilidh.com/sruth" style="color:#6B4E1F;">globalceilidh.com/sruth</a>.</p>`;
  } else if (reason === 'not-found') {
    title = 'Link expired';
    headline = 'This link has already been used or never existed.';
    body = `
      <p style="margin:0 0 16px;">The unsubscribe token isn't valid. The most common reason is the link was used once already; the second click finds nothing to do.</p>
      <p style="margin:0;font-size:13px;color:#666;">If you're still receiving Sruth and want to stop, email <a href="mailto:sruth_editors@globalceilidh.com?subject=Unsubscribe" style="color:#6B4E1F;">sruth_editors@globalceilidh.com</a> with the subject "Unsubscribe".</p>`;
  } else {
    title = 'Something went wrong';
    headline = 'Something went wrong on our end.';
    body = `
      <p style="margin:0;">Please email <a href="mailto:sruth_editors@globalceilidh.com?subject=Unsubscribe" style="color:#6B4E1F;">sruth_editors@globalceilidh.com</a> and we'll handle it manually.</p>`;
  }

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
