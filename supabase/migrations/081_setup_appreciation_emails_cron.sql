-- =====================================================
-- Setup Instructions for Appreciation Emails Cron Job
-- =====================================================

-- IMPORTANT: Supabase Cloud doesn't support pg_cron directly.
-- Instead, you need to set up the cron job through one of these methods:

-- METHOD 1: Use Supabase Dashboard (Recommended)
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to Database > Cron Jobs (if available in your plan)
-- 3. Create a new cron job with:
--    - Name: send-appreciation-emails-daily
--    - Schedule: 0 17 * * * (5 PM GMT daily)
--    - SQL Command: See below

-- METHOD 2: Use an external cron service (e.g., cron-job.org, EasyCron, GitHub Actions)
-- Set up a scheduled HTTP request to:
-- POST https://your-project.supabase.co/functions/v1/send-appreciation-emails
-- Headers:
--   Authorization: Bearer YOUR_SERVICE_ROLE_KEY
--   Content-Type: application/json
-- Body: {}

-- METHOD 3: Use Supabase Edge Functions with pg_net (if pg_cron is available)
-- This requires pg_cron extension which may not be available on all Supabase plans

-- For METHOD 1, use this SQL command in the cron job:
/*
SELECT
  net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-appreciation-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  ) as request_id;
*/

-- VERIFICATION:
-- To test if the function works, you can manually invoke it:
-- curl -X POST https://your-project.supabase.co/functions/v1/send-appreciation-emails \
--   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--   -H "Content-Type: application/json"

-- TROUBLESHOOTING:
-- 1. Check Supabase Edge Function logs in the dashboard
-- 2. Verify the function is deployed: supabase functions list
-- 3. Check that RESEND_API_KEY is set in function secrets
-- 4. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set

-- RECOMMENDED SOLUTION: GitHub Actions
-- Create .github/workflows/send-appreciation-emails.yml
-- See the workflow file for implementation details

