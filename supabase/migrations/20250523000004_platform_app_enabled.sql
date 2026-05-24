-- Toggle consumer app availability from admin settings

ALTER TABLE platform_settings
  ADD COLUMN IF NOT EXISTS app_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS maintenance_message_ar TEXT DEFAULT 'التطبيق متوقف مؤقتًا للصيانة. نعود قريبًا.';
