-- Platform display currency (amounts in DB remain SAR-based)

CREATE TABLE IF NOT EXISTS platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  display_currency TEXT NOT NULL DEFAULT 'SAR' CHECK (display_currency IN ('SAR', 'USD', 'SYP')),
  usd_per_sar NUMERIC(12, 6) NOT NULL DEFAULT 0.266667,
  syp_per_sar NUMERIC(12, 2) NOT NULL DEFAULT 3500,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO platform_settings (id, display_currency, usd_per_sar, syp_per_sar)
VALUES ('default', 'SAR', 0.266667, 3500)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_settings_read ON platform_settings FOR SELECT USING (true);
CREATE POLICY platform_settings_admin ON platform_settings FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
