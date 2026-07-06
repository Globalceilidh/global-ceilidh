-- Global Ceilidh Radio — API call metrics.
--
-- Aggregates hourly call counts by metric name so we can watch load,
-- upstream success/failure rates, and catch cost surprises early.
--
-- Apply once in the Supabase SQL editor. Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS gc_radio_metrics (
  hour_bucket TIMESTAMPTZ NOT NULL,
  metric      TEXT        NOT NULL,
  count       INTEGER     NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (hour_bucket, metric)
);

CREATE INDEX IF NOT EXISTS idx_gc_radio_metrics_hour
  ON gc_radio_metrics (hour_bucket DESC);

-- Atomic upsert-increment. Called from the /api/live365/nowplaying
-- route on every serverless invocation (which is ~once per cache
-- window thanks to next/revalidate). Doesn't inflate row count —
-- one row per (hour, metric_name) pair.
CREATE OR REPLACE FUNCTION increment_gc_radio_metric(
  p_hour TIMESTAMPTZ,
  p_metric TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO gc_radio_metrics (hour_bucket, metric, count)
  VALUES (p_hour, p_metric, 1)
  ON CONFLICT (hour_bucket, metric)
  DO UPDATE SET count = gc_radio_metrics.count + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Handy views for at-a-glance monitoring.
CREATE OR REPLACE VIEW gc_radio_metrics_last_24h AS
SELECT hour_bucket, metric, count
FROM gc_radio_metrics
WHERE hour_bucket >= NOW() - INTERVAL '24 hours'
ORDER BY hour_bucket DESC, metric;

CREATE OR REPLACE VIEW gc_radio_metrics_daily AS
SELECT
  DATE_TRUNC('day', hour_bucket) AS day,
  metric,
  SUM(count) AS total
FROM gc_radio_metrics
GROUP BY DATE_TRUNC('day', hour_bucket), metric
ORDER BY day DESC, metric;
