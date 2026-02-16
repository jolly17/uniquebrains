# Calendar Invites - Remaining Work

## Current Status

✅ **Completed:**
- Admin dashboard with courses, instructors, students management
- Admin RLS policies fixed
- Calendar invite Edge Function created and deployed
- Database triggers created and enabled
- Edge Function code fixed for date parsing

❌ **Issue:**
- Calendar invites not sending due to authentication error
- Error: `status_code 401, {"code":401,"message":"Invalid JWT"}`

## The Problem

The database trigger is calling the Edge Function, but the anon key being used is invalid or incorrect. This causes a 401 authentication error.

## What Needs to Be Fixed Tomorrow

### Option 1: Fix the Anon Key (Quick Fix)

The function `send_calendar_invite_on_enrollment()` has hardcoded credentials that need to be correct:

```sql
CREATE OR REPLACE FUNCTION send_calendar_invite_on_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT := 'https://your-project-ref.supabase.co'; -- ← Check this is correct
  auth_header TEXT := 'your-anon-key-here'; -- ← This is the problem - needs correct anon key
```

**Steps:**
1. Go to Project Settings → API
2. Copy the **exact** "anon public" key (very long JWT token)
3. Update the function with the correct key
4. Test enrollment again

### Option 2: Use Service Role Key Instead (Better)

Edge Functions can use service role key for internal calls:

1. Get service role key from Project Settings → API
2. Update function to use service role key instead of anon key
3. This bypasses RLS and is more appropriate for internal triggers

### Option 3: Alternative Approach - Frontend Integration

Instead of database triggers, send calendar invites from the frontend after enrollment:

**Pros:**
- Easier to debug
- No authentication issues
- Can show user feedback

**Cons:**
- Requires frontend code changes
- Won't work if user closes browser before email sends

## Files to Reference Tomorrow

1. **Edge Function:** `supabase/functions/send-calendar-invite/index.ts`
2. **Database Function:** Check with query:
   ```sql
   SELECT pg_get_functiondef(oid) 
   FROM pg_proc 
   WHERE proname = 'send_calendar_invite_on_enrollment';
   ```
3. **Test Queries:** `SIMPLE_CALENDAR_TEST.sql`
4. **Debug Queries:** 
   ```sql
   SELECT id, created, status_code, error_msg, content::text
   FROM net._http_response
   ORDER BY created DESC
   LIMIT 5;
   ```

## Quick Test Command

After fixing, test with:
```sql
-- Check if it worked
SELECT id, status_code, error_msg
FROM net._http_response
ORDER BY created DESC
LIMIT 1;
```

Should see `status_code = 200` for success.

## Alternative: Disable Calendar Invites Temporarily

If you want enrollments to work without calendar invites for now:

```sql
-- Disable the trigger
DROP TRIGGER IF EXISTS trigger_send_calendar_invite_on_enrollment ON enrollments;
```

Can re-enable later when fixed.

## Summary

The calendar invite system is 95% complete. Just need to fix the authentication between the database trigger and the Edge Function. The issue is the anon key being used is invalid.

**Tomorrow's goal:** Get the correct anon key or switch to service role key, update the function, and test that calendar invites are sent successfully.
