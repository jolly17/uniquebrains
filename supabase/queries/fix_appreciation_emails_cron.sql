-- =====================================================
-- Fix Appreciation Emails Cron Job
-- This fixes the existing cron job with correct URL and service role key
-- =====================================================

-- First, remove the existing broken cron job
SELECT cron.unschedule('send-appreciation-emails');

-- Create the corrected cron job
-- IMPORTANT: Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
-- You can find it in Supabase Dashboard > Settings > API > service_role (secret)
SELECT cron.schedule(
  'send-appreciation-emails',
  '0 17 * * *',  -- 5 PM GMT daily
  $$
  SELECT
    net.http_post(
      url := 'https://wxfxvuvlpjxnyxhpquyw.supabase.co/functions/v1/send-appreciation-emails',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);

-- Verify the cron job was created correctly
SELECT * FROM cron.job WHERE jobname = 'send-appreciation-emails';

-- To check if the cron job runs successfully, check the logs:
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-appreciation-emails') ORDER BY start_time DESC LIMIT 10;
