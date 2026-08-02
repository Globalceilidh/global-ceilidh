// app/api/radio/react/route.js
// Anonymous, quick reactions to the currently-playing song on /radio.
// Four kinds only (Whitey): tonnssuas · tonnsios · gradh · fearagach.
// One reaction per (track, listener); posting a new kind updates it, posting
// the same kind again clears it. Deduped by a salted IP hash — the same
// scheme the radio Vote/Request routes use. Aggregate counts only; no identity.

import crypto from 'crypto';
import { supabaseAdmin } from '../../../../lib/supabase';

const KINDS = new Set(['tonnsuas', 'tonnsios', 'gradh', 'fearagach']);
const IP_SALT = process.env.GC_RADIO_IP_SALT || 'gc-radio-default-salt';

function norm(s) {
  return (s || '')
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function getIp(request) {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function hashIp(ip) {
  return crypto.createHash('sha256').update((ip || 'unknown') + IP_SALT).digest('hex').slice(0, 32);
}

async function tally(an, tn) {
  const { data } = await supabaseAdmin
    .from('gc_radio_reaction_counts')
    .select('kind,n')
    .eq('artist_norm', an)
    .eq('title_norm', tn);
  const counts = {};
  (data || []).forEach((r) => { counts[r.kind] = Number(r.n); });
  return counts;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const an = norm(searchParams.get('artist') || '');
  const tn = norm(searchParams.get('title') || '');
  if (!an || !tn) return Response.json({ ok: true, counts: {}, mine: null });

  const counts = await tally(an, tn);
  const ipHash = hashIp(getIp(request));
  const { data: mineRow } = await supabaseAdmin
    .from('gc_radio_reactions')
    .select('kind')
    .eq('artist_norm', an)
    .eq('title_norm', tn)
    .eq('ip_hash', ipHash)
    .limit(1);
  return Response.json({ ok: true, counts, mine: (mineRow && mineRow[0]?.kind) || null });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const artist = (body.artist || '').toString();
  const title = (body.title || '').toString();
  const kind = (body.kind || '').toString();
  const an = norm(artist);
  const tn = norm(title);
  if (!an || !tn) return Response.json({ ok: false, error: 'No track playing.' }, { status: 400 });
  if (kind && !KINDS.has(kind)) return Response.json({ ok: false, error: 'Unknown reaction.' }, { status: 400 });

  const ipHash = hashIp(getIp(request));
  try {
    if (!kind) {
      // Empty kind = clear the listener's reaction to this track.
      await supabaseAdmin
        .from('gc_radio_reactions')
        .delete()
        .eq('artist_norm', an)
        .eq('title_norm', tn)
        .eq('ip_hash', ipHash);
    } else {
      await supabaseAdmin.from('gc_radio_reactions').upsert(
        {
          artist, title, artist_norm: an, title_norm: tn,
          kind, ip_hash: ipHash, updated_at: new Date().toISOString(),
        },
        { onConflict: 'artist_norm,title_norm,ip_hash' },
      );
    }
  } catch (e) {
    return Response.json({ ok: false, error: 'Could not record reaction.' }, { status: 500 });
  }

  const counts = await tally(an, tn);
  return Response.json({ ok: true, counts, mine: kind || null });
}
