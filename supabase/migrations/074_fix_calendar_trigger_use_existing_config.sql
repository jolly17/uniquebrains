-- =====================================================
-- FIX CALENDAR INVITE TRIGGER TO USE EXISTING CONFIG
-- Use the same configuration as enrollment emails
-- =====================================================

-- Update the enrollment function to use existing config (app.supabase_url)
CREATE OR REPLACE FUNCTION send_calendar_invite_on_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
BEGIN
  -- Only proceed if status is active
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  -- Use the same config as enrollment emails
  BEGIN
    function_url := current_setting('app.supabase_url');
  EXCEPTION
    WHEN OTHERS THEN
      -- Configuration not set, skip calendar invite
      RAISE NOTICE 'Calendar invite configuration not set, skipping';
      RETURN NEW;
  END;

  -- Only proceed if URL is set
  IF function_url IS NULL OR function_url = '' THEN
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
          'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
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
  event_type TEXT;
BEGIN
  -- Try to get configuration
  BEGIN
    function_url := current_setting('app.supabase_url');
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
  IF function_url IS NULL OR function_url = '' THEN
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
            'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
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
              'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
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

-- Triggers are already created, just updating the functions

-- Add helpful comments
COMMENT ON FUNCTION send_calendar_invite_on_enrollment() IS 
  'Sends calendar invites to students when they enroll. Uses same config as enrollment emails (app.supabase_url and app.supabase_anon_key). Fails gracefully if Edge Function not deployed.';

COMMENT ON FUNCTION send_calendar_update_on_session_change() IS 
  'Sends updated calendar invites when sessions change. Uses same config as enrollment emails. Fails gracefully if Edge Function not deployed.';

-- =====================================================
-- VERIFICATION
-- =====================================================
-- This now uses the same configuration as your enrollment emails:
-- - app.supabase_url (already set)
-- - app.supabase_anon_key (already set)
-- 
-- To enable calendar invites, just deploy the Edge Function:
-- supabase functions deploy send-calendar-invite
-- 
-- Enrollments will work even if the Edge Function isn't deployed yet
-- =====================================================
