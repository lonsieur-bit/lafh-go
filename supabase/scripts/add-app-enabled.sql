-- Run in Supabase SQL Editor for admin app on/off toggle

ALTER TABLE platform_settings
  ADD COLUMN IF NOT EXISTS app_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS maintenance_message_ar TEXT DEFAULT 'التطبيق متوقف مؤقتًا للصيانة. نعود قريبًا.';
