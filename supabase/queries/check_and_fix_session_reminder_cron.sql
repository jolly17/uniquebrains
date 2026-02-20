-- Check current cron jobs for session reminders
SELECT * FROM cron.job WHERE jobname LIKE '%session%';

-- If the cron job exists but has issues, unschedule it first
SELECT cron.unschedule('send-session-reminders');

-- Create/recreate the cron job for session reminders
-- Runs daily at 9:00 AM IST (3:30 AM UTC)
SELECT cron.schedule(
  'send-session-reminders',
  '30 3 * * *', -- 3:30 AM UTC = 9:00 AM IST
  $$
  SELECT
    net.http_post(
      url:='https://wxfxvuvlpjxnyxhpquyw.supabase.co/functions/v1/send-session-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY_HERE"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Verify the cron job was created
SELECT * FROM cron.job WHERE jobname = 'send-session-reminders';

-- Check recent cron job runs and their status
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-session-reminders')
ORDER BY start_time DESC
LIMIT 10;
