-- Freight (cargo/tow): captain quote + mutual confirmation before active trip

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS captain_quote_sar NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS freight_notes TEXT,
  ADD COLUMN IF NOT EXISTS rider_confirmed_match BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS captain_confirmed_match BOOLEAN NOT NULL DEFAULT FALSE;

-- Captain accepts rider price OR submits a counter-quote (cargo/tow only)
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

-- Rider confirms captain quote → trip becomes active when both sides agreed
CREATE OR REPLACE FUNCTION public.rider_freight_confirm(p_order_id TEXT)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_order orders%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول';
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود';
  END IF;

  IF v_order.rider_id IS DISTINCT FROM v_uid THEN
    RAISE EXCEPTION 'غير مصرح';
  END IF;

  IF v_order.service_type NOT IN ('cargo', 'tow') THEN
    RAISE EXCEPTION 'طلب غير مدعوم';
  END IF;

  IF v_order.captain_id IS NULL OR NOT v_order.captain_confirmed_match THEN
    RAISE EXCEPTION 'لم يرد كابتن بعد';
  END IF;

  UPDATE orders
  SET
    rider_confirmed_match = TRUE,
    status = 'active',
    status_label = 'نشط — جاري التنفيذ',
    total_sar = COALESCE(captain_quote_sar, total_sar),
    price_sar = COALESCE(captain_quote_sar, price_sar),
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  INSERT INTO order_timeline_steps (order_id, sort_order, title, step_time, done)
  SELECT p_order_id, COALESCE(MAX(sort_order), 0) + 1, 'تم الاتفاق — بدء الخدمة', to_char(now(), 'HH24:MI'), TRUE
  FROM order_timeline_steps WHERE order_id = p_order_id;

  RETURN v_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.captain_freight_respond(TEXT, BOOLEAN, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rider_freight_confirm(TEXT) TO authenticated;
