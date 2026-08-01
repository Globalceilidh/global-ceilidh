// app/api/posts/[id]/comments/route.js
// ============================================================
// GET  /api/posts/<id>/comments
//   → auth() → the post's live comments, oldest-first, author joined.
//     Each carries `isMine` so the client can show a delete control.
//     Requires the caller to be able to see the post.
//
// POST /api/posts/<id>/comments   { body }
//   → auth() → resolve profile → confirm the caller can see the post →
//     insert a comment authored by them. Returns { ok, comment }.
//
// Server-side only, service-role client. Reacting or commenting can't
// reach a post the viewer would never be shown (viewerCanSeePost).
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { getProfileByClerkId, viewerCanSeePost, publicProfile } from '../../../../../lib/social';

export const runtime = 'nodejs';

const BODY_MAX = 2000;

async function loadPost(id) {
  const { data, error } = await supabaseAdmin
    .from('gc_posts')
    .select('id, author_id, visibility, status, deleted_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function shapeComment(row, viewerId) {
  return {
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    author: publicProfile(row.author),
    isMine: row.author_id === viewerId,
  };
}

export async function GET(req, { params }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    const post = await loadPost(id);
    if (!post || post.deleted_at || post.status !== 'visible') {
      return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    if (!(await viewerCanSeePost(me.id, post))) {
      return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('gc_post_comments')
      .select('id, body, created_at, author_id, author:gc_profiles!gc_post_comments_author_id_fkey(id, handle, display_name, avatar_url)')
      .eq('post_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) throw error;

    return Response.json({ ok: true, comments: (data || []).map((r) => shapeComment(r, me.id)) });
  } catch (err) {
    console.error('Comments list failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  let payload;
  try { payload = await req.json(); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }
  const body = String(payload.body || '').trim();
  if (!body) return Response.json({ ok: false, error: 'empty', reason: 'Write something first.' }, { status: 400 });
  if (body.length > BODY_MAX) {
    return Response.json({ ok: false, error: 'too_long', reason: `Comments are capped at ${BODY_MAX} characters.` }, { status: 400 });
  }

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    const post = await loadPost(id);
    if (!post || post.deleted_at || post.status !== 'visible') {
      return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    if (!(await viewerCanSeePost(me.id, post))) {
      return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('gc_post_comments')
      .insert({ post_id: id, author_id: me.id, author_clerk_user_id: userId, body })
      .select('id, body, created_at, author_id, author:gc_profiles!gc_post_comments_author_id_fkey(id, handle, display_name, avatar_url)')
      .single();
    if (error) throw error;

    return Response.json({ ok: true, comment: shapeComment(data, me.id) });
  } catch (err) {
    console.error('Comment create failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
