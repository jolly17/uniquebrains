-- =====================================================
-- QUICK CLEANUP - Safe to run in Supabase SQL Editor
-- =====================================================
-- This deletes all data from tables but keeps the schema intact
-- Run this entire script at once in Supabase SQL Editor
-- =====================================================

-- Disable triggers temporarily for faster deletion
SET session_replication_role = replica;

-- Delete all data (in correct order)
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE homework CASCADE;
TRUNCATE TABLE resources CASCADE;
TRUNCATE TABLE sessions CASCADE;
TRUNCATE TABLE enrollments CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Verify cleanup
SELECT 
  'messages' as table_name, 
  COUNT(*) as remaining_records 
FROM messages
UNION ALL
SELECT 'homework', COUNT(*) FROM homework
UNION ALL
SELECT 'resources', COUNT(*) FROM resources
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;

-- All counts should be 0
