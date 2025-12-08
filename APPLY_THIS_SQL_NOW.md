# 🚨 APPLY THIS SQL NOW - Step by Step

## Your Data is Ready!

Good news: Your name and avatar are being extracted correctly:
- **Name**: Anjali Goyal ✅
- **Email**: anjali.iitd@gmail.com ✅
- **Avatar**: Your Google profile picture ✅

The ONLY issue is the database policy blocking the INSERT.

---

## Fix It in 3 Steps (2 Minutes)

### Step 1: Open Supabase SQL Editor

1. Click this link: https://app.supabase.com/project/wxfxvuvlpjxnyxhpquyw/sql/new
2. Or manually: Supabase Dashboard → SQL Editor → New Query

### Step 2: Copy This Entire SQL Block

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

-- Create simple, working policies
CREATE POLICY "allow_public_select"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "allow_authenticated_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_own_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_own_delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
```

### Step 3: Click "RUN" Button

- You should see: **"Success. No rows returned"**
- If you see an error, share it with me

---

## Then Test Again

1. **Go back to your app**: http://localhost:3001/login
2. **Sign out** (if signed in)
3. **Click "Continue with Google"**
4. **Watch the console** - you should see:
   ```
   ✅ Profile created successfully!
   Profile data: [...]
   Name: Anjali Goyal
   ```

5. **Check Supabase** → Table Editor → profiles
   - You should see your profile with your name!

---

## Alternative: Quick Manual Insert

If you want to skip the policy fix for now and just create your profile manually:

```sql
INSERT INTO profiles (id, email, first_name, last_name, role, avatar_url)
VALUES (
  '4fe7f2fc-0cb1-4790-acf9-dbfc22720080',
  'anjali.iitd@gmail.com',
  'Anjali',
  'Goyal',
  'student',
  'https://lh3.googleusercontent.com/a/ACg8ocJASkeEG2wg5blFh09187vf0nVZX2G3ehClUfvJuBUuoH67_oo8=s96-c'
);
```

This will create your profile immediately, and you can fix the policies later.

---

## Why This is Happening

The RLS policies on your profiles table have circular references that cause infinite recursion. The SQL above removes those problematic policies and replaces them with simple ones that work.

---

## Summary

**Your data is perfect**: ✅ Anjali Goyal with avatar
**The problem**: ❌ Database policy blocking INSERT
**The fix**: Run the SQL above (2 minutes)
**The result**: Profile will be created automatically

Apply the SQL fix now and OAuth will work perfectly! 🚀
