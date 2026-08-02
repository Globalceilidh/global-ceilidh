// lib/social.js
// Shared server-side helpers for the social layer (gc_profiles,
// gc_follows, gc_posts). Server-only: every function here uses the
// service-role client, so nothing in this file may be imported into a
// client component.
//
// The audience rules live here rather than in each route so there is one
// place to change if the tier nesting ever stops matching how people
// actually think about their circles.

import { supabaseAdmin } from './supabase';

export const VISIBILITIES = ['global', 'connections', 'close', 'family', 'custom', 'private'];
export const CATEGORIES = ['connection', 'close', 'family'];

// The reaction palette (kind slugs). The glyphs live client-side in
// app/duilleag/reactions.js; the server only validates the slug.
export const REACTION_KINDS = ['tonnsuas', 'gradh', 'curam', 'solas', 'tonnsios', 'bron', 'fearagach'];

// Can this viewer see this post at all? The same rule the feed enforces,
// reused so reacting and commenting can't reach a post the viewer would
// never be shown. `post` needs { id, author_id, visibility }.
export async function viewerCanSeePost(viewerProfileId, post) {
  if (!post) return false;
  if (post.author_id === viewerProfileId) return true;      // your own post
  if (post.visibility === 'global') return true;            // open to everyone
  if (post.visibility === 'private') return false;          // author only

  if (post.visibility === 'custom') {
    const { data } = await supabaseAdmin
      .from('gc_post_audience')
      .select('post_id')
      .eq('post_id', post.id)
      .eq('profile_id', viewerProfileId)
      .maybeSingle();
    return !!data;
  }

  // A tiered post: the author must have filed the viewer in a category
  // whose visible tiers include this post's tier.
  const { data: edge } = await supabaseAdmin
    .from('gc_follows')
    .select('category')
    .eq('follower_id', viewerProfileId)
    .eq('followee_id', post.author_id)
    .eq('status', 'accepted')
    .maybeSingle();
  if (!edge) return false;
  return tiersVisibleTo(edge.category).includes(post.visibility);
}

// Attach reaction + comment engagement to a batch of post rows in two
// queries, whatever tier or query they came from. Each row must have `.id`.
// Returns new rows carrying:
//   reactions: { counts: { kind: n }, mine: kind|null, total }
//   commentCount: n
export async function attachEngagement(rows, viewerProfileId) {
  if (!rows || rows.length === 0) return rows || [];
  const ids = rows.map((r) => r.id);

  const [reactRes, commentRes] = await Promise.all([
    supabaseAdmin.from('gc_post_reactions').select('post_id, kind, profile_id').in('post_id', ids),
    supabaseAdmin.from('gc_post_comments').select('post_id').in('post_id', ids).is('deleted_at', null),
  ]);
  if (reactRes.error) throw reactRes.error;
  if (commentRes.error) throw commentRes.error;

  const reactByPost = new Map();
  for (const r of reactRes.data || []) {
    let e = reactByPost.get(r.post_id);
    if (!e) { e = { counts: {}, mine: null, total: 0 }; reactByPost.set(r.post_id, e); }
    e.counts[r.kind] = (e.counts[r.kind] || 0) + 1;
    e.total += 1;
    if (viewerProfileId && r.profile_id === viewerProfileId) e.mine = r.kind;
  }

  const commentByPost = new Map();
  for (const c of commentRes.data || []) {
    commentByPost.set(c.post_id, (commentByPost.get(c.post_id) || 0) + 1);
  }

  return rows.map((row) => ({
    ...row,
    reactions: reactByPost.get(row.id) || { counts: {}, mine: null, total: 0 },
    commentCount: commentByPost.get(row.id) || 0,
  }));
}

// Which of the author's tiers a follower in `category` is entitled to
// see. Tighter circles are inside looser ones: family sees everything
// short of private, a plain connection sees only the widest tiers.
export function tiersVisibleTo(category) {
  switch (category) {
    case 'family': return ['global', 'connections', 'close', 'family'];
    case 'close': return ['global', 'connections', 'close'];
    case 'connection': return ['global', 'connections'];
    default: return ['global'];
  }
}

export async function getProfileByClerkId(clerkUserId) {
  const { data, error } = await supabaseAdmin
    .from('gc_profiles')
    .select('id, handle, display_name, onboarded_at')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProfileByHandle(handle) {
  const { data, error } = await supabaseAdmin
    .from('gc_profiles')
    .select('id, handle, display_name, onboarded_at')
    .eq('handle', String(handle || '').toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Everyone the viewer has an accepted ceangal WITH, in the direction that
// matters for reading: viewer follows author, author approved it, and the
// author's label on the viewer decides which of their tiers the viewer
// can see. Returns Map(authorProfileId -> category).
export async function getAuthorsFor(viewerProfileId) {
  const { data, error } = await supabaseAdmin
    .from('gc_follows')
    .select('followee_id, category')
    .eq('follower_id', viewerProfileId)
    .eq('status', 'accepted');
  if (error) throw error;
  return new Map((data || []).map((r) => [r.followee_id, r.category || 'connection']));
}

// The viewer's own accepted followers — the people a post can be
// addressed to. Returns rows joined to the follower's profile.
export async function getFollowersOf(ownerProfileId) {
  const { data, error } = await supabaseAdmin
    .from('gc_follows')
    .select('id, status, category, created_at, follower:gc_profiles!gc_follows_follower_id_fkey(id, handle, display_name, avatar_url)')
    .eq('followee_id', ownerProfileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Hydrate the original for any rows that are reshares. reshare_of ids are
// fetched in one query and attached as `reshareOf` (public shape) or null.
// Originals are always 'global' (enforced at reshare time), so they are
// safe to show to whoever sees the reshare. A deleted/removed original
// still renders as a tombstone rather than vanishing the whole card.
export async function attachReshares(rows) {
  if (!rows || rows.length === 0) return rows || [];
  const originIds = [...new Set(rows.map((r) => r.reshare_of).filter(Boolean))];
  if (originIds.length === 0) return rows.map((r) => ({ ...r, reshareOf: null }));

  const { data, error } = await supabaseAdmin
    .from('gc_posts')
    .select('id, body, media, video, created_at, status, deleted_at, author:gc_profiles!gc_posts_author_id_fkey(id, handle, display_name, avatar_url)')
    .in('id', originIds);
  if (error) throw error;

  const byId = new Map();
  for (const o of data || []) {
    const gone = o.deleted_at || o.status !== 'visible';
    byId.set(o.id, gone
      ? { id: o.id, removed: true }
      : { id: o.id, body: o.body, media: o.media || null, video: o.video || null, created_at: o.created_at, author: publicProfile(o.author) });
  }

  return rows.map((r) => ({
    ...r,
    reshareOf: r.reshare_of ? (byId.get(r.reshare_of) || { id: r.reshare_of, removed: true }) : null,
  }));
}

// Shape a profile for the wire. Clerk ids never leave the server.
export function publicProfile(p) {
  if (!p) return null;
  return {
    id: p.id,
    handle: p.handle,
    displayName: p.display_name || (p.handle ? `@${p.handle}` : 'Gàidheal'),
    avatarUrl: p.avatar_url || null,
  };
}
