# OAuth Testing Guide - Google Only

## 🎯 Current Status

✅ **Implementation Complete**
- OAuth buttons added to Login and Register pages
- Google OAuth button with branded icon
- GitHub OAuth button (can be hidden if not configured)
- OAuth callback handler ready
- Profile creation logic implemented

🚀 **Dev Server Running**
- URL: http://localhost:3001/
- Ready for testing

---

## 📋 Testing Checklist

### Visual Verification

1. **Navigate to Login Page**
   - Open: http://localhost:3001/login
   - [ ] Verify "Continue with Google" button appears
   - [ ] Verify "Continue with GitHub" button appears
   - [ ] Verify divider with "or" text appears
   - [ ] Verify buttons have proper styling and icons

2. **Navigate to Register Page**
   - Open: http://localhost:3001/register
   - [ ] Verify OAuth buttons appear
   - [ ] Verify same styling as login page

### Google OAuth Testing

**Prerequisites**: Google OAuth must be configured in Supabase Dashboard

1. **Test Google OAuth Flow**
   - [ ] Click "Continue with Google" on login page
   - [ ] You should be redirected to Google sign-in
   - [ ] Sign in with your Google account
   - [ ] Authorize the app
   - [ ] You should be redirected back to the app
   - [ ] Check that you're logged in
   - [ ] Verify profile was created

2. **Test Profile Creation**
   - [ ] Open Supabase Dashboard
   - [ ] Navigate to Table Editor → profiles
   - [ ] Verify your profile exists with:
     - Email from Google
     - First name and last name
     - Avatar URL (if provided by Google)
     - Default role (student)

3. **Test Sign Out and Sign In Again**
   - [ ] Sign out from the app
   - [ ] Click "Continue with Google" again
   - [ ] You should be signed in immediately (no authorization needed)
   - [ ] Verify you're redirected to the correct page

---

## 🔍 What to Look For

### Success Indicators

✅ **OAuth Button Appears**: Google button with icon visible on login/register pages
✅ **Redirect Works**: Clicking button redirects to Google
✅ **Authorization Works**: Google shows authorization screen
✅ **Callback Works**: Redirected back to app after authorization
✅ **Profile Created**: Profile exists in database with correct data
✅ **Role-Based Redirect**: Redirected to correct page based on role
✅ **No Console Errors**: Browser console shows no errors

### Expected Behavior

**First Time Sign-In**:
1. Click "Continue with Google"
2. Redirected to Google sign-in
3. Enter Google credentials
4. See authorization screen
5. Click "Allow"
6. Redirected to app at `/auth/callback`
7. Profile created automatically
8. Redirected to dashboard/marketplace based on role

**Subsequent Sign-Ins**:
1. Click "Continue with Google"
2. Redirected to Google (may skip if already signed in)
3. Immediately redirected back to app
4. Signed in automatically
5. Redirected to appropriate page

---

## 🐛 Troubleshooting

### Issue: OAuth Button Not Appearing

**Check**:
- Browser console for errors
- Verify `OAuthButton` component is imported
- Check that files were saved after modification

**Solution**:
```bash
# Restart dev server
# Stop current server (Ctrl+C)
npm run dev
```

### Issue: "Redirect URI mismatch" Error

**Problem**: Callback URL doesn't match Google Cloud Console configuration

**Check**:
- Google Cloud Console → Credentials → OAuth 2.0 Client IDs
- Authorized redirect URIs should include:
  - `https://wxfxvuvlpjxnyxhpquyw.supabase.co/auth/v1/callback`

**Solution**:
1. Go to Google Cloud Console
2. Edit OAuth client
3. Add correct redirect URI
4. Save and try again

### Issue: "Access blocked" Error

**Problem**: OAuth consent screen not configured

**Solution**:
1. Go to Google Cloud Console
2. Navigate to OAuth consent screen
3. Fill in all required fields:
   - App name
   - User support email
   - Developer contact email
4. Add authorized domain: `supabase.co`
5. Save and try again

### Issue: Profile Not Created

**Check**:
- Browser console for errors
- Supabase Dashboard → Logs for database errors
- Table Editor → profiles to see if profile exists

**Solution**:
1. Check that `profiles` table exists
2. Verify RLS policies allow INSERT for authenticated users
3. Check `AuthCallback.jsx` for errors
4. Review Supabase logs

### Issue: Stuck on "Completing sign in..."

**Problem**: Callback handler not processing correctly

**Check**:
- Browser console for errors
- Network tab for failed requests
- Supabase logs for errors

**Solution**:
1. Check that session is being retrieved
2. Verify profile creation logic
3. Check redirect logic
4. Review error handling in `AuthCallback.jsx`

---

## 🧪 Manual Testing Steps

### Test 1: Visual Verification

```bash
# Server should be running on http://localhost:3001/

1. Open http://localhost:3001/login
2. Verify OAuth buttons appear
3. Check styling and icons
4. Open http://localhost:3001/register
5. Verify same buttons appear
```

**Expected Result**: OAuth buttons visible with proper styling

### Test 2: Google OAuth Flow (If Configured)

```bash
1. Click "Continue with Google"
2. Complete Google authorization
3. Verify redirect back to app
4. Check browser console for errors
5. Verify you're logged in
```

**Expected Result**: Successfully signed in with Google account

### Test 3: Profile Verification

```bash
1. Open Supabase Dashboard
2. Go to Table Editor → profiles
3. Find your profile by email
4. Verify data is correct
```

**Expected Result**: Profile exists with correct data from Google

### Test 4: Sign Out and Sign In Again

```bash
1. Sign out from app
2. Click "Continue with Google" again
3. Verify immediate sign-in (no authorization needed)
```

**Expected Result**: Quick sign-in without re-authorization

---

## 📊 Testing Results

### Visual Tests
- [ ] Login page shows OAuth buttons
- [ ] Register page shows OAuth buttons
- [ ] Buttons have proper styling
- [ ] Icons display correctly
- [ ] Divider appears between OAuth and email/password

### Functional Tests (Requires Google OAuth Configuration)
- [ ] Google OAuth redirects to Google
- [ ] Authorization screen appears
- [ ] Redirect back to app works
- [ ] Profile is created automatically
- [ ] User is logged in after OAuth
- [ ] Role-based redirect works
- [ ] Sign out works
- [ ] Sign in again works

### Error Handling Tests
- [ ] No console errors
- [ ] No network errors
- [ ] Error messages display correctly (if any)
- [ ] Graceful handling of OAuth failures

---

## 🎯 Next Steps

### If Google OAuth is NOT Yet Configured:

1. **Configure Google OAuth**:
   - Follow `supabase/OAUTH_SETUP_INSTRUCTIONS.md`
   - Create Google Cloud project
   - Set up OAuth credentials
   - Enable in Supabase Dashboard

2. **Test Again**:
   - Complete functional tests above
   - Verify everything works end-to-end

### If Google OAuth IS Configured:

1. **Complete Testing**:
   - Run through all test cases
   - Document any issues
   - Verify profile creation

2. **Production Preparation**:
   - Update Google OAuth with production URLs
   - Update Supabase redirect URLs
   - Test in production environment

---

## 📝 Notes

- **GitHub OAuth**: Skipped as per user request
- **Dev Server**: Running on http://localhost:3001/
- **Google OAuth**: Requires configuration in Supabase Dashboard
- **Profile Creation**: Automatic for new OAuth users
- **Default Role**: Student (can be changed in database)

---

## ✅ Success Criteria

OAuth implementation is successful when:

✅ OAuth buttons appear on login and register pages
✅ Buttons have proper styling and icons
✅ Clicking Google OAuth redirects to Google (if configured)
✅ User can authorize the app (if configured)
✅ User is redirected back after authorization (if configured)
✅ Profile is created automatically (if configured)
✅ User is logged in successfully (if configured)
✅ No errors in browser console
✅ No errors in Supabase logs

---

## 🚀 Current Status

**Implementation**: ✅ Complete
**Visual Testing**: Ready to test
**Functional Testing**: Requires Google OAuth configuration in Supabase
**Documentation**: Complete
**Verification Tools**: Available (`npm run verify-oauth`)

**You can now**:
1. Test the visual appearance of OAuth buttons
2. Configure Google OAuth in Supabase Dashboard
3. Test the complete OAuth flow
4. Deploy to production

---

## 📞 Support

If you encounter issues:
- Check browser console for errors
- Review Supabase logs
- Check documentation in `supabase/` folder
- Run `npm run verify-oauth` for verification

**Dev Server**: http://localhost:3001/
**Login Page**: http://localhost:3001/login
**Register Page**: http://localhost:3001/register
