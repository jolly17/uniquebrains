-- =====================================================
-- Quick Fix for RLS Infinite Recursion
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Parents can view children profiles" ON profiles;
DROP POLICY IF EXISTS "Parents can update children profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can create own profile" ON profiles;

-- Step 2: Create simple, working policies

-- Allow everyone to view all profiles (needed for instructor discovery)
CREATE POLICY "Public can view all profiles"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to manage their own profile (INSERT, UPDATE, DELETE)
CREATE POLICY "Users can manage their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 3: Verify policies were created
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';

-- You should see 2 policies:
-- 1. "Public can view all profiles" - SELECT
-- 2. "Users can manage their own profile" - ALL
