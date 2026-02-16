-- =====================================================
-- DEBUG ENROLLMENT ERROR
-- Run this to understand what's causing the enrollment issue
-- =====================================================

-- 1. Check all triggers on enrollments table
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE tgenabled
    WHEN 'O' THEN 'enabled'
    WHEN 'D' THEN 'disabled'
    WHEN 'R' THEN 'replica'
    WHEN 'A' THEN 'always'
    ELSE 'unknown (' || tgenabled || ')'
  END as status,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgrelid = 'enrollments'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- 2. Check all triggers on sessions table
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE tgenabled
    WHEN 'O' THEN 'enabled'
    WHEN 'D' THEN 'disabled'
    WHEN 'R' THEN 'replica'
    WHEN 'A' THEN 'always'
    ELSE 'unknown (' || tgenabled || ')'
  END as status,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgrelid = 'sessions'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- 3. Check if pg_net extension is enabled
SELECT 
  extname,
  extversion,
  extnamespace::regnamespace as schema
FROM pg_extension 
WHERE extname = 'pg_net';

-- 4. Check if the calendar functions exist
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname LIKE '%calendar%'
ORDER BY proname;

-- 5. Try a test enrollment (replace with actual IDs)
-- Uncomment and modify to test:
-- INSERT INTO enrollments (student_id, course_id, status)
-- VALUES ('your-student-id', 'your-course-id', 'active');

-- 6. Check recent errors in pg_net queue
SELECT 
  id,
  url,
  method,
  headers,
  body,
  created_at,
  error_msg
FROM net._http_response
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;
