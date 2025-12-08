-- =====================================================
-- Check Current RLS Policies on profiles table
-- This shows all policies and their definitions
-- =====================================================

-- Show all policies with their full definitions
SELECT 
  policyname,
  cmd as operation,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- This will show you exactly which policies exist
-- and what conditions they have
