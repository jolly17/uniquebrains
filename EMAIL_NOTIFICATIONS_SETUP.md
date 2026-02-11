# Email Notifications Setup Guide

Complete guide for setting up all email notifications in UniqueBrains.

## Overview

UniqueBrains sends the following email notifications:

1. **Enrollment Emails** ✅ (Already working)
   - Student enrollment confirmation
   - Instructor notification of new student
   - Student unenrollment confirmation

2. **Session Reminder Emails** ⚠️ (Needs cron setup)
   - Sent 24 hours before each session
   - To both instructor and all enrolled students

3. **Session Deletion Emails** 🆕 (New)
   - Sent when instructor deletes a session
   - To all enrolled students

4. **Chat Message Notifications** 🆕 (New)
   - Sent when instructor sends a message
   - To all enrolled students in the course

5. **Answer Notifications** 🆕 (New)
   - Sent when someone answers your question
   - To the question author

---

## 1. Session Reminder Emails (Fix Cron Job)

### Check if Function Exists

1. Go to Supabase Dashboard → Edge Functions
2. Look for `send-session-reminders`
3. If it doesn't exist, create it:
   - Click "Create a new function"
   - Name: `send-session-reminders`
   - Copy code from `supabase/functions/send-session-reminders/index.ts`
   - Deploy

### Setup Cron Job

1. Go to Database → Extensions
2. Enable `pg_cron` if not already enabled
3. Go to SQL Editor
4. Run this SQL (replace YOUR_PROJECT_REF and YOUR_SERVICE_ROLE_KEY):

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

**Where to find values:**
- YOUR_PROJECT_REF: Settings → General → Reference ID
- YOUR_SERVICE_ROLE_KEY: Settings → API → service_role key

### Verify Cron Job

```sql
SELECT * FROM cron.job WHERE jobname = 'send-session-reminders';
```

Should return 1 row with the cron schedule.

---

## 2. Session Deletion Emails (New)

### Deploy Function

1. Go to Supabase Dashboard → Edge Functions
2. Click "Create a new function"
3. Name: `send-session-deleted-email`
4. Copy code from `supabase/functions/send-session-deleted-email/index.ts`
5. Deploy

### Test Function

In Supabase Dashboard, invoke with:

```json
{
  "sessionTitle": "Test Session",
  "sessionDate": "2026-02-15T10:00:00Z",
  "courseTitle": "Test Course",
  "courseId": "test-id",
  "instructorName": "Test Instructor",
  "studentEmails": ["test@example.com"]
}
```

---

## 3. Chat Message Notifications (New)

### Deploy Function

1. Go to Supabase Dashboard → Edge Functions
2. Click "Create a new function"
3. Name: `send-chat-notification-email`
4. Copy code from `supabase/functions/send-chat-notification-email/index.ts`
5. Deploy

### Test Function

In Supabase Dashboard, invoke with:

```json
{
  "senderName": "Test Instructor",
  "messageContent": "Hello everyone!",
  "courseTitle": "Test Course",
  "courseId": "test-id",
  "recipientEmails": ["test@example.com"],
  "isInstructor": true
}
```

---

## 4. Answer Notifications (New)

### Deploy Function

1. Go to Supabase Dashboard → Edge Functions
2. Click "Create a new function"
3. Name: `send-answer-notification-email`
4. Copy code from `supabase/functions/send-answer-notification-email/index.ts`
5. Deploy

### Test Function

In Supabase Dashboard, invoke with:

```json
{
  "questionTitle": "How do I help my child?",
  "questionId": "test-id",
  "topicSlug": "autism-support",
  "answerAuthorName": "Jane Doe",
  "answerContent": "Here's my advice...",
  "questionAuthorEmail": "test@example.com"
}
```

---

## Frontend Integration

The frontend code needs to be updated to call these new functions. The changes are in:

1. `src/services/sessionService.js` - Call session deletion email
2. `src/services/messageService.js` - Call chat notification email
3. `src/services/communityService.js` - Call answer notification email

These changes will be implemented in the code after you confirm the functions are deployed.

---

## Monitoring

### Check Function Logs

1. Go to Edge Functions
2. Select the function
3. Click "Logs" tab

### Check Email Delivery

Go to Resend Dashboard: https://resend.com/emails

### Check Cron Execution

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-session-reminders')
ORDER BY start_time DESC 
LIMIT 10;
```

---

## Troubleshooting

### Session Reminders Not Sending

1. Check if cron job exists: `SELECT * FROM cron.job;`
2. Check cron execution logs (SQL above)
3. Check function logs in Supabase Dashboard
4. Verify RESEND_API_KEY is set in environment variables
5. Create a test session for tomorrow and wait for cron to run

### Other Emails Not Sending

1. Check function logs for errors
2. Verify RESEND_API_KEY environment variable
3. Check Resend dashboard for delivery status
4. Verify email addresses are correct in database

---

## Quick Deployment Checklist

- [ ] Deploy `send-session-reminders` function (if not exists)
- [ ] Setup cron job for session reminders
- [ ] Deploy `send-session-deleted-email` function
- [ ] Deploy `send-chat-notification-email` function
- [ ] Deploy `send-answer-notification-email` function
- [ ] Test each function manually
- [ ] Update frontend code to call new functions
- [ ] Monitor logs for first few days

---

## Environment Variables

All functions use these environment variables (automatically available in Supabase):

- `RESEND_API_KEY` - Your Resend API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

No additional configuration needed!
