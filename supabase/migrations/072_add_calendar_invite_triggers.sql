-- =====================================================
-- CALENDAR INVITE TRIGGERS
-- Automatically send calendar invites when students enroll
-- and when sessions are updated or deleted
-- =====================================================

-- STEP 1: Create function to call Edge Function for enrollment
-- =====================================================
CREATE OR REPLACE FUNCTION send_calendar_invite_on_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
BEGIN
  -- Only send for active enrollments
  IF NEW.status = 'active' THEN
    -- Get the Edge Function URL from environment
    function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-calendar-invite';
    
    -- Call the Edge Function asynchronously using pg_net
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'type', 'enrollment_created',
          'enrollment_id', NEW.id,
          'course_id', NEW.course_id
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Create function to call Edge Function for session updates
-- =====================================================
CREATE OR REPLACE FUNCTION send_calendar_update_on_session_change()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  event_type TEXT;
BEGIN
  -- Get the Edge Function URL
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-calendar-invite';
  
  -- Determine event type
  IF TG_OP = 'DELETE' THEN
    event_type := 'session_deleted';
    
    -- Call Edge Function for deletion
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'type', event_type,
          'session_id', OLD.id,
          'course_id', OLD.course_id
        )
      );
    
    RETURN OLD;
  ELSE
    -- Check if important fields changed (date, time, duration, meeting_link)
    IF (OLD.session_date IS DISTINCT FROM NEW.session_date) OR
       (OLD.session_time IS DISTINCT FROM NEW.session_time) OR
       (OLD.session_duration IS DISTINCT FROM NEW.session_duration) OR
       (OLD.meeting_link IS DISTINCT FROM NEW.meeting_link) THEN
      
      event_type := 'session_updated';
      
      -- Call Edge Function for update
      PERFORM
        net.http_post(
          url := function_url,
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := jsonb_build_object(
            'type', event_type,
            'session_id', NEW.id,
            'course_id', NEW.course_id
          )
        );
    END IF;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Create triggers
-- =====================================================

-- Trigger for new enrollments
DROP TRIGGER IF EXISTS trigger_send_calendar_invite_on_enrollment ON enrollments;
CREATE TRIGGER trigger_send_calendar_invite_on_enrollment
  AFTER INSERT ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION send_calendar_invite_on_enrollment();

-- Trigger for session updates
DROP TRIGGER IF EXISTS trigger_send_calendar_update_on_session_update ON sessions;
CREATE TRIGGER trigger_send_calendar_update_on_session_update
  AFTER UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION send_calendar_update_on_session_change();

-- Trigger for session deletions
DROP TRIGGER IF EXISTS trigger_send_calendar_update_on_session_delete ON sessions;
CREATE TRIGGER trigger_send_calendar_update_on_session_delete
  AFTER DELETE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION send_calendar_update_on_session_change();

-- STEP 4: Add comments for documentation
-- =====================================================
COMMENT ON FUNCTION send_calendar_invite_on_enrollment() IS 
  'Sends calendar invites to students when they enroll in a course. Calls the send-calendar-invite Edge Function.';

COMMENT ON FUNCTION send_calendar_update_on_session_change() IS 
  'Sends updated calendar invites when sessions are modified or cancelled. Calls the send-calendar-invite Edge Function.';

COMMENT ON TRIGGER trigger_send_calendar_invite_on_enrollment ON enrollments IS 
  'Automatically sends calendar invites for all upcoming sessions when a student enrolls';

COMMENT ON TRIGGER trigger_send_calendar_update_on_session_update ON sessions IS 
  'Automatically sends updated calendar invites when session details change';

COMMENT ON TRIGGER trigger_send_calendar_update_on_session_delete ON sessions IS 
  'Automatically sends cancellation notices when sessions are deleted';

-- =====================================================
-- NOTES:
-- 1. Requires pg_net extension to be enabled
-- 2. Requires environment variables to be set:
--    - app.settings.supabase_url
--    - app.settings.service_role_key
-- 3. Requires send-calendar-invite Edge Function to be deployed
-- 4. Uses SECURITY DEFINER to run with elevated privileges
-- =====================================================
