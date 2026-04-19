-- GlobalCeilidh.com — Row Level Security Policies
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
--
-- Auth note: this app uses Clerk, not Supabase Auth.
-- auth.uid() is not available. The Clerk webhook uses the SERVICE ROLE key
-- which bypasses RLS entirely, so webhook writes are unaffected by these policies.

-- ─── Enable RLS on all tables ────────────────────────────────────────────────

ALTER TABLE immersion_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE units               ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;

-- ─── Lesson content: public read, no writes from client ──────────────────────
-- The anon key in the browser can read lesson data — that is intentional.
-- No client should ever insert/update/delete these tables directly.

CREATE POLICY "Public read immersion_locations"
  ON immersion_locations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read units"
  ON units FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read lesson_items"
  ON lesson_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- ─── Users: no client access ─────────────────────────────────────────────────
-- The users table is written only by the Clerk webhook (service role key).
-- The anon key in the browser has no business reading or writing user rows.
-- Service role bypasses RLS, so the webhook is unaffected.

-- No SELECT, INSERT, UPDATE, or DELETE policies = table is locked to anon/authenticated.
-- If you later need authenticated users to read their own profile, add:
--
-- CREATE POLICY "Users read own row"
--   ON users FOR SELECT
--   TO authenticated
--   USING (clerk_id = current_setting('app.clerk_user_id', true));
--
-- And set that config value server-side when making the request.
