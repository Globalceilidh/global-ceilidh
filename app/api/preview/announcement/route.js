// In-browser preview of the one-off announcement email. Visit:
//   https://www.globalceilidh.com/api/preview/announcement
//   https://www.globalceilidh.com/api/preview/announcement?name=Mairi
//
// Renders the exact HTML the announcement script will send. No subscribers
// affected. Use to eyeball the copy before triggering the actual broadcast.

import { announcementHtml } from '@/app/emails/templates';

export const runtime = 'nodejs';

export async function GET(request) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || '';

  // Sample unsubscribe URL so the footer link doesn't read as dead.
  const sampleUnsub = 'https://www.globalceilidh.com/api/unsubscribe/example-token-not-real';
  const html = announcementHtml({ name, unsubscribeUrl: sampleUnsub });
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
