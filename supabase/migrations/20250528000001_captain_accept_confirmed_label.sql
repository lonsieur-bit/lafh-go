-- After accept, use confirmed label aligned with captain trip phase A
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
