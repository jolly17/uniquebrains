# OAuth Setup Instructions - Quick Start Guide

This guide provides step-by-step instructions to enable Google and GitHub OAuth for UniqueBrains.

## Prerequisites

- Supabase project created and running
- Access to Supabase Dashboard
- Google Cloud Console account (for Google OAuth)
- GitHub account (for GitHub OAuth)

## Your Supabase OAuth Callback URL

```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference ID.

---

## Part 1: Enable Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Select **External** user type
   - Fill in app name: "UniqueBrains"
   - Add user support email
   - Add developer contact email
   - Click **Save and Continue**
6. Back to creating OAuth client ID:
   - Application type: **Web application**
   - Name: "UniqueBrains Web Client"
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
7. Click **Create**
8. **Copy your Client ID and Client Secret** - you'll need these next

### Step 2: Configure Google OAuth in Supabase

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle **Enable Sign in with Google** to ON
6. Paste your Google OAuth credentials:
   - **Client ID**: [Paste from Google Cloud Console]
   - **Client Secret**: [Paste from Google Cloud Console]
7. Click **Save**

### Step 3: Test Google OAuth

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Continue with Google"
4. You should be redirected to Google sign-in
5. After signing in, you should be redirected back to your app

✅ Google OAuth is now configured!

---

## Part 2: Enable GitHub OAuth

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the form:
   - **Application name**: UniqueBrains
   - **Homepage URL**: `http://localhost:5173` (or your production URL)
   - **Application description**: Where every brain learns differently
   - **Authorization callback URL**: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Click **Register application**
5. On the next page, click **Generate a new client secret**
6. **Copy your Client ID and Client Secret** - you'll need these next

### Step 2: Configure GitHub OAuth in Supabase

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **GitHub** in the list
5. Toggle **Enable Sign in with GitHub** to ON
6. Paste your GitHub OAuth credentials:
   - **Client ID**: [Paste from GitHub]
   - **Client Secret**: [Paste from GitHub]
7. Click **Save**

### Step 3: Test GitHub OAuth

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Continue with GitHub"
4. You should be redirected to GitHub authorization
5. After authorizing, you should be redirected back to your app

✅ GitHub OAuth is now configured!

---

## Part 3: Configure Redirect URLs in Supabase

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`
3. Add **Redirect URLs**:
   ```
   http://localhost:5173
   http://localhost:5173/auth/callback
   https://yourdomain.com
   https://yourdomain.com/auth/callback
   ```
4. Click **Save**

---

## Part 4: Update Environment Variables (Optional)

Add these to your `.env` file for reference (actual config is in Supabase):

```bash
# Google OAuth (for reference only)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth (for reference only)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Note**: These credentials are configured in Supabase Dashboard, not used directly in your frontend code.

---

## Verification Checklist

After completing the setup, verify everything works:

- [ ] Google OAuth button appears on login page
- [ ] GitHub OAuth button appears on login page
- [ ] Clicking Google OAuth redirects to Google sign-in
- [ ] Clicking GitHub OAuth redirects to GitHub authorization
- [ ] After OAuth sign-in, user is redirected back to app
- [ ] User profile is created in database after OAuth sign-in
- [ ] User can sign out and sign back in with OAuth

---

## Troubleshooting

### "Redirect URI mismatch" error

**Problem**: The callback URL doesn't match what's configured in Google/GitHub.

**Solution**: 
- Ensure the callback URL in Google Cloud Console / GitHub matches exactly: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Check for typos or extra spaces
- Make sure you're using the correct Supabase project reference

### "Access blocked: This app's request is invalid"

**Problem**: Google OAuth consent screen is not properly configured.

**Solution**:
- Go to Google Cloud Console → APIs & Services → OAuth consent screen
- Fill in all required fields (app name, support email, developer email)
- Add authorized domains (supabase.co)
- Save and try again

### OAuth works in development but not production

**Problem**: Production domain not authorized.

**Solution**:
- Add production domain to authorized origins in Google Cloud Console
- Add production callback URL to GitHub OAuth app
- Update Supabase redirect URLs with production domain

### User profile not created after OAuth sign-in

**Problem**: Database trigger or RLS policy issue.

**Solution**:
- Check that profiles table exists
- Verify RLS policies allow INSERT for authenticated users
- Check Supabase logs for errors
- The AuthCallback component should create profile if it doesn't exist

---

## Production Deployment

Before deploying to production:

1. **Update Google OAuth**:
   - Add production domain to authorized JavaScript origins
   - Add production callback URL to authorized redirect URIs

2. **Update GitHub OAuth**:
   - Update homepage URL to production domain
   - Update authorization callback URL to production

3. **Update Supabase**:
   - Set Site URL to production domain
   - Add production redirect URLs

4. **Test in production**:
   - Test Google OAuth flow
   - Test GitHub OAuth flow
   - Verify user profiles are created
   - Check error tracking for any issues

---

## Security Best Practices

✅ **Never commit OAuth secrets** - Keep them in Supabase Dashboard only
✅ **Use HTTPS in production** - OAuth requires secure connections
✅ **Validate redirect URLs** - Only allow your own domains
✅ **Monitor OAuth usage** - Check Supabase dashboard for suspicious activity
✅ **Keep credentials secure** - Rotate secrets if compromised

---

## Support

For issues or questions:
- Check [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- Review [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- Review [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- Contact: hello@uniquebrains.org

---

## Requirements Validated

✅ **Requirement 1.6**: OAuth providers (Google, GitHub) for social login
✅ **Requirement 1.1**: User registration via OAuth
✅ **Requirement 1.2**: JWT token generation (handled by Supabase)
✅ **Requirement 8.1**: HTTPS enforcement (OAuth requires HTTPS)

**Task 4.2 Complete!** ✅
