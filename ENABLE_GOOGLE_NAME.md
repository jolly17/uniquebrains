# Enable Google Name in OAuth

## What Changed

I've updated the OAuth implementation to properly extract the user's name from their Google account.

### Changes Made

1. **OAuthButton.jsx** - Now requests `email profile` scopes from Google
2. **AuthCallback.jsx** - Better extraction of name from user metadata:
   - Tries `given_name` and `family_name` (Google's preferred fields)
   - Falls back to `full_name` or `name`
   - Also extracts `picture` for avatar
   - Added debug logging to see what data Google provides

---

## How to Test

### Option 1: Sign Out and Sign In Again (Recommended)

1. **Sign out** from your current session
2. **Go to login page**: http://localhost:3001/login
3. **Click "Continue with Google"**
4. **Authorize again** (Google will ask for permissions again)
5. **Check your profile** in Supabase Dashboard

Your name should now be populated correctly!

### Option 2: Delete Your Profile and Try Again

If signing out doesn't work, you can delete your existing profile:

1. **Open Supabase Dashboard** → **Table Editor** → **profiles**
2. **Find your profile** (by email)
3. **Delete it**
4. **Go to login page** and sign in with Google again
5. **New profile will be created** with your name

---

## Verify It's Working

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Sign in with Google
4. Look for: `User metadata: { ... }`
5. You should see fields like:
   ```javascript
   {
     email: "your@email.com",
     given_name: "Your",
     family_name: "Name",
     picture: "https://...",
     full_name: "Your Name"
   }
   ```

### Check Database

1. **Supabase Dashboard** → **Table Editor** → **profiles**
2. **Find your profile**
3. **Verify**:
   - `first_name` has your first name
   - `last_name` has your last name
   - `avatar_url` has your Google profile picture

---

## Configure Google OAuth Scopes (If Needed)

### In Supabase Dashboard

1. Go to **Authentication** → **Providers**
2. Find **Google**
3. Click to expand
4. Check **Scopes** field
5. It should include: `email profile`
6. If not, add it and save

### In Google Cloud Console

The scopes are already configured when you set up OAuth:
- `userinfo.email` - Email address
- `userinfo.profile` - Profile information (name, picture)

These are the default scopes, so they should already be enabled.

---

## What Data Google Provides

When a user signs in with Google, Supabase receives:

```javascript
{
  id: "uuid",
  email: "user@gmail.com",
  user_metadata: {
    email: "user@gmail.com",
    email_verified: true,
    full_name: "John Doe",
    given_name: "John",      // ← First name
    family_name: "Doe",       // ← Last name
    name: "John Doe",
    picture: "https://lh3.googleusercontent.com/...",  // ← Avatar
    provider_id: "123456789",
    sub: "123456789"
  }
}
```

Our code now extracts:
- `first_name` from `given_name` (or splits `full_name`)
- `last_name` from `family_name` (or splits `full_name`)
- `avatar_url` from `picture` (or `avatar_url`)

---

## Troubleshooting

### Name Still Not Showing

**Check Console Logs**:
```javascript
// You should see this in console:
User metadata: { given_name: "...", family_name: "..." }
Profile created successfully with name: John Doe
```

**If metadata is empty**:
1. Google might not be providing the data
2. Check Google OAuth consent screen configuration
3. Ensure scopes include `userinfo.profile`

### Only Email is Populated

**Solution**:
1. Sign out completely
2. Revoke app access in Google Account settings:
   - Go to https://myaccount.google.com/permissions
   - Find "UniqueBrains"
   - Click "Remove Access"
3. Sign in again with Google
4. Google will ask for permissions again
5. Name should now be captured

### Avatar Not Showing

**Check**:
- `avatar_url` field in profiles table
- Should have a Google URL like: `https://lh3.googleusercontent.com/...`

**If empty**:
- Google might not be providing the picture
- User might not have a profile picture set

---

## Testing Checklist

- [ ] Sign out from current session
- [ ] Sign in with Google again
- [ ] Check browser console for "User metadata" log
- [ ] Verify `given_name` and `family_name` are present
- [ ] Check profiles table in Supabase
- [ ] Verify `first_name` and `last_name` are populated
- [ ] Verify `avatar_url` has Google profile picture
- [ ] Test with a different Google account

---

## Example: What You Should See

### In Browser Console
```
User metadata: {
  email: "john.doe@gmail.com",
  email_verified: true,
  full_name: "John Doe",
  given_name: "John",
  family_name: "Doe",
  name: "John Doe",
  picture: "https://lh3.googleusercontent.com/a/ABC123...",
  provider_id: "123456789012345678901",
  sub: "123456789012345678901"
}
Profile created successfully with name: John Doe
Redirecting user with role: student
```

### In Supabase Database
```sql
SELECT id, email, first_name, last_name, avatar_url 
FROM profiles 
WHERE email = 'john.doe@gmail.com';

-- Result:
-- id: abc-123-def-456
-- email: john.doe@gmail.com
-- first_name: John
-- last_name: Doe
-- avatar_url: https://lh3.googleusercontent.com/a/ABC123...
```

---

## Summary

✅ **Updated OAuthButton** to request `email profile` scopes
✅ **Updated AuthCallback** to extract name from Google metadata
✅ **Added debug logging** to see what data is received
✅ **Added fallback logic** for different name formats

**To test**: Sign out and sign in with Google again. Your name should now be captured!

If you still don't see your name, check the browser console logs and let me know what you see in the "User metadata" log.
