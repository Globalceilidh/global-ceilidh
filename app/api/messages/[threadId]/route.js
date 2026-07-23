// app/api/messages/[threadId]/route.js
// ============================================================
// One thread's messages.
//
// GET → the messages in a thread, oldest first, and the other person. Only
//       a participant can read it. Fetching also marks the inbound messages
//       read (1:1, so "read by the other side" is unambiguous).
//
// POST → reply in this existing thread. Re-checks the connection: if the
//        ceangal was withdrawn, the thread stays but no new message lands.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getProfileByClerkId, publicProfile } from '../../../../lib/social';
import { canMessage, postMessage } from '../../../../lib/messages';

export const runtime = 'nodejs';

async function loadThread(threadId, myId) {
  const { data: thread, error } = await supabaseAdmin
    .from('gc_threads')
    .select('id, a_id, b_id, a:gc_profiles!gc_threads_a_id_fkey(id,handle,display_name,avatar_url), b:gc_profiles!gc_threads_b_id_fkey(id,handle,display_name,avatar_url)')
    .eq('id', threadId)
    .maybeSingle();
  if (error) throw error;
  if (!thread) return null;
  if (thread.a_id !== myId && thread.b_id !== myId) return { forbidden: true };
  const other = thread.a_id === myId ? thread.b : thread.a;
  return { thread, other };
}

export async function GET(_req, { params }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });
  const { threadId } = await params;

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    const loaded = await loadThread(threadId, me.id);
    if (!loaded) return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
    if (loaded.forbidden) return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });

    const { data: rows, error } = await supabaseAdmin
      .from('gc_messages')
      .select('id, sender_id, body, created_at, read_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(300);
    if (error) throw error;

    // Mark what the other person sent as read.
    await supabaseAdmin
      .from('gc_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .neq('sender_id', me.id)
      .is('read_at', null);

    return Response.json({
      ok: true,
      other: publicProfile(loaded.other),
      messages: (rows || []).map((m) => ({
        id: m.id, body: m.body, at: m.created_at, fromMe: m.sender_id === me.id,
      })),
    });
  } catch (err) {
    console.error('Thread read failed:', err);
    return Response.json({ ok: false, error: 'read_failed' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });
  const { threadId } = await params;

  let payload;
  try { payload = await req.json(); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }
  const body = String(payload.body || '').trim();
  if (!body) return Response.json({ ok: false, error: 'empty' }, { status: 400 });
  if (body.length > 4000) return Response.json({ ok: false, error: 'too_long' }, { status: 400 });

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    const loaded = await loadThread(threadId, me.id);
    if (!loaded) return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
    if (loaded.forbidden) return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });

    const allowed = await canMessage(me.id, loaded.other.id);
    if (!allowed) {
      return Response.json({ ok: false, error: 'not_connected', reason: 'This connection is no longer active.' }, { status: 403 });
    }

    const message = await postMessage(threadId, me.id, body);
    return Response.json({ ok: true, message: { id: message.id, body: message.body, at: message.created_at, fromMe: true } });
  } catch (err) {
    console.error('Reply failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
