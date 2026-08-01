// app/t/[tag]/page.js
// A hashtag page: every post carrying #<tag> that you're allowed to see.
// Public topic, private-safe — the /api/tags route does the audience
// enforcement; this page just gates on sign-in and renders.

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';
import TagFeed from './TagFeed';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { tag } = await params;
  return {
    title: `#${decodeURIComponent(tag)} · Global Ceilidh`,
    robots: { index: false, follow: false },
  };
}

export default async function TagPage({ params }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag || '').toLowerCase();

  const { data: profile } = await supabaseAdmin
    .from('gc_profiles')
    .select('handle, onboarded_at')
    .eq('clerk_user_id', userId)
    .maybeSingle();
  if (!profile || !profile.onboarded_at) redirect('/welcome');

  return <TagFeed tag={tag} viewerHandle={profile.handle} />;
}
