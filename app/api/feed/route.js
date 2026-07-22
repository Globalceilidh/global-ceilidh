// app/api/feed/route.js
// The middle column: what the people you have a ceangal with are saying.
//
// This is the route where the audience rules are actually ENFORCED, so
// it is the one worth being careful in. The filtering happens
// server-side against the author's chosen tier and the author's own
// label on the viewer — never client-side, and never by trusting a
// visibility value the client sent.
//
// A post reaches the viewer if any of these hold:
//   * the author filed the viewer in a circle the post was addressed to
//     (tiersVisibleTo maps a category to the tiers it can see)
//   * the post is 'custom' and the viewer is named in gc_post_audience
// 'private' appears in neither list, so a note to self can never leak.
//
// Deliberately NOT included: a sampling of strangers' 'global' posts.
// That discovery slice is wanted eventually, but mixing it in before the
// graph has any real edges would mean the feed is mostly strangers,
// which is the opposite of the point.

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { getProfileByClerkId, getAuthorsFor, tiersVisibleTo, publicProfile } from '../../../lib/social';

export const runtime = 'nodejs';

const PAGE_DEFAULT = 40;
const PAGE_MAX = 100;

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  const url = new URL(req.url);
  const before = url.searchParams.get('before');
  let limit = parseInt(url.searchParams.get('limit') || '', 10);
  if (!Number.isFinite(limit) || limit <= 0) limit = PAGE_DEFAULT;
  limit = Math.min(limit, PAGE_MAX);

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    const authors = await getAuthorsFor(me.id);

    // Which tiers each author has opened to me. Group authors by tier set
    // so this is a handful of `in` filters rather than one query each.
    const byTier = new Map(); // tier -> [authorId]
    for (const [authorId, category] of authors) {
      for (const tier of tiersVisibleTo(category)) {
        if (!byTier.has(tier)) byTier.set(tier, []);
        byTier.get(tier).push(authorId);
      }
    }

    const select = 'id, body, visibility, created_at, author:gc_profiles!gc_posts_author_id_fkey(id, handle, display_name, avatar_url)';

    const queries = [];
    for (const [tier, ids] of byTier) {
      let q = supabaseAdmin
        .from('gc_posts')
        .select(select)
        .in('author_id', ids)
        .eq('visibility', tier)
        .eq('status', 'visible')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (before) q = q.lt('created_at', before);
      queries.push(q);
    }

    // Posts addressed to me by name, whoever wrote them. A 'custom' post
    // does not require a ceangal — being named IS the grant.
    const { data: addressed, error: addrErr } = await supabaseAdmin
      .from('gc_post_audience')
      .select('post_id')
      .eq('profile_id', me.id)
      .limit(PAGE_MAX);
    if (addrErr) throw addrErr;

    if (addressed?.length) {
      let q = supabaseAdmin
        .from('gc_posts')
        .select(select)
        .in('id', addressed.map((r) => r.post_id))
        .eq('status', 'visible')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (before) q = q.lt('created_at', before);
      queries.push(q);
    }

    const results = await Promise.all(queries);
    for (const r of results) if (r.error) throw r.error;

    // Merge, de-duplicate (an author can appear under several tiers),
    // then re-sort — each query was only sorted within itself.
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

    return Response.json({
      ok: true,
      posts: page.map((row) => ({
        id: row.id,
        body: row.body,
        visibility: row.visibility,
        created_at: row.created_at,
        author: publicProfile(row.author),
      })),
      nextBefore,
    });
  } catch (err) {
    console.error('Feed failed:', err);
    return Response.json({ ok: false, error: 'feed_failed' }, { status: 500 });
  }
}
