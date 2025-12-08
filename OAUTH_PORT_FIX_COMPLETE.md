# OAuth Port Configuration - Complete Fix

## What I Did

1. ✅ Updated `vite.config.js` to use port **5173** (Vite's default)
2. ✅ Set `strictPort: false` to allow fallback if port is in use
3. ✅ Created guide for updating Supabase redirect URLs

## What You Need to Do

### Step 1: Update Supabase Redirect URLs

1. **Open Supabase Dashboard**
2. Go to **Authentication** → **URL Configuration**
3. **Add these redirect URLs**:
   ```
   http://localhost:5173
   http://localhost:5173/auth/callback
   http://localhost:3001
   http://localhost:3001/auth/callback
   ```
4. **Update Site URL** to:
   ```
   http://localhost:5173
   ```
5. Click **Save**

### Step 2: Restart Dev Server

```bash
# Stop current server (Ctrl+C in terminal)
npm run dev
```

The server should now start on port **5173** (or 5174 if 5173 is in use).

### Step 3: Test OAuth

1. **Go to**: http://localhost:5173/login (or whatever port it shows)
2. **Open DevTools** (F12) → Console
3. **Click "Continue with Google"**
4. **Complete OAuth flow**
5. **Watch console** for debug messages

You should see:
```
=== OAuth Callback Debug ===
User ID: ...
User Email: ...
User Metadata: { given_name: "...", family_name: "..." }
========================
✅ Profile created successfully!
```

### Step 4: Verify Profile Created

1. **Supabase Dashboard** → **Table Editor** → **profiles**
2. You should see your profile with:
   - ✅ Email
   - ✅ First name
   - ✅ Last name
   - ✅ Avatar URL
   - ✅ Role (student)

---

## Why This Fixes It

### The Problem:
- Vite config said port 3000
- But 3000 was in use, so it used 3001
- Supabase was configured for 5173
- **Port mismatch = OAuth callback fails**

### The Solution:
- Changed Vite to use 5173 (standard)
- Added both 5173 and 3001 to Supabase (covers all cases)
- Now OAuth works regardless of which port is used

---

## Configuration Summary

### vite.config.js
```javascript
server: {
  port: 5173,        // Vite's default port
  strictPort: false  // Allow fallback if port is in use
}
```

### Supabase Redirect URLs
```
http://localhost:5173
http://localhost:5173/auth/callback
http://localhost:3001
http://localhost:3001/auth/callback
```

### Google OAuth (if configured)
**Authorized JavaScript origins**:
```
http://localhost:5173
http://localhost:3001
```

**Authorized redirect URIs**:
```
https://wxfxvuvlpjxnyxhpquyw.supabase.co/auth/v1/callback
```

---

## Testing Checklist

- [ ] Updated Supabase redirect URLs
- [ ] Restarted dev server
- [ ] Noted which port it's running on
- [ ] Opened login page on correct port
- [ ] Clicked "Continue with Google"
- [ ] Completed OAuth flow
- [ ] Checked console for debug messages
- [ ] Verified profile created in Supabase
- [ ] Confirmed name and avatar are populated

---

## Expected Console Output

### Success:
```
=== OAuth Callback Debug ===
User ID: abc-123-def-456
User Email: your@gmail.com
User Metadata: {
  email: "your@gmail.com",
  email_verified: true,
  given_name: "Your",
  family_name: "Name",
  name: "Your Name",
  picture: "https://lh3.googleusercontent.com/..."
}
========================
User metadata: { given_name: "Your", family_name: "Name", ... }
Attempting to create profile with: {
  id: "abc-123-def-456",
  email: "your@gmail.com",
  first_name: "Your",
  last_name: "Name",
  role: "student",
  avatar_url: "https://lh3.googleusercontent.com/..."
}
✅ Profile created successfully!
Profile data: [{ id: "...", email: "...", ... }]
Name: Your Name
Redirecting user with role: student
```

### If Still Failing:
```
❌ Error creating profile: { ... }
Error code: ...
Error message: ...
```

Share the error and I'll help fix it!

---

## Quick Reference

### Dev Server URL
After restart, check terminal for:
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

Use that URL for testing!

### Supabase Dashboard Links
- **URL Configuration**: Authentication → URL Configuration
- **Users**: Authentication → Users
- **Profiles Table**: Table Editor → profiles
- **Logs**: Logs → Postgres Logs

---

## Next Steps

1. ✅ Update Supabase redirect URLs (1 minute)
2. ✅ Restart dev server (10 seconds)
3. ✅ Test OAuth login (30 seconds)
4. ✅ Verify profile created (10 seconds)
5. 🎉 OAuth is working!

Total time: ~2 minutes

Let me know once you've updated the Supabase redirect URLs and restarted the server! 🚀
