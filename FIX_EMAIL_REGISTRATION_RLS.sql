-- =====================================================
-- Fix RLS for Email/Password Registration
-- Allows both OAuth and email/password registration
-- =====================================================

-- Check current RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

-- If RLS is disabled, re-enable it
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing INSERT policies
DROP POLICY IF EXISTS "allow_authenticated_insert" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profile" ON profiles;

-- Create a comprehensive INSERT policy that works for both OAuth and email/password
CREATE POLICY "allow_user_insert_own_profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT policyname, cmd, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'INSERT';

-- You should see: allow_user_insert_own_profile | INSERT | (auth.uid() = id)
