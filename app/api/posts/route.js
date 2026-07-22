// app/api/posts/route.js
// ============================================================
// Posts — the wall on a user's Duilleag-cèilidh (gc_posts).
//
// POST  { body, visibility? }
//         → auth() → resolve the caller's gc_profiles row → insert a post
//           authored by them. Returns { ok, post }. Only 'global'
//           visibility is accepted from the MVP composer.
//
// GET   ?handle=<h>[&before=<iso>][&limit=<n>]
//         → PUBLIC: that user's visible, non-deleted posts, newest first,
//           keyset-paginated by created_at. Returns { ok, posts, nextBefore }.
//
// Server-side only. Service-role client (RLS bypass); the signed-in Clerk
// user id from auth() is the sole authority on who authors a post — the
// client never names the author. Decoupled from the Railway backend.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';

export const runtime = 'nodejs';

const BODY_MAX = 5000;
const PAGE_DEFAULT = 30;
const PAGE_MAX = 100;

// Shape returned to the client — never leak the author's Clerk id.
function publicPost(row) {
  return {
    id: row.id,
    body: row.body,
    visibility: row.visibility,
    created_at: row.created_at,
  };
}

async function getProfileByClerkId(clerkUserId) {
  const { data, error } = await supabaseAdmin
    .from('gc_profiles')
    .select('id, handle, onboarded_at')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getProfileIdByHandle(handle) {
  const { data, error } = await supabaseAdmin
    .from('gc_profiles')
    .select('id')
    .eq('handle', handle)
    .maybeSingle();
  if (error) throw error;
  return data?.id || null;
}

export async function GET(req) {
  const url = new URL(req.url);
  const handle = String(url.searchParams.get('handle') || '').trim().toLowerCase();
  if (!handle) {
    return Response.json({ ok: false, error: 'handle_required' }, { status: 400 });
  }
  const before = url.searchParams.get('before');
  let limit = parseInt(url.searchParams.get('limit') || '', 10);
  if (!Number.isFinite(limit) || limit <= 0) limit = PAGE_DEFAULT;
  limit = Math.min(limit, PAGE_MAX);

  try {
    const authorId = await getProfileIdByHandle(handle);
    if (!authorId) return Response.json({ ok: true, posts: [], nextBefore: null });

    let q = supabaseAdmin
      .from('gc_posts')
      .select('id, body, visibility, created_at')
      .eq('author_id', authorId)
      .eq('visibility', 'global')
      .eq('status', 'visible')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit + 1); // fetch one extra to know if there's a next page
    if (before) q = q.lt('created_at', before);

    const { data, error } = await q;
    if (error) throw error;

    const hasMore = data.length > limit;
    const page = hasMore ? data.slice(0, limit) : data;
    const nextBefore = hasMore ? page[page.length - 1].created_at : null;

    return Response.json({ ok: true, posts: page.map(publicPost), nextBefore });
  } catch (err) {
    console.error('Posts list failed:', err);
    return Response.json({ ok: false, error: 'list_failed' }, { status: 500 });
  }
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const body = String(payload.body || '').trim();
  if (!body) {
    return Response.json({ ok: false, error: 'empty_body', reason: 'Write something first.' }, { status: 400 });
  }
  if (body.length > BODY_MAX) {
    return Response.json(
      { ok: false, error: 'too_long', reason: `Posts are capped at ${BODY_MAX} characters.` },
      { status: 400 },
    );
  }

  try {
    const profile = await getProfileByClerkId(userId);
    if (!profile || !profile.onboarded_at) {
      // Can't post without a finished Duilleag-cèilidh.
      return Response.json({ ok: false, error: 'no_profile', reason: 'Finish your profile first.' }, { status: 403 });
    }

    const row = {
      author_id: profile.id,
      author_clerk_user_id: userId,
      body,
      // 'global' is the widest tier and the only one that reaches the
      // public /u/<handle> page. Still hardcoded until the composer's
      // audience picker lands; migration 035 renamed 'public' -> 'global'
      // and the CHECK constraint now REJECTS the old value outright, so
      // this is not cosmetic — writing 'public' here fails the insert.
      visibility: 'global',
    };

    const { data, error } = await supabaseAdmin
      .from('gc_posts')
      .insert(row)
      .select('id, body, visibility, created_at')
      .single();

    if (error) {
      console.error('Post insert failed:', error);
      return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
    }

    return Response.json({ ok: true, post: publicPost(data) });
  } catch (err) {
    console.error('Post create failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
