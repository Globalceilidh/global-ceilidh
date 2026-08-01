// app/api/stream/upload/route.js
// ============================================================
// POST /api/stream/upload
//   → auth() → mint a one-time Cloudflare Stream direct-upload URL →
//     { ok, uploadURL, uid }. The browser then PUTs the video file straight
//     to uploadURL (the bytes never pass through Vercel), and posts the
//     returned uid with the post.
//
// Server-side only; the Stream token stays on the server.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { streamConfigured, createDirectUpload } from '../../../../lib/stream';

export const runtime = 'nodejs';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  if (!streamConfigured()) {
    return Response.json({ ok: false, error: 'stream_off', reason: 'Video isn’t enabled yet.' }, { status: 503 });
  }

  try {
    const { uploadURL, uid } = await createDirectUpload();
    return Response.json({ ok: true, uploadURL, uid });
  } catch (err) {
    console.error('Stream upload URL failed:', err);
    return Response.json({ ok: false, error: 'server_error', reason: 'Could not start the video upload.' }, { status: 500 });
  }
}
