-- =====================================================
-- REINSTATE CALENDAR INVITES WITH PROPER FIX
-- Edge Function is now deployed, so we can enable triggers
-- =====================================================

-- STEP 1: Ensure functions use correct configuration
-- =====================================================

-- Update enrollment function to use existing email config
CREATE OR REPLACE FUNCTION send_calendar_invite_on_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  anon_key TEXT;
BEGIN
  -- Only proceed if status is active
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  -- Get configuration (same as enrollment emails)
  BEGIN
    function_url := current_setting('app.supabase_url');
    anon_key := current_setting('app.supabase_anon_key');
  EXCEPTION
    WHEN OTHERS THEN
      -- Configuration not set, skip but don't fail
      RAISE NOTICE 'Calendar invite configuration not found, skipping';
      RETURN NEW;
  END;

  -- Validate configuration
  IF function_url IS NULL OR function_url = '' OR anon_key IS NULL OR anon_key = '' THEN
    RAISE NOTICE 'Calendar invite not fully configured, skipping';
    RETURN NEW;
  END IF;

  -- Send calendar invite (wrapped in exception handler)
  BEGIN
    PERFORM
      net.http_post(
        url := function_url || '/functions/v1/send-calendar-invite',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || anon_key
        ),
        body := jsonb_build_object(
          'type', 'enrollment_created',
          'enrollment_id', NEW.id,
          'course_id', NEW.course_id
        )
      );
    
    RAISE NOTICE 'Calendar invite queued for enrollment %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the enrollment
      RAISE WARNING 'Failed to queue calendar invite: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update session change function
CREATE OR REPLACE FUNCTION send_calendar_update_on_session_change()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  anon_key TEXT;
  event_type TEXT;
  should_send BOOLEAN := FALSE;
BEGIN
  -- Get configuration
  BEGIN
    function_url := current_setting('app.supabase_url');
    anon_key := current_setting('app.supabase_anon_key');
  EXCEPTION
    WHEN OTHERS THEN
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
  END;

  -- Validate configuration
  IF function_url IS NULL OR function_url = '' OR anon_key IS NULL OR anon_key = '' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    event_type := 'session_deleted';
    should_send := TRUE;
    
    BEGIN
      PERFORM
        net.http_post(
          url := function_url || '/functions/v1/send-calendar-invite',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || anon_key
          ),
          body := jsonb_build_object(
            'type', event_type,
            'session_id', OLD.id,
            'course_id', OLD.course_id
          )
        );
      
      RAISE NOTICE 'Calendar cancellation queued for session %', OLD.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to queue calendar cancellation: %', SQLERRM;
    END;
    
    RETURN OLD;
  END IF;

  -- Handle UPDATE - only if important fields changed
  IF (OLD.session_date IS DISTINCT FROM NEW.session_date) OR
     (OLD.session_time IS DISTINCT FROM NEW.session_time) OR
     (OLD.session_duration IS DISTINCT FROM NEW.session_duration) OR
     (OLD.meeting_link IS DISTINCT FROM NEW.meeting_link) THEN
    
    event_type := 'session_updated';
    should_send := TRUE;
    
    BEGIN
      PERFORM
        net.http_post(
          url := function_url || '/functions/v1/send-calendar-invite',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || anon_key
          ),
          body := jsonb_build_object(
            'type', event_type,
            'session_id', NEW.id,
            'course_id', NEW.course_id
          )
        );
      
      RAISE NOTICE 'Calendar update queued for session %', NEW.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to queue calendar update: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Create triggers
-- =====================================================

-- Drop existing triggers first (if any)
DROP TRIGGER IF EXISTS trigger_send_calendar_invite_on_enrollment ON enrollments;
DROP TRIGGER IF EXISTS trigger_send_calendar_update_on_session_update ON sessions;
DROP TRIGGER IF EXISTS trigger_send_calendar_update_on_session_delete ON sessions;

-- Create enrollment trigger
CREATE TRIGGER trigger_send_calendar_invite_on_enrollment
  AFTER INSERT ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION send_calendar_invite_on_enrollment();

-- Create session update trigger
CREATE TRIGGER trigger_send_calendar_update_on_session_update
  AFTER UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION send_calendar_update_on_session_change();

-- Create session delete trigger
CREATE TRIGGER trigger_send_calendar_update_on_session_delete
  AFTER DELETE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION send_calendar_update_on_session_change();

-- STEP 3: Add documentation
-- =====================================================

COMMENT ON FUNCTION send_calendar_invite_on_enrollment() IS 
  'Sends calendar invites when students enroll. Uses app.supabase_url and app.supabase_anon_key. Fails gracefully on errors.';

COMMENT ON FUNCTION send_calendar_update_on_session_change() IS 
  'Sends calendar updates/cancellations when sessions change. Fails gracefully on errors.';

COMMENT ON TRIGGER trigger_send_calendar_invite_on_enrollment ON enrollments IS 
  'Automatically sends calendar invites for all upcoming sessions when a student enrolls';

COMMENT ON TRIGGER trigger_send_calendar_update_on_session_update ON sessions IS 
  'Automatically sends updated calendar invites when session details change';

COMMENT ON TRIGGER trigger_send_calendar_update_on_session_delete ON sessions IS 
  'Automatically sends cancellation notices when sessions are deleted';

-- STEP 4: Verify setup
-- =====================================================

-- Check triggers are enabled
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE tgenabled
    WHEN 'O' THEN 'enabled ✓'
    WHEN 'D' THEN 'disabled ✗'
    ELSE 'unknown'
  END as status
FROM pg_trigger 
WHERE tgname LIKE '%calendar%'
  AND NOT tgisinternal
ORDER BY tgname;

-- =====================================================
-- CALENDAR INVITES ARE NOW ACTIVE!
-- 
-- What happens now:
-- 1. Student enrolls → Calendar invites sent for all upcoming sessions
-- 2. Session updated → All enrolled students get updated invite
-- 3. Session deleted → All enrolled students get cancellation
-- 
-- The triggers fail gracefully, so enrollments will never fail
-- even if the Edge Function has issues.
-- =====================================================
