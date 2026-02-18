# Appreciation Emails Cron Job Setup Guide

## Problem
The send-appreciation-emails cron job was not configured, so emails didn't send automatically at 5 PM GMT.

## Solution
I've set up a GitHub Actions workflow that will trigger the Supabase Edge Function daily at 5 PM GMT.

## Setup Steps (Required)

### 1. Add GitHub Secrets

You need to add two secrets to your GitHub repository:

1. Go to your GitHub repository: https://github.com/jolly17/uniquebrains
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** > **Actions**
4. Click **New repository secret** button

Add these two secrets:

#### Secret 1: SUPABASE_URL
- **Name**: `SUPABASE_URL`
- **Value**: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- You can find this in your Supabase project settings

#### Secret 2: SUPABASE_SERVICE_ROLE_KEY
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your Supabase service role key
- You can find this in Supabase Dashboard > Project Settings > API > service_role key (secret)

### 2. Verify the Workflow

After adding the secrets:

1. Go to the **Actions** tab in your GitHub repository
2. You should see a workflow called "Send Appreciation Emails"
3. The workflow will run automatically every day at 5 PM GMT (17:00 UTC)

### 3. Test Manually (Optional)

To test if it works right now:

1. Go to **Actions** tab
2. Click on "Send Appreciation Emails" workflow
3. Click the **Run workflow** button (dropdown on the right)
4. Click the green **Run workflow** button
5. Wait a few seconds and refresh the page
6. Click on the workflow run to see the logs

## How It Works

1. **GitHub Actions** runs the workflow daily at 5 PM GMT
2. The workflow makes an HTTP POST request to your Supabase Edge Function
3. The Edge Function:
   - Finds sessions that happened in the last 24 hours
   - Gets all enrolled students for those sessions
   - Sends appreciation emails via Resend API

## Monitoring

### Check if emails were sent:
1. Go to GitHub repository > **Actions** tab
2. Look for "Send Appreciation Emails" workflow runs
3. Click on a run to see the logs
4. You'll see either:
   - ✅ Success: "Appreciation emails sent successfully"
   - ❌ Failure: Error details in the logs

### Check Supabase logs:
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Click on `send-appreciation-emails`
4. Click on **Logs** tab
5. You'll see detailed logs of what happened

## Troubleshooting

### Workflow not running?
- Check that GitHub Actions is enabled in your repository settings
- Verify the workflow file exists at `.github/workflows/send-appreciation-emails.yml`

### Emails not sending?
1. Check GitHub Actions logs for errors
2. Verify both secrets are set correctly
3. Check Supabase Edge Function logs
4. Ensure `RESEND_API_KEY` is set in Supabase Edge Function secrets

### No emails sent but no errors?
- This is normal if no sessions occurred in the last 24 hours
- The function only sends emails for sessions that happened recently

## Time Zone Reference

- **5 PM GMT** = **17:00 UTC**
- If you're in a different timezone:
  - EST: 12 PM (noon)
  - PST: 9 AM
  - IST: 10:30 PM

To change the time, edit the cron expression in `.github/workflows/send-appreciation-emails.yml`:
```yaml
schedule:
  - cron: '0 17 * * *'  # Change '17' to your desired hour (0-23 in UTC)
```

## Next Steps

1. ✅ Add the two GitHub secrets (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
2. ✅ Test the workflow manually to verify it works
3. ✅ Wait until 5 PM GMT tomorrow to see if it runs automatically
4. ✅ Check the logs to confirm emails were sent

That's it! The cron job is now properly configured and will run automatically every day at 5 PM GMT.
