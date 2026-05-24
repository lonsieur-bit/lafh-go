-- Captain may only have one active (نشطة) trip at a time

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

  IF EXISTS (
    SELECT 1 FROM orders
    WHERE captain_id = v_uid AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'captain_has_active_trip';
  END IF;

  UPDATE orders
  SET
    captain_id = v_uid,
    status = 'active',
    status_label = 'تم تأكيد الطلب',
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

CREATE OR REPLACE FUNCTION public.captain_freight_respond(
  p_order_id TEXT,
  p_use_rider_price BOOLEAN,
  p_quote_sar NUMERIC DEFAULT NULL
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_order orders%ROWTYPE;
  v_quote NUMERIC(10, 2);
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول';
  END IF;

  IF EXISTS (
    SELECT 1 FROM orders
    WHERE captain_id = v_uid AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'captain_has_active_trip';
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود';
  END IF;

  IF v_order.service_type NOT IN ('cargo', 'tow') THEN
    RAISE EXCEPTION 'هذا الطلب ليس نقل بضائع أو سطحة';
  END IF;

  IF v_order.status <> 'pending' OR v_order.captain_confirmed_match THEN
    RAISE EXCEPTION 'لا يمكن الرد على هذا الطلب';
  END IF;

  IF p_use_rider_price THEN
    v_quote := COALESCE(v_order.total_sar, v_order.price_sar);
  ELSE
    IF p_quote_sar IS NULL OR p_quote_sar <= 0 THEN
      RAISE EXCEPTION 'أدخل سعراً صحيحاً';
    END IF;
    v_quote := p_quote_sar;
  END IF;

  UPDATE orders
  SET
    captain_id = v_uid,
    captain_quote_sar = v_quote,
    captain_confirmed_match = TRUE,
    rider_confirmed_match = FALSE,
    status_label = 'بانتظار موافقة الراكب',
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  INSERT INTO order_timeline_steps (order_id, sort_order, title, step_time, done)
  SELECT p_order_id, COALESCE(MAX(sort_order), 0) + 1, 'عرض الكابتن · ' || v_quote::TEXT || ' ر.س', to_char(now(), 'HH24:MI'), TRUE
  FROM order_timeline_steps WHERE order_id = p_order_id;

  RETURN v_order;
END;
$$;
