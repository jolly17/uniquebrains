-- Verification queries after migration 060
-- Run these to ensure simplification was successful

-- 1. Verify students table is gone
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public'
  AND table_name = 'students'
) AS students_table_exists;
-- Expected: false

-- 2. Verify student_profile_id column is gone from enrollments
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public'
  AND table_name = 'enrollments' 
  AND column_name = 'student_profile_id'
) AS enrollments_has_student_profile_id;
-- Expected: false

-- 3. Verify student_profile_id column is gone from sessions
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public'
  AND table_name = 'sessions' 
  AND column_name = 'student_profile_id'
) AS sessions_has_student_profile_id;
-- Expected: false

-- 4. Check all enrollments have student_id
SELECT 
  COUNT(*) AS total_enrollments,
  COUNT(student_id) AS enrollments_with_student_id,
  COUNT(*) - COUNT(student_id) AS enrollments_without_student_id
FROM enrollments;
-- Expected: enrollments_without_student_id = 0

-- 5. Check for orphaned enrollments (student_id not in profiles)
SELECT COUNT(*) AS orphaned_enrollments
FROM enrollments 
WHERE student_id NOT IN (SELECT id FROM profiles);
-- Expected: 0

-- 6. Check for orphaned sessions (student_id not in profiles)
SELECT COUNT(*) AS orphaned_sessions
FROM sessions 
WHERE student_id IS NOT NULL 
AND student_id NOT IN (SELECT id FROM profiles);
-- Expected: 0

-- 7. List all current roles in profiles
SELECT 
  role,
  COUNT(*) AS count
FROM profiles
GROUP BY role
ORDER BY role;
-- Expected: Only 'student' and 'instructor' (no 'parent')

-- 8. Check for any remaining 'parent' roles
SELECT COUNT(*) AS parent_role_count
FROM profiles
WHERE role = 'parent';
-- Expected: 0 (after running the data cleanup SQL)

-- 9. List all policies (simplified view)
SELECT 
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 10. Check for any policies referencing student_profile_id
SELECT 
  tablename,
  policyname,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND (
  qual LIKE '%student_profile_id%' 
  OR with_check LIKE '%student_profile_id%'
);
-- Expected: 0 rows

-- 11. Verify security definer function is gone
SELECT EXISTS (
  SELECT FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname = 'is_student_enrolled_in_instructor_course'
) AS function_exists;
-- Expected: false

-- 12. Summary of table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('enrollments', 'sessions', 'messages', 'profiles')
AND column_name LIKE '%student%'
ORDER BY table_name, column_name;

-- All-in-one verification summary
SELECT 
  'students table exists' AS check_name,
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'students') 
    THEN '❌ FAIL' ELSE '✅ PASS' END AS status
UNION ALL
SELECT 
  'enrollments.student_profile_id exists',
  CASE WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'student_profile_id') 
    THEN '❌ FAIL' ELSE '✅ PASS' END
UNION ALL
SELECT 
  'sessions.student_profile_id exists',
  CASE WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'student_profile_id') 
    THEN '❌ FAIL' ELSE '✅ PASS' END
UNION ALL
SELECT 
  'all enrollments have student_id',
  CASE WHEN (SELECT COUNT(*) FROM enrollments WHERE student_id IS NULL) > 0 
    THEN '❌ FAIL' ELSE '✅ PASS' END
UNION ALL
SELECT 
  'no orphaned enrollments',
  CASE WHEN (SELECT COUNT(*) FROM enrollments WHERE student_id NOT IN (SELECT id FROM profiles)) > 0 
    THEN '❌ FAIL' ELSE '✅ PASS' END
UNION ALL
SELECT 
  'no parent roles exist',
  CASE WHEN (SELECT COUNT(*) FROM profiles WHERE role = 'parent') > 0 
    THEN '⚠️ WARN - Run cleanup SQL' ELSE '✅ PASS' END
UNION ALL
SELECT 
  'security definer function removed',
  CASE WHEN EXISTS (SELECT FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'is_student_enrolled_in_instructor_course') 
    THEN '❌ FAIL' ELSE '✅ PASS' END;
