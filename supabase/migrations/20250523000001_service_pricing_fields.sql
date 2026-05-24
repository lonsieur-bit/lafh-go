-- Per-service pricing: door opening, km, wait time (all in SAR)

ALTER TABLE service_config
  ADD COLUMN IF NOT EXISTS door_fee_sar NUMERIC(10, 2) NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS km_rate_sar NUMERIC(10, 2) NOT NULL DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS wait_minute_rate_sar NUMERIC(10, 2) NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS min_fare_sar NUMERIC(10, 2) NOT NULL DEFAULT 15;

UPDATE service_config SET
  door_fee_sar = CASE service_type
    WHEN 'regular' THEN 7
    WHEN 'premium' THEN 7
    WHEN 'family' THEN 7
    WHEN 'bike' THEN 6
    WHEN 'cargo' THEN 7
    WHEN 'tow' THEN 7
    ELSE 7
  END,
  km_rate_sar = CASE service_type
    WHEN 'regular' THEN 2.5
    WHEN 'premium' THEN 3.5
    WHEN 'family' THEN 3
    WHEN 'bike' THEN 1.8
    WHEN 'cargo' THEN 4
    WHEN 'tow' THEN 5
    ELSE 2.5
  END,
  wait_minute_rate_sar = CASE service_type
    WHEN 'regular' THEN 0.5
    WHEN 'premium' THEN 0.75
    WHEN 'family' THEN 0.6
    WHEN 'bike' THEN 0.4
    WHEN 'cargo' THEN 0.8
    WHEN 'tow' THEN 1
    ELSE 0.5
  END,
  min_fare_sar = COALESCE(min_fare_sar, base_fare_sar, 15);
