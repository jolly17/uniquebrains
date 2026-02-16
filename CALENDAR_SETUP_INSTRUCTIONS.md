## Quick Fix for Enrollment Error

If you're getting an enrollment error about "null value in column url", it means the calendar invite feature needs to be configured. You have two options:

### Option A: Disable Calendar Invites (Quick Fix)

Run this in Supabase SQL Editor to disable the triggers temporarily:

```sql
-- Disable calendar invite triggers
DROP TRIGGER IF EXISTS trigger_send_calendar_invite_on_enrollment ON enrollments;
DROP TRIGGER IF EXISTS trigger_send_calendar_update_on_session_update ON sessions;
DROP TRIGGER IF EXISTS trigger_send_calendar_update_on_session_delete ON sessions;
```

### Option B: Apply the Fix Migration (Recommended)

Apply migration `073_fix_calendar_trigger_error.sql` which makes the triggers fail gracefully:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/073_fix_calendar_trigger_error.sql`
3. Paste and run

This allows enrollments to work even without calendar configuration. Calendar invites will be skipped until you complete the setup below.

---

## Full Setup Instructions

This guide will help you set up automatic calendar invites to reduce student absenteeism.

## Prerequisites

1. Resend API account (for sending emails)
2. Supabase project with Edge Functions enabled
3. Access to Supabase Dashboard

## Step 1: Enable pg_net Extension

The triggers use `pg_net` to call Edge Functions asynchronously.

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:

```sql
-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
```

## Step 2: Set Environment Variables

1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add these environment variables:

```
RESEND_API_KEY=re_your_resend_api_key_here
```

3. Go to SQL Editor and run:

```sql
-- Set Supabase URL (replace with your actual URL)
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';

-- Set Service Role Key (replace with your actual key)
ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key-here';
```

**Important:** Get your service role key from Project Settings → API → service_role key

## Step 3: Deploy Edge Function

1. Install Supabase CLI if you haven't:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref your-project-ref
```

3. Deploy the function:
```bash
supabase functions deploy send-calendar-invite
```

4. Verify deployment:
```bash
supabase functions list
```

## Step 4: Apply Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/072_add_calendar_invite_triggers.sql`
3. Copy all the SQL
4. Paste and run in SQL Editor

## Step 5: Test the Setup

### Test 1: Enrollment Calendar Invite

1. Have a test student enroll in a course with upcoming sessions
2. Check their email for calendar invite
3. Verify .ics files are attached
4. Click on .ics file to add to calendar

### Test 2: Session Update

1. As instructor, update a session time
2. Enrolled students should receive updated calendar invite
3. Their calendar should automatically update

### Test 3: Session Cancellation

1. As instructor, delete a session
2. Enrolled students should receive cancellation email
3. Event should be removed from their calendar

## Verification Queries

Check if triggers are working:

```sql
-- Check if pg_net extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- Check if triggers exist
SELECT tgname, tgrelid::regclass, tgenabled 
FROM pg_trigger 
WHERE tgname LIKE '%calendar%';

-- Check if functions exist
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE '%calendar%';

-- View recent pg_net requests (for debugging)
SELECT * FROM net._http_response ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

### Calendar invites not sending

1. Check Edge Function logs:
```bash
supabase functions logs send-calendar-invite
```

2. Verify environment variables are set:
```sql
SELECT current_setting('app.settings.supabase_url', true);
SELECT current_setting('app.settings.service_role_key', true);
```

3. Check pg_net requests:
```sql
SELECT * FROM net._http_response 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### .ics files not opening

- Make sure email client supports attachments
- Try downloading .ics file and opening manually
- Check if calendar app is installed

### Calendar not updating automatically

- Some calendar apps require manual refresh
- UID in .ics file must match for updates to work
- Check SEQUENCE number is incrementing

## Email Template Customization

To customize the email template, edit:
`supabase/functions/send-calendar-invite/index.ts`

Look for the `htmlContent` variable around line 150.

## Cost Estimates

- Edge Function calls: ~$0.00002 per call
- Resend emails: $0.001 per email (first 3,000 free)
- For 100 students × 10 sessions = 1,000 invites
- Estimated cost: ~$1-2/month

## Alternative: Manual Calendar Links

If automatic invites don't work, you can add manual "Add to Calendar" buttons:

1. Google Calendar: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...`
2. Outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=...`
3. Download .ics: Provide download button on session page

## Best Practices

1. Send invites immediately after enrollment
2. Include 15-minute and 1-hour reminders
3. Use clear, descriptive event titles
4. Include meeting link in both description and location
5. Test with different calendar apps (Google, Outlook, Apple)
6. Monitor email delivery rates
7. Provide fallback options (manual download)

## Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Check Resend email logs
3. Verify database triggers are firing
4. Test with your own email first
5. Contact support with error logs

## Next Steps

After setup:
1. Test with a small group of students
2. Gather feedback on calendar integration
3. Monitor absenteeism rates
4. Adjust reminder times if needed
5. Consider adding SMS reminders (requires phone numbers)
