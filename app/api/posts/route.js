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
import { VISIBILITIES, getFollowersOf, attachReshares } from '../../../lib/social';

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
    media: row.media || null,
    reshareOf: row.reshareOf !== undefined ? row.reshareOf : null,
  };
}

// Sanitise the media array a composer sends. Only http(s) urls survive
// (the client uploads via /api/upload and gets back such a url); at most
// four images; width/height are kept if given but never required.
function cleanMedia(raw) {
  if (!Array.isArray(raw)) return null;
  const out = [];
  for (const m of raw.slice(0, 4)) {
    if (m && typeof m.url === 'string' && /^https?:\/\//i.test(m.url)) {
      const item = { url: m.url };
      if (Number.isFinite(m.w)) item.w = Math.round(m.w);
      if (Number.isFinite(m.h)) item.h = Math.round(m.h);
      out.push(item);
    }
  }
  return out.length ? out : null;
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
      .select('id, body, visibility, created_at, media')
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
  const media = cleanMedia(payload.media);
  const reshareOf = payload.reshareOf ? String(payload.reshareOf) : null;
  if (!body && !media && !reshareOf) {
    return Response.json({ ok: false, error: 'empty_body', reason: 'Write something or add an image.' }, { status: 400 });
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

    // The audience the author chose. Anything unrecognised falls back to
    // 'connections' rather than 'global' — a bad or missing value must
    // never widen the audience beyond what was asked for.
    const visibility = VISIBILITIES.includes(payload.visibility) ? payload.visibility : 'connections';

    // For a 'custom' post, the named recipients. Validated against the
    // author's own accepted followers: you can address someone you have
    // a ceangal with, not an arbitrary profile id posted from a console.
    let recipientIds = [];
    if (visibility === 'custom') {
      const asked = Array.isArray(payload.audience) ? payload.audience.map(String) : [];
      if (asked.length === 0) {
        return Response.json({ ok: false, error: 'no_audience', reason: 'Choose who this is for.' }, { status: 400 });
      }
      const followers = await getFollowersOf(profile.id);
      const allowed = new Set(followers.filter((f) => f.status === 'accepted').map((f) => f.follower.id));
      recipientIds = asked.filter((pid) => allowed.has(pid));
      if (recipientIds.length === 0) {
        return Response.json({ ok: false, error: 'no_audience', reason: 'None of those are connections.' }, { status: 400 });
      }
    }

    // Reshare: only a post the original author marked 'global' may be
    // reshared, so a connections/close/family post can never be pushed
    // wider than its author chose. Validate the target here.
    if (reshareOf) {
      const { data: original, error: origErr } = await supabaseAdmin
        .from('gc_posts')
        .select('id, visibility, status, deleted_at')
        .eq('id', reshareOf)
        .maybeSingle();
      if (origErr) throw origErr;
      if (!original || original.deleted_at || original.status !== 'visible') {
        return Response.json({ ok: false, error: 'reshare_not_found', reason: 'That post is no longer available.' }, { status: 404 });
      }
      if (original.visibility !== 'global') {
        return Response.json({ ok: false, error: 'reshare_not_global', reason: 'Only public posts can be shared.' }, { status: 403 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('gc_posts')
      .insert({
        author_id: profile.id,
        author_clerk_user_id: userId,
        body,
        visibility,
        media,
        reshare_of: reshareOf,
      })
      .select('id, body, visibility, created_at, media, reshare_of')
      .single();

    if (error) {
      console.error('Post insert failed:', error);
      return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
    }

    if (recipientIds.length) {
      const { error: audErr } = await supabaseAdmin
        .from('gc_post_audience')
        .insert(recipientIds.map((pid) => ({ post_id: data.id, profile_id: pid })));
      if (audErr) {
        // A custom post with no audience rows is a post nobody can read.
        // Better to remove it than to leave a silent orphan.
        console.error('Audience insert failed, removing post:', audErr);
        await supabaseAdmin.from('gc_posts').delete().eq('id', data.id);
        return Response.json({ ok: false, error: 'audience_failed' }, { status: 500 });
      }
    }

    const [hydrated] = await attachReshares([data]);
    return Response.json({ ok: true, post: publicPost(hydrated) });
  } catch (err) {
    console.error('Post create failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
