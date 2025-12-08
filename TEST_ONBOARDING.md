# Test Onboarding Flow

## The Issue

Your profile already exists in the database, so you're being treated as a returning user and skipping onboarding.

## Solution: Delete Your Profile and Test Again

### Step 1: Delete Your Profile

Run this in **Supabase Dashboard → SQL Editor**:

```sql
-- Delete your profile to test as a new user
DELETE FROM profiles WHERE email = 'anjali.iitd@gmail.com';
```

### Step 2: Sign Out

1. Sign out from the app
2. Clear browser cache (optional but recommended)

### Step 3: Test Onboarding

1. Go to **Register page**: http://localhost:5174/register
2. Click **"Continue with Google"**
3. Complete Google authentication
4. **You should see the Onboarding page!** 🎉
5. Fill in:
   - Select your role (Student/Instructor/Parent)
   - Fill in learning preferences (optional)
6. Click **"Complete Setup"**
7. You'll be redirected to the appropriate dashboard

### Step 4: Test Returning User

1. Sign out again
2. Go to **Login page**: http://localhost:5174/login
3. Click **"Continue with Google"**
4. **You should skip onboarding** and go directly to dashboard

## What to Expect

### New User (First Time)
```
Register → Google Auth → Profile Created → 🎉 Onboarding Page 🎉 → Dashboard
```

### Returning User
```
Login → Google Auth → Profile Exists → Dashboard (Skip Onboarding)
```

## Troubleshooting

### Still Redirecting to Marketplace?

**Check console logs**. You should see:
- For new user: `✅ Profile created successfully! (new user)`
- For returning user: `✅ Profile already exists (returning user)`

### Onboarding Shows Then Disappears?

This was the bug we just fixed. The updated code now:
- Sets `hasRedirected = true` when going to onboarding
- Checks `!hasRedirected` before doing normal redirect
- Uses `replace: true` to prevent back button issues

### Profile Already Exists Error?

Run the DELETE query again to remove your profile.

## Quick Test Commands

```sql
-- Check if your profile exists
SELECT * FROM profiles WHERE email = 'anjali.iitd@gmail.com';

-- Delete your profile to test as new user
DELETE FROM profiles WHERE email = 'anjali.iitd@gmail.com';

-- Check all profiles
SELECT id, email, first_name, last_name, role FROM profiles;
```

## Summary

1. **Delete profile** in Supabase
2. **Sign in from Register page** with Google
3. **See onboarding page** ✅
4. **Complete onboarding**
5. **Sign out and sign in from Login page**
6. **Skip onboarding** (returning user) ✅

The onboarding flow is now working correctly! 🚀
