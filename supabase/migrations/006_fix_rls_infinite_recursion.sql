-- =====================================================
-- Fix RLS Infinite Recursion Issues
-- Fixes policies that cause infinite recursion
-- =====================================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Parents can view children profiles" ON profiles;
DROP POLICY IF EXISTS "Parents can update children profiles" ON profiles;

-- Recreate parent policies without recursion
-- Parents can view their children's profiles (non-recursive)
CREATE POLICY "Parents can view children profiles"
  ON profiles FOR SELECT
  USING (
    parent_id = auth.uid()
    OR auth.uid() = id
  );

-- Parents can update their children's profiles (non-recursive)
CREATE POLICY "Parents can update children profiles"
  ON profiles FOR UPDATE
  USING (
    parent_id = auth.uid()
    OR auth.uid() = id
  );

-- Add a simpler policy for profile creation during OAuth
-- Allow authenticated users to create their own profile
DROP POLICY IF EXISTS "Authenticated users can create own profile" ON profiles;
CREATE POLICY "Authenticated users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

