-- Run after creating a user in Supabase Auth (Dashboard → Authentication → Users)
-- Replace the email below with your admin account email.

UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@lafhride.info' LIMIT 1
);
