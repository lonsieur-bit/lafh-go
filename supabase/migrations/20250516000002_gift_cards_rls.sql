-- RLS for partner stores and gift card batches

ALTER TABLE partner_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_batches ENABLE ROW LEVEL SECURITY;

-- partner_stores
CREATE POLICY partner_stores_staff_select ON partner_stores FOR SELECT
  USING (is_staff());
CREATE POLICY partner_stores_staff_all ON partner_stores FOR ALL
  USING (has_employee_permission('cards')) WITH CHECK (has_employee_permission('cards'));

-- gift_card_batches
CREATE POLICY gift_batches_staff_select ON gift_card_batches FOR SELECT
  USING (is_staff());
CREATE POLICY gift_batches_staff_all ON gift_card_batches FOR ALL
  USING (has_employee_permission('cards')) WITH CHECK (has_employee_permission('cards'));

-- recharge_cards: users can read cards they redeemed
DROP POLICY IF EXISTS recharge_select ON recharge_cards;
CREATE POLICY recharge_select ON recharge_cards FOR SELECT
  USING (is_staff() OR used_by = auth.uid());

-- Authenticated users redeem via RPC only (no direct update on cards)
