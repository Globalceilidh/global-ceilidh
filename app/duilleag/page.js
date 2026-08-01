// app/duilleag/page.js
// The Duilleag-cèilidh — a person's own private room on Global Ceilidh.
//
// This is NOT a profile page. Nobody but the owner ever sees it: no
// visitor view, no public mode, no handle in the URL. Whitey's rule —
// "No one should ever see anyone's page but their own." What other
// people can see of you lives at /u/<handle> (identity card + posts you
// marked `global`) and in their own feed.
//
// Server component: gate on Clerk, resolve the profile, hand the shell
// its data. Anyone signed out goes to sign-in; anyone signed in but not
// yet onboarded goes to /welcome, because the whole surface hangs off a
// gc_profiles row.

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../lib/supabase';
import { attachEngagement, attachReshares } from '../../lib/social';
import DuilleagShell from './DuilleagShell';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'An Duilleag-chèilidh · Global Ceilidh',
  // Private by definition — never index it, never follow out of it.
  robots: { index: false, follow: false },
};

async function getProfile(clerkUserId) {
  const { data } = await supabaseAdmin
    .from('gc_profiles')
    .select('id, handle, display_name, avatar_url, region, lat, lng, location_public, gaidhlig_level, onboarded_at')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();
  return data;
}

// The owner's own posts, every tier. This is their room — nothing is
// filtered out of it. Audience filtering is what the *feed* does.
async function getOwnPosts(authorId) {
  const { data } = await supabaseAdmin
    .from('gc_posts')
    .select('id, body, visibility, created_at, media, reshare_of')
    .eq('author_id', authorId)
    .eq('status', 'visible')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(30);
  const withEngagement = await attachEngagement(data || [], authorId);
  return attachReshares(withEngagement);
}

export default async function DuilleagPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const profile = await getProfile(userId);
  if (!profile || !profile.onboarded_at) redirect('/welcome');

  const posts = await getOwnPosts(profile.id);

  return (
    <DuilleagShell
      profile={{
        handle: profile.handle,
        displayName: profile.display_name || `@${profile.handle}`,
        avatarUrl: profile.avatar_url,
        region: profile.region,
        lat: profile.lat === null ? null : Number(profile.lat),
        lng: profile.lng === null ? null : Number(profile.lng),
        locationPublic: !!profile.location_public,
      }}
      initialPosts={posts}
    />
  );
}
