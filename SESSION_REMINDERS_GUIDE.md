# Session Reminder Emails - Complete Guide

Automated email reminders sent to instructors and students 24 hours before each scheduled session.

## Quick Deploy (Browser Method - Recommended)

### Step 1: Create the Function in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** (left sidebar)
3. Click **"Create a new function"**
4. Name it: `send-session-reminders`
5. Copy and paste the code from `supabase/functions/send-session-reminders/index.ts`
6. Click **"Deploy"**

That's it! The function is now deployed.

### Step 2: Test the Function

In the Supabase Dashboard, on the function page:

1. Click the **"Invoke"** button
2. Leave the body empty (or use `{}`)
3. Click **"Run"**

Expected response:
```json
{
  "success": true,
  "sessionsProcessed": 0,
  "emailsSent": 0,
  "emailsFailed": 0
}
```

(Will be 0 if no sessions are scheduled for tomorrow)

### Step 3: Test with Real Data

To properly test the emails:

1. Create a course in your app
2. Add a session scheduled for **tomorrow**
3. Enroll a student in the course
4. Invoke the function again (Step 2)
5. Check that emails were sent to both instructor and student
6. Verify emails in Resend dashboard: https://resend.com/emails

### Step 4: Schedule Daily Execution

Set up a cron job to run the function automatically every day:

1. Go to **Database** → **Extensions**
2. Enable `pg_cron` extension (if not already enabled)
3. Go to **SQL Editor**
4. Run this SQL (replace `YOUR_PROJECT_REF` and `YOUR_SERVICE_ROLE_KEY`):

```sql
-- Schedule to run daily at 9 AM UTC
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

**Where to find these values:**
- `YOUR_PROJECT_REF`: Settings → General → Reference ID
- `YOUR_SERVICE_ROLE_KEY`: Settings → API → service_role key (secret)

**Cron Schedule Options:**
- `0 9 * * *` - Every day at 9 AM UTC
- `0 10 * * *` - Every day at 10 AM UTC
- `30 8 * * *` - Every day at 8:30 AM UTC
- `0 9 * * 1-5` - Weekdays only at 9 AM UTC

### Step 5: Verify Cron Job

In SQL Editor, run:

```sql
SELECT * FROM cron.job;
```

You should see `send-session-reminders` listed.

---

## How It Works

1. Function runs daily (via cron)
2. Queries for all sessions scheduled for tomorrow (24 hours from now)
3. For each session:
   - Fetches course details and instructor info
   - Fetches all enrolled students
   - Sends reminder email to instructor
   - Sends reminder email to each student
4. Returns summary of emails sent/failed

## Email Content

### Instructor Email Includes:
- Session title and course name
- Date/time in course timezone
- Duration
- Meeting link (if available)
- Link to course dashboard

### Student Email Includes:
- Session title and course name
- Instructor name
- Date/time in course timezone
- Duration
- Meeting link (if available)
- Preparation checklist
- Link to course details

## Monitoring

### Check Function Logs

1. Go to **Edge Functions**
2. Select `send-session-reminders`
3. Click **Logs** tab

Look for:
- Number of sessions found
- Emails sent/failed
- Any error messages

### Check Email Delivery

Go to Resend Dashboard: https://resend.com/emails

### Check Cron Execution History

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-session-reminders')
ORDER BY start_time DESC 
LIMIT 10;
```

## Troubleshooting

### No emails sent
- Verify sessions exist for tomorrow with status 'scheduled'
- Check that courses have enrolled students
- Verify RESEND_API_KEY is set in Supabase environment variables
- Check function logs for errors

### Emails not received
- Verify email addresses are correct in profiles table
- Check Resend dashboard for delivery status
- Check spam folder

### Timezone issues
- Ensure courses have the `timezone` field set correctly
- Function uses course timezone for formatting
- Defaults to UTC if timezone not set

### Cron not running
- Verify `pg_cron` extension is enabled
- Check cron job exists: `SELECT * FROM cron.job;`
- Check for errors: `SELECT * FROM cron.job_run_details WHERE status = 'failed';`

## Unscheduling (if needed)

To stop the automated reminders:

```sql
SELECT cron.unschedule('send-session-reminders');
```

## Environment Variables

The function uses these environment variables (automatically available):
- `RESEND_API_KEY` - Your Resend API key (already configured)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

No additional configuration needed!

---

## Summary Checklist

- [ ] Deploy function in Supabase Dashboard
- [ ] Test manually with "Invoke" button
- [ ] Create test session for tomorrow
- [ ] Verify emails are sent and received
- [ ] Enable `pg_cron` extension
- [ ] Schedule cron job with SQL
- [ ] Verify cron job is listed
- [ ] Monitor for first few days

Done! Your session reminders are now automated. 🎉
