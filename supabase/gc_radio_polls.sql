-- Global Ceilidh Radio — Votes + Requests.
--
-- Ship-ready schema for the three-category Top 10 polls + song
-- requests. Paste into Supabase SQL editor and run. Idempotent.
--
-- Model:
--   gc_radio_poll_categories — 3 seeded rows (Best Artist/Song/Album)
--   gc_radio_poll_nominees   — curated pool per category; new items
--                              land here when a write-in hits 5 votes
--   gc_radio_poll_writeins   — holding tank for user-submitted names
--                              (dedup by lowercased+trimmed label)
--   gc_radio_poll_votes      — one row per vote; unique per
--                              (category, ip_hash, day) so IPs can't
--                              vote twice in the same category same day
--   gc_radio_requests        — song requests, open queue

CREATE TABLE IF NOT EXISTS gc_radio_poll_categories (
  id         TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0
);

INSERT INTO gc_radio_poll_categories (id, label, sort_order) VALUES
  ('best-artist', 'Best Artist', 1),
  ('best-song',   'Best Song',   2),
  ('best-album',  'Best Album',  3)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS gc_radio_poll_nominees (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT        NOT NULL REFERENCES gc_radio_poll_categories(id),
  label       TEXT        NOT NULL,
  subtitle    TEXT,
  source      TEXT        NOT NULL DEFAULT 'seed', -- 'seed' | 'promoted' | 'admin'
  active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gc_radio_poll_nominees_cat_active
  ON gc_radio_poll_nominees (category_id, active);

CREATE TABLE IF NOT EXISTS gc_radio_poll_writeins (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id            TEXT        NOT NULL REFERENCES gc_radio_poll_categories(id),
  label                  TEXT        NOT NULL,
  normalized             TEXT        NOT NULL,
  vote_count             INT         NOT NULL DEFAULT 0,
  promoted_to_nominee_id UUID        REFERENCES gc_radio_poll_nominees(id),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_id, normalized)
);

CREATE TABLE IF NOT EXISTS gc_radio_poll_votes (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id        TEXT        NOT NULL REFERENCES gc_radio_poll_categories(id),
  target_type        TEXT        NOT NULL CHECK (target_type IN ('nominee','writein')),
  target_id          UUID        NOT NULL,
  ip_hash            TEXT        NOT NULL,
  now_playing_track  TEXT,
  now_playing_artist TEXT,
  user_agent         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Real UTC calendar day the vote was cast on. Defaults are evaluated
  -- per-INSERT so they don't need to be IMMUTABLE (only index expressions
  -- do). Giving the day its own column dodges the whole timestamptz→date
  -- immutability trap that killed the previous two migration attempts.
  vote_day           DATE        NOT NULL DEFAULT ((NOW() AT TIME ZONE 'UTC')::date)
);
-- Backfill the column on tables that were created by an earlier failed run
-- of this migration (before vote_day existed).
ALTER TABLE gc_radio_poll_votes
  ADD COLUMN IF NOT EXISTS vote_day DATE NOT NULL DEFAULT ((NOW() AT TIME ZONE 'UTC')::date);

CREATE UNIQUE INDEX IF NOT EXISTS gc_radio_poll_votes_one_per_day
  ON gc_radio_poll_votes (category_id, ip_hash, vote_day);
CREATE INDEX IF NOT EXISTS gc_radio_poll_votes_target
  ON gc_radio_poll_votes (target_type, target_id);

CREATE TABLE IF NOT EXISTS gc_radio_requests (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  song_title         TEXT        NOT NULL,
  artist_name        TEXT,
  album_name         TEXT,
  notes              TEXT,
  ip_hash            TEXT        NOT NULL,
  now_playing_track  TEXT,
  now_playing_artist TEXT,
  user_agent         TEXT,
  status             TEXT        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending','approved','played','rejected')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gc_radio_requests_created ON gc_radio_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS gc_radio_requests_status  ON gc_radio_requests (status);

-- Top 10 view — used by sruth-admin to render results per category.
-- Combines nominee votes + write-in votes with a resolved label.
CREATE OR REPLACE VIEW gc_radio_poll_leaderboard AS
WITH counts AS (
  SELECT
    category_id,
    target_type,
    target_id,
    COUNT(*) AS votes
  FROM gc_radio_poll_votes
  GROUP BY category_id, target_type, target_id
)
SELECT
  c.category_id,
  c.target_type,
  c.target_id,
  c.votes,
  CASE
    WHEN c.target_type = 'nominee'
      THEN (SELECT label FROM gc_radio_poll_nominees WHERE id = c.target_id)
    ELSE (SELECT label FROM gc_radio_poll_writeins WHERE id = c.target_id)
  END AS label
FROM counts c
ORDER BY c.category_id, c.votes DESC;

-- Seed Best Artist with the current 18-artist library. Best Song and
-- Best Album start with zero nominees — users bootstrap them via
-- write-ins until 5 votes promote them into real nominees.
INSERT INTO gc_radio_poll_nominees (category_id, label) VALUES
  ('best-artist', 'Ally the Piper'),
  ('best-artist', 'Bad Haggis'),
  ('best-artist', 'Beluga Lagoon'),
  ('best-artist', 'Hadrian''s Wall'),
  ('best-artist', 'Isla Scott'),
  ('best-artist', 'Josie Duncan'),
  ('best-artist', 'Julie Fowlis'),
  ('best-artist', 'Kim Carnie'),
  ('best-artist', 'Mairi McGillivray'),
  ('best-artist', 'Mànran'),
  ('best-artist', 'The Proclaimers'),
  ('best-artist', 'Runrig'),
  ('best-artist', 'Sian'),
  ('best-artist', 'Skerryvore'),
  ('best-artist', 'Skipinnish'),
  ('best-artist', 'Steve Earle'),
  ('best-artist', 'Tide Lines'),
  ('best-artist', 'Trail West')
ON CONFLICT DO NOTHING;
