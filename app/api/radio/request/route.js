// GC Radio — Song request endpoint.
//
// POST { song_title, artist_name?, album_name?, notes?, honeypot? }
//
// Guards:
//   - honeypot (silent success)
//   - 3 requests per 10 minutes per IP (in-memory)
//   - text length caps
//
// Requests land unfiltered in gc_radio_requests with status='pending'.
// sruth-admin surfaces them for review.

import crypto from 'crypto';
import { supabaseAdmin } from '../../../../lib/supabase';

export const runtime = 'nodejs';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const IP_SALT = process.env.GC_RADIO_IP_SALT || 'gc-radio-default-salt';

const recentByIp = new Map();

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

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { song_title, artist_name, album_name, notes, honeypot } = body || {};

  if (honeypot && String(honeypot).trim() !== '') {
    return Response.json({ ok: true });
  }

  const title = String(song_title || '').trim();
  if (title.length < 2) {
    return Response.json({ ok: false, error: 'Song title required' }, { status: 400 });
  }

  const ipHash = hashIp(getIp(request));
  const now = Date.now();
  const recent = (recentByIp.get(ipHash) || []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    return Response.json(
      { ok: false, error: 'Too many requests recently — try again later.' },
      { status: 429 }
    );
  }

  const np = await fetchNowPlaying(request);
  const userAgent = (request.headers.get('user-agent') || '').slice(0, 200);

  try {
    const { error } = await supabaseAdmin
      .from('gc_radio_requests')
      .insert({
        song_title: title.slice(0, 300),
        artist_name: artist_name ? String(artist_name).trim().slice(0, 200) : null,
        album_name: album_name ? String(album_name).trim().slice(0, 200) : null,
        notes: notes ? String(notes).trim().slice(0, 500) : null,
        ip_hash: ipHash,
        now_playing_track: np.track,
        now_playing_artist: np.artist,
        user_agent: userAgent,
      });
    if (error) throw error;

    recent.push(now);
    recentByIp.set(ipHash, recent);
    if (recentByIp.size > 5000) {
      const cutoff = now - WINDOW_MS * 2;
      for (const [k, arr] of recentByIp) {
        const kept = arr.filter(t => t >= cutoff);
        if (kept.length === 0) recentByIp.delete(k);
        else recentByIp.set(k, kept);
      }
    }

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
