// app/api/presence/beat/route.js
// Presence heartbeat. The whole site beats here every ~30s while the tab is
// visible (see components/PresenceBeat.js). One row per session_id, upserted
// with a fresh last_seen; /api/metrics/live counts the recent ones.
//
// Open to anonymous callers by design — we want visitors, not just members —
// so session_id is a client-generated id we simply trust. It's a vanity
// concurrency gauge, not a security boundary; if it ever needs hardening,
// rate-limit by IP here.

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export const runtime = 'nodejs';

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { body = {}; }

  const sessionId = String(body.session_id || '').trim().slice(0, 64);
  if (!sessionId) return Response.json({ ok: false, error: 'no_session' }, { status: 400 });

  let userId = null;
  try { userId = (await auth()).userId || null; } catch { /* anon is fine */ }

  try {
    await supabaseAdmin
      .from('gc_presence')
      .upsert(
        { session_id: sessionId, user_id: userId, last_seen: new Date().toISOString() },
        { onConflict: 'session_id' },
      );
  } catch { /* table not applied yet — ignore so the site never breaks on this */ }

  return Response.json({ ok: true });
}
