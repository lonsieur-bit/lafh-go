-- Captain dispatch: coords on orders, session location, accept/complete RPCs

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS pickup_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS pickup_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS dropoff_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS dropoff_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS captain_net_sar NUMERIC(10, 2);

ALTER TABLE captain_sessions
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS heading DOUBLE PRECISION;

-- Captains can read pending unassigned orders (offer feed)
DROP POLICY IF EXISTS orders_captain_pending_select ON orders;
CREATE POLICY orders_captain_pending_select ON orders FOR SELECT
  USING (
    status = 'pending'
    AND captain_id IS NULL
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'captain'
    )
  );

-- Captain online + location
CREATE OR REPLACE FUNCTION public.captain_set_online(
  p_online BOOLEAN,
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_offline_alerts BOOLEAN DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_uid AND role = 'captain') THEN
    RAISE EXCEPTION 'not_captain';
  END IF;

  INSERT INTO captain_sessions (profile_id, online, offline_alerts_enabled, lat, lng, last_seen)
  VALUES (
    v_uid,
    p_online,
    COALESCE(p_offline_alerts, true),
    p_lat,
    p_lng,
    now()
  )
  ON CONFLICT (profile_id) DO UPDATE SET
    online = EXCLUDED.online,
    offline_alerts_enabled = COALESCE(p_offline_alerts, captain_sessions.offline_alerts_enabled),
    lat = COALESCE(EXCLUDED.lat, captain_sessions.lat),
    lng = COALESCE(EXCLUDED.lng, captain_sessions.lng),
    last_seen = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.captain_set_online(BOOLEAN, DOUBLE PRECISION, DOUBLE PRECISION, BOOLEAN) TO authenticated;

-- Atomic accept
CREATE OR REPLACE FUNCTION public.captain_accept_order(p_order_id TEXT)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row orders;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_uid AND role = 'captain') THEN
    RAISE EXCEPTION 'not_captain';
  END IF;

  UPDATE orders
  SET
    captain_id = v_uid,
    status = 'active',
    status_label = 'جاري',
    updated_at = now()
  WHERE id = p_order_id
    AND captain_id IS NULL
    AND status = 'pending'
  RETURNING * INTO v_row;

  IF v_row IS NULL THEN
    RAISE EXCEPTION 'order_not_available';
  END IF;

  INSERT INTO order_timeline_steps (order_id, sort_order, title, step_time, done)
  VALUES (
    p_order_id,
    (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM order_timeline_steps WHERE order_id = p_order_id),
    'تم قبول الطلب من الكابتن',
    to_char(now(), 'HH24:MI'),
    true
  );

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.captain_accept_order(TEXT) TO authenticated;

-- Update trip status + timeline step
CREATE OR REPLACE FUNCTION public.captain_update_trip_status(
  p_order_id TEXT,
  p_status_label TEXT,
  p_step_title TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM orders WHERE id = p_order_id AND captain_id = v_uid
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE orders
  SET status_label = p_status_label, updated_at = now()
  WHERE id = p_order_id;

  INSERT INTO order_timeline_steps (order_id, sort_order, title, step_time, done)
  VALUES (
    p_order_id,
    (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM order_timeline_steps WHERE order_id = p_order_id),
    p_step_title,
    to_char(now(), 'HH24:MI'),
    true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.captain_update_trip_status(TEXT, TEXT, TEXT) TO authenticated;

-- Complete trip + credit captain wallet (80% net)
CREATE OR REPLACE FUNCTION public.captain_complete_trip(p_order_id TEXT)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_total NUMERIC;
  v_net NUMERIC;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT COALESCE(total_sar, price_sar, 0) INTO v_total
  FROM orders
  WHERE id = p_order_id AND captain_id = v_uid AND status = 'active';

  IF v_total IS NULL THEN
    RAISE EXCEPTION 'order_not_active';
  END IF;

  v_net := ROUND(v_total * 0.8, 2);

  UPDATE orders
  SET
    status = 'completed',
    status_label = 'مكتملة',
    captain_net_sar = v_net,
    updated_at = now()
  WHERE id = p_order_id;

  INSERT INTO order_timeline_steps (order_id, sort_order, title, step_time, done)
  VALUES (
    p_order_id,
    (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM order_timeline_steps WHERE order_id = p_order_id),
    'اكتملت الرحلة',
    to_char(now(), 'HH24:MI'),
    true
  );

  PERFORM public.rider_wallet_apply(
    v_net,
    true,
    'أرباح رحلة',
    '#' || upper(p_order_id)
  );

  RETURN v_net;
END;
$$;

GRANT EXECUTE ON FUNCTION public.captain_complete_trip(TEXT) TO authenticated;

-- Push tokens for notifications
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS push_tokens_own ON push_tokens;
CREATE POLICY push_tokens_own ON push_tokens FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());
