# Fix OAuth Redirect URL Mismatch

## 🚨 Issue Found!

Your Supabase redirect URL is configured for `http://localhost:5173`, but your dev server is running on `http://localhost:3001`.

This mismatch can cause:
- OAuth callback to fail
- Profile not being created
- Session not being established properly

## ✅ Quick Fix

### Option 1: Update Supabase Redirect URLs (Recommended)

1. **Open Supabase Dashboard**
2. Go to **Authentication** → **URL Configuration**
3. Find **Redirect URLs** section
4. **Add** these URLs (keep existing ones):
   ```
   http://localhost:3001
   http://localhost:3001/auth/callback
   ```
5. Click **Save**

### Option 2: Change Dev Server Port

Make your dev server use port 5173 instead:

1. **Stop the current dev server** (Ctrl+C)
2. **Edit `vite.config.js`**:
   ```javascript
   export default {
     server: {
       port: 5173
     }
   }
   ```
3. **Restart dev server**: `npm run dev`
4. **Access at**: http://localhost:5173

---

## Complete Redirect URL Configuration

### In Supabase Dashboard

**Authentication** → **URL Configuration**

#### Site URL
```
http://localhost:5173
```
(or `http://localhost:3001` if you prefer)

#### Redirect URLs (Add all of these)
```
http://localhost:5173
http://localhost:5173/auth/callback
http://localhost:3001
http://localhost:3001/auth/callback
https://yourdomain.com
https://yourdomain.com/auth/callback
```

This way, OAuth will work on any port!

---

## Why This Matters

### OAuth Flow:
1. User clicks "Continue with Google"
2. Redirected to Google
3. Google redirects back to: `http://localhost:XXXX/auth/callback`
4. **If XXXX doesn't match Supabase config, it fails!**

### What Happens with Mismatch:
- OAuth might complete on Google's side
- But Supabase rejects the callback
- Session might not be established
- Profile creation never happens

---

## Test After Fix

1. **Update Supabase redirect URLs** (add port 3001)
2. **Sign out** from current session
3. **Clear browser cache** (or use Incognito)
4. **Go to**: http://localhost:3001/login
5. **Click "Continue with Google"**
6. **Complete OAuth flow**
7. **Check console** for debug messages
8. **Check Supabase** → Table Editor → profiles

Profile should now be created! ✅

---

## Verify Configuration

### Check Current Port

Your dev server is running on:
```
http://localhost:3001/
```

### Check Supabase Config

1. Supabase Dashboard → Authentication → URL Configuration
2. Verify redirect URLs include:
   - `http://localhost:3001`
   - `http://localhost:3001/auth/callback`

### Check Google OAuth Config

If you configured Google OAuth, also update there:

1. Google Cloud Console → Credentials
2. Edit OAuth 2.0 Client ID
3. **Authorized JavaScript origins**:
   - Add: `http://localhost:3001`
4. **Authorized redirect URIs**:
   - Should be: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
   - (This one is correct, don't change it)

---

## Quick Commands

### Check what port dev server is using:
```bash
npm run dev
# Look for: "Local: http://localhost:XXXX/"
```

### Force specific port:
```bash
# Edit vite.config.js
export default {
  server: {
    port: 5173  // or 3001
  }
}
```

---

## Recommended Setup

### For Development:

**Use port 5173** (Vite's default):
- Matches most tutorials
- Consistent with Vite defaults
- Less configuration needed

**Supabase Redirect URLs**:
```
http://localhost:5173
http://localhost:5173/auth/callback
```

### For Production:

**Supabase Redirect URLs**:
```
https://yourdomain.com
https://yourdomain.com/auth/callback
```

---

## Summary

**The Problem**: Port mismatch (5173 vs 3001)

**The Fix**: Add `http://localhost:3001` and `http://localhost:3001/auth/callback` to Supabase redirect URLs

**Time Required**: 1 minute

**Result**: OAuth will work and profiles will be created!

---

## After Fixing

Once you update the redirect URLs:

1. ✅ OAuth callback will work properly
2. ✅ Session will be established
3. ✅ Profile will be created automatically
4. ✅ Debug logs will show success
5. ✅ You'll see your profile in Supabase

Try it now and let me know if it works! 🚀
