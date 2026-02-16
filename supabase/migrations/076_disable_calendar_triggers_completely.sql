-- =====================================================
-- DISABLE CALENDAR TRIGGERS COMPLETELY
-- Remove calendar invite triggers to fix enrollment errors
-- Can be re-enabled later when Edge Function is deployed
-- =====================================================

-- Drop all calendar-related triggers
DROP TRIGGER IF EXISTS trigger_send_calendar_invite_on_enrollment ON enrollments;
DROP TRIGGER IF EXISTS trigger_send_calendar_update_on_session_update ON sessions;
DROP TRIGGER IF EXISTS trigger_send_calendar_update_on_session_delete ON sessions;

-- Keep the functions but don't use them (for future use)
-- The functions are already updated to fail gracefully

-- Add comment explaining the situation
COMMENT ON FUNCTION send_calendar_invite_on_enrollment() IS 
  'Calendar invite function (currently not triggered). To enable: CREATE TRIGGER trigger_send_calendar_invite_on_enrollment AFTER INSERT ON enrollments FOR EACH ROW EXECUTE FUNCTION send_calendar_invite_on_enrollment();';

COMMENT ON FUNCTION send_calendar_update_on_session_change() IS 
  'Calendar update function (currently not triggered). To enable: CREATE TRIGGER trigger_send_calendar_update_on_session_update AFTER UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION send_calendar_update_on_session_change();';

-- Verify triggers are removed
SELECT 
  'Triggers on enrollments:' as info,
  COUNT(*) as count
FROM pg_trigger 
WHERE tgrelid = 'enrollments'::regclass
  AND NOT tgisinternal
  AND tgname LIKE '%calendar%'
UNION ALL
SELECT 
  'Triggers on sessions:' as info,
  COUNT(*) as count
FROM pg_trigger 
WHERE tgrelid = 'sessions'::regclass
  AND NOT tgisinternal
  AND tgname LIKE '%calendar%';

-- =====================================================
-- RESULT: Enrollments should now work without errors
-- 
-- To re-enable calendar invites later:
-- 1. Deploy the Edge Function: supabase functions deploy send-calendar-invite
-- 2. Run this SQL:
--    CREATE TRIGGER trigger_send_calendar_invite_on_enrollment
--      AFTER INSERT ON enrollments
--      FOR EACH ROW
--      EXECUTE FUNCTION send_calendar_invite_on_enrollment();
-- =====================================================
