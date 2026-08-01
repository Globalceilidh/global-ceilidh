// app/api/reports/route.js
// ============================================================
// POST /api/reports   { targetType, targetId, reason, note? }
//   → auth() → resolve profile → file a report into the open queue
//     (gc_reports). targetType is 'post' | 'comment' | 'profile';
//     targetId is that thing's UUID. Nothing acts automatically — this is
//     the primitive the moderation surface reads.
//
// A person filing the same open report twice is a no-op (the partial
// unique index), returned as { ok, already: true } rather than an error.
//
// Server-side only, service-role client. auth() names the reporter; the
// client never does.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { getProfileByClerkId } from '../../../lib/social';

export const runtime = 'nodejs';

const TARGET_TYPES = ['post', 'comment', 'profile'];
const REASON_MAX = 80;
const NOTE_MAX = 2000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  let payload;
  try { payload = await req.json(); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }

  const targetType = String(payload.targetType || '');
  const targetId = String(payload.targetId || '');
  const reason = String(payload.reason || '').trim().slice(0, REASON_MAX);
  const note = payload.note ? String(payload.note).trim().slice(0, NOTE_MAX) : null;

  if (!TARGET_TYPES.includes(targetType)) return Response.json({ ok: false, error: 'bad_target_type' }, { status: 400 });
  if (!UUID_RE.test(targetId)) return Response.json({ ok: false, error: 'bad_target_id' }, { status: 400 });
  if (!reason) return Response.json({ ok: false, error: 'reason_required', reason: 'Tell us what’s wrong.' }, { status: 400 });

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    const { error } = await supabaseAdmin
      .from('gc_reports')
      .insert({
        reporter_id: me.id,
        reporter_clerk_user_id: userId,
        target_type: targetType,
        target_id: targetId,
        reason,
        note,
      });

    if (error) {
      // Already reported this exact thing and it's still open — not an error.
      if (error.code === '23505') return Response.json({ ok: true, already: true });
      throw error;
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Report failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
