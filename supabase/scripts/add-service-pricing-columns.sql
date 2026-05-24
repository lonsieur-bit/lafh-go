-- Run in Supabase SQL Editor if service_config already exists without pricing columns

ALTER TABLE service_config
  ADD COLUMN IF NOT EXISTS door_fee_sar NUMERIC(10, 2) NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS km_rate_sar NUMERIC(10, 2) NOT NULL DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS wait_minute_rate_sar NUMERIC(10, 2) NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS min_fare_sar NUMERIC(10, 2) NOT NULL DEFAULT 15;

UPDATE service_config SET
  door_fee_sar = COALESCE(door_fee_sar, 7),
  km_rate_sar = COALESCE(km_rate_sar, 2.5),
  wait_minute_rate_sar = COALESCE(wait_minute_rate_sar, 0.5),
  min_fare_sar = COALESCE(min_fare_sar, base_fare_sar, 15);
