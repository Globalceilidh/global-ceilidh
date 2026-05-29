// In-browser preview of the welcome email. Visit:
//   https://www.globalceilidh.com/api/preview/welcome
//   https://www.globalceilidh.com/api/preview/welcome?name=Mairi&location=Edinburgh
//
// Renders the exact same HTML that gets sent to a real subscriber. No Resend
// involvement — purely a render. Use this to iterate on copy/layout without
// burning Resend quota or filling inboxes during testing.

import { welcomeHtml } from '@/app/emails/templates';

export const runtime = 'nodejs';

export async function GET(request) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || '';
  const location = url.searchParams.get('location') || '';

  const html = welcomeHtml({ name, location });
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
