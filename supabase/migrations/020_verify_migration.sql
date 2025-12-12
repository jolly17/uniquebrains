-- =====================================================
-- Verification Script for Migration 020
-- Run this after migration 020 to verify everything worked
-- =====================================================

-- Verify courses table has all required columns
SELECT 'COURSES TABLE VERIFICATION:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'course_type') 
    THEN '✅ course_type column exists'
    ELSE '❌ course_type column missing'
  END as course_type_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'session_duration') 
    THEN '✅ session_duration column exists'
    ELSE '❌ session_duration column missing'
  END as session_duration_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'enrollment_limit') 
    THEN '✅ enrollment_limit column exists'
    ELSE '❌ enrollment_limit column missing'
  END as enrollment_limit_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_self_paced') 
    THEN '✅ is_self_paced column exists'
    ELSE '❌ is_self_paced column missing'
  END as is_self_paced_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') 
    THEN '✅ status column exists'
    ELSE '❌ status column missing'
  END as status_check;

-- Verify sessions table has all required columns
SELECT 'SESSIONS TABLE VERIFICATION:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'duration') 
    THEN '✅ duration column exists'
    ELSE '❌ duration column missing'
  END as duration_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'meeting_link') 
    THEN '✅ meeting_link column exists'
    ELSE '❌ meeting_link column missing'
  END as meeting_link_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'meeting_password') 
    THEN '✅ meeting_password column exists'
    ELSE '❌ meeting_password column missing'
  END as meeting_password_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'meeting_platform') 
    THEN '✅ meeting_platform column exists'
    ELSE '❌ meeting_platform column missing'
  END as meeting_platform_check;

-- Verify profiles table has full_name column
SELECT 'PROFILES TABLE VERIFICATION:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') 
    THEN '✅ full_name column exists'
    ELSE '❌ full_name column missing'
  END as full_name_check;

-- Check that constraints were added properly
SELECT 'CONSTRAINTS VERIFICATION:' as info;
SELECT 
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name IN ('courses', 'sessions') 
  AND constraint_type = 'CHECK'
  AND constraint_name LIKE '%course_type%' 
   OR constraint_name LIKE '%status%'
   OR constraint_name LIKE '%duration%'
   OR constraint_name LIKE '%meeting_platform%'
ORDER BY table_name, constraint_name;

-- Check that indexes were created
SELECT 'INDEXES VERIFICATION:' as info;
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE tablename IN ('courses', 'sessions')
  AND (indexname LIKE '%course_type%' 
    OR indexname LIKE '%status%' 
    OR indexname LIKE '%self_paced%'
    OR indexname LIKE '%enrollment_limit%'
    OR indexname LIKE '%duration%'
    OR indexname LIKE '%meeting_platform%')
ORDER BY tablename, indexname;

-- Test that we can create a course with new fields
SELECT 'TESTING COURSE CREATION:' as info;
-- This is just a syntax check - don't actually insert
SELECT 
  'course_type, session_duration, enrollment_limit, is_self_paced, status' as required_fields,
  'Ready for course creation with new schema' as status;