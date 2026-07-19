// app/api/posts/[id]/route.js
// ============================================================
// DELETE /api/posts/<id>
//   → auth() → verify the post belongs to the caller (author_clerk_user_id
//     === userId) → soft-delete (stamp deleted_at). The row is kept for
//     audit; the wall query filters deleted rows out. Returns { ok }.
//
// Authorship is checked off the denormalised Clerk id, so no profile join
// is needed. A non-owner (or signed-out) caller gets 403/401 and the row is
// untouched.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export const runtime = 'nodejs';

export async function DELETE(req, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return Response.json({ ok: false, error: 'id_required' }, { status: 400 });
  }

  try {
    const { data: post, error: readErr } = await supabaseAdmin
      .from('gc_posts')
      .select('id, author_clerk_user_id, deleted_at')
      .eq('id', id)
      .maybeSingle();
    if (readErr) throw readErr;

    if (!post || post.deleted_at) {
      // Already gone (or never existed) — idempotent success.
      return Response.json({ ok: true });
    }
    if (post.author_clerk_user_id !== userId) {
      return Response.json({ ok: false, error: 'not_owner' }, { status: 403 });
    }

    const { error: updErr } = await supabaseAdmin
      .from('gc_posts')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (updErr) throw updErr;

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Post delete failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
