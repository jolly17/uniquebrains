-- =====================================================
-- TEMPORARY FIX: Disable RLS on profiles
-- This will allow profile creation to work
-- WARNING: Only for testing! Re-enable RLS after testing
-- =====================================================

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Now test OAuth - profile should be created successfully

-- After testing, re-enable RLS:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
