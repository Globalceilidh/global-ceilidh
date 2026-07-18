// app/welcome/page.js
// First-run onboarding. Server component: gate on Clerk, skip users who
// already onboarded, otherwise hand the form sensible defaults pulled
// from their Clerk account.

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '../../lib/supabase';
import OnboardingClient from './OnboardingClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Fàilte · Global Ceilidh',
  robots: { index: false, follow: false },
};

// Seed a handle suggestion from the Clerk username / first name.
function suggestHandle(user) {
  const base = (user?.username || user?.firstName || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
  return base.length >= 3 ? base.slice(0, 30) : '';
}

export default async function WelcomePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/welcome');

  const { data: profile } = await supabaseAdmin
    .from('gc_profiles')
    .select('handle, display_name, email, avatar_url, onboarded_at')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  // Already onboarded → straight to their page.
  if (profile?.onboarded_at && profile?.handle) {
    redirect(`/u/${profile.handle}`);
  }

  const user = await currentUser();
  const primaryEmail =
    user?.emailAddresses?.find((e) => e.id === user?.primaryEmailAddressId)?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    '';
  const defaults = {
    display_name:
      profile?.display_name ||
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      '',
    email: profile?.email || primaryEmail,
    avatar_url: profile?.avatar_url || user?.imageUrl || '',
    handle: suggestHandle(user),
  };

  return <OnboardingClient defaults={defaults} />;
}
