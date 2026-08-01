// app/api/comments/[id]/route.js
// ============================================================
// DELETE /api/comments/<id>
//   → auth() → soft-delete the comment (stamp deleted_at) if the caller
//     wrote it OR owns the post it sits under. A post owner can clear a
//     reply on their own wall; everyone else can only remove their own.
//     Idempotent: an already-gone comment returns { ok }.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export const runtime = 'nodejs';

export async function DELETE(req, { params }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  try {
    const { data: comment, error: readErr } = await supabaseAdmin
      .from('gc_post_comments')
      .select('id, author_clerk_user_id, deleted_at, post:gc_posts!gc_post_comments_post_id_fkey(author_clerk_user_id)')
      .eq('id', id)
      .maybeSingle();
    if (readErr) throw readErr;

    if (!comment || comment.deleted_at) return Response.json({ ok: true });

    const isAuthor = comment.author_clerk_user_id === userId;
    const isPostOwner = comment.post?.author_clerk_user_id === userId;
    if (!isAuthor && !isPostOwner) {
      return Response.json({ ok: false, error: 'not_allowed' }, { status: 403 });
    }

    const { error: updErr } = await supabaseAdmin
      .from('gc_post_comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (updErr) throw updErr;

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Comment delete failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
