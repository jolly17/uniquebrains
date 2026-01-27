-- =====================================================
-- RESET DATABASE FOR TESTING
-- =====================================================
-- WARNING: This will delete ALL data from your database!
-- Use this to clean up test data and start fresh.
-- 
-- IMPORTANT: Run these queries in order!
-- =====================================================

-- Step 1: Delete all data from tables (in correct order to respect foreign keys)
-- =====================================================

-- Delete messages (no foreign key dependencies)
DELETE FROM messages;

-- Delete homework submissions
DELETE FROM homework_submissions;

-- Delete homework
DELETE FROM homework;

-- Delete resources
DELETE FROM resources;

-- Delete sessions
DELETE FROM sessions;

-- Delete enrollments
DELETE FROM enrollments;

-- Delete courses
DELETE FROM courses;

-- Delete profiles (keep this for last as it's referenced by many tables)
-- Note: This will NOT delete auth.users - see Step 2 for that
DELETE FROM profiles;

-- Step 2: Delete users from auth.users
-- =====================================================
-- IMPORTANT: This requires admin privileges
-- You may need to run this from Supabase Dashboard > Authentication > Users
-- and manually delete users, OR use the Supabase API

-- If you have access to run this:
-- DELETE FROM auth.users;

-- Step 3: Reset storage buckets (delete all uploaded files)
-- =====================================================
-- You'll need to do this manually from Supabase Dashboard:
-- 1. Go to Storage
-- 2. For each bucket (profile-pictures, course-images, resources, homework-submissions):
--    - Click on the bucket
--    - Select all files
--    - Click Delete

-- Step 4: Verify cleanup
-- =====================================================

-- Check that all tables are empty
SELECT 'messages' as table_name, COUNT(*) as count FROM messages
UNION ALL
SELECT 'homework_submissions', COUNT(*) FROM homework_submissions
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

-- Expected result: All counts should be 0

-- =====================================================
-- ALTERNATIVE: Delete specific test users only
-- =====================================================
-- If you want to keep some data and only delete specific test accounts:

-- First, identify the test user IDs
-- SELECT id, email FROM auth.users WHERE email LIKE '%test%' OR email LIKE '%example%';

-- Then delete their data (replace 'USER_ID_HERE' with actual IDs):
/*
-- Delete messages
DELETE FROM messages WHERE sender_id = 'USER_ID_HERE';

-- Delete homework submissions
DELETE FROM homework_submissions WHERE student_id = 'USER_ID_HERE';

-- Delete enrollments
DELETE FROM enrollments WHERE student_id = 'USER_ID_HERE';

-- Delete courses
DELETE FROM courses WHERE instructor_id = 'USER_ID_HERE';

-- Delete profile
DELETE FROM profiles WHERE id = 'USER_ID_HERE';

-- Delete auth user (from Supabase Dashboard)
*/

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Deleting from auth.users:
--    - Must be done from Supabase Dashboard > Authentication > Users
--    - Or use Supabase Admin API
--    - Cannot be done directly via SQL for security reasons
--
-- 2. Storage cleanup:
--    - Must be done from Supabase Dashboard > Storage
--    - Or use Supabase Storage API
--    - Files are not automatically deleted when records are deleted
--
-- 3. After cleanup:
--    - You can reuse the same email addresses
--    - All test courses will be removed from live site
--    - Database will be in clean state for fresh testing
--
-- 4. Backup recommendation:
--    - Before running this, consider taking a backup if you have any data you want to keep
--    - Supabase Dashboard > Database > Backups
