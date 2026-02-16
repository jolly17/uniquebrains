-- =====================================================
-- FIX CALENDAR INVITE TRIGGER ERROR
-- Make calendar invites optional until properly configured
-- =====================================================

-- Drop the existing triggers that are causing enrollment errors
DROP TRIGGER IF EXISTS trigger_send_calendar_invite_on_enrollment ON enrollments;
DROP TRIGGER IF EXISTS trigger_send_calendar_update_on_session_update ON sessions;
DROP TRIGGER IF EXISTS trigger_send_calendar_update_on_session_delete ON sessions;

-- Update the enrollment function to handle missing configuration gracefully
CREATE OR REPLACE FUNCTION send_calendar_invite_on_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  service_key TEXT;
BEGIN
  -- Only proceed if status is active
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  -- Try to get configuration, but don't fail if not set
  BEGIN
    function_url := current_setting('app.settings.supabase_url', true);
    service_key := current_setting('app.settings.service_role_key', true);
  EXCEPTION
    WHEN OTHERS THEN
      -- Configuration not set, skip calendar invite
      RAISE NOTICE 'Calendar invite configuration not set, skipping';
      RETURN NEW;
  END;

  -- Only proceed if both URL and key are set
  IF function_url IS NULL OR function_url = '' OR service_key IS NULL OR service_key = '' THEN
    RAISE NOTICE 'Calendar invite not configured, skipping';
    RETURN NEW;
  END IF;

  -- Try to send calendar invite, but don't fail enrollment if it errors
  BEGIN
    PERFORM
      net.http_post(
        url := function_url || '/functions/v1/send-calendar-invite',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_key
        ),
        body := jsonb_build_object(
          'type', 'enrollment_created',
          'enrollment_id', NEW.id,
          'course_id', NEW.course_id
        )
      );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the enrollment
      RAISE NOTICE 'Failed to send calendar invite: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the session change function similarly
CREATE OR REPLACE FUNCTION send_calendar_update_on_session_change()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  service_key TEXT;
  event_type TEXT;
BEGIN
  -- Try to get configuration
  BEGIN
    function_url := current_setting('app.settings.supabase_url', true);
    service_key := current_setting('app.settings.service_role_key', true);
  EXCEPTION
    WHEN OTHERS THEN
      -- Configuration not set, skip
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
  END;

  -- Only proceed if configured
  IF function_url IS NULL OR function_url = '' OR service_key IS NULL OR service_key = '' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Determine event type
  IF TG_OP = 'DELETE' THEN
    event_type := 'session_deleted';
    
    BEGIN
      PERFORM
        net.http_post(
          url := function_url || '/functions/v1/send-calendar-invite',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_key
          ),
          body := jsonb_build_object(
            'type', event_type,
            'session_id', OLD.id,
            'course_id', OLD.course_id
          )
        );
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Failed to send calendar cancellation: %', SQLERRM;
    END;
    
    RETURN OLD;
  ELSE
    -- Check if important fields changed
    IF (OLD.session_date IS DISTINCT FROM NEW.session_date) OR
       (OLD.session_time IS DISTINCT FROM NEW.session_time) OR
       (OLD.session_duration IS DISTINCT FROM NEW.session_duration) OR
       (OLD.meeting_link IS DISTINCT FROM NEW.meeting_link) THEN
      
      event_type := 'session_updated';
      
      BEGIN
        PERFORM
          net.http_post(
            url := function_url || '/functions/v1/send-calendar-invite',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || service_key
            ),
            body := jsonb_build_object(
              'type', event_type,
              'session_id', NEW.id,
              'course_id', NEW.course_id
            )
          );
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Failed to send calendar update: %', SQLERRM;
      END;
    END IF;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers (they will now fail gracefully if not configured)
CREATE TRIGGER trigger_send_calendar_invite_on_enrollment
  AFTER INSERT ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION send_calendar_invite_on_enrollment();

CREATE TRIGGER trigger_send_calendar_update_on_session_update
  AFTER UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION send_calendar_update_on_session_change();

CREATE TRIGGER trigger_send_calendar_update_on_session_delete
  AFTER DELETE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION send_calendar_update_on_session_change();

-- Add helpful comments
COMMENT ON FUNCTION send_calendar_invite_on_enrollment() IS 
  'Sends calendar invites to students when they enroll. Fails gracefully if not configured. Configure by setting app.settings.supabase_url and app.settings.service_role_key.';

COMMENT ON FUNCTION send_calendar_update_on_session_change() IS 
  'Sends updated calendar invites when sessions change. Fails gracefully if not configured.';

-- =====================================================
-- VERIFICATION
-- =====================================================
-- You can now enroll in courses even without calendar configuration
-- To enable calendar invites, run:
-- 
-- ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
-- 
-- Then deploy the Edge Function:
-- supabase functions deploy send-calendar-invite
-- =====================================================
