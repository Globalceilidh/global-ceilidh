// app/api/upload/route.js
// ============================================================
// POST /api/upload   (multipart/form-data, field "file")
//   → auth() → validate it's an image within the size cap → store it in
//     the public `gc-media` bucket under posts/<clerkUserId>/<uuid>.<ext>
//     → return { ok, url }.
//
// The bucket is public so post images serve straight from getPublicUrl;
// upload itself is gated here (signed-in only, service-role write). Used
// by the Duilleag composer to attach an image before the post is created.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../../../lib/supabase';
import { r2Configured, putObject } from '../../../lib/r2';

export const runtime = 'nodejs';

const BUCKET = 'gc-media';
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  let form;
  try { form = await req.formData(); } catch { return Response.json({ ok: false, error: 'bad_form' }, { status: 400 }); }

  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return Response.json({ ok: false, error: 'no_file', reason: 'No image was sent.' }, { status: 400 });
  }

  const type = file.type || '';
  const ext = EXT_BY_TYPE[type];
  if (!ext) {
    return Response.json({ ok: false, error: 'bad_type', reason: 'Images only (jpg, png, webp, gif).' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ ok: false, error: 'too_big', reason: 'Images must be under 8 MB.' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `posts/${userId}/${randomUUID()}.${ext}`;

    // Cloudflare R2 is the media store; Supabase Storage is the fallback if
    // the R2 env isn't present on this deploy.
    if (r2Configured()) {
      const url = await putObject(path, buffer, type);
      return Response.json({ ok: true, url });
    }

    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: type, upsert: false });
    if (upErr) throw upErr;

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return Response.json({ ok: true, url: data.publicUrl });
  } catch (err) {
    console.error('Upload failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
