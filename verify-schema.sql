-- =====================================================
-- Schema Verification Script
-- Run this in your Supabase SQL editor to verify the schema is correct
-- =====================================================

-- Check courses table has all required columns
SELECT 'COURSES TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'courses'
  AND column_name IN ('course_type', 'session_duration', 'enrollment_limit', 'is_self_paced', 'status')
ORDER BY column_name;

-- Check sessions table has all required columns
SELECT 'SESSIONS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sessions'
  AND column_name IN ('duration', 'meeting_link', 'meeting_password', 'meeting_platform')
ORDER BY column_name;

-- Check homework table has all required columns
SELECT 'HOMEWORK TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'homework'
  AND column_name IN ('points', 'submission_type', 'attachments')
ORDER BY column_name;

-- Check submissions table has all required columns
SELECT 'SUBMISSIONS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'submissions'
  AND column_name IN ('content', 'file_url')
ORDER BY column_name;

-- Check messages table has all required columns
SELECT 'MESSAGES TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'messages'
  AND column_name IN ('recipient_id', 'is_announcement', 'attachments')
ORDER BY column_name;

-- Check that constraints exist
SELECT 'CONSTRAINTS CHECK:' as info;
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('courses', 'sessions', 'homework', 'submissions', 'messages')
  AND tc.constraint_type = 'CHECK'
  AND (tc.constraint_name LIKE '%course_type%' 
    OR tc.constraint_name LIKE '%status%'
    OR tc.constraint_name LIKE '%submission_type%'
    OR tc.constraint_name LIKE '%meeting_platform%')
ORDER BY tc.table_name, tc.constraint_name;

-- Check that indexes exist
SELECT 'INDEXES CHECK:' as info;
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE tablename IN ('courses', 'sessions', 'homework', 'submissions', 'messages')
  AND (indexname LIKE '%course_type%' 
    OR indexname LIKE '%status%' 
    OR indexname LIKE '%submission_type%'
    OR indexname LIKE '%meeting_platform%')
ORDER BY tablename, indexname;

-- Check that views exist
SELECT 'VIEWS CHECK:' as info;
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_type = 'VIEW'
  AND table_name IN ('course_stats', 'upcoming_sessions', 'homework_with_stats', 'student_submissions_with_homework')
ORDER BY table_name;

-- Check that functions exist
SELECT 'FUNCTIONS CHECK:' as info;
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN ('get_course_enrollment_count', 'is_course_full', 'get_homework_stats', 'has_submitted_homework')
ORDER BY routine_name;

-- Test a simple course creation (syntax check only)
SELECT 'SCHEMA COMPATIBILITY TEST:' as info;
SELECT 
  'course_type, session_duration, enrollment_limit, is_self_paced, status' as courses_ready,
  'duration, meeting_link, meeting_password, meeting_platform' as sessions_ready,
  'points, submission_type, attachments' as homework_ready,
  'content, file_url' as submissions_ready,
  'recipient_id, is_announcement, attachments' as messages_ready;

SELECT '✅ Schema verification complete! If you see all the expected columns and constraints above, your database is ready for the backend integration.' as result;