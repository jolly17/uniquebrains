-- Fix for Session Reminder Cron Job
-- Error: schema "net" does not exist
-- Solution: Enable pg_net extension and recreate cron job

-- Step 1: Enable pg_net extension (required for HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Unschedule existing cron job (if it exists)
SELECT cron.unschedule('send-session-reminders');

-- Step 3: Recreate cron job with correct configuration
-- IMPORTANT: Replace YOUR_PROJECT_REF and YOUR_SERVICE_ROLE_KEY with your actual values
-- 
-- Find these values in Supabase Dashboard:
-- - YOUR_PROJECT_REF: Settings → General → Reference ID
-- - YOUR_SERVICE_ROLE_KEY: Settings → API → service_role key (secret)

SELECT cron.schedule(
  'send-session-reminders',
  '0 9 * * *',  -- Daily at 9 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-session-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);

-- Step 4: Verify cron job was created successfully
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job 
WHERE jobname = 'send-session-reminders';

-- Expected output:
-- jobname: send-session-reminders
-- schedule: 0 9 * * *
-- active: true
-- command: SELECT net.http_post(...)
