# Update Chat Notification Email Function

## Issue
Getting 429 "Too many requests" error from Resend when sending chat notifications to multiple students because we were sending individual emails in a loop.

## Solution
Updated the edge function to send a single email with BCC to all recipients instead of individual emails.

## Changes Made
- Modified `send-chat-notification-email` function to use BCC for all recipients
- Sends only 1 API request to Resend instead of N requests (where N = number of recipients)
- Avoids rate limit issues (10 requests/second on free tier)

## How to Deploy

1. Go to Supabase Dashboard → Edge Functions
2. Find `send-chat-notification-email` function
3. Click "Deploy new version"
4. Copy and paste the updated code from `supabase/functions/send-chat-notification-email/index.ts`
5. Click "Deploy"

## Testing

1. Send a message in a course with 3+ enrolled students
2. All students should receive the email notification
3. No rate limit errors should occur
4. Check Supabase logs to verify single email sent with multiple BCC recipients

## Technical Details

### Before:
```typescript
for (const email of data.recipientEmails) {
  await sendChatNotificationEmail(data, email) // N API calls
}
```

### After:
```typescript
await sendEmail({
  to: 'hello@uniquebrains.org',
  bcc: data.recipientEmails, // All recipients in BCC - 1 API call
  subject: `...`,
  html: `...`
})
```

### Benefits:
- Avoids rate limits (1 request instead of N)
- Faster execution
- More efficient
- Recipients don't see each other's emails (BCC)
