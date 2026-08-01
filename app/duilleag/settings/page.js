// app/duilleag/settings/page.js
// Duilleag settings. Linked from the Duilleag nav but never built until now
// (it 404'd). First section: Location & map visibility — the home for the
// "hide yourself" control. Onboarding is where you opt IN and we geocode
// you; this is where you change your place or step off the map later.
//
// Server component: same gate as the Duilleag itself — signed out → sign-in,
// signed in but not onboarded → /welcome. Resolves the caller's own profile
// and hands it to the client. Nobody sees anyone's settings but their own.

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';
import SettingsClient from './SettingsClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Roghainnean · Global Ceilidh',
  robots: { index: false, follow: false },
};

async function getProfile(clerkUserId) {
  const { data } = await supabaseAdmin
    .from('gc_profiles')
    .select('handle, display_name, avatar_url, region, lat, lng, location_public, onboarded_at')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();
  return data;
}

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const profile = await getProfile(userId);
  if (!profile || !profile.onboarded_at) redirect('/welcome');

  return (
    <SettingsClient
      profile={{
        handle: profile.handle,
        displayName: profile.display_name || `@${profile.handle}`,
        avatarUrl: profile.avatar_url || null,
        region: profile.region,
        lat: profile.lat === null ? null : Number(profile.lat),
        lng: profile.lng === null ? null : Number(profile.lng),
        locationPublic: !!profile.location_public,
      }}
    />
  );
}
