// GC Radio — Vote endpoint.
//
// POST { category_id, target_type: 'nominee'|'writein',
//        target_id?, writein_label?, honeypot? }
//
// Guards:
//   - honeypot (silent success for bots)
//   - per-IP throttle (60s between any votes, in-memory)
//   - DB unique index (category, ip_hash, day) — one vote per
//     category per IP per day
//
// Write-in logic:
//   - dedup by lowercased trimmed label
//   - increment vote_count
//   - when it hits 5, promote to gc_radio_poll_nominees (source='promoted')
//
// GET  ?category=<id>  → nominees for that category
// GET  (no query)      → active categories

import crypto from 'crypto';
import { supabaseAdmin } from '../../../../lib/supabase';

export const runtime = 'nodejs';

const RATE_WINDOW_MS = 60 * 1000;
const PROMOTION_THRESHOLD = 5;
const IP_SALT = process.env.GC_RADIO_IP_SALT || 'gc-radio-default-salt';
const VALID_CATEGORIES = new Set(['best-artist', 'best-song', 'best-album']);

// In-memory throttle. Resets on cold start; per Vercel Function instance.
// DB unique constraint is the real backstop against multi-vote abuse; this
// just cuts down on obvious spam bursts.
const lastVoteAt = new Map();

function hashIp(ip) {
  return crypto.createHash('sha256').update((ip || 'unknown') + IP_SALT).digest('hex').slice(0, 32);
}

function getIp(request) {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

async function fetchNowPlaying(request) {
  try {
    const url = new URL('/api/live365/nowplaying', request.url).toString();
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { track: null, artist: null };
    const json = await res.json();
    return { track: json.track || null, artist: json.artist || null };
  } catch {
    return { track: null, artist: null };
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  const category_id = url.searchParams.get('category');

  if (!category_id) {
    const { data, error } = await supabaseAdmin
      .from('gc_radio_poll_categories')
      .select('id, label, sort_order')
      .eq('active', true)
      .order('sort_order');
    if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
    return Response.json({ ok: true, categories: data });
  }

  if (!VALID_CATEGORIES.has(category_id)) {
    return Response.json({ ok: false, error: 'Invalid category' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('gc_radio_poll_nominees')
    .select('id, label, subtitle')
    .eq('category_id', category_id)
    .eq('active', true)
    .order('label');
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true, nominees: data });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { category_id, target_type, target_id, writein_label, honeypot } = body || {};

  // Bot honeypot — return 200 so bots don't retry, but skip all work
  if (honeypot && String(honeypot).trim() !== '') {
    return Response.json({ ok: true });
  }

  if (!VALID_CATEGORIES.has(category_id)) {
    return Response.json({ ok: false, error: 'Invalid category' }, { status: 400 });
  }
  if (!['nominee', 'writein'].includes(target_type)) {
    return Response.json({ ok: false, error: 'Invalid target_type' }, { status: 400 });
  }

  const ipHash = hashIp(getIp(request));
  const now = Date.now();
  const last = lastVoteAt.get(ipHash) || 0;
  if (now - last < RATE_WINDOW_MS) {
    return Response.json(
      { ok: false, error: 'Please wait a moment between votes.' },
      { status: 429 }
    );
  }

  const nowPlaying = await fetchNowPlaying(request);
  const userAgent = (request.headers.get('user-agent') || '').slice(0, 200);

  try {
    let voteTargetId = target_id;
    let voteTargetType = target_type;
    let promoted = false;
    let promotedNomineeId = null;

    if (target_type === 'writein') {
      const raw = String(writein_label || '').trim();
      if (raw.length < 2) {
        return Response.json({ ok: false, error: 'Write-in too short' }, { status: 400 });
      }
      if (raw.length > 200) {
        return Response.json({ ok: false, error: 'Write-in too long' }, { status: 400 });
      }
      const normalized = raw.toLowerCase().replace(/\s+/g, ' ');

      // Upsert write-in row
      const { data: existing, error: selErr } = await supabaseAdmin
        .from('gc_radio_poll_writeins')
        .select('id, vote_count, promoted_to_nominee_id')
        .eq('category_id', category_id)
        .eq('normalized', normalized)
        .maybeSingle();
      if (selErr) throw selErr;

      let writeinId;
      let currentCount = 0;
      let alreadyPromoted = null;

      if (existing) {
        writeinId = existing.id;
        currentCount = existing.vote_count;
        alreadyPromoted = existing.promoted_to_nominee_id;
      } else {
        const { data: created, error: insErr } = await supabaseAdmin
          .from('gc_radio_poll_writeins')
          .insert({ category_id, label: raw, normalized })
          .select('id')
          .single();
        if (insErr) throw insErr;
        writeinId = created.id;
      }

      voteTargetId = writeinId;

      // If already promoted, redirect the vote to the promoted nominee
      // so it counts on the real leaderboard.
      if (alreadyPromoted) {
        voteTargetId = alreadyPromoted;
        voteTargetType = 'nominee';
      }

      const { error: voteErr } = await supabaseAdmin
        .from('gc_radio_poll_votes')
        .insert({
          category_id,
          target_type: voteTargetType,
          target_id: voteTargetId,
          ip_hash: ipHash,
          now_playing_track: nowPlaying.track,
          now_playing_artist: nowPlaying.artist,
          user_agent: userAgent,
        });
      if (voteErr) {
        if (voteErr.code === '23505') {
          return Response.json(
            { ok: false, error: 'You already voted in this category today.' },
            { status: 409 }
          );
        }
        throw voteErr;
      }

      // Increment write-in count only if we recorded to the write-in row
      if (voteTargetType === 'writein') {
        const newCount = currentCount + 1;
        await supabaseAdmin
          .from('gc_radio_poll_writeins')
          .update({ vote_count: newCount })
          .eq('id', writeinId);

        if (newCount >= PROMOTION_THRESHOLD && !alreadyPromoted) {
          const { data: nominee, error: nomErr } = await supabaseAdmin
            .from('gc_radio_poll_nominees')
            .insert({ category_id, label: raw, source: 'promoted' })
            .select('id')
            .single();
          if (!nomErr && nominee) {
            await supabaseAdmin
              .from('gc_radio_poll_writeins')
              .update({ promoted_to_nominee_id: nominee.id })
              .eq('id', writeinId);
            promoted = true;
            promotedNomineeId = nominee.id;
          }
        }
      }
    } else {
      if (!target_id) {
        return Response.json({ ok: false, error: 'Missing target_id' }, { status: 400 });
      }
      // Confirm nominee exists and matches category
      const { data: nominee, error: nomErr } = await supabaseAdmin
        .from('gc_radio_poll_nominees')
        .select('id, category_id, active')
        .eq('id', target_id)
        .maybeSingle();
      if (nomErr) throw nomErr;
      if (!nominee || nominee.category_id !== category_id || !nominee.active) {
        return Response.json({ ok: false, error: 'Nominee not found' }, { status: 404 });
      }

      const { error: voteErr } = await supabaseAdmin
        .from('gc_radio_poll_votes')
        .insert({
          category_id,
          target_type: 'nominee',
          target_id,
          ip_hash: ipHash,
          now_playing_track: nowPlaying.track,
          now_playing_artist: nowPlaying.artist,
          user_agent: userAgent,
        });
      if (voteErr) {
        if (voteErr.code === '23505') {
          return Response.json(
            { ok: false, error: 'You already voted in this category today.' },
            { status: 409 }
          );
        }
        throw voteErr;
      }
    }

    lastVoteAt.set(ipHash, now);
    // Occasional cleanup so the throttle map doesn't grow unbounded
    if (lastVoteAt.size > 5000) {
      const cutoff = now - RATE_WINDOW_MS * 4;
      for (const [k, t] of lastVoteAt) if (t < cutoff) lastVoteAt.delete(k);
    }

    return Response.json({
      ok: true,
      promoted,
      new_nominee_id: promotedNomineeId,
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
