// app/duilleag/messages/page.js
// Teachdaireachdan — the messenger. A private surface like the Duilleag
// itself: gate on Clerk, require an onboarded profile, then hand the client
// the caller's own handle. Everything else it fetches for itself.

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getProfileByClerkId } from '../../../lib/social';
import Messenger from './Messenger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Teachdaireachdan · Global Ceilidh',
  robots: { index: false, follow: false },
};

export default async function MessagesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const me = await getProfileByClerkId(userId);
  if (!me || !me.onboarded_at) redirect('/welcome');

  return <Messenger meHandle={me.handle} />;
}
