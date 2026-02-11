# Fix Session Reminder Cron Job

## Problem

The cron job is failing with this error:
```
ERROR: schema "net" does not exist
LINE 3: net.http_post(
```

## Root Cause

The `pg_net` extension is not enabled in your Supabase database. This extension is required for making HTTP requests from PostgreSQL (which the cron job uses to call the edge function).

---

## Solution

### Step 1: Enable pg_net Extension

1. Go to **Supabase Dashboard**
2. Navigate to **Database** → **Extensions**
3. Search for `pg_net`
4. Click **Enable** next to `pg_net`

**OR** run this SQL in SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Step 2: Recreate the Cron Job

1. Go to **Database** → **SQL Editor**
2. Run the following SQL (replace the placeholders):

```sql
-- Unschedule existing cron job
SELECT cron.unschedule('send-session-reminders');

-- Recreate cron job
SELECT cron.schedule(
  'send-session-reminders',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-session-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

**Replace these values:**
- `YOUR_PROJECT_REF`: Found in Settings → General → Reference ID
- `YOUR_SERVICE_ROLE_KEY`: Found in Settings → API → service_role key (secret)

### Step 3: Verify the Fix

Run this SQL to check the cron job:

```sql
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job 
WHERE jobname = 'send-session-reminders';
```

**Expected output:**
- `jobname`: send-session-reminders
- `schedule`: 0 9 * * *
- `active`: true
- `command`: Should contain `net.http_post(...)`

### Step 4: Test the Cron Job

Wait for the next scheduled run (9 AM UTC) OR manually test:

**Option A: Wait for Natural Run**
- The cron will run automatically at 9 AM UTC tomorrow
- Check execution history after it runs

**Option B: Manual Test**
- Run the test script: `node scripts/test-session-reminder-manual.js`
- This will temporarily move a session to tomorrow and trigger emails

---

## Verification

### Check Cron Execution History

After the cron runs (or after manual test), check if it succeeded:

```sql
SELECT 
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-session-reminders')
ORDER BY start_time DESC 
LIMIT 5;
```

**Expected output:**
- `status`: succeeded
- `return_message`: Should be empty or contain success info
- No "schema net does not exist" error

### Check Function Logs

1. Go to **Edge Functions** → `send-session-reminders`
2. Click **Logs** tab
3. Look for recent invocations
4. Should show sessions processed and emails sent

### Check Email Delivery

Go to Resend Dashboard: https://resend.com/emails
- Should see sent emails
- Check delivery status

---

## Why This Happened

The `pg_net` extension is not enabled by default in all Supabase projects. It needs to be manually enabled to allow PostgreSQL to make HTTP requests.

The cron job uses `net.http_post()` to call your edge function, which requires this extension.

---

## Alternative: Use Supabase Cron (Recommended)

Instead of using `pg_cron` with `pg_net`, you can use Supabase's built-in cron feature:

### Option 1: Database Webhooks (Simpler)

1. Go to **Database** → **Webhooks**
2. Create a new webhook:
   - **Name**: Session Reminders
   - **Table**: sessions
   - **Events**: None (we'll use cron instead)
   - **Type**: HTTP Request
   - **Method**: POST
   - **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-session-reminders`
   - **Headers**: 
     ```json
     {
       "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY",
       "Content-Type": "application/json"
     }
     ```

3. Schedule it to run daily at 9 AM UTC

### Option 2: External Cron Service

Use a service like:
- **Cron-job.org** (free)
- **EasyCron** (free tier)
- **GitHub Actions** (if your repo is on GitHub)

Configure it to POST to:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-session-reminders
```

With header:
```
Authorization: Bearer YOUR_SERVICE_ROLE_KEY
```

---

## Quick Fix Script

I've created a SQL script with all the commands: `scripts/fix-cron-job.sql`

Just:
1. Open the file
2. Replace YOUR_PROJECT_REF and YOUR_SERVICE_ROLE_KEY
3. Run it in Supabase SQL Editor

---

## Summary

1. ✅ Enable `pg_net` extension
2. ✅ Recreate cron job
3. ✅ Verify it's working
4. ✅ Test with manual script or wait for 9 AM UTC

After these steps, your session reminder emails will work automatically!
