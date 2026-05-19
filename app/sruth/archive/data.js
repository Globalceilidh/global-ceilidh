import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client (service role) — same pattern as the working
// /api/subscribe route. The public archive reads DIRECTLY from Supabase, never
// from sruth-backend, so its availability equals the rest of the site:
// it depends only on Supabase (which everything already depends on).
//
// The archive is defined as exactly: sruth_newsletters rows whose
// html_archive IS NOT NULL. sruth-backend only ever WRITES that column, and
// only on a real (non-test) send — so test sends never appear here.

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

// "Sruth · Nº 002 · 18 May 2026" -> 2. Falls back to position if absent.
function issueNumberFrom(subjectEn, subjectGd, fallback) {
  for (const s of [subjectEn, subjectGd]) {
    if (!s) continue;
    const m = s.match(/N[º°№o]\s*0*(\d+)/i);
    if (m) return parseInt(m[1], 10);
  }
  return fallback;
}

export const slugForNumber = (n) => `no-${String(n).padStart(3, '0')}`;
export const padded = (n) => String(n).padStart(3, '0');

// Metadata only — never pulls html_archive (can be ~30KB/row).
export async function getPublishedIssues() {
  try {
    const { data, error } = await sb()
      .from('sruth_newsletters')
      .select('id, subject_en, subject_gd, sent_at')
      .not('html_archive', 'is', null)
      .order('sent_at', { ascending: true });
    if (error) throw error;

    const issues = (data || []).map((row, i) => {
      const number = issueNumberFrom(row.subject_en, row.subject_gd, i + 1);
      return {
        id: row.id,
        number,
        slug: slugForNumber(number),
        sentAt: row.sent_at,
      };
    });
    // Newest first, de-duped by issue number (keep the latest send of each).
    const byNumber = new Map();
    for (const it of issues) byNumber.set(it.number, it);
    return [...byNumber.values()].sort((a, b) => b.number - a.number);
  } catch (e) {
    // Degrade, don't crash: ISR keeps serving the last good page; a cold
    // build with Supabase unreachable yields an empty (not broken) archive.
    console.error('getPublishedIssues failed:', e?.message || e);
    return [];
  }
}

export async function getIssueBySlug(slug) {
  const issues = await getPublishedIssues();
  const meta = issues.find((i) => i.slug === slug);
  if (!meta) return null;
  try {
    const { data, error } = await sb()
      .from('sruth_newsletters')
      .select('html_archive, subject_en, subject_gd, sent_at')
      .eq('id', meta.id)
      .single();
    if (error) throw error;
    return { ...meta, html: data?.html_archive || '', subjectEn: data?.subject_en, subjectGd: data?.subject_gd };
  } catch (e) {
    console.error('getIssueBySlug failed:', e?.message || e);
    return null;
  }
}
