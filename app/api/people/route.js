// app/api/people/route.js
// ============================================================
// People discovery — the way INTO the Ceangal graph.
//
// GET /api/people?q=<query> → members whose handle or display name match,
// each annotated with the caller's relationship to them so the UI can show
// the right button:
//     none       → not connected, no request either way   ("Connect")
//     requested  → I have already asked them               ("Requested")
//     incoming   → they have asked me                      ("Asked you")
//     connected  → accepted ceangal                        ("Connected")
//     blocked    → declined/blocked
//
// With no query (or <2 chars) it returns the most recent members as
// suggestions, so an empty search box is still a place to start rather
// than a dead end. Server-side only; the Clerk session is the sole
// authority on who the caller is.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { getProfileByClerkId, publicProfile } from '../../../lib/social';

export const runtime = 'nodejs';

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  // Strip the characters that would break a PostgREST or() filter, and cap
  // the length — this string goes into an ilike pattern.
  const raw = new URL(req.url).searchParams.get('q') || '';
  const q = raw.replace(/[,()%*\\]/g, '').trim().slice(0, 40);

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    let query = supabaseAdmin
      .from('gc_profiles')
      .select('id, handle, display_name, avatar_url, region')
      .not('onboarded_at', 'is', null)
      .neq('id', me.id)
      .limit(16);

    if (q.length >= 2) {
      const like = `%${q}%`;
      query = query.or(`handle.ilike.${like},display_name.ilike.${like}`);
    } else {
      query = query.order('onboarded_at', { ascending: false });
    }

    const { data: people, error } = await query;
    if (error) throw error;

    // Annotate each with my relationship to them. Two small lookups rather
    // than one clever join — accepted always wins over pending.
    const ids = (people || []).map((p) => p.id);
    const rel = new Map();
    if (ids.length) {
      const [{ data: out }, { data: inc }] = await Promise.all([
        supabaseAdmin.from('gc_follows').select('followee_id, status').eq('follower_id', me.id).in('followee_id', ids),
        supabaseAdmin.from('gc_follows').select('follower_id, status').eq('followee_id', me.id).in('follower_id', ids),
      ]);
      for (const e of out || []) {
        rel.set(e.followee_id, e.status === 'accepted' ? 'connected' : e.status === 'blocked' ? 'blocked' : 'requested');
      }
      for (const e of inc || []) {
        if (rel.get(e.follower_id) === 'connected') continue;
        rel.set(e.follower_id, e.status === 'accepted' ? 'connected' : (rel.get(e.follower_id) || 'incoming'));
      }
    }

    return Response.json({
      ok: true,
      people: (people || []).map((p) => ({
        ...publicProfile(p),
        region: p.region || null,
        rel: rel.get(p.id) || 'none',
      })),
    });
  } catch (err) {
    console.error('People search failed:', err);
    return Response.json({ ok: false, error: 'search_failed' }, { status: 500 });
  }
}
