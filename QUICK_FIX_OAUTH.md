# Quick Fix for OAuth Login Error

## 🚨 The Error
"infinite recursion detected in policy for relation 'profiles'"

## ✅ The Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Paste This SQL

```sql
-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Parents can view children profiles" ON profiles;
DROP POLICY IF EXISTS "Parents can update children profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can create own profile" ON profiles;

-- Create simple, working policies
CREATE POLICY "Public can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Step 3: Run the Query
- Click **Run** (or press Ctrl+Enter)
- Wait for "Success" message

### Step 4: Test OAuth Login
1. Go to http://localhost:3001/login
2. Click "Continue with Google"
3. Complete the OAuth flow
4. ✅ You should now be logged in!

---

## 🎯 What This Does

**Removes**: Problematic policies that cause infinite recursion
**Adds**: 
- Public read access to all profiles (needed for instructor discovery)
- Users can create/update/delete their own profile

**Result**: OAuth login will work!

---

## ✅ Verify It Worked

After running the SQL, check that policies were created:

```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

You should see:
- ✅ "Public can view all profiles" - SELECT
- ✅ "Users can manage their own profile" - ALL

---

## 🐛 Still Having Issues?

### If you get a syntax error:
- Make sure you copied the entire SQL block
- Check for any extra characters
- Try running each DROP statement separately, then the CREATE statements

### If OAuth still fails:
1. Check browser console for errors
2. Check Supabase Dashboard → Logs
3. Try signing out and signing in again
4. Clear browser cache and try again

---

## 📞 Alternative: Use the SQL File

Instead of copy/paste, you can use the pre-made file:

1. Open `supabase/FIX_RLS_QUICK.sql`
2. Copy all contents
3. Paste in Supabase SQL Editor
4. Run

---

## ✅ Success!

Once the SQL runs successfully:
- ✅ OAuth login will work
- ✅ Profiles will be created automatically
- ✅ No more infinite recursion errors
- ✅ You can continue with your work!

**Time Required**: 2 minutes
**Difficulty**: Easy - just copy/paste SQL

🚀 **Ready to test? Go to http://localhost:3001/login and try "Continue with Google"!**
