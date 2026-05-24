-- RLS policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_config ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND NOT disabled
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'employee') AND NOT disabled
  );
$$;

CREATE OR REPLACE FUNCTION public.has_employee_permission(perm TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1
    FROM profiles p
    JOIN employee_permissions ep ON ep.profile_id = p.id
    WHERE p.id = auth.uid()
      AND p.role = 'employee'
      AND NOT p.disabled
      AND (
        (perm = 'trips' AND ep.can_manage_trips)
        OR (perm = 'cards' AND ep.can_manage_cards)
        OR (perm = 'users' AND ep.can_manage_users)
      )
  );
$$;

-- profiles
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid() OR is_staff());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_staff_all ON profiles FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- employee_permissions
CREATE POLICY employee_perms_staff ON employee_permissions FOR ALL USING (is_staff()) WITH CHECK (is_admin());

-- drivers
CREATE POLICY drivers_select ON drivers FOR SELECT USING (true);
CREATE POLICY drivers_staff ON drivers FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- orders
CREATE POLICY orders_select_own ON orders FOR SELECT
  USING (rider_id = auth.uid() OR captain_id = auth.uid() OR is_staff());
CREATE POLICY orders_insert_own ON orders FOR INSERT
  WITH CHECK (rider_id = auth.uid() OR is_staff());
CREATE POLICY orders_update_own ON orders FOR UPDATE
  USING (rider_id = auth.uid() OR captain_id = auth.uid() OR has_employee_permission('trips'));
CREATE POLICY orders_staff ON orders FOR ALL USING (has_employee_permission('trips')) WITH CHECK (has_employee_permission('trips'));

-- order_timeline_steps
CREATE POLICY timeline_select ON order_timeline_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_id
    AND (o.rider_id = auth.uid() OR o.captain_id = auth.uid() OR is_staff())
  ));
CREATE POLICY timeline_staff ON order_timeline_steps FOR ALL
  USING (has_employee_permission('trips')) WITH CHECK (has_employee_permission('trips'));

-- order_receipt_lines
CREATE POLICY receipt_select ON order_receipt_lines FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_id
    AND (o.rider_id = auth.uid() OR o.captain_id = auth.uid() OR is_staff())
  ));
CREATE POLICY receipt_staff ON order_receipt_lines FOR ALL
  USING (has_employee_permission('trips')) WITH CHECK (has_employee_permission('trips'));

-- wallets
CREATE POLICY wallets_select ON wallets FOR SELECT USING (profile_id = auth.uid() OR is_staff());
CREATE POLICY wallets_update_staff ON wallets FOR UPDATE USING (is_staff());
CREATE POLICY wallets_insert ON wallets FOR INSERT WITH CHECK (profile_id = auth.uid());

-- wallet_transactions
CREATE POLICY wallet_tx_select ON wallet_transactions FOR SELECT
  USING (profile_id = auth.uid() OR is_staff());
CREATE POLICY wallet_tx_insert ON wallet_transactions FOR INSERT
  WITH CHECK (profile_id = auth.uid() OR is_staff());

-- recharge_cards
CREATE POLICY recharge_select ON recharge_cards FOR SELECT USING (is_staff());
CREATE POLICY recharge_staff ON recharge_cards FOR ALL
  USING (has_employee_permission('cards')) WITH CHECK (has_employee_permission('cards'));

-- saved_addresses
CREATE POLICY addresses_own ON saved_addresses FOR ALL
  USING (profile_id = auth.uid() OR is_staff())
  WITH CHECK (profile_id = auth.uid() OR is_staff());

-- notifications
CREATE POLICY notifications_own ON notifications FOR ALL
  USING (profile_id = auth.uid() OR is_staff())
  WITH CHECK (profile_id = auth.uid() OR is_staff());

-- referrals
CREATE POLICY referrals_select ON referrals FOR SELECT
  USING (inviter_id = auth.uid() OR invitee_id = auth.uid() OR is_staff());
CREATE POLICY referrals_insert ON referrals FOR INSERT WITH CHECK (invitee_id = auth.uid() OR is_staff());
CREATE POLICY referrals_staff ON referrals FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- cargo_requests
CREATE POLICY cargo_own ON cargo_requests FOR ALL
  USING (rider_id = auth.uid() OR is_staff())
  WITH CHECK (rider_id = auth.uid() OR is_staff());

-- captain_sessions
CREATE POLICY captain_sessions_own ON captain_sessions FOR ALL
  USING (profile_id = auth.uid() OR is_staff())
  WITH CHECK (profile_id = auth.uid() OR is_staff());

-- service_config
CREATE POLICY service_config_read ON service_config FOR SELECT USING (true);
CREATE POLICY service_config_staff ON service_config FOR ALL USING (is_admin()) WITH CHECK (is_admin());
