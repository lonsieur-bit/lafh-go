-- =============================================================================
-- Luffa Go — FULL DATABASE SETUP (run once in Supabase SQL Editor)
-- Project: vyozqojqivumthiztxkg
-- Dashboard: https://supabase.com/dashboard/project/vyozqojqivumthiztxkg/sql/new
-- =============================================================================

-- ---------- 1. SCHEMA ----------
CREATE TYPE user_role AS ENUM ('rider', 'captain', 'admin', 'employee');
CREATE TYPE order_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE recharge_card_status AS ENUM ('new', 'used');
CREATE TYPE service_type AS ENUM ('regular', 'premium', 'family', 'bike', 'cargo', 'tow');
CREATE TYPE cargo_status AS ENUM ('pending', 'assigned', 'completed', 'cancelled');
CREATE TYPE notification_group AS ENUM ('today', 'earlier');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  display_name TEXT,
  role user_role NOT NULL DEFAULT 'rider',
  referral_code TEXT UNIQUE,
  disabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employee_permissions (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  can_manage_trips BOOLEAN NOT NULL DEFAULT false,
  can_manage_cards BOOLEAN NOT NULL DEFAULT false,
  can_manage_users BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 4.9,
  trips_count INT NOT NULL DEFAULT 0,
  car_model TEXT,
  plate TEXT,
  avatar_color TEXT DEFAULT 'bg-primary/15 text-primary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  display_id TEXT NOT NULL,
  rider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  captain_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  trip_date DATE,
  trip_time TEXT,
  price_sar NUMERIC(10, 2),
  status order_status NOT NULL DEFAULT 'pending',
  status_label TEXT,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  service_type service_type NOT NULL DEFAULT 'regular',
  service_label TEXT,
  discount_sar NUMERIC(10, 2),
  total_sar NUMERIC(10, 2),
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_timeline_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sort_order INT NOT NULL,
  title TEXT NOT NULL,
  step_time TEXT,
  done BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE order_receipt_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sort_order INT NOT NULL,
  label TEXT NOT NULL,
  amount TEXT NOT NULL
);

CREATE TABLE wallets (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance_sar NUMERIC(12, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  amount_sar NUMERIC(12, 2) NOT NULL,
  positive BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recharge_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  amount_sar NUMERIC(10, 2) NOT NULL,
  status recharge_card_status NOT NULL DEFAULT 'new',
  used_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE saved_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  detail TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  time_label TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  notif_group notification_group NOT NULL DEFAULT 'today',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invitee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code TEXT,
  reward_sar NUMERIC(10, 2) NOT NULL DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cargo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  from_location TEXT,
  to_location TEXT,
  description TEXT,
  status cargo_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE captain_sessions (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  online BOOLEAN NOT NULL DEFAULT false,
  offline_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE service_config (
  service_type service_type PRIMARY KEY,
  base_fare_sar NUMERIC(10, 2) NOT NULL,
  label_ar TEXT NOT NULL,
  door_fee_sar NUMERIC(10, 2) NOT NULL DEFAULT 7,
  km_rate_sar NUMERIC(10, 2) NOT NULL DEFAULT 2.5,
  wait_minute_rate_sar NUMERIC(10, 2) NOT NULL DEFAULT 0.5,
  min_fare_sar NUMERIC(10, 2) NOT NULL DEFAULT 15
);

CREATE TABLE platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  display_currency TEXT NOT NULL DEFAULT 'SAR' CHECK (display_currency IN ('SAR', 'USD', 'SYP')),
  usd_per_sar NUMERIC(12, 6) NOT NULL DEFAULT 0.266667,
  syp_per_sar NUMERIC(12, 2) NOT NULL DEFAULT 3500,
  app_enabled BOOLEAN NOT NULL DEFAULT true,
  maintenance_message_ar TEXT DEFAULT 'التطبيق متوقف مؤقتًا للصيانة. نعود قريبًا.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE referral_program_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  default_reward_sar NUMERIC(10, 2) NOT NULL DEFAULT 25,
  invitee_bonus_sar NUMERIC(10, 2) NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  description_ar TEXT DEFAULT 'شارك كودك واكسب مكافأة عند كل تسجيل جديد.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_rider ON orders(rider_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_notifications_profile ON notifications(profile_id);
CREATE INDEX idx_wallet_tx_profile ON wallet_transactions(profile_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_recharge_cards_status ON recharge_cards(status);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
BEGIN
  ref_code := 'LF' || floor(100000 + random() * 900000)::text;
  INSERT INTO profiles (id, phone, display_name, role, referral_code)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'rider'),
    ref_code
  );
  INSERT INTO wallets (profile_id, balance_sar) VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------- 2. RLS ----------
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
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_program_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND NOT disabled); $$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee') AND NOT disabled); $$;

CREATE OR REPLACE FUNCTION public.has_employee_permission(perm TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1 FROM profiles p
    JOIN employee_permissions ep ON ep.profile_id = p.id
    WHERE p.id = auth.uid() AND p.role = 'employee' AND NOT p.disabled
      AND ((perm = 'trips' AND ep.can_manage_trips) OR (perm = 'cards' AND ep.can_manage_cards) OR (perm = 'users' AND ep.can_manage_users))
  );
$$;

CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid() OR is_staff());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_staff_all ON profiles FOR ALL USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY employee_perms_staff ON employee_permissions FOR ALL USING (is_staff()) WITH CHECK (is_admin());
CREATE POLICY drivers_select ON drivers FOR SELECT USING (true);
CREATE POLICY drivers_staff ON drivers FOR ALL USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY orders_select_own ON orders FOR SELECT USING (rider_id = auth.uid() OR captain_id = auth.uid() OR is_staff());
CREATE POLICY orders_insert_own ON orders FOR INSERT WITH CHECK (rider_id = auth.uid() OR is_staff());
CREATE POLICY orders_update_own ON orders FOR UPDATE USING (rider_id = auth.uid() OR captain_id = auth.uid() OR has_employee_permission('trips'));
CREATE POLICY orders_staff ON orders FOR ALL USING (has_employee_permission('trips')) WITH CHECK (has_employee_permission('trips'));
CREATE POLICY timeline_select ON order_timeline_steps FOR SELECT USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.rider_id = auth.uid() OR o.captain_id = auth.uid() OR is_staff())));
CREATE POLICY timeline_staff ON order_timeline_steps FOR ALL USING (has_employee_permission('trips')) WITH CHECK (has_employee_permission('trips'));
CREATE POLICY receipt_select ON order_receipt_lines FOR SELECT USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.rider_id = auth.uid() OR o.captain_id = auth.uid() OR is_staff())));
CREATE POLICY receipt_staff ON order_receipt_lines FOR ALL USING (has_employee_permission('trips')) WITH CHECK (has_employee_permission('trips'));
CREATE POLICY wallets_select ON wallets FOR SELECT USING (profile_id = auth.uid() OR is_staff());
CREATE POLICY wallets_update_staff ON wallets FOR UPDATE USING (is_staff());
CREATE POLICY wallets_insert ON wallets FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY wallet_tx_select ON wallet_transactions FOR SELECT USING (profile_id = auth.uid() OR is_staff());
CREATE POLICY wallet_tx_insert ON wallet_transactions FOR INSERT WITH CHECK (profile_id = auth.uid() OR is_staff());
CREATE POLICY recharge_select ON recharge_cards FOR SELECT USING (is_staff());
CREATE POLICY recharge_staff ON recharge_cards FOR ALL USING (has_employee_permission('cards')) WITH CHECK (has_employee_permission('cards'));
CREATE POLICY addresses_own ON saved_addresses FOR ALL USING (profile_id = auth.uid() OR is_staff()) WITH CHECK (profile_id = auth.uid() OR is_staff());
CREATE POLICY notifications_own ON notifications FOR ALL USING (profile_id = auth.uid() OR is_staff()) WITH CHECK (profile_id = auth.uid() OR is_staff());
CREATE POLICY referrals_select ON referrals FOR SELECT USING (inviter_id = auth.uid() OR invitee_id = auth.uid() OR is_staff());
CREATE POLICY referrals_insert ON referrals FOR INSERT WITH CHECK (invitee_id = auth.uid() OR is_staff());
CREATE POLICY referrals_staff ON referrals FOR ALL USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY cargo_own ON cargo_requests FOR ALL USING (rider_id = auth.uid() OR is_staff()) WITH CHECK (rider_id = auth.uid() OR is_staff());
CREATE POLICY captain_sessions_own ON captain_sessions FOR ALL USING (profile_id = auth.uid() OR is_staff()) WITH CHECK (profile_id = auth.uid() OR is_staff());
CREATE POLICY service_config_read ON service_config FOR SELECT USING (true);
CREATE POLICY service_config_staff ON service_config FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY platform_settings_read ON platform_settings FOR SELECT USING (true);
CREATE POLICY platform_settings_admin ON platform_settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY referral_program_read ON referral_program_settings FOR SELECT USING (true);
CREATE POLICY referral_program_admin ON referral_program_settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ---------- 3. GIFT CARDS (partner stores) ----------
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

ALTER TABLE partner_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY partner_stores_staff_select ON partner_stores FOR SELECT USING (is_staff());
CREATE POLICY partner_stores_staff_all ON partner_stores FOR ALL USING (has_employee_permission('cards')) WITH CHECK (has_employee_permission('cards'));
CREATE POLICY gift_batches_staff_select ON gift_card_batches FOR SELECT USING (is_staff());
CREATE POLICY gift_batches_staff_all ON gift_card_batches FOR ALL USING (has_employee_permission('cards')) WITH CHECK (has_employee_permission('cards'));

DROP POLICY IF EXISTS recharge_select ON recharge_cards;
CREATE POLICY recharge_select ON recharge_cards FOR SELECT USING (is_staff() OR used_by = auth.uid());

CREATE OR REPLACE FUNCTION public.redeem_gift_card(p_code TEXT)
RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_card recharge_cards%ROWTYPE;
  v_amount NUMERIC(10, 2);
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول لاستخدام البطاقة'; END IF;
  SELECT * INTO v_card FROM recharge_cards WHERE UPPER(TRIM(code)) = UPPER(TRIM(p_code)) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'كود غير صالح'; END IF;
  IF v_card.status <> 'new' THEN RAISE EXCEPTION 'هذا الكود مستخدم مسبقاً'; END IF;
  v_amount := v_card.amount_sar;
  UPDATE recharge_cards SET status = 'used', used_by = v_user_id, used_at = now() WHERE id = v_card.id;
  INSERT INTO wallets (profile_id, balance_sar) VALUES (v_user_id, v_amount)
  ON CONFLICT (profile_id) DO UPDATE SET balance_sar = wallets.balance_sar + EXCLUDED.balance_sar, updated_at = now();
  INSERT INTO wallet_transactions (profile_id, title, subtitle, amount_sar, positive)
  VALUES (v_user_id, 'شحن بكرت هدية', v_card.code, v_amount, true);
  RETURN v_amount;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_gift_card(TEXT) TO authenticated;

-- ---------- 4. SEED DATA (demo) ----------
INSERT INTO platform_settings (id, display_currency, usd_per_sar, syp_per_sar)
VALUES ('default', 'SAR', 0.266667, 3500)
ON CONFLICT (id) DO NOTHING;

INSERT INTO referral_program_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

INSERT INTO service_config (service_type, base_fare_sar, label_ar, door_fee_sar, km_rate_sar, wait_minute_rate_sar, min_fare_sar) VALUES
  ('regular', 25, 'رحلة عادية', 7, 2.5, 0.5, 15),
  ('premium', 45, 'رحلة مميزة', 7, 3.5, 0.75, 25),
  ('family', 55, 'رحلة عائلية', 7, 3, 0.6, 20),
  ('bike', 18, 'دراجة نارية', 6, 1.8, 0.4, 12),
  ('cargo', 60, 'نقل بضائع', 7, 4, 0.8, 40),
  ('tow', 80, 'سطحة', 7, 5, 1, 50)
ON CONFLICT (service_type) DO NOTHING;

INSERT INTO partner_stores (id, name, area, contact_phone) VALUES
  ('a1000001-0000-4000-8000-000000000001', 'بقالة النخيل', 'حي النخيل — الرياض', '0500000001'),
  ('a1000001-0000-4000-8000-000000000002', 'سوبرماركت العليا', 'العليا — الرياض', '0500000002'),
  ('a1000001-0000-4000-8000-000000000003', 'ميني مارت الياسمين', 'حي الياسمين — الرياض', '0500000003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, display_id, from_location, to_location, trip_date, trip_time, price_sar, status, status_label, rating, service_type, service_label, discount_sar, total_sar) VALUES
  ('lf-2847', '#LF-2847', 'حي الياسمين', 'مطار الملك خالد', '2024-03-15', '14:30', 45, 'completed', 'مكتمل', 4.8, 'regular', 'توصيل ركاب', 5, 45),
  ('lf-2831', '#LF-2831', 'جامعة الملك سعود', 'العليا مول', '2024-03-14', '10:15', 22, 'completed', 'مكتمل', 5, 'regular', 'توصيل ركاب', NULL, 22),
  ('lf-2820', '#LF-2820', 'حي النخيل', 'حي الملقا', '2024-03-13', '18:00', 18, 'cancelled', 'ملغي', 0, 'regular', 'توصيل ركاب', NULL, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_timeline_steps (order_id, sort_order, title, step_time, done) VALUES
  ('lf-2847', 1, 'تم تأكيد الطلب', '14:22', true),
  ('lf-2847', 2, 'السائق في الطريق', '14:25', true),
  ('lf-2847', 3, 'بدء الرحلة', '14:30', true),
  ('lf-2847', 4, 'تم الوصول', '14:52', true),
  ('lf-2831', 1, 'تم تأكيد الطلب', '10:05', true),
  ('lf-2831', 2, 'تم الوصول', '10:15', true),
  ('lf-2820', 1, 'تم تأكيد الطلب', '17:50', true),
  ('lf-2820', 2, 'السائق في الطريق', '17:55', true),
  ('lf-2820', 3, 'تم الإلغاء', '18:00', true);

INSERT INTO order_receipt_lines (order_id, sort_order, label, amount) VALUES
  ('lf-2847', 1, 'أجرة الرحلة', '38 ر.س'),
  ('lf-2847', 2, 'رسوم الخدمة', '4 ر.س'),
  ('lf-2847', 3, 'ضريبة القيمة المضافة', '3 ر.س'),
  ('lf-2831', 1, 'أجرة الرحلة', '20 ر.س'),
  ('lf-2831', 2, 'رسوم الخدمة', '2 ر.س'),
  ('lf-2820', 1, 'رسوم الإلغاء', '0 ر.س');

INSERT INTO recharge_cards (code, amount_sar, status) VALUES
  ('RHC-4821-7390', 50, 'new'),
  ('RHC-9102-3847', 100, 'new'),
  ('RHC-5520-1183', 50, 'used')
ON CONFLICT (code) DO NOTHING;

INSERT INTO cargo_requests (from_location, to_location, description, status) VALUES
  ('حي الياسمين', 'الرياض — المستودعات', '3 صناديق — أثاث خفيف', 'pending'),
  ('طريق الملك فهد', 'جدة — الميناء', 'شحنة تجارية صغيرة', 'assigned');

-- =============================================================================
-- 5. AFTER RUNNING: create admin (run separately AFTER you sign up in the app)
-- =============================================================================
-- 1. Enable Email auth in Dashboard → Authentication → Providers
-- 2. Sign up at http://localhost:8081/login
-- 3. Run this (replace email):

-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com' LIMIT 1);
