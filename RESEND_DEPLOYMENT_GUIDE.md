# Resend Email Deployment Guide

## Prerequisites

Before deploying, ensure you have completed:
- ✅ Resend account created
- ✅ API key obtained
- ✅ Domain verified in Resend
- ✅ DNS records configured and verified

---

## Step 1: Install Supabase CLI

If you haven't already:

```bash
npm install -g supabase
```

Or using Homebrew (Mac):
```bash
brew install supabase/tap/supabase
```

---

## Step 2: Login to Supabase CLI

```bash
supabase login
```

This will open a browser window to authenticate.

---

## Step 3: Link Your Project

```bash
supabase link --project-ref wxfxvuvlpjxnyxhpquyw
```

When prompted, enter your database password.

---

## Step 4: Set Environment Variables

Add your Resend API key to Supabase:

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

---

## Step 5: Deploy the Edge Function

From your project root directory:

```bash
supabase functions deploy send-enrollment-email
```

This will:
- Upload the function code
- Make it available at: `https://wxfxvuvlpjxnyxhpquyw.supabase.co/functions/v1/send-enrollment-email`

---

## Step 6: Run the Database Migration

Apply the trigger migration:

```bash
supabase db push
```

Or manually run the migration in Supabase SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/062_add_enrollment_email_triggers.sql`
3. Paste and run

---

## Step 7: Configure Supabase Settings

In Supabase Dashboard:

1. Go to **Project Settings** → **API**
2. Note your:
   - Project URL: `https://wxfxvuvlpjxnyxhpquyw.supabase.co`
   - Anon/Public Key: `eyJ...`

3. Go to **Database** → **Extensions**
4. Enable the `http` extension (for making HTTP requests from triggers)

---

## Step 8: Test the Email System

### Test 1: Manual Function Call

Test the Edge Function directly:

```bash
curl -X POST \
  'https://wxfxvuvlpjxnyxhpquyw.supabase.co/functions/v1/send-enrollment-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "student_enrolled",
    "studentEmail": "your-test-email@example.com",
    "studentName": "Test Student",
    "courseTitle": "Test Course",
    "courseId": "test-id"
  }'
```

### Test 2: Enroll in a Course

1. Log in to your app
2. Enroll in a course
3. Check your email inbox
4. You should receive:
   - Student enrollment confirmation
   - Instructor should receive notification

### Test 3: Unenroll from a Course

1. Unenroll from a course
2. Check your email inbox
3. You should receive unenrollment confirmation

---

## Troubleshooting

### Function Not Deploying?

```bash
# Check function logs
supabase functions logs send-enrollment-email

# Redeploy with verbose output
supabase functions deploy send-enrollment-email --debug
```

### Emails Not Sending?

1. **Check Edge Function Logs:**
   ```bash
   supabase functions logs send-enrollment-email
   ```

2. **Verify Resend API Key:**
   ```bash
   supabase secrets list
   ```

3. **Check Resend Dashboard:**
   - Go to Resend → Logs
   - Look for failed email attempts

4. **Verify Domain:**
   - Ensure domain is verified in Resend
   - Check DNS records are correct

### Triggers Not Firing?

1. **Check if http extension is enabled:**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'http';
   ```

2. **Check trigger exists:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%enrollment%';
   ```

3. **Check function logs in Supabase Dashboard:**
   - Go to Database → Functions
   - Look for errors

### Emails Going to Spam?

- Ensure SPF, DKIM, DMARC are all verified
- Ask test recipients to mark as "Not Spam"
- Start with low volume
- Check Resend deliverability score

---

## Monitoring

### View Email Logs

In Resend Dashboard:
- Go to **Logs**
- Filter by date, status, recipient
- View delivery status, opens, clicks

### View Function Logs

```bash
supabase functions logs send-enrollment-email --tail
```

Or in Supabase Dashboard:
- Go to **Edge Functions**
- Click on `send-enrollment-email`
- View logs and metrics

---

## Email Templates

The system sends 3 types of emails:

1. **Student Enrollment Confirmation**
   - Sent when student enrolls
   - Includes course details and dashboard link

2. **Instructor Notification**
   - Sent when student enrolls
   - Includes student name and link to view details

3. **Student Unenrollment Confirmation**
   - Sent when student unenrolls
   - Includes marketplace link to browse other courses

---

## Customizing Email Templates

To customize email templates:

1. Edit `supabase/functions/send-enrollment-email/index.ts`
2. Modify the HTML in:
   - `sendStudentEnrollmentEmail()`
   - `sendInstructorNotificationEmail()`
   - `sendStudentUnenrollmentEmail()`
3. Redeploy:
   ```bash
   supabase functions deploy send-enrollment-email
   ```

---

## Production Checklist

- [ ] Resend API key added to Supabase secrets
- [ ] Edge Function deployed successfully
- [ ] Database migration applied
- [ ] `http` extension enabled in Supabase
- [ ] Domain verified in Resend
- [ ] Test emails sent and received
- [ ] Emails not going to spam
- [ ] Monitoring set up (Resend + Supabase logs)

---

## Support

If you encounter issues:

1. Check Supabase Edge Function logs
2. Check Resend email logs
3. Verify all environment variables are set
4. Ensure DNS records are correct
5. Contact support:
   - Resend: support@resend.com
   - Supabase: support@supabase.com

---

## Next Steps

Once emails are working:

1. Monitor deliverability for first few days
2. Adjust email templates based on feedback
3. Add more email types (course updates, reminders, etc.)
4. Set up email analytics tracking
5. Consider adding email preferences for users

