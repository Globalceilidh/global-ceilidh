// app/api/messages/route.js
// ============================================================
// Teachdaireachdan — direct messages.
//
// GET  → my threads, newest first: the other person, a preview of the last
//        message, and my unread count for each.
//
// POST → send a message. Either:
//          { to: <handle>, body }        → one person
//          { group: 'connection'|'close'|'family', body } → fan out to that
//            tier of MY accepted followers, one private thread each.
//        Every recipient is checked against gc_follows first: you can only
//        message an established connection. The client never names the
//        sender — the Clerk session does.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { getProfileByClerkId, getProfileByHandle, publicProfile } from '../../../lib/social';
import { canMessage, groupRecipients, getOrCreateThread, postMessage } from '../../../lib/messages';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  try {
    const me = await getProfileByClerkId(userId);
    if (!me) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    const { data: threads, error } = await supabaseAdmin
      .from('gc_threads')
      .select('id, a_id, b_id, last_message_at, a:gc_profiles!gc_threads_a_id_fkey(id,handle,display_name,avatar_url), b:gc_profiles!gc_threads_b_id_fkey(id,handle,display_name,avatar_url)')
      .or(`a_id.eq.${me.id},b_id.eq.${me.id}`)
      .order('last_message_at', { ascending: false })
      .limit(60);
    if (error) throw error;

    const ids = (threads || []).map((t) => t.id);
    const lastByThread = new Map();
    const unreadByThread = new Map();
    if (ids.length) {
      const { data: msgs } = await supabaseAdmin
        .from('gc_messages')
        .select('thread_id, body, created_at, sender_id, read_at')
        .in('thread_id', ids)
        .order('created_at', { ascending: false })
        .limit(600);
      for (const m of msgs || []) {
        if (!lastByThread.has(m.thread_id)) lastByThread.set(m.thread_id, m);
        if (m.sender_id !== me.id && !m.read_at) {
          unreadByThread.set(m.thread_id, (unreadByThread.get(m.thread_id) || 0) + 1);
        }
      }
    }

    const list = (threads || []).map((t) => {
      const other = t.a_id === me.id ? t.b : t.a;
      const last = lastByThread.get(t.id);
      return {
        id: t.id,
        person: publicProfile(other),
        lastMessageAt: t.last_message_at,
        preview: last ? { body: last.body, fromMe: last.sender_id === me.id, at: last.created_at } : null,
        unread: unreadByThread.get(t.id) || 0,
      };
    });

    return Response.json({ ok: true, threads: list });
  } catch (err) {
    console.error('Thread list failed:', err);
    return Response.json({ ok: false, error: 'list_failed' }, { status: 500 });
  }
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });

  let payload;
  try { payload = await req.json(); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }

  const body = String(payload.body || '').trim();
  if (!body) return Response.json({ ok: false, error: 'empty' }, { status: 400 });
  if (body.length > 4000) return Response.json({ ok: false, error: 'too_long' }, { status: 400 });

  try {
    const me = await getProfileByClerkId(userId);
    if (!me || !me.onboarded_at) return Response.json({ ok: false, error: 'no_profile' }, { status: 403 });

    // ── Fan-out to a tier ──────────────────────────────────────────────
    if (payload.group) {
      const tier = String(payload.group);
      const recipients = await groupRecipients(me.id, tier);
      if (recipients.length === 0) {
        return Response.json({ ok: true, sent: 0, reason: 'No one in that circle yet.' });
      }
      let sent = 0;
      for (const rid of recipients) {
        const threadId = await getOrCreateThread(me.id, rid);
        await postMessage(threadId, me.id, body);
        sent += 1;
      }
      return Response.json({ ok: true, sent });
    }

    // ── One person ─────────────────────────────────────────────────────
    const handle = String(payload.to || '').trim().toLowerCase();
    if (!handle) return Response.json({ ok: false, error: 'to_required' }, { status: 400 });

    const them = await getProfileByHandle(handle);
    if (!them) return Response.json({ ok: false, error: 'not_found' }, { status: 404 });

    const allowed = await canMessage(me.id, them.id);
    if (!allowed) {
      return Response.json(
        { ok: false, error: 'not_connected', reason: 'You can only message an established connection.' },
        { status: 403 },
      );
    }

    const threadId = await getOrCreateThread(me.id, them.id);
    const message = await postMessage(threadId, me.id, body);
    return Response.json({ ok: true, threadId, message: { ...message, fromMe: true } });
  } catch (err) {
    console.error('Send message failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
