# Send Appreciation Emails Function

This edge function sends appreciation emails to students who attended sessions in the last 24 hours, asking them to:
1. Leave a course review
2. Donate to keep the platform free

## Schedule

This function should run daily at **5:00 PM GMT** (17:00 UTC).

## Setup Cron Job

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Cron Jobs** (pg_cron extension)
3. Create a new cron job with:
   - **Name**: `send-appreciation-emails`
   - **Schedule**: `0 17 * * *` (5 PM GMT daily)
   - **Command**:
   ```sql
   SELECT
     net.http_post(
       url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-appreciation-emails',
       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     ) as request_id;
   ```

### Option 2: Using SQL

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the cron job
SELECT cron.schedule(
  'send-appreciation-emails',
  '0 17 * * *',  -- 5 PM GMT daily
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-appreciation-emails',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

Replace:
- `YOUR_PROJECT_REF` with your actual Supabase project reference
- `YOUR_ANON_KEY` with your Supabase anon key

## Deploy Function

```bash
supabase functions deploy send-appreciation-emails
```

## Manual Testing

You can manually trigger the function using:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-appreciation-emails \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Or from the Supabase Dashboard:
1. Go to **Edge Functions**
2. Select `send-appreciation-emails`
3. Click **Invoke**
4. Use GET method with empty body

## Email Content

The email includes:
- Personalized greeting with student name
- Gratitude message about their recent session
- Two call-to-action options:
  1. **Leave a Review**: Direct link to the course page
  2. **Donate**: Separate buttons for India (Razorpay) and International (PayPal) donations
- Heartfelt, touching message to encourage action
- Beautiful, responsive HTML design

## Environment Variables Required

- `RESEND_API_KEY`: Your Resend API key for sending emails
- `SUPABASE_URL`: Your Supabase project URL (auto-provided)
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (auto-provided)

## Donation Links

The function uses these donation links:
- **India**: Milaap - https://milaap.org/fundraisers/support-autistic-kids-1
- **International**: GoFundMe - https://www.gofundme.com/f/help-me-support-autism-awareness-and-families-with-genai

These are hardcoded in the function. To update them, modify the `indiaDonateLink` and `internationalDonateLink` variables in the `sendAppreciationEmail` function.

## Monitoring

Check the function logs in Supabase Dashboard → Edge Functions → send-appreciation-emails → Logs

The function returns:
```json
{
  "success": true,
  "sessionsProcessed": 5,
  "emailsSent": 23,
  "emailsFailed": 0
}
```
