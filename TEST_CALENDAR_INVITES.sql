-- =====================================================
-- TEST CALENDAR INVITES
-- Run these queries to test the calendar invite system
-- =====================================================

-- STEP 1: Verify configuration is set
-- =====================================================
SELECT 
  'Configuration Check' as test_name,
  CASE 
    WHEN current_setting('app.supabase_url', true) IS NOT NULL 
      AND current_setting('app.supabase_url', true) != ''
    THEN '✓ Supabase URL is set'
    ELSE '✗ Supabase URL is NOT set'
  END as supabase_url_status,
  CASE 
    WHEN current_setting('app.supabase_anon_key', true) IS NOT NULL 
      AND current_setting('app.supabase_anon_key', true) != ''
    THEN '✓ Anon key is set'
    ELSE '✗ Anon key is NOT set'
  END as anon_key_status;

-- STEP 2: Verify pg_net extension is enabled
-- =====================================================
SELECT 
  'pg_net Extension' as test_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net')
    THEN '✓ pg_net is enabled'
    ELSE '✗ pg_net is NOT enabled - run: CREATE EXTENSION pg_net;'
  END as status;

-- STEP 3: Verify triggers are enabled
-- =====================================================
SELECT 
  'Triggers Status' as test_name,
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE tgenabled
    WHEN 'O' THEN '✓ enabled'
    WHEN 'D' THEN '✗ disabled'
    ELSE '? unknown'
  END as status
FROM pg_trigger 
WHERE tgname LIKE '%calendar%'
  AND NOT tgisinternal
ORDER BY tgname;

-- STEP 4: Check recent HTTP requests (calendar invites)
-- =====================================================
SELECT 
  'Recent Calendar Invites' as test_name,
  id,
  url,
  method,
  CASE 
    WHEN status_code = 200 THEN '✓ Success'
    WHEN status_code IS NULL THEN '⏳ Pending'
    ELSE '✗ Failed (' || status_code || ')'
  END as result,
  created_at,
  error_msg
FROM net._http_response
WHERE url LIKE '%send-calendar-invite%'
ORDER BY created_at DESC
LIMIT 10;

-- STEP 5: Test enrollment (OPTIONAL - uncomment to test)
-- =====================================================
-- Replace with actual student_id and course_id
-- This will trigger a calendar invite to be sent

-- BEGIN;
-- 
-- INSERT INTO enrollments (student_id, course_id, status)
-- VALUES (
--   'your-student-id-here',
--   'your-course-id-here',
--   'active'
-- );
-- 
-- -- Check if HTTP request was queued
-- SELECT 
--   'Test Enrollment Result' as test_name,
--   COUNT(*) as calendar_invites_queued
-- FROM net._http_response
-- WHERE url LIKE '%send-calendar-invite%'
--   AND created_at > NOW() - INTERVAL '1 minute';
-- 
-- -- Rollback to avoid creating test enrollment
-- ROLLBACK;

-- STEP 6: Check Edge Function logs (in Supabase Dashboard)
-- =====================================================
-- Go to: Edge Functions → send-calendar-invite → Logs
-- Look for successful invocations and any errors

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================
-- 
-- If calendar invites aren't working:
-- 
-- 1. Configuration not set:
--    ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';
--    ALTER DATABASE postgres SET app.supabase_anon_key = 'your-anon-key';
-- 
-- 2. pg_net not enabled:
--    CREATE EXTENSION IF NOT EXISTS pg_net;
-- 
-- 3. Triggers disabled:
--    ALTER TABLE enrollments ENABLE TRIGGER trigger_send_calendar_invite_on_enrollment;
--    ALTER TABLE sessions ENABLE TRIGGER trigger_send_calendar_update_on_session_update;
--    ALTER TABLE sessions ENABLE TRIGGER trigger_send_calendar_update_on_session_delete;
-- 
-- 4. Edge Function not deployed:
--    supabase functions deploy send-calendar-invite
-- 
-- 5. Check Edge Function environment variables:
--    RESEND_API_KEY should be set in Edge Function settings
-- 
-- =====================================================
