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
