// app/api/connections/[id]/route.js
// Respond to, re-file, or end a ceangal.
//
// PATCH  { action: 'accept', category }  — approve a pending request and
//                                          file the person. Accepting IS
//                                          categorising: the tier decides
//                                          what they'll ever see.
//        { action: 'recategorise', category } — move an existing one
//        { action: 'block' }                  — refuse without deleting,
//                                               so the same person can't
//                                               simply ask again
//
// DELETE — remove the edge entirely. Valid from either side: the
//          followee dropping someone, or the follower withdrawing.
//
// Authorisation is by ROW, not by role: the caller must be one end of
// this specific edge, and only the followee may accept or file. A
// follower who could set their own category would be choosing what they
// get to see.

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getProfileByClerkId, CATEGORIES } from '../../../../lib/social';

export const runtime = 'nodejs';

async function loadEdge(id) {
  const { data, error } = await supabaseAdmin
    .from('gc_follows')
    .select('id, follower_id, followee_id, status, category')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  let payload;
  try { payload = await req.json(); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }

  const action = String(payload.action || '');
  const category = payload.category ? String(payload.category) : null;

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    const edge = await loadEdge(id);
    if (!edge) return Response.json({ ok: false, error: 'not_found' }, { status: 404 });

    // Only the person being followed decides anything about this edge.
    if (edge.followee_id !== me.id) {
      return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }

    let patch;
    if (action === 'accept' || action === 'recategorise') {
      if (!CATEGORIES.includes(category)) {
        return Response.json({ ok: false, error: 'bad_category' }, { status: 400 });
      }
      patch = { status: 'accepted', category, responded_at: new Date().toISOString() };
    } else if (action === 'block') {
      patch = { status: 'blocked', category: null, responded_at: new Date().toISOString() };
    } else {
      return Response.json({ ok: false, error: 'bad_action' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('gc_follows')
      .update(patch)
      .eq('id', id)
      .select('id, status, category')
      .single();
    if (error) throw error;

    return Response.json({ ok: true, connection: data });
  } catch (err) {
    console.error('Connection update failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    const edge = await loadEdge(id);
    if (!edge) return Response.json({ ok: true, already: true });

    if (edge.follower_id !== me.id && edge.followee_id !== me.id) {
      return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from('gc_follows').delete().eq('id', id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Connection delete failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
