-- Luffa Go — core schema

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
  label_ar TEXT NOT NULL
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
