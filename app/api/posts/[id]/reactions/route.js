// app/api/posts/[id]/reactions/route.js
// ============================================================
// POST /api/posts/<id>/reactions   { kind }
//   → auth() → resolve profile → confirm the caller can see the post →
//     set the caller's reaction to `kind`, or clear it if `kind` is null
//     or the same kind already held (a tap on your own reaction toggles it
//     off). At most one reaction per person per post (the UNIQUE row).
//     Returns { ok, reactions } — the recomputed summary.
//
// Server-side only, service-role client. auth() is the sole authority on
// who reacts; the client never names the reactor.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { getProfileByClerkId, viewerCanSeePost, REACTION_KINDS } from '../../../../../lib/social';

export const runtime = 'nodejs';

async function summarise(postId, viewerProfileId) {
  const { data, error } = await supabaseAdmin
    .from('gc_post_reactions')
    .select('kind, profile_id')
    .eq('post_id', postId);
  if (error) throw error;
  const counts = {};
  let mine = null;
  for (const r of data || []) {
    counts[r.kind] = (counts[r.kind] || 0) + 1;
    if (r.profile_id === viewerProfileId) mine = r.kind;
  }
  return { counts, mine, total: (data || []).length };
}

export async function POST(req, { params }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  let payload;
  try { payload = await req.json(); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }
  const kind = payload.kind ? String(payload.kind) : null;
  if (kind && !REACTION_KINDS.includes(kind)) {
    return Response.json({ ok: false, error: 'bad_kind' }, { status: 400 });
  }

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    const { data: post, error: postErr } = await supabaseAdmin
      .from('gc_posts')
      .select('id, author_id, visibility, status, deleted_at')
      .eq('id', id)
      .maybeSingle();
    if (postErr) throw postErr;
    if (!post || post.deleted_at || post.status !== 'visible') {
      return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    if (!(await viewerCanSeePost(me.id, post))) {
      return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }

    // What do I hold now? A repeat of the same kind, or an explicit null,
    // clears; anything else sets.
    const { data: existing } = await supabaseAdmin
      .from('gc_post_reactions')
      .select('id, kind')
      .eq('post_id', id)
      .eq('profile_id', me.id)
      .maybeSingle();

    if (!kind || (existing && existing.kind === kind)) {
      if (existing) await supabaseAdmin.from('gc_post_reactions').delete().eq('id', existing.id);
    } else {
      const { error: upErr } = await supabaseAdmin
        .from('gc_post_reactions')
        .upsert(
          { post_id: id, profile_id: me.id, reactor_clerk_user_id: userId, kind },
          { onConflict: 'post_id,profile_id' },
        );
      if (upErr) throw upErr;
    }

    return Response.json({ ok: true, reactions: await summarise(id, me.id) });
  } catch (err) {
    console.error('Reaction failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
