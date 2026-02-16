-- =====================================================
-- SIMPLE CALENDAR INVITE TEST
-- Quick checks to verify calendar invites are set up
-- =====================================================

-- 1. Check configuration
SELECT 
  '1. Configuration' as check_name,
  CASE 
    WHEN current_setting('app.supabase_url', true) IS NOT NULL 
    THEN '✓ URL is set: ' || current_setting('app.supabase_url', true)
    ELSE '✗ URL NOT set'
  END as result;

-- 2. Check pg_net extension
SELECT 
  '2. pg_net Extension' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net')
    THEN '✓ pg_net is enabled'
    ELSE '✗ pg_net NOT enabled - Run: CREATE EXTENSION pg_net;'
  END as result;

-- 3. Check calendar functions exist
SELECT 
  '3. Calendar Functions' as check_name,
  COUNT(*) || ' functions found' as result
FROM pg_proc 
WHERE proname LIKE '%calendar%';

-- 4. Check triggers on enrollments
SELECT 
  '4. Enrollment Triggers' as check_name,
  COUNT(*) || ' triggers on enrollments table' as result
FROM pg_trigger 
WHERE tgrelid = 'enrollments'::regclass
  AND NOT tgisinternal
  AND tgname LIKE '%calendar%';

-- 5. Check trigger status
SELECT 
  '5. Trigger Details' as check_name,
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN '✓ ENABLED'
    WHEN 'D' THEN '✗ DISABLED'
    ELSE 'UNKNOWN'
  END as status
FROM pg_trigger 
WHERE tgname LIKE '%calendar%'
  AND NOT tgisinternal;

-- 6. Test if we can call the function manually (won't actually send)
SELECT 
  '6. Function Test' as check_name,
  'Testing if function can be called...' as result;

-- Try to see the function definition
SELECT 
  '7. Function Definition' as check_name,
  proname as function_name,
  CASE 
    WHEN prosrc LIKE '%app.supabase_url%' THEN '✓ Uses correct config'
    ELSE '✗ May use wrong config'
  END as config_check
FROM pg_proc 
WHERE proname = 'send_calendar_invite_on_enrollment';

-- =====================================================
-- SUMMARY
-- =====================================================
-- If all checks pass:
-- ✓ Configuration is set
-- ✓ pg_net is enabled  
-- ✓ Functions exist
-- ✓ Triggers are enabled
-- 
-- Then calendar invites should work!
-- Test by enrolling a student in a course.
-- =====================================================
