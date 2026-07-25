// app/api/metrics/live/route.js
// Live dashboard numbers for the Sruth admin:
//   activeUsers — distinct sessions with a presence heartbeat in the last 60s
//                 (from gc_presence; null until the table is applied)
//   inRooms     — total participants across all Ceilidh Rooms, straight from
//                 LiveKit (the source of truth); rooms[] gives the breakdown
//
// Read cross-origin by admin.globalceilidh.com, so it carries CORS for that
// origin. Aggregate counts only — no PII — so exposing it there is fine.

import { supabaseAdmin } from '../../../../lib/supabase';
import { RoomServiceClient } from 'livekit-server-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_ORIGIN = 'https://admin.globalceilidh.com';

function withCors(res) {
  res.headers.set('Access-Control-Allow-Origin', ADMIN_ORIGIN);
  res.headers.set('Vary', 'Origin');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export async function OPTIONS() {
  const res = new Response(null, { status: 204 });
  res.headers.set('Access-Control-Allow-Origin', ADMIN_ORIGIN);
  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  return res;
}

export async function GET() {
  // --- active sessions on the site (last 60s) ---
  let activeUsers = null;
  try {
    const cutoff = new Date(Date.now() - 60_000).toISOString();
    const { count, error } = await supabaseAdmin
      .from('gc_presence')
      .select('session_id', { count: 'exact', head: true })
      .gte('last_seen', cutoff);
    if (!error) activeUsers = count ?? 0;
    // Best-effort cleanup so the table stays tiny (fire and forget).
    const stale = new Date(Date.now() - 10 * 60_000).toISOString();
    supabaseAdmin.from('gc_presence').delete().lt('last_seen', stale).then(() => {}, () => {});
  } catch { activeUsers = null; }

  // --- participants in Ceilidh Rooms (LiveKit) ---
  let inRooms = null;
  let rooms = [];
  try {
    const host = (process.env.NEXT_PUBLIC_LIVEKIT_URL || '')
      .replace(/^wss:/, 'https:')
      .replace(/^ws:/, 'http:');
    if (host && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET) {
      const svc = new RoomServiceClient(host, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
      const list = await svc.listRooms();
      rooms = list
        .filter((r) => (r.numParticipants || 0) > 0)
        .map((r) => ({ name: r.name, count: r.numParticipants }));
      inRooms = list.reduce((sum, r) => sum + (r.numParticipants || 0), 0);
    }
  } catch { inRooms = null; rooms = []; }

  return withCors(Response.json({ ok: true, activeUsers, inRooms, rooms, at: new Date().toISOString() }));
}
