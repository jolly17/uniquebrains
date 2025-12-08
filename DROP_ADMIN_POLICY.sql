-- =====================================================
-- Drop the Problematic Admin Policy
-- This policy causes infinite recursion because it
-- queries the profiles table to check if user is admin
-- =====================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;

-- Verify it's gone
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- You should now see only 4 policies:
-- 1. allow_authenticated_insert (INSERT)
-- 2. allow_own_delete (DELETE)
-- 3. allow_public_select (SELECT)
-- 4. allow_own_update (UPDATE)
