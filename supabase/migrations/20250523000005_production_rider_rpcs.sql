-- Production: rider checkout children, wallet mutations, referral signup

-- Riders may insert timeline/receipt lines for their own orders
DROP POLICY IF EXISTS timeline_rider_insert ON order_timeline_steps;
CREATE POLICY timeline_rider_insert ON order_timeline_steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.rider_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS receipt_rider_insert ON order_receipt_lines;
CREATE POLICY receipt_rider_insert ON order_receipt_lines FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.rider_id = auth.uid()
    )
  );

-- Rider wallet credit/debit with transaction log (no arbitrary balance edits)
CREATE OR REPLACE FUNCTION public.rider_wallet_apply(
  p_amount_sar NUMERIC,
  p_positive BOOLEAN,
  p_title TEXT,
  p_subtitle TEXT DEFAULT ''
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_balance NUMERIC;
  v_next NUMERIC;
  v_amount NUMERIC := ABS(p_amount_sar);
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF v_amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  INSERT INTO wallets (profile_id, balance_sar)
  VALUES (v_uid, 0)
  ON CONFLICT (profile_id) DO NOTHING;

  SELECT balance_sar INTO v_balance FROM wallets WHERE profile_id = v_uid FOR UPDATE;

  IF p_positive THEN
    v_next := COALESCE(v_balance, 0) + v_amount;
  ELSE
    IF COALESCE(v_balance, 0) < v_amount THEN
      RAISE EXCEPTION 'insufficient_balance';
    END IF;
    v_next := COALESCE(v_balance, 0) - v_amount;
  END IF;

  UPDATE wallets SET balance_sar = v_next, updated_at = now() WHERE profile_id = v_uid;

  INSERT INTO wallet_transactions (profile_id, title, subtitle, amount_sar, positive)
  VALUES (v_uid, p_title, COALESCE(p_subtitle, ''), v_amount, p_positive);

  RETURN v_next;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rider_wallet_apply(NUMERIC, BOOLEAN, TEXT, TEXT) TO authenticated;

-- Apply referral code for the signed-in user (invitee)
CREATE OR REPLACE FUNCTION public.apply_referral_code(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitee UUID := auth.uid();
  v_code TEXT := UPPER(TRIM(p_code));
  v_inviter_id UUID;
  v_enabled BOOLEAN;
  v_reward NUMERIC;
  v_bonus NUMERIC;
  v_balance NUMERIC;
BEGIN
  IF v_invitee IS NULL OR v_code = '' THEN
    RETURN FALSE;
  END IF;

  SELECT enabled, default_reward_sar, invitee_bonus_sar
  INTO v_enabled, v_reward, v_bonus
  FROM referral_program_settings
  WHERE id = 'default';

  IF NOT COALESCE(v_enabled, TRUE) THEN
    RETURN FALSE;
  END IF;

  SELECT id INTO v_inviter_id
  FROM profiles
  WHERE referral_code = v_code
  LIMIT 1;

  IF v_inviter_id IS NULL OR v_inviter_id = v_invitee THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (SELECT 1 FROM referrals WHERE invitee_id = v_invitee) THEN
    RETURN FALSE;
  END IF;

  INSERT INTO referrals (inviter_id, invitee_id, referral_code, reward_sar)
  VALUES (v_inviter_id, v_invitee, v_code, COALESCE(v_reward, 25));

  IF COALESCE(v_bonus, 0) > 0 THEN
    INSERT INTO wallets (profile_id, balance_sar)
    VALUES (v_invitee, 0)
    ON CONFLICT (profile_id) DO NOTHING;

    SELECT balance_sar INTO v_balance FROM wallets WHERE profile_id = v_invitee FOR UPDATE;
    UPDATE wallets
    SET balance_sar = COALESCE(v_balance, 0) + v_bonus, updated_at = now()
    WHERE profile_id = v_invitee;

    INSERT INTO wallet_transactions (profile_id, title, subtitle, amount_sar, positive)
    VALUES (v_invitee, 'مكافأة الإحالة', 'ترحيب', v_bonus, TRUE);
  END IF;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_referral_code(TEXT) TO authenticated;

-- Resolve referral code for display (public read by code only)
CREATE OR REPLACE FUNCTION public.lookup_referral_code(p_code TEXT)
RETURNS TABLE (profile_id UUID, referral_code TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, referral_code
  FROM profiles
  WHERE referral_code = UPPER(TRIM(p_code))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_referral_code(TEXT) TO authenticated;
