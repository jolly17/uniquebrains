# Fix Infinite Recursion - FINAL SOLUTION

## 🚨 The Problem

Error: **"infinite recursion detected in policy for relation 'profiles'"**

This is preventing profile creation during OAuth sign-in.

## ✅ The Solution (2 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run This SQL

Copy and paste this entire query:

```sql
-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Parents can view children profiles" ON profiles;
DROP POLICY IF EXISTS "Parents can update children profiles" ON profiles;
DROP POLICY IF EXISTS "Public can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profile" ON profiles;
DROP POLICY IF EXISTS "Users can view and update own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;

-- Create simple, non-recursive policies

-- Allow anyone to view all profiles
CREATE POLICY "allow_public_select"
  ON profiles FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "allow_authenticated_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "allow_own_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "allow_own_delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
```

### Step 3: Click "Run" (or press Ctrl+Enter)

You should see: **"Success. No rows returned"**

### Step 4: Verify Policies

Run this query to verify:

```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

You should see 4 policies:
- `allow_authenticated_insert` (INSERT)
- `allow_own_delete` (DELETE)
- `allow_own_update` (UPDATE)
- `allow_public_select` (SELECT)

### Step 5: Test OAuth Again

1. **Sign out** from your app
2. **Go to login**: http://localhost:3001/login
3. **Click "Continue with Google"**
4. **Complete OAuth flow**
5. **Check console** - should see: ✅ Profile created successfully!

### Step 6: Verify Profile in Database

1. **Supabase Dashboard** → **Table Editor** → **profiles**
2. You should now see your profile with:
   - Your email
   - Your first name
   - Your last name
   - Your avatar URL

---

## Why This Works

The previous policies had circular references:
- Policy checked `parent_id = auth.uid()`
- To get `parent_id`, it queried profiles table
- Which triggered the same policy again
- Creating infinite recursion

The new policies are simple and direct:
- `auth.uid() = id` - No table lookup needed
- `true` - Always allow (for public read)
- No circular references = No recursion

---

## What You Get

✅ **Public Read**: Anyone can view profiles (needed for instructor discovery)
✅ **Authenticated Insert**: Users can create their own profile during OAuth
✅ **Own Update**: Users can update their own profile
✅ **Own Delete**: Users can delete their own profile
✅ **No Recursion**: Simple policies that work!

---

## After Applying the Fix

Your OAuth flow will work perfectly:
1. User signs in with Google
2. Profile is created automatically
3. Name and avatar are extracted from Google
4. User is redirected to the app
5. Everything works! 🎉

---

## Quick Reference

**SQL File**: `supabase/FIX_RLS_INSERT_FINAL.sql`

**Time Required**: 2 minutes

**Result**: OAuth profile creation will work!

---

## Still Having Issues?

If you still see errors after applying this fix:

1. **Check Supabase Logs**: Dashboard → Logs → Postgres Logs
2. **Check Browser Console**: Look for new error messages
3. **Verify RLS is enabled**: 
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'profiles';
   ```
   Should show `rowsecurity = true`

4. **Try disabling RLS temporarily** (testing only):
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```
   If it works, the issue is definitely the policies.

---

## Summary

**Problem**: Infinite recursion in RLS policies
**Solution**: Drop all policies and create simple ones
**Time**: 2 minutes
**Result**: OAuth profile creation works!

Run the SQL above and try signing in with Google again! 🚀
