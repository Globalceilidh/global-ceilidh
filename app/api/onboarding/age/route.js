// app/api/onboarding/age/route.js
// Age gate — collected once, before the profile form. Enforces the 13+
// minimum to create an account and stamps age_verified_at on the user's
// gc_profiles row. Birth year is stored for later gating (16+ rooms, 18+
// paid) but never displayed on the public Duilleag-cèilidh.

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export const runtime = 'nodejs';

const MIN_AGE = 13;

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }

  const year = parseInt(body.birth_year, 10);
  const now = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 1900 || year > now) {
    return Response.json({ ok: false, error: 'invalid_year' }, { status: 400 });
  }

  // Birth-year age is approximate (±1y); the gate errs toward the youngest
  // possible age for that year, so a 13th-birthday-this-year account passes.
  const age = now - year;
  if (age < MIN_AGE) {
    return Response.json({ ok: false, error: 'under_age', min_age: MIN_AGE }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from('gc_profiles')
    .upsert(
      {
        clerk_user_id: userId,
        birth_year: year,
        age_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_user_id' }
    );

  if (error) {
    console.error('Age gate upsert failed:', error);
    return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
  }
  return Response.json({ ok: true });
}
