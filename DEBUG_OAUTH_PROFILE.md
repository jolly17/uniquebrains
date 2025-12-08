# Debug: OAuth Profile Not Created

## Issue

You're signed in with Google OAuth, but no profile entry appears in the `profiles` table.

## Quick Checks

### 1. Check Browser Console

Open DevTools (F12) and look for these logs:
- `User metadata: { ... }` - Shows what data Google provided
- `Profile created successfully with name: ...` - Confirms profile was created
- `Error creating profile: ...` - Shows if there was an error

**What to look for**:
- If you see "Error creating profile", note the error message
- If you see "Profile created successfully", but no entry in database, it's an RLS issue

### 2. Check auth.users Table

Your Google account IS created in Supabase, just not the profile:

1. **Supabase Dashboard** → **Authentication** → **Users**
2. You should see your email there
3. Click on the user to see details
4. Note the **User UID** (you'll need this)

### 3. Check Supabase Logs

1. **Supabase Dashboard** → **Logs** → **Postgres Logs**
2. Look for INSERT errors on profiles table
3. Common errors:
   - "permission denied" - RLS policy issue
   - "duplicate key" - Profile already exists
   - "violates check constraint" - Data validation issue

---

## Solution 1: Manual Profile Creation

If the profile isn't being created automatically, create it manually:

### Step 1: Get Your User ID

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Find your email
3. Copy the **User UID** (looks like: `abc-123-def-456`)

### Step 2: Create Profile Manually

1. **Supabase Dashboard** → **SQL Editor**
2. Run this query (replace with your actual values):

```sql
INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES (
  'YOUR-USER-ID-HERE',  -- Replace with your User UID from auth.users
  'your-email@gmail.com',  -- Your email
  'Your',  -- Your first name
  'Name',  -- Your last name
  'student'  -- Role
);
```

### Step 3: Verify

```sql
SELECT * FROM profiles WHERE email = 'your-email@gmail.com';
```

You should now see your profile!

---

## Solution 2: Fix RLS Policy for INSERT

The issue might be that the RLS policy doesn't allow profile creation. Let's fix it:

### Run This in SQL Editor:

```sql
-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;

-- Create a simple INSERT policy
CREATE POLICY "Authenticated users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also ensure SELECT and UPDATE work
CREATE POLICY "Users can view and update own profile"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Public can view all profiles (for instructor discovery)
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);
```

### Test Again

1. Sign out
2. Sign in with Google
3. Profile should be created automatically

---

## Solution 3: Check What's in Browser Console

Let me add more detailed logging. Update your `AuthCallback.jsx`:

Add this right after getting the session:

```javascript
if (session) {
  console.log('=== OAuth Callback Debug ===')
  console.log('User ID:', session.user.id)
  console.log('User Email:', session.user.email)
  console.log('User Metadata:', session.user.user_metadata)
  console.log('========================')
  
  // ... rest of the code
}
```

Then sign in again and check the console. Share what you see!

---

## Solution 4: Use Service Role (Temporary)

If RLS is blocking profile creation, we can temporarily bypass it for testing:

### In SQL Editor:

```sql
-- Temporarily disable RLS on profiles (TESTING ONLY!)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Then try signing in with Google again. If it works, the issue is definitely RLS policies.

**Don't forget to re-enable RLS after testing:**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## Diagnostic Queries

### Check if user exists in auth.users

```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@gmail.com';
```

### Check if profile exists

```sql
SELECT * FROM profiles WHERE email = 'your-email@gmail.com';
```

### Check RLS policies on profiles

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Check if RLS is enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';
```

---

## Most Likely Issues

### Issue 1: RLS Policy Blocking INSERT

**Symptom**: Console shows "Error creating profile: permission denied"

**Fix**: Run Solution 2 above (Fix RLS Policy for INSERT)

### Issue 2: Profile Already Exists

**Symptom**: Console shows "Error creating profile: duplicate key"

**Fix**: Profile already exists! Check:
```sql
SELECT * FROM profiles WHERE email = 'your-email@gmail.com';
```

### Issue 3: Missing Required Fields

**Symptom**: Console shows "Error creating profile: violates not-null constraint"

**Fix**: Check that first_name and last_name are being extracted correctly

### Issue 4: Silent Failure

**Symptom**: No error in console, but no profile in database

**Fix**: Check Supabase Postgres Logs for the actual error

---

## Quick Test Script

Run this in your browser console after signing in:

```javascript
// Get current session
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// Try to create profile manually
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: session.user.id,
    email: session.user.email,
    first_name: 'Test',
    last_name: 'User',
    role: 'student'
  })
  .select()

console.log('Insert result:', data)
console.log('Insert error:', error)
```

This will show you exactly what error is happening!

---

## Next Steps

1. **Check browser console** for error messages
2. **Check Supabase Logs** for database errors
3. **Try manual profile creation** (Solution 1)
4. **Fix RLS policies** (Solution 2)
5. **Share the error message** if you're still stuck

Let me know what you see in the browser console and I can help debug further!
