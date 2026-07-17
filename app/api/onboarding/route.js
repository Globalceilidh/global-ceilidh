// app/api/onboarding/route.js
// ============================================================
// Onboarding — write a user's gc_profiles row (the social keystone).
//
// POST  { handle, display_name, region, gaidhlig_level, bio, interests,
//         ancestral_places, clan_family_names, location_public, avatar_url }
//         → validates + reserves the handle, upserts gc_profiles keyed by
//           the Clerk user id, stamps onboarded_at. Returns { ok, handle }.
//
// GET   ?handle=<h>  → live availability check for the onboarding form.
//         Returns { ok, valid, available, reason }.
//
// Server-side only. Uses the service-role client (RLS bypass) and the
// signed-in Clerk user id from auth() — the client never gets to name
// which profile it's writing. Decoupled from the Railway backend: signup
// must work even when sruth-backend is down.
// ============================================================

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';

export const runtime = 'nodejs';

const HANDLE_RE = /^[a-z0-9_]{3,30}$/;

// Route names, brand words, and infra terms that must never become a
// personal handle (they'd collide with real paths or impersonate GC).
const RESERVED = new Set([
  'admin', 'api', 'u', 'g', 'sign-in', 'signin', 'sign-up', 'signup',
  'welcome', 'home', 'sruth', 'radio', 'antonn', 'anton', 'saoghal',
  'rooms', 'feisean', 'news', 'contribute', 'about', 'help', 'support',
  'settings', 'me', 'you', 'us', 'globalceilidh', 'global-ceilidh', 'gc',
  'ceilidh', 'ceilidh', 'root', 'www', 'mail', 'static', 'assets',
  'public', 'null', 'undefined', 'moderator', 'mod', 'official',
]);

const LEVELS = new Set(['none', 'learner', 'intermediate', 'fluent', 'native']);

// Normalise a handle candidate: trim, strip a leading @, lowercase.
function normalizeHandle(raw) {
  return String(raw || '').trim().replace(/^@+/, '').toLowerCase();
}

// Returns { valid, reason } for format/reserved checks (no DB).
function checkHandleShape(handle) {
  if (!handle) return { valid: false, reason: 'Choose a handle.' };
  if (!HANDLE_RE.test(handle)) {
    return {
      valid: false,
      reason: '3–30 characters: lowercase letters, numbers, underscores.',
    };
  }
  if (RESERVED.has(handle)) return { valid: false, reason: 'That handle is reserved.' };
  return { valid: true, reason: null };
}

// Is the handle free (ignoring the caller's own existing row)?
async function isHandleFree(handle, selfClerkId) {
  const { data, error } = await supabaseAdmin
    .from('gc_profiles')
    .select('clerk_user_id')
    .eq('handle', handle)
    .maybeSingle();
  if (error) throw error;
  if (!data) return true;
  return data.clerk_user_id === selfClerkId; // their own handle = still "free" for them
}

// Clean a free-text array field: trim, drop empties, dedupe, cap.
function cleanArray(value, { maxItems = 12, maxLen = 60 } = {}) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const out = [];
  for (const item of value) {
    const s = String(item || '').trim().slice(0, maxLen);
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= maxItems) break;
  }
  return out;
}

export async function GET(req) {
  const { userId } = await auth();
  const handle = normalizeHandle(new URL(req.url).searchParams.get('handle'));

  const shape = checkHandleShape(handle);
  if (!shape.valid) {
    return Response.json({ ok: true, valid: false, available: false, reason: shape.reason });
  }
  try {
    const free = await isHandleFree(handle, userId);
    return Response.json({
      ok: true,
      valid: true,
      available: free,
      reason: free ? null : 'That handle is taken.',
    });
  } catch (err) {
    console.error('Handle availability check failed:', err);
    return Response.json({ ok: false, error: 'check_failed' }, { status: 500 });
  }
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ ok: false, error: 'not_signed_in' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const handle = normalizeHandle(body.handle);
  const shape = checkHandleShape(handle);
  if (!shape.valid) {
    return Response.json({ ok: false, error: 'invalid_handle', reason: shape.reason }, { status: 400 });
  }

  const displayName = String(body.display_name || '').trim().slice(0, 80) || null;
  const region = String(body.region || '').trim().slice(0, 120) || null;
  const bio = String(body.bio || '').trim().slice(0, 600) || null;
  const avatarUrl = String(body.avatar_url || '').trim().slice(0, 500) || null;

  let level = body.gaidhlig_level ? String(body.gaidhlig_level).trim().toLowerCase() : null;
  if (level && !LEVELS.has(level)) level = null;

  const interests = cleanArray(body.interests);
  const ancestralPlaces = cleanArray(body.ancestral_places);
  const clanFamilyNames = cleanArray(body.clan_family_names);
  const locationPublic = body.location_public === true;

  try {
    const free = await isHandleFree(handle, userId);
    if (!free) {
      return Response.json({ ok: false, error: 'handle_taken', reason: 'That handle is taken.' }, { status: 409 });
    }

    const row = {
      clerk_user_id: userId,
      handle,
      display_name: displayName,
      avatar_url: avatarUrl,
      region,
      location_public: locationPublic,
      ancestral_places: ancestralPlaces,
      gaidhlig_level: level,
      bio,
      interests: interests,
      clan_family_names: clanFamilyNames,
      onboarded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from('gc_profiles')
      .upsert(row, { onConflict: 'clerk_user_id' });

    if (error) {
      // 23505 on the handle index = someone grabbed it between the check
      // and the write (race). Surface it as a taken-handle conflict.
      if (error.code === '23505') {
        return Response.json({ ok: false, error: 'handle_taken', reason: 'That handle was just taken — try another.' }, { status: 409 });
      }
      console.error('Onboarding upsert failed:', error);
      return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
    }

    return Response.json({ ok: true, handle });
  } catch (err) {
    console.error('Onboarding failed:', err);
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
