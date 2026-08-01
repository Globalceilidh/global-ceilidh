// app/api/tags/[tag]/route.js
// ============================================================
// GET /api/tags/<tag> → posts carrying #<tag> that the caller is allowed
// to see. A hashtag is a public topic, so this includes GLOBAL posts by
// anyone — but tiered posts (connections/close/family/custom) appear only
// when the caller is already entitled to them, exactly as the feed
// enforces. A #tag can never surface a family-only post to a stranger.
//
// Same shape as /api/feed so the tag page can reuse PostCard.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import {
  getProfileByClerkId, getAuthorsFor, tiersVisibleTo,
  publicProfile, attachEngagement, attachReshares,
} from '../../../../lib/social';

export const runtime = 'nodejs';

const PAGE_DEFAULT = 40;
const PAGE_MAX = 100;
const SELECT = 'id, body, visibility, created_at, media, reshare_of, author:gc_profiles!gc_posts_author_id_fkey(id, handle, display_name, avatar_url)';

export async function GET(req, { params }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  const { tag: rawTag } = await params;
  // Strip the characters that would break an ilike pattern; keep it a plain
  // tag. The stored form of a hashtag is "#<tag>" inside the body.
  const tag = decodeURIComponent(rawTag || '').replace(/[,()%*\\]/g, '').toLowerCase().trim().slice(0, 60);
  if (!tag) return Response.json({ ok: true, posts: [], nextBefore: null });
  const like = `%#${tag}%`;

  const url = new URL(req.url);
  const before = url.searchParams.get('before');
  let limit = parseInt(url.searchParams.get('limit') || '', 10);
  if (!Number.isFinite(limit) || limit <= 0) limit = PAGE_DEFAULT;
  limit = Math.min(limit, PAGE_MAX);

  const withTag = (q) => {
    let x = q.eq('status', 'visible').is('deleted_at', null).ilike('body', like)
      .order('created_at', { ascending: false }).limit(limit);
    if (before) x = x.lt('created_at', before);
    return x;
  };

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    const authors = await getAuthorsFor(me.id);
    const byTier = new Map();
    for (const [authorId, category] of authors) {
      for (const tier of tiersVisibleTo(category)) {
        if (!byTier.has(tier)) byTier.set(tier, []);
        byTier.get(tier).push(authorId);
      }
    }

    const queries = [];
    // Global posts with the tag, from anyone — the public topic.
    queries.push(withTag(supabaseAdmin.from('gc_posts').select(SELECT).eq('visibility', 'global')));
    // Tiered posts, only from authors who filed me in a circle that sees them.
    for (const [tier, ids] of byTier) {
      queries.push(withTag(supabaseAdmin.from('gc_posts').select(SELECT).in('author_id', ids).eq('visibility', tier)));
    }
    // My own posts with the tag, whatever tier.
    queries.push(withTag(supabaseAdmin.from('gc_posts').select(SELECT).eq('author_id', me.id)));
    // Custom posts addressed to me by name.
    const { data: addressed, error: addrErr } = await supabaseAdmin
      .from('gc_post_audience').select('post_id').eq('profile_id', me.id).limit(PAGE_MAX);
    if (addrErr) throw addrErr;
    if (addressed?.length) {
      queries.push(withTag(supabaseAdmin.from('gc_posts').select(SELECT).in('id', addressed.map((r) => r.post_id))));
    }

    const results = await Promise.all(queries);
    for (const r of results) if (r.error) throw r.error;

    const seen = new Set();
    const merged = [];
    for (const r of results) {
      for (const row of r.data || []) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        merged.push(row);
      }
    }
    merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const page = merged.slice(0, limit);
    const nextBefore = merged.length > limit ? page[page.length - 1].created_at : null;

    let enriched = await attachEngagement(page, me.id);
    enriched = await attachReshares(enriched);

    return Response.json({
      ok: true,
      posts: enriched.map((row) => ({
        id: row.id,
        body: row.body,
        visibility: row.visibility,
        created_at: row.created_at,
        media: row.media || null,
        reshareOf: row.reshareOf || null,
        author: publicProfile(row.author),
        reactions: row.reactions,
        commentCount: row.commentCount,
      })),
      nextBefore,
    });
  } catch (err) {
    console.error('Tag feed failed:', err);
    return Response.json({ ok: false, error: 'tag_failed' }, { status: 500 });
  }
}
