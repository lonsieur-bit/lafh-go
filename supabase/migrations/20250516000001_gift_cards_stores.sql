-- Partner stores + gift card batches + atomic redemption

CREATE TABLE partner_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area TEXT,
  contact_phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gift_card_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES partner_stores(id) ON DELETE RESTRICT,
  label TEXT NOT NULL,
  amount_sar NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recharge_cards
  ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES gift_card_batches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES partner_stores(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_recharge_cards_batch ON recharge_cards(batch_id);
CREATE INDEX IF NOT EXISTS idx_recharge_cards_store ON recharge_cards(store_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_batches_store ON gift_card_batches(store_id);

-- Demo partner stores
INSERT INTO partner_stores (id, name, area, contact_phone) VALUES
  ('a1000001-0000-4000-8000-000000000001', 'بقالة النخيل', 'حي النخيل — الرياض', '0500000001'),
  ('a1000001-0000-4000-8000-000000000002', 'سوبرماركت العليا', 'العليا — الرياض', '0500000002'),
  ('a1000001-0000-4000-8000-000000000003', 'ميني مارت الياسمين', 'حي الياسمين — الرياض', '0500000003')
ON CONFLICT (id) DO NOTHING;

-- Atomic gift card redemption (rider or captain wallet)
CREATE OR REPLACE FUNCTION public.redeem_gift_card(p_code TEXT)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_card recharge_cards%ROWTYPE;
  v_amount NUMERIC(10, 2);
  v_balance NUMERIC(12, 2);
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول لاستخدام البطاقة';
  END IF;

  SELECT * INTO v_card
  FROM recharge_cards
  WHERE UPPER(TRIM(code)) = UPPER(TRIM(p_code))
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'كود غير صالح';
  END IF;

  IF v_card.status <> 'new' THEN
    RAISE EXCEPTION 'هذا الكود مستخدم مسبقاً';
  END IF;

  v_amount := v_card.amount_sar;

  UPDATE recharge_cards
  SET status = 'used', used_by = v_user_id, used_at = now()
  WHERE id = v_card.id;

  INSERT INTO wallets (profile_id, balance_sar)
  VALUES (v_user_id, v_amount)
  ON CONFLICT (profile_id) DO UPDATE
  SET balance_sar = wallets.balance_sar + EXCLUDED.balance_sar,
      updated_at = now();

  SELECT balance_sar INTO v_balance FROM wallets WHERE profile_id = v_user_id;

  INSERT INTO wallet_transactions (profile_id, title, subtitle, amount_sar, positive)
  VALUES (v_user_id, 'شحن بكرت هدية', v_card.code, v_amount, true);

  RETURN v_amount;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_gift_card(TEXT) TO authenticated;
