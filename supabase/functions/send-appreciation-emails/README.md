# Send Appreciation Emails Function

This Supabase Edge Function sends appreciation emails to students after they attend a session. It runs daily at 5 PM GMT to thank students for their participation and encourage them to leave reviews or donate.

## How It Works

1. **Scheduled Execution**: Runs daily at 5 PM GMT via GitHub Actions workflow
2. **Session Detection**: Finds all sessions that occurred in the last 24 hours
3. **Student Lookup**: Gets all enrolled students for each session's course
4. **Email Sending**: Sends personalized appreciation emails via Resend API

## Setup Instructions

### 1. Deploy the Edge Function

```bash
supabase functions deploy send-appreciation-emails
```

### 2. Set Environment Variables

In your Supabase project dashboard, go to Settings > Edge Functions and add:

- `RESEND_API_KEY`: Your Resend API key for sending emails
- `SUPABASE_URL`: Your Supabase project URL (auto-set)
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (auto-set)

### 3. Configure GitHub Secrets

The cron job runs via GitHub Actions. Add these secrets to your repository:

1. Go to GitHub repository Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `SUPABASE_URL`: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 4. Verify the Workflow

The GitHub Actions workflow is located at `.github/workflows/send-appreciation-emails.yml`

- **Schedule**: Runs daily at 5 PM GMT (17:00 UTC)
- **Manual Trigger**: Can be triggered manually from the Actions tab

## Testing

### Test Manually via GitHub Actions

1. Go to your repository's Actions tab
2. Select "Send Appreciation Emails" workflow
3. Click "Run workflow" button
4. Check the logs to see if emails were sent

### Test via curl

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/send-appreciation-emails" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Check Logs

View function logs in Supabase Dashboard:
1. Go to Edge Functions
2. Select `send-appreciation-emails`
3. Click on "Logs" tab

## Email Content

The appreciation email includes:

- **Personalized greeting** with student name
- **Session details** (course title, instructor name)
- **Call to action** to leave a course review
- **Donation links** for India (Milaap) and International (GoFundMe)
- **Gratitude message** from the UniqueBrains team

## Troubleshooting

### Emails Not Sending

1. **Check GitHub Actions logs**: Go to Actions tab and check the workflow run
2. **Verify secrets are set**: Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured
3. **Check Edge Function logs**: Look for errors in Supabase dashboard
4. **Verify Resend API key**: Ensure `RESEND_API_KEY` is set in Edge Function secrets

### No Sessions Found

The function only processes sessions from the last 24 hours. If no sessions occurred, no emails will be sent. This is expected behavior.

### Cron Job Not Running

1. **Check GitHub Actions is enabled**: Go to repository Settings > Actions > General
2. **Verify workflow file**: Ensure `.github/workflows/send-appreciation-emails.yml` exists
3. **Check workflow runs**: Go to Actions tab to see if the workflow is executing

## Time Zone Notes

- The cron job runs at **5 PM GMT (17:00 UTC)**
- Adjust the cron expression in the workflow file if you need a different time
- Cron expression format: `minute hour day month day-of-week`
- Example: `0 17 * * *` = 5 PM GMT every day

## Function Response

Success response:
```json
{
  "success": true,
  "sessionsProcessed": 2,
  "emailsSent": 5,
  "emailsFailed": 0
}
```

No sessions response:
```json
{
  "success": true,
  "message": "No sessions found in the last 24 hours",
  "count": 0
}
```

Error response:
```json
{
  "error": "Error message",
  "stack": "Error stack trace"
}
```
