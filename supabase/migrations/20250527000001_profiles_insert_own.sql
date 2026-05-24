-- Allow authenticated users to insert their own profile row (fallback if trigger missed)
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());
