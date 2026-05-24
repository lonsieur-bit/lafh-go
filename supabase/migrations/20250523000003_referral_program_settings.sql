-- Referral program configuration + admin management

CREATE TABLE IF NOT EXISTS referral_program_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  default_reward_sar NUMERIC(10, 2) NOT NULL DEFAULT 25,
  invitee_bonus_sar NUMERIC(10, 2) NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  description_ar TEXT DEFAULT 'شارك كودك واكسب مكافأة عند كل تسجيل جديد.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO referral_program_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE referral_program_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY referral_program_read ON referral_program_settings FOR SELECT USING (true);
CREATE POLICY referral_program_admin ON referral_program_settings FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
