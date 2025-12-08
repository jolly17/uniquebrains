# OAuth Configuration Checklist

Use this checklist to configure OAuth providers for UniqueBrains.

---

## ✅ Implementation Status

- [x] OAuth buttons added to Login page
- [x] OAuth buttons added to Register page
- [x] OAuth callback handler implemented
- [x] Profile creation logic implemented
- [x] Styling and UI complete
- [x] Documentation created
- [x] Verification script created

---

## 📋 Configuration Checklist

### Part 1: Google OAuth Setup

#### Step 1: Google Cloud Console
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create new project or select existing one
- [ ] Navigate to **APIs & Services** → **OAuth consent screen**
- [ ] Configure consent screen:
  - [ ] App name: "UniqueBrains"
  - [ ] User support email: hello@uniquebrains.org
  - [ ] Developer contact email: hello@uniquebrains.org
  - [ ] Add authorized domain: supabase.co
- [ ] Navigate to **APIs & Services** → **Credentials**
- [ ] Click **Create Credentials** → **OAuth client ID**
- [ ] Configure OAuth client:
  - [ ] Application type: Web application
  - [ ] Name: "UniqueBrains Web Client"
  - [ ] Authorized JavaScript origins:
    - [ ] `http://localhost:5173` (development)
    - [ ] `https://yourdomain.com` (production)
  - [ ] Authorized redirect URIs:
    - [ ] `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- [ ] Copy Client ID
- [ ] Copy Client Secret

#### Step 2: Supabase Dashboard (Google)
- [ ] Go to [Supabase Dashboard](https://app.supabase.com)
- [ ] Select your project
- [ ] Navigate to **Authentication** → **Providers**
- [ ] Find **Google** in the list
- [ ] Toggle **Enable Sign in with Google** to ON
- [ ] Paste Google Client ID
- [ ] Paste Google Client Secret
- [ ] Click **Save**

#### Step 3: Test Google OAuth
- [ ] Run `npm run dev`
- [ ] Navigate to login page
- [ ] Click "Continue with Google"
- [ ] Complete Google authorization
- [ ] Verify redirect back to app
- [ ] Check that profile is created

---

### Part 2: GitHub OAuth Setup

#### Step 1: GitHub Developer Settings
- [ ] Go to [GitHub Developer Settings](https://github.com/settings/developers)
- [ ] Click **OAuth Apps** → **New OAuth App**
- [ ] Configure OAuth app:
  - [ ] Application name: "UniqueBrains"
  - [ ] Homepage URL: `http://localhost:5173` (or production URL)
  - [ ] Application description: "Where every brain learns differently"
  - [ ] Authorization callback URL: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- [ ] Click **Register application**
- [ ] Click **Generate a new client secret**
- [ ] Copy Client ID
- [ ] Copy Client Secret

#### Step 2: Supabase Dashboard (GitHub)
- [ ] Go to [Supabase Dashboard](https://app.supabase.com)
- [ ] Select your project
- [ ] Navigate to **Authentication** → **Providers**
- [ ] Find **GitHub** in the list
- [ ] Toggle **Enable Sign in with GitHub** to ON
- [ ] Paste GitHub Client ID
- [ ] Paste GitHub Client Secret
- [ ] Click **Save**

#### Step 3: Test GitHub OAuth
- [ ] Run `npm run dev`
- [ ] Navigate to login page
- [ ] Click "Continue with GitHub"
- [ ] Complete GitHub authorization
- [ ] Verify redirect back to app
- [ ] Check that profile is created

---

### Part 3: Supabase Configuration

#### URL Configuration
- [ ] Go to **Authentication** → **URL Configuration**
- [ ] Set **Site URL**:
  - [ ] Development: `http://localhost:5173`
  - [ ] Production: `https://yourdomain.com`
- [ ] Add **Redirect URLs**:
  - [ ] `http://localhost:5173`
  - [ ] `http://localhost:5173/auth/callback`
  - [ ] `https://yourdomain.com`
  - [ ] `https://yourdomain.com/auth/callback`
- [ ] Click **Save**

#### Session Settings
- [ ] Go to **Authentication** → **Settings**
- [ ] Verify **JWT Expiry**: 3600 seconds (1 hour)
- [ ] Verify **Refresh Token Expiry**: 2592000 seconds (30 days)
- [ ] Verify **Refresh Token Rotation**: Enabled

---

### Part 4: Environment Variables (Optional)

- [ ] Open `.env` file
- [ ] Add Google credentials (for reference):
  ```bash
  GOOGLE_CLIENT_ID=your_google_client_id
  GOOGLE_CLIENT_SECRET=your_google_client_secret
  ```
- [ ] Add GitHub credentials (for reference):
  ```bash
  GITHUB_CLIENT_ID=your_github_client_id
  GITHUB_CLIENT_SECRET=your_github_client_secret
  ```
- [ ] Save file

**Note**: These are for reference only. Actual credentials are in Supabase Dashboard.

---

### Part 5: Testing

#### Development Testing
- [ ] Run verification script: `npm run verify-oauth`
- [ ] Start dev server: `npm run dev`
- [ ] Test Google OAuth:
  - [ ] Click "Continue with Google"
  - [ ] Authorize the app
  - [ ] Verify redirect back
  - [ ] Check profile created
  - [ ] Sign out
  - [ ] Sign in again with Google
- [ ] Test GitHub OAuth:
  - [ ] Click "Continue with GitHub"
  - [ ] Authorize the app
  - [ ] Verify redirect back
  - [ ] Check profile created
  - [ ] Sign out
  - [ ] Sign in again with GitHub

#### Production Testing (After Deployment)
- [ ] Update Google OAuth with production URLs
- [ ] Update GitHub OAuth with production URLs
- [ ] Update Supabase redirect URLs
- [ ] Deploy to production
- [ ] Test Google OAuth in production
- [ ] Test GitHub OAuth in production
- [ ] Verify HTTPS is enforced
- [ ] Check error tracking

---

## 🔍 Verification Commands

```bash
# Verify OAuth setup
npm run verify-oauth

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📚 Documentation References

- **Quick Start**: `supabase/OAUTH_SETUP_INSTRUCTIONS.md`
- **Detailed Guide**: `supabase/OAUTH_CONFIGURATION.md`
- **Flow Diagram**: `supabase/OAUTH_FLOW_DIAGRAM.md`
- **Completion Summary**: `supabase/TASK_4.2_COMPLETE.md`
- **Implementation Summary**: `OAUTH_IMPLEMENTATION_SUMMARY.md`

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Redirect URI mismatch"
- [ ] Check callback URL matches exactly in provider settings
- [ ] Verify no typos or extra spaces
- [ ] Ensure using correct Supabase project reference

**Issue**: "Access blocked: This app's request is invalid"
- [ ] Configure OAuth consent screen in Google Cloud Console
- [ ] Fill in all required fields
- [ ] Add authorized domains

**Issue**: OAuth works in dev but not production
- [ ] Add production domain to provider settings
- [ ] Update Supabase redirect URLs
- [ ] Verify HTTPS is enabled

**Issue**: Profile not created after OAuth
- [ ] Check `profiles` table exists
- [ ] Verify RLS policies allow INSERT
- [ ] Check Supabase logs for errors
- [ ] Review AuthCallback component

---

## 🎯 Success Criteria

You'll know OAuth is working correctly when:

✅ OAuth buttons appear on login and register pages
✅ Clicking Google OAuth redirects to Google
✅ Clicking GitHub OAuth redirects to GitHub
✅ User can authorize the app
✅ User is redirected back to app after authorization
✅ Profile is automatically created for new users
✅ Existing users can sign in with OAuth
✅ User is redirected based on their role
✅ User can sign out and sign back in
✅ No errors in browser console
✅ No errors in Supabase logs

---

## 📞 Support

If you encounter issues:

1. **Check Documentation**:
   - Review setup instructions
   - Check troubleshooting section
   - Review flow diagram

2. **Run Verification**:
   ```bash
   npm run verify-oauth
   ```

3. **Check Logs**:
   - Browser console for frontend errors
   - Supabase Dashboard → Logs for backend errors

4. **External Resources**:
   - [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/social-login)
   - [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
   - [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)

5. **Contact**:
   - Email: hello@uniquebrains.org

---

## ✅ Completion

Once all checkboxes are marked:

- [ ] Google OAuth is fully configured
- [ ] GitHub OAuth is fully configured
- [ ] All tests pass
- [ ] Documentation reviewed
- [ ] Ready for production deployment

**Congratulations! OAuth is now configured for UniqueBrains!** 🎉
