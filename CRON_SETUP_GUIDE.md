# Appreciation Emails Cron Job Fix Guide

## Problem
The send-appreciation-emails cron job was configured but didn't trigger at 5 PM. The issue was with the cron job configuration.

## Issues Found in Your Existing Cron Job

1. **Duplicate URL**: `https://https://wxfxvuvlpjxnyxhpquyw.supabase.co.supabase.co/`
   - Should be: `https://wxfxvuvlpjxnyxhpquyw.supabase.co/`

2. **Wrong API Key**: Using `anon` key instead of `service_role` key
   - The `anon` key has limited permissions
   - The `service_role` key is needed to bypass RLS and access all data

## Solution: Fix the Existing Cron Job

### Step 1: Run the Fix Script

Run this SQL in your Supabase SQL Editor:

```sql
-- Remove the broken cron job
SELECT cron.unschedule('send-appreciation-emails');

-- Create the corrected cron job
-- Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
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
```

### Step 2: Get Your Service Role Key

1. Go to Supabase Dashboard
2. Navigate to **Settings** > **API**
3. Find **service_role** key (it's marked as "secret")
4. Copy the key
5. Replace `YOUR_SERVICE_ROLE_KEY` in the SQL above with this key

### Step 3: Verify the Cron Job

Run this to check if the cron job is configured correctly:

```sql
SELECT * FROM cron.job WHERE jobname = 'send-appreciation-emails';
```

You should see:
- `jobname`: send-appreciation-emails
- `schedule`: 0 17 * * *
- `active`: true

## Why This Happened

Your original SQL had these issues:

```sql
-- WRONG:
url := 'https://https://wxfxvuvlpjxnyxhpquyw.supabase.co.supabase.co/functions/v1/send-appreciation-emails'
--         ^^^^^^ duplicate                          ^^^^^^^^^^^^^^ duplicate

-- WRONG:
"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  -- This is the anon key
--                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Limited permissions

-- CORRECT:
url := 'https://wxfxvuvlpjxnyxhpquyw.supabase.co/functions/v1/send-appreciation-emails'
"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"  -- Full permissions
```

## Monitoring

### Check if the cron job ran:

```sql
SELECT * 
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-appreciation-emails') 
ORDER BY start_time DESC 
LIMIT 10;
```

Look for:
- `status`: 'succeeded' or 'failed'
- `return_message`: Response from the function
- `start_time`: When it ran

### Check Edge Function logs:

1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Click on `send-appreciation-emails`
4. Click on **Logs** tab

## Testing

### Test the cron job manually:

```sql
-- This will trigger the function immediately
SELECT
  net.http_post(
    url := 'https://wxfxvuvlpjxnyxhpquyw.supabase.co/functions/v1/send-appreciation-emails',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) as request_id;
```

## Comparison with Session Reminders

If your session reminders cron job works correctly, it should look similar to this:

```sql
SELECT cron.schedule(
  'send-session-reminders',
  '0 9 * * *',  -- Or whatever schedule you use
  $$
  SELECT
    net.http_post(
      url := 'https://wxfxvuvlpjxnyxhpquyw.supabase.co/functions/v1/send-session-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

The key differences in your broken appreciation emails cron were:
1. URL had duplicates
2. Used anon key instead of service_role key

## Next Steps

1. ✅ Run the fix script above with your service_role key
2. ✅ Verify the cron job is configured correctly
3. ✅ Test it manually to ensure it works
4. ✅ Wait until 5 PM GMT to see if it runs automatically
5. ✅ Check the logs to confirm emails were sent

## Note About GitHub Actions

You can **ignore the GitHub Actions workflow** I created earlier. Since you already have `pg_cron` set up in Supabase, you don't need it. The GitHub Actions approach was a fallback solution for when `pg_cron` isn't available.

You can delete the workflow file if you want:
- `.github/workflows/send-appreciation-emails.yml`

Or keep it as a backup option in case the Supabase cron ever has issues.
