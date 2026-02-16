# Fix Calendar Invite 401 Error

## The Problem

Calendar invites are failing with `401 Invalid JWT` error. The database trigger is calling the Edge Function, but the anon key in the configuration is invalid.

## The Solution

The configuration uses `app.supabase_anon_key` which needs to be the correct anon key from your Supabase project.

### Step 1: Get Your Correct Anon Key

1. Go to your Supabase Dashboard
2. Click on **Project Settings** (gear icon in sidebar)
3. Click on **API** in the left menu
4. Find the **Project API keys** section
5. Copy the **anon public** key (it's a long JWT token starting with `eyJ...`)

### Step 2: Update the Configuration

Run this SQL in your Supabase SQL Editor, replacing `YOUR_ACTUAL_ANON_KEY` with the key you copied:

```sql
-- Set the correct anon key
ALTER DATABASE postgres SET app.supabase_anon_key = 'YOUR_ACTUAL_ANON_KEY';

-- Verify it's set correctly
SELECT 
  'app.supabase_anon_key' as setting,
  LEFT(current_setting('app.supabase_anon_key'), 20) || '...' as value;
```

### Step 3: Test It

Enroll a student in a course and check if the calendar invite is sent:

```sql
-- Check the most recent http request
SELECT 
  id, 
  created, 
  status_code, 
  error_msg,
  content::text
FROM net._http_response
ORDER BY created DESC
LIMIT 1;
```

You should see `status_code = 200` for success.

## Alternative: Use Service Role Key

If the anon key still doesn't work, you can use the service role key instead (more appropriate for internal triggers):

```sql
-- Get your service role key from Project Settings → API
-- Then set it:
ALTER DATABASE postgres SET app.supabase_service_key = 'YOUR_SERVICE_ROLE_KEY';

-- Update the function to use service role key instead:
CREATE OR REPLACE FUNCTION send_calendar_invite_on_enrollment()
RETURNS TRIGGER AS $
DECLARE
  function_url TEXT;
  auth_key TEXT;
BEGIN
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  BEGIN
    function_url := current_setting('app.supabase_url');
    auth_key := current_setting('app.supabase_service_key'); -- Changed from anon_key
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Calendar invite configuration not found, skipping';
      RETURN NEW;
  END;

  IF function_url IS NULL OR function_url = '' OR auth_key IS NULL OR auth_key = '' THEN
    RAISE NOTICE 'Calendar invite not fully configured, skipping';
    RETURN NEW;
  END IF;

  BEGIN
    PERFORM
      net.http_post(
        url := function_url || '/functions/v1/send-calendar-invite',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || auth_key
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
$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Quick Check

To verify your current configuration:

```sql
SELECT 
  'URL' as config,
  current_setting('app.supabase_url', true) as value
UNION ALL
SELECT 
  'Anon Key (first 20 chars)' as config,
  LEFT(current_setting('app.supabase_anon_key', true), 20) as value;
```

The URL should match your project URL (e.g., `https://xxxxx.supabase.co`).
The anon key should start with `eyJ`.
