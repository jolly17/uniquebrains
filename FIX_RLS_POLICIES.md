# Fix RLS Infinite Recursion Error

## 🚨 Issue

You're seeing: **"infinite recursion detected in policy for relation 'profiles'"**

This happens when RLS policies reference the same table they're protecting, creating a circular dependency.

## ✅ Quick Fix

### Option 1: Apply the Fix Migration (Recommended)

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Copy the contents** of `supabase/migrations/006_fix_rls_infinite_recursion.sql`
3. **Paste and Run** in SQL Editor
4. **Test OAuth again**

### Option 2: Temporarily Disable RLS (For Testing Only)

⚠️ **WARNING**: This is NOT secure for production! Only use for testing.

```sql
-- Temporarily disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

After testing, re-enable it:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Option 3: Simplify the Policies

Run this in SQL Editor:

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Parents can view children profiles" ON profiles;
DROP POLICY IF EXISTS "Parents can update children profiles" ON profiles;

-- Create simpler policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public read for all profiles (needed for instructor discovery)
CREATE POLICY "Public profiles are viewable"
  ON profiles FOR SELECT
  USING (true);
```

---

## 🔍 Understanding the Problem

### What Causes Infinite Recursion?

The original policy:
```sql
CREATE POLICY "Parents can view children profiles"
  ON profiles FOR SELECT
  USING (parent_id = auth.uid());
```

When checking if a user can view a profile, it needs to:
1. Check if `parent_id = auth.uid()`
2. To get `parent_id`, it queries the profiles table
3. Which triggers the same policy again
4. Creating an infinite loop

### The Fix

Use simpler policies that don't reference the same table:
```sql
-- Simple policy: users can view their own profile
USING (auth.uid() = id)

-- Or: everyone can view all profiles
USING (true)
```

---

## 🧪 Test After Fix

### 1. Verify Policies

```sql
-- Check policies on profiles table
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### 2. Test OAuth Login

1. Go to http://localhost:3001/login
2. Click "Continue with Google"
3. Complete OAuth flow
4. You should be logged in successfully!

### 3. Verify Profile Created

```sql
-- Check if your profile exists
SELECT id, email, first_name, last_name, role 
FROM profiles 
WHERE email = 'your-email@gmail.com';
```

---

## 🎯 Recommended Solution

For now, use **simple policies** that work:

```sql
-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Parents can view children profiles" ON profiles;
DROP POLICY IF EXISTS "Parents can update children profiles" ON profiles;

-- Create new simple policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

This gives you:
- ✅ Public read access (needed for instructor discovery)
- ✅ Users can manage their own profiles
- ✅ No infinite recursion
- ✅ OAuth will work

---

## 🔐 Production Security

For production, you'll want more granular policies. But for now, focus on getting OAuth working.

Later, you can implement:
- Separate policies for SELECT, INSERT, UPDATE, DELETE
- Parent-child relationships (using a different approach)
- Admin access policies
- Role-based access control

---

## 📋 Step-by-Step Fix

### Step 1: Open SQL Editor
- Supabase Dashboard → SQL Editor

### Step 2: Run This Query
```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Parents can view children profiles" ON profiles;
DROP POLICY IF EXISTS "Parents can update children profiles" ON profiles;

-- Ensure basic policies exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create simple, working policies
CREATE POLICY "Public can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Step 3: Verify
```sql
-- Should return 2 policies
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles';
```

### Step 4: Test OAuth
1. Go to login page
2. Click "Continue with Google"
3. Should work now!

---

## 🐛 Still Having Issues?

### Check Supabase Logs
1. Supabase Dashboard → Logs
2. Look for errors related to profiles table
3. Check for RLS policy errors

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors during OAuth callback

### Verify Session
```javascript
// In browser console
const { data } = await supabase.auth.getSession()
console.log(data.session)
```

### Manual Profile Creation
If OAuth succeeds but profile isn't created:

```sql
-- Manually create profile
INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES (
  'your-user-id-from-auth-users',
  'your-email@gmail.com',
  'Your',
  'Name',
  'student'
);
```

---

## ✅ Success Checklist

After applying the fix:

- [ ] RLS policies simplified
- [ ] No infinite recursion errors
- [ ] OAuth login works
- [ ] Profile is created automatically
- [ ] User is redirected correctly
- [ ] No errors in browser console
- [ ] No errors in Supabase logs

---

## 📞 Next Steps

Once OAuth is working:

1. ✅ Test sign out and sign in again
2. ✅ Verify profile data in database
3. ✅ Test with different Google accounts
4. ✅ Continue with other backend tasks
5. 📝 Document any issues for future reference

---

## Summary

**The Problem**: RLS policies with infinite recursion
**The Fix**: Simplify policies to avoid circular references
**Time Required**: 2-3 minutes
**Result**: OAuth login will work!

Run the SQL query above, test OAuth, and you should be good to go! 🚀
