-- =====================================================
-- ENABLE CALENDAR INVITE TRIGGERS
-- Re-enable the triggers that were disabled
-- =====================================================

-- Enable the enrollment calendar invite trigger
ALTER TABLE enrollments ENABLE TRIGGER trigger_send_calendar_invite_on_enrollment;

-- Enable the session update calendar invite trigger
ALTER TABLE sessions ENABLE TRIGGER trigger_send_calendar_update_on_session_update;

-- Enable the session delete calendar invite trigger
ALTER TABLE sessions ENABLE TRIGGER trigger_send_calendar_update_on_session_delete;

-- Verify triggers are enabled
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE tgenabled
    WHEN 'O' THEN 'enabled'
    WHEN 'D' THEN 'disabled'
    WHEN 'R' THEN 'replica'
    WHEN 'A' THEN 'always'
    ELSE 'unknown'
  END as status
FROM pg_trigger 
WHERE tgname LIKE '%calendar%'
ORDER BY tgname;

-- =====================================================
-- NOTE: These triggers now fail gracefully if the
-- Edge Function isn't deployed yet, so enrollments
-- will work even without calendar invites configured
-- =====================================================
