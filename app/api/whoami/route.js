// app/api/whoami/route.js
// GET → returns the SIGNED-IN caller's own Clerk user id + profile handle.
// Only ever exposes the caller's own identity (auth() decides who that is),
// so there's nothing to leak. Handy for seeding host_user_id on a room, or
// confirming which account you're signed in as.

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });
  }
  const { data } = await supabaseAdmin
    .from('gc_profiles')
    .select('handle, display_name')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  return Response.json({
    ok: true,
    clerk_user_id: userId,
    handle: data?.handle || null,
    display_name: data?.display_name || null,
  });
}
