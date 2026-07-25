-- Global Ceilidh — lightweight presence for "who's on the site right now".
--
-- One row per browser session, refreshed by a heartbeat every ~30s while the
-- tab is visible (see components/PresenceBeat.js → /api/presence/beat).
-- "Active now" = rows whose last_seen is within the last 60s. Anonymous
-- visitors count too (session_id is a client-generated id); user_id is filled
-- in when the visitor is signed in.
--
-- This is a coarse concurrency gauge, not audited analytics. Writes are
-- server-only via the service role, so no RLS policies are needed.
--
-- Apply once in the Supabase SQL editor. Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS gc_presence (
  session_id TEXT        PRIMARY KEY,
  user_id    TEXT,                                  -- Clerk user id if signed in, else NULL
  last_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The only query that matters: count sessions seen in the last minute.
CREATE INDEX IF NOT EXISTS idx_gc_presence_last_seen
  ON gc_presence (last_seen DESC);
