// lib/messages.js
// Server-side helpers for direct messages (gc_threads, gc_messages).
// Service-role client — never import into a client component.
//
// The one rule everything here enforces: you can only message an
// established connection. `canMessage` is the gate; the API calls it before
// any thread is touched. Tier fan-out (`groupRecipients`) resolves against
// the SENDER's own accepted followers, so it can only ever reach people the
// sender themselves filed — never a stranger.

import { supabaseAdmin } from './supabase';

// Canonical ordering so a pair maps to exactly one thread regardless of who
// starts it. UUIDs compare lexicographically, matching the a_id < b_id CHECK.
function orderPair(x, y) {
  return x < y ? [x, y] : [y, x];
}

// Is there an accepted ceangal between me and them, in either direction?
export async function canMessage(myId, otherId) {
  if (!otherId || myId === otherId) return false;
  const { data, error } = await supabaseAdmin
    .from('gc_follows')
    .select('id')
    .eq('status', 'accepted')
    .or(`and(follower_id.eq.${myId},followee_id.eq.${otherId}),and(follower_id.eq.${otherId},followee_id.eq.${myId})`)
    .limit(1);
  if (error) throw error;
  return (data || []).length > 0;
}

// The people a tier fan-out reaches: the sender's accepted followers filed
// at that tier or tighter (family ⊂ close ⊂ connection). 'connection' (or
// anything unrecognised) means every accepted follower. Returns profile ids.
export async function groupRecipients(myId, tier) {
  const cats =
    tier === 'family' ? ['family'] :
    tier === 'close' ? ['close', 'family'] :
    ['connection', 'close', 'family'];

  const { data, error } = await supabaseAdmin
    .from('gc_follows')
    .select('follower_id')
    .eq('followee_id', myId)
    .eq('status', 'accepted')
    .in('category', cats);
  if (error) throw error;
  return (data || []).map((r) => r.follower_id);
}

// Find or create the single thread for a pair. Returns the thread id.
export async function getOrCreateThread(x, y) {
  const [a, b] = orderPair(x, y);

  const { data: found, error: findErr } = await supabaseAdmin
    .from('gc_threads')
    .select('id')
    .eq('a_id', a)
    .eq('b_id', b)
    .maybeSingle();
  if (findErr) throw findErr;
  if (found) return found.id;

  const { data: made, error: insErr } = await supabaseAdmin
    .from('gc_threads')
    .insert({ a_id: a, b_id: b })
    .select('id')
    .single();
  // Someone raced us to it — take theirs.
  if (insErr) {
    if (insErr.code === '23505') {
      const { data: again } = await supabaseAdmin
        .from('gc_threads').select('id').eq('a_id', a).eq('b_id', b).single();
      return again.id;
    }
    throw insErr;
  }
  return made.id;
}

// Insert a message and bump the thread's last_message_at.
export async function postMessage(threadId, senderId, body) {
  const { data, error } = await supabaseAdmin
    .from('gc_messages')
    .insert({ thread_id: threadId, sender_id: senderId, body })
    .select('id, thread_id, sender_id, body, created_at, read_at')
    .single();
  if (error) throw error;
  await supabaseAdmin
    .from('gc_threads')
    .update({ last_message_at: data.created_at })
    .eq('id', threadId);
  return data;
}
