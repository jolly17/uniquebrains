-- =====================================================
-- USE ENVIRONMENT VARIABLES FOR CALENDAR CONFIG
-- Instead of database settings, use Supabase environment
-- =====================================================

-- Update enrollment function to get URL from Supabase environment
CREATE OR REPLACE FUNCTION send_calendar_invite_on_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  auth_header TEXT;
BEGIN
  -- Only proceed if status is active
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  -- Get Supabase URL from environment (set by Supabase automatically)
  -- This is available as SUPABASE_URL in Edge Functions
  -- For database functions, we'll construct it from the request context
  BEGIN
    -- Try to get from existing settings first (if set)
    function_url := current_setting('app.supabase_url', true);
    
    -- If not set, try to get from request headers (set by Supabase)
    IF function_url IS NULL OR function_url = '' THEN
      -- Use the public URL from Supabase environment
      -- This will be set automatically by Supabase
      function_url := current_setting('request.headers', true)::json->>'host';
      
      IF function_url IS NOT NULL AND function_url != '' THEN
        function_url := 'https://' || function_url;
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not determine Supabase URL, skipping calendar invite';
      RETURN NEW;
  END;

  -- If still no URL, skip
  IF function_url IS NULL OR function_url = '' THEN
    RAISE NOTICE 'Supabase URL not configured, skipping calendar invite';
    RETURN NEW;
  END IF;

  -- Get auth key
  BEGIN
    auth_header := current_setting('app.supabase_anon_key', true);
    
    IF auth_header IS NULL OR auth_header = '' THEN
      -- Try to get from request
      auth_header := current_setting('request.headers', true)::json->>'authorization';
      
      IF auth_header IS NOT NULL THEN
        -- Extract just the token part (remove 'Bearer ' prefix if present)
        auth_header := regexp_replace(auth_header, '^Bearer ', '');
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not get auth key, skipping calendar invite';
      RETURN NEW;
  END;

  -- If no auth key, skip
  IF auth_header IS NULL OR auth_header = '' THEN
    RAISE NOTICE 'Auth key not available, skipping calendar invite';
    RETURN NEW;
  END IF;

  -- Send calendar invite
  BEGIN
    PERFORM
      net.http_post(
        url := function_url || '/functions/v1/send-calendar-invite',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || auth_header
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
      RAISE WARNING 'Failed to queue calendar invite: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update session change function similarly
CREATE OR REPLACE FUNCTION send_calendar_update_on_session_change()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  auth_header TEXT;
  event_type TEXT;
BEGIN
  -- Get configuration
  BEGIN
    function_url := current_setting('app.supabase_url', true);
    
    IF function_url IS NULL OR function_url = '' THEN
      function_url := current_setting('request.headers', true)::json->>'host';
      IF function_url IS NOT NULL AND function_url != '' THEN
        function_url := 'https://' || function_url;
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
  END;

  IF function_url IS NULL OR function_url = '' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Get auth key
  BEGIN
    auth_header := current_setting('app.supabase_anon_key', true);
    
    IF auth_header IS NULL OR auth_header = '' THEN
      auth_header := current_setting('request.headers', true)::json->>'authorization';
      IF auth_header IS NOT NULL THEN
        auth_header := regexp_replace(auth_header, '^Bearer ', '');
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
  END;

  IF auth_header IS NULL OR auth_header = '' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Handle operations
  IF TG_OP = 'DELETE' THEN
    event_type := 'session_deleted';
    
    BEGIN
      PERFORM
        net.http_post(
          url := function_url || '/functions/v1/send-calendar-invite',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || auth_header
          ),
          body := jsonb_build_object(
            'type', event_type,
            'session_id', OLD.id,
            'course_id', OLD.course_id
          )
        );
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to queue calendar cancellation: %', SQLERRM;
    END;
    
    RETURN OLD;
  END IF;

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
            'Authorization', 'Bearer ' || auth_header
          ),
          body := jsonb_build_object(
            'type', event_type,
            'session_id', NEW.id,
            'course_id', NEW.course_id
          )
        );
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to queue calendar update: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- NOTE: This version tries to auto-detect the Supabase URL
-- from the request context. If that doesn't work, you can
-- still set it manually with service role key:
-- 
-- Using psql or service role connection:
-- ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET app.supabase_anon_key = 'your-anon-key';
-- =====================================================

COMMENT ON FUNCTION send_calendar_invite_on_enrollment() IS 
  'Sends calendar invites when students enroll. Auto-detects Supabase URL from request context or uses app.supabase_url if set.';

COMMENT ON FUNCTION send_calendar_update_on_session_change() IS 
  'Sends calendar updates/cancellations when sessions change. Auto-detects configuration from request context.';
