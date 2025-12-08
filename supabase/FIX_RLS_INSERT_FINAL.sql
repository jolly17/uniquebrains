-- =====================================================
-- FINAL FIX: RLS Infinite Recursion for INSERT
-- This completely removes all problematic policies
-- and creates simple, working policies
-- =====================================================

-- Step 1: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Parents can view children profiles" ON profiles;
DROP POLICY IF EXISTS "Parents can update children profiles" ON profiles;
DROP POLICY IF EXISTS "Public can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profile" ON profiles;
DROP POLICY IF EXISTS "Users can view and update own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;

-- Step 2: Create simple, non-recursive policies

-- Allow anyone to view all profiles (needed for instructor discovery)
CREATE POLICY "allow_public_select"
  ON profiles FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own profile (no recursion)
CREATE POLICY "allow_authenticated_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile (no recursion)
CREATE POLICY "allow_own_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile (no recursion)
CREATE POLICY "allow_own_delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Step 3: Verify policies were created
SELECT 
  policyname, 
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- You should see 4 policies:
-- 1. allow_public_select (SELECT)
-- 2. allow_authenticated_insert (INSERT)
-- 3. allow_own_update (UPDATE)
-- 4. allow_own_delete (DELETE)
