# Email Notifications - Implementation Summary

## What Was Done

I've implemented a comprehensive email notification system for UniqueBrains. Here's what's been added:

### 1. New Edge Functions Created

Three new Supabase Edge Functions have been created in `supabase/functions/`:

1. **send-session-deleted-email** - Notifies students when a session is cancelled
2. **send-chat-notification-email** - Notifies students when instructor sends a message
3. **send-answer-notification-email** - Notifies question authors when someone answers

### 2. Frontend Integration

Updated three service files to automatically trigger email notifications:

1. **src/services/sessionService.js**
   - When instructor deletes a session, all enrolled students receive an email
   - Email includes session details and course link

2. **src/services/messageService.js**
   - When instructor sends a group message, all enrolled students receive an email
   - Email includes message preview and link to course chat
   - Only triggers for instructor messages (not student messages)

3. **src/services/communityService.js**
   - When someone answers a question, the question author receives an email
   - Email includes answer preview and link to the question
   - Doesn't send if you answer your own question

### 3. Documentation

Created two comprehensive guides:

1. **EMAIL_NOTIFICATIONS_SETUP.md** - Complete setup instructions for all email functions
2. **EMAIL_NOTIFICATIONS_SUMMARY.md** - This file, quick overview

---

## What You Need To Do

### Step 1: Deploy the New Edge Functions

Go to your Supabase Dashboard and deploy these 3 functions:

1. **send-session-deleted-email**
   - Go to Edge Functions → Create new function
   - Name: `send-session-deleted-email`
   - Copy code from: `supabase/functions/send-session-deleted-email/index.ts`
   - Deploy

2. **send-chat-notification-email**
   - Go to Edge Functions → Create new function
   - Name: `send-chat-notification-email`
   - Copy code from: `supabase/functions/send-chat-notification-email/index.ts`
   - Deploy

3. **send-answer-notification-email**
   - Go to Edge Functions → Create new function
   - Name: `send-answer-notification-email`
   - Copy code from: `supabase/functions/send-answer-notification-email/index.ts`
   - Deploy

### Step 2: Fix Session Reminder Cron Job

The session reminder function exists but the cron job might not be set up:

1. Go to Supabase Dashboard → Database → SQL Editor
2. Run this to check if cron job exists:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'send-session-reminders';
   ```

3. If it returns no rows, set it up:
   ```sql
   -- Enable pg_cron extension first (if not enabled)
   -- Go to Database → Extensions → Enable pg_cron
   
   -- Then schedule the cron job
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
   ```

   Replace:
   - `YOUR_PROJECT_REF` with your Supabase project reference (Settings → General → Reference ID)
   - `YOUR_SERVICE_ROLE_KEY` with your service role key (Settings → API → service_role key)

### Step 3: Test Everything

1. **Test Session Deletion Email:**
   - Create a test course with a session
   - Enroll a test student
   - Delete the session as instructor
   - Check that student receives email

2. **Test Chat Notification Email:**
   - As instructor, send a message in course chat
   - Check that enrolled students receive email

3. **Test Answer Notification Email:**
   - Ask a question in community
   - Have another user answer it
   - Check that question author receives email

4. **Test Session Reminder Email:**
   - Create a session scheduled for tomorrow
   - Wait for cron to run (9 AM UTC) or manually invoke the function
   - Check that instructor and students receive emails

---

## How It Works

### Email Flow

1. **User Action** (delete session, send message, answer question)
   ↓
2. **Frontend Service** (sessionService, messageService, communityService)
   ↓
3. **Database Update** (session deleted, message saved, answer created)
   ↓
4. **Email Function Called** (via fetch to Supabase Edge Function)
   ↓
5. **Resend API** (sends actual email)
   ↓
6. **Email Delivered** to recipients

### Key Features

- **Non-blocking**: Email sending doesn't block the main action
- **Error handling**: If email fails, the main action still succeeds
- **Smart filtering**: 
  - Only instructor messages trigger notifications (not student messages)
  - Don't send answer notification if you answer your own question
  - Don't send to the person who performed the action

---

## Monitoring

### Check Email Delivery

1. **Resend Dashboard**: https://resend.com/emails
   - See all sent emails
   - Check delivery status
   - View email content

2. **Supabase Function Logs**:
   - Go to Edge Functions → Select function → Logs tab
   - See function invocations and errors

3. **Cron Job Status**:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-session-reminders')
   ORDER BY start_time DESC 
   LIMIT 10;
   ```

---

## Troubleshooting

### Emails Not Sending

1. Check function logs in Supabase Dashboard
2. Verify RESEND_API_KEY is set in Supabase environment variables
3. Check Resend dashboard for delivery status
4. Verify email addresses are correct in profiles table

### Session Reminders Not Working

1. Check if cron job exists: `SELECT * FROM cron.job;`
2. Check cron execution logs (SQL above)
3. Verify function is deployed
4. Create a test session for tomorrow and wait for cron

---

## What's Already Working

✅ Enrollment confirmation emails (student)
✅ Instructor notification of new student
✅ Unenrollment confirmation emails

## What's New

🆕 Session deletion notifications
🆕 Chat message notifications (instructor → students)
🆕 Answer notifications (when someone answers your question)

## What Needs Setup

⚠️ Session reminder cron job (function exists, needs cron schedule)
⚠️ Deploy 3 new edge functions

---

## Files Changed

- `src/services/sessionService.js` - Added session deletion email
- `src/services/messageService.js` - Added chat notification email
- `src/services/communityService.js` - Added answer notification email
- `supabase/functions/send-session-deleted-email/index.ts` - New function
- `supabase/functions/send-chat-notification-email/index.ts` - New function
- `supabase/functions/send-answer-notification-email/index.ts` - New function
- `EMAIL_NOTIFICATIONS_SETUP.md` - Complete setup guide
- `EMAIL_NOTIFICATIONS_SUMMARY.md` - This summary

All changes have been committed and pushed to GitHub!
