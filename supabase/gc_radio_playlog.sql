-- Global Ceilidh Radio — Now-playing session log.
--
-- Live365 has no historical playlist API. The Vercel poller sees every
-- track once per ~4-second cache window; this table converts that
-- stream into distinct "plays" so sruth-admin can show the actual
-- rotation history and per-artist airtime.
--
-- Dedup rule: a poll for the same (artist, title) as the last-logged
-- row within the last 5 minutes updates last_seen_at rather than
-- inserting. Anything longer than that gap counts as a new play (the
-- station either replayed the song or hit a gap in poller uptime).
--
-- Paste into Supabase SQL editor. Idempotent.

CREATE TABLE IF NOT EXISTS gc_radio_playlog (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  artist         TEXT        NOT NULL,
  title          TEXT        NOT NULL,
  art_url        TEXT,
  first_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gc_radio_playlog_first_seen
  ON gc_radio_playlog (first_seen_at DESC);
CREATE INDEX IF NOT EXISTS gc_radio_playlog_last_seen
  ON gc_radio_playlog (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS gc_radio_playlog_artist
  ON gc_radio_playlog (artist);

-- RPC used by the Vercel /api/live365/nowplaying route. Fire-and-forget:
-- if the DB is slow or errors, the caller swallows it so the response
-- is never blocked.
CREATE OR REPLACE FUNCTION log_now_playing(
  p_artist  TEXT,
  p_title   TEXT,
  p_art_url TEXT
) RETURNS UUID AS $$
DECLARE
  last_row  gc_radio_playlog%ROWTYPE;
  new_id    UUID;
BEGIN
  -- Skip empty/unknown tracks — the API sometimes returns null between
  -- songs and we don't want to log those as their own "play".
  IF p_artist IS NULL OR p_title IS NULL
     OR btrim(p_artist) = '' OR btrim(p_title) = '' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO last_row
  FROM gc_radio_playlog
  ORDER BY last_seen_at DESC
  LIMIT 1;

  -- Same song as the most recent observation AND we saw it within the
  -- last 5 minutes → the song is still playing (or the poller re-hit
  -- upstream during the same track). Just move the last_seen forward.
  IF last_row.id IS NOT NULL
     AND lower(btrim(last_row.artist)) = lower(btrim(p_artist))
     AND lower(btrim(last_row.title))  = lower(btrim(p_title))
     AND last_row.last_seen_at > NOW() - INTERVAL '5 minutes'
  THEN
    UPDATE gc_radio_playlog
       SET last_seen_at = NOW(),
           art_url = COALESCE(p_art_url, art_url)
     WHERE id = last_row.id;
    RETURN last_row.id;
  END IF;

  -- Different song OR long gap → new play row.
  INSERT INTO gc_radio_playlog (artist, title, art_url)
  VALUES (btrim(p_artist), btrim(p_title), p_art_url)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Airtime leaderboard by artist. approx_seconds_played is the SUM of
-- (last_seen - first_seen) across all rows for that artist — a lower
-- bound. Songs that played for less than one poll cycle collapse to
-- 0s; songs that ended cleanly between polls also under-count. Still
-- the right shape for "who dominates the rotation."
CREATE OR REPLACE VIEW gc_radio_airtime_by_artist AS
SELECT
  artist,
  COUNT(*)                                                                 AS play_count,
  MIN(first_seen_at)                                                       AS first_play_at,
  MAX(last_seen_at)                                                        AS last_play_at,
  ROUND(SUM(EXTRACT(EPOCH FROM (last_seen_at - first_seen_at))))::BIGINT   AS approx_seconds_played
FROM gc_radio_playlog
GROUP BY artist;

-- Airtime by song. Same idea, dimension is (artist, title).
CREATE OR REPLACE VIEW gc_radio_airtime_by_song AS
SELECT
  artist,
  title,
  COUNT(*)                                                                 AS play_count,
  MIN(first_seen_at)                                                       AS first_play_at,
  MAX(last_seen_at)                                                        AS last_play_at,
  ROUND(SUM(EXTRACT(EPOCH FROM (last_seen_at - first_seen_at))))::BIGINT   AS approx_seconds_played
FROM gc_radio_playlog
GROUP BY artist, title;
