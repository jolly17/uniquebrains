# Fix Email Registration - Final Solution

## The Problem

Email/password registration is failing with:
```
Error 42501: new row violates row-level security policy for table "profiles"
```

## Why This Happens

When a user signs up with email/password:
1. Supabase creates the user in `auth.users`
2. User is NOT immediately authenticated (needs email verification)
3. Code tries to create profile in `profiles` table
4. RLS policy blocks it because user isn't authenticated yet

## The Solution: Database Trigger

Use a database trigger to automatically create the profile when a user signs up. This runs with elevated permissions and bypasses RLS.

### Step 1: Create the Trigger

**Run this in Supabase SQL Editor:**

```sql
-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 1),
      SPLIT_PART(NEW.raw_user_meta_data->>'name', ' ', 1),
      'User'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'last_name',
      SUBSTRING(NEW.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'full_name') + 1),
      SUBSTRING(NEW.raw_user_meta_data->>'name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'name') + 1),
      ''
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 2: Remove Manual Profile Creation

The trigger will handle profile creation automatically, so we can remove the manual creation from the code. But let's keep it as a fallback for now.

### Step 3: Wait for Rate Limit

You saw this error:
```
For security purposes, you can only request this after 55 seconds
```

**Wait 1 minute** before trying to register again.

### Step 4: Test Email Registration

1. **Wait 60 seconds** (rate limit)
2. **Try registering** with email/password
3. **Profile should be created automatically** ✅
4. **Check email** for verification link
5. **Verify email** and sign in

## How It Works

### With Trigger (Recommended)

```
User signs up
    ↓
Supabase creates user in auth.users
    ↓
Trigger fires automatically
    ↓
Profile created with SECURITY DEFINER (bypasses RLS)
    ↓
Success! ✅
```

### Without Trigger (Current - Broken)

```
User signs up
    ↓
Supabase creates user in auth.users
    ↓
User NOT authenticated yet (needs email verification)
    ↓
Code tries to create profile
    ↓
RLS blocks it (user not authenticated)
    ↓
Error! ❌
```

## Benefits of Trigger Approach

✅ **Automatic**: Profile created automatically for all users
✅ **Secure**: Runs with elevated permissions (SECURITY DEFINER)
✅ **Reliable**: Works for both OAuth and email/password
✅ **No RLS Issues**: Bypasses RLS policies
✅ **Consistent**: Same logic for all registration methods

## Verify Trigger Works

After creating the trigger, check it exists:

```sql
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

You should see:
- trigger_name: `on_auth_user_created`
- event_object_table: `users`
- action_statement: `EXECUTE FUNCTION public.handle_new_user()`

## Test It

1. **Create the trigger** (SQL above)
2. **Wait 60 seconds** (rate limit)
3. **Register with email/password**
4. **Check profiles table**:
   ```sql
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
   ```
5. **You should see the new profile!** ✅

## Alternative: Temporarily Disable RLS (Not Recommended)

If you just want to test quickly:

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

**Remember to re-enable it:**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

## Summary

**Problem**: RLS blocking email registration
**Solution**: Database trigger with SECURITY DEFINER
**Time**: 2 minutes to set up
**Result**: Email registration works! ✅

Run the SQL above and email registration will work perfectly! 🚀

**File**: `CREATE_PROFILE_TRIGGER.sql` has the complete SQL.
