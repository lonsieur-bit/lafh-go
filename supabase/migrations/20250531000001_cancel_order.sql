-- Cancel order (rider or captain) only before customer boards the vehicle

CREATE OR REPLACE FUNCTION public.order_may_be_cancelled(p_status order_status, p_status_label TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_label TEXT := trim(coalesce(p_status_label, ''));
BEGIN
  IF p_status IN ('completed', 'cancelled') THEN
    RETURN FALSE;
  END IF;

  IF p_status = 'pending' THEN
    RETURN TRUE;
  END IF;

  IF p_status <> 'active' THEN
    RETURN FALSE;
  END IF;

  IF v_label = '' OR v_label IN ('تم تأكيد الطلب', 'جاري', 'في الطريق إلى العميل', 'وصلت للعميل') THEN
    RETURN TRUE;
  END IF;

  IF v_label LIKE '%بانتظار موافقة%' THEN
    RETURN TRUE;
  END IF;

  IF v_label LIKE '%تأكيد%' THEN
    RETURN TRUE;
  END IF;

  IF v_label LIKE '%في الطريق%' AND v_label LIKE '%العميل%' THEN
    RETURN TRUE;
  END IF;

  IF v_label LIKE '%وصلت%' AND v_label LIKE '%العميل%' AND v_label NOT LIKE '%الوجهة%' THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id TEXT)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row orders;
  v_who TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT * INTO v_row FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found';
  END IF;

  IF v_row.rider_id = v_uid THEN
    v_who := 'rider';
  ELSIF v_row.captain_id = v_uid THEN
    v_who := 'captain';
  ELSE
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF NOT public.order_may_be_cancelled(v_row.status, v_row.status_label) THEN
    IF v_row.status = 'active' THEN
      RAISE EXCEPTION 'customer_onboard_cannot_cancel';
    END IF;
    RAISE EXCEPTION 'order_not_cancellable';
  END IF;

  UPDATE orders
  SET
    status = 'cancelled',
    status_label = 'ملغي',
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_row;

  INSERT INTO order_timeline_steps (order_id, sort_order, title, step_time, done)
  VALUES (
    p_order_id,
    (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM order_timeline_steps WHERE order_id = p_order_id),
  CASE WHEN v_who = 'captain' THEN 'ألغى الكابتن الطلب' ELSE 'ألغى الراكب الطلب' END,
    to_char(now(), 'HH24:MI'),
    true
  );

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_order(TEXT) TO authenticated;
