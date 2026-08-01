// app/api/content/route.js
// Public read of the editable site content (gc_content). Returns a map of
// key → { type, en, gd } for whatever editors have published. Components use
// this via lib/siteContent, falling back to their in-code default when a key
// is unset — so the site never depends on the DB being populated.
//
// Cached at the edge for ~30s so a published edit appears within half a
// minute without a redeploy. Fails soft (empty map) so a DB hiccup just
// leaves every component on its default.

import { supabaseAdmin } from '../../../lib/supabase';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('gc_content')
      .select('key, type, value_en, value_gd');
    if (error) throw error;

    const content = {};
    for (const r of data || []) {
      content[r.key] = { type: r.type, en: r.value_en, gd: r.value_gd };
    }
    return Response.json(
      { ok: true, content },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=300' } },
    );
  } catch (err) {
    console.error('Site content read failed:', err);
    return Response.json({ ok: true, content: {} });
  }
}
