# OAuth Authentication Flow Diagram

## Overview

This document illustrates the OAuth authentication flow for Google and GitHub in the UniqueBrains platform.

---

## OAuth Sign-In Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1. Clicks "Continue with Google/GitHub"
       │
       ▼
┌─────────────────────────────────────────┐
│  Login/Register Page                    │
│  (src/pages/Login.jsx)                  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  OAuthButton Component            │ │
│  │  (src/components/OAuthButton.jsx) │ │
│  └───────────────┬───────────────────┘ │
└──────────────────┼─────────────────────┘
                   │
                   │ 2. Calls supabase.auth.signInWithOAuth()
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Supabase Auth                          │
│  (Managed by Supabase)                  │
│                                         │
│  • Validates request                    │
│  • Generates state parameter (CSRF)     │
│  • Redirects to OAuth provider          │
└──────────────────┬──────────────────────┘
                   │
                   │ 3. Redirects to provider
                   │
                   ▼
┌─────────────────────────────────────────┐
│  OAuth Provider                         │
│  (Google / GitHub)                      │
│                                         │
│  • User sees authorization screen       │
│  • User grants permissions              │
│  • Provider validates user              │
└──────────────────┬──────────────────────┘
                   │
                   │ 4. Redirects back with auth code
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Supabase Auth Callback                 │
│  (https://PROJECT.supabase.co/auth/v1/  │
│   callback)                             │
│                                         │
│  • Validates state parameter            │
│  • Exchanges code for tokens            │
│  • Creates/updates user in auth.users   │
│  • Generates JWT token                  │
└──────────────────┬──────────────────────┘
                   │
                   │ 5. Redirects to app callback
                   │
                   ▼
┌─────────────────────────────────────────┐
│  App Callback Handler                   │
│  (src/pages/AuthCallback.jsx)           │
│  Route: /auth/callback                  │
│                                         │
│  • Gets session from Supabase           │
│  • Checks if profile exists             │
│  • Creates profile if needed            │
│  • Extracts user metadata               │
└──────────────────┬──────────────────────┘
                   │
                   │ 6. Redirects based on role
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Dashboard / Home Page                  │
│                                         │
│  • Instructor → /instructor/dashboard   │
│  • Parent → /my-courses                 │
│  • Student → /marketplace               │
└─────────────────────────────────────────┘
```

---

## Detailed Step-by-Step Flow

### Step 1: User Initiates OAuth

**Location**: Login or Register page

**User Action**: Clicks "Continue with Google" or "Continue with GitHub"

**Code**:
```javascript
// src/components/OAuthButton.jsx
const handleOAuthSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider, // 'google' or 'github'
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  })
}
```

**What Happens**:
- OAuthButton component calls Supabase Auth
- Supabase generates authorization URL
- Browser redirects to OAuth provider

---

### Step 2: OAuth Provider Authorization

**Location**: Google or GitHub authorization page

**User Action**: Reviews permissions and clicks "Allow" or "Authorize"

**What Happens**:
- Provider shows authorization screen
- User grants requested permissions (email, profile)
- Provider validates user credentials
- Provider generates authorization code

---

### Step 3: Provider Redirects to Supabase

**Location**: Supabase Auth callback endpoint

**URL**: `https://PROJECT.supabase.co/auth/v1/callback?code=...&state=...`

**What Happens**:
- Provider redirects with authorization code
- Supabase validates state parameter (CSRF protection)
- Supabase exchanges code for access token
- Supabase creates or updates user in `auth.users` table
- Supabase generates JWT token for the user

**User Data Stored**:
```javascript
{
  id: "uuid",
  email: "user@example.com",
  user_metadata: {
    full_name: "John Doe",
    avatar_url: "https://...",
    provider: "google" // or "github"
  }
}
```

---

### Step 4: Supabase Redirects to App

**Location**: App callback handler

**URL**: `http://localhost:3000/auth/callback#access_token=...`

**Code**:
```javascript
// src/pages/AuthCallback.jsx
const { data: { session }, error } = await supabase.auth.getSession()
```

**What Happens**:
- AuthCallback component receives the session
- Session contains JWT token and user data
- Component extracts user information

---

### Step 5: Profile Creation/Verification

**Location**: AuthCallback component

**Code**:
```javascript
// Check if profile exists
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .single()

// Create profile if it doesn't exist
if (!profile) {
  await supabase.from('profiles').insert({
    id: session.user.id,
    email: session.user.email,
    first_name: session.user.user_metadata?.full_name?.split(' ')[0],
    last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
    role: 'student', // Default role
    avatar_url: session.user.user_metadata?.avatar_url
  })
}
```

**What Happens**:
- Component checks if user has a profile
- If no profile exists, creates one with:
  - User ID from auth.users
  - Email from OAuth provider
  - Name parsed from full_name
  - Avatar URL from provider
  - Default role (student)

---

### Step 6: Role-Based Redirect

**Location**: AuthCallback component

**Code**:
```javascript
const userRole = profile?.role || 'student'

if (userRole === 'instructor') {
  navigate('/instructor/dashboard')
} else if (userRole === 'parent') {
  navigate('/my-courses')
} else {
  navigate('/marketplace')
}
```

**What Happens**:
- Component determines user's role
- Redirects to appropriate page:
  - Instructors → Dashboard
  - Parents → My Courses
  - Students → Marketplace

---

## Security Features

### 1. CSRF Protection
- Supabase generates unique state parameter
- State is validated on callback
- Prevents cross-site request forgery attacks

### 2. PKCE Flow
- Proof Key for Code Exchange enabled
- Adds extra security layer for OAuth
- Configured in `src/lib/supabase.js`

### 3. Secure Token Storage
- JWT tokens stored in localStorage
- Tokens encrypted by Supabase
- Automatic token refresh

### 4. HTTPS Enforcement
- OAuth requires HTTPS in production
- Supabase enforces HTTPS for callbacks
- Prevents man-in-the-middle attacks

### 5. Redirect URL Validation
- Only configured URLs allowed
- Prevents open redirect vulnerabilities
- Configured in Supabase Dashboard

---

## Error Handling

### OAuth Provider Errors

**Scenario**: User denies authorization

**Flow**:
```
User clicks "Deny" → Provider redirects with error
→ Supabase detects error → Redirects to app with error
→ AuthCallback shows error message → Redirects to login
```

### Profile Creation Errors

**Scenario**: Profile creation fails

**Flow**:
```
OAuth succeeds → Profile insert fails
→ AuthCallback catches error → Shows error message
→ User can retry or contact support
```

### Network Errors

**Scenario**: Network connection lost

**Flow**:
```
OAuth initiated → Network error occurs
→ OAuthButton catches error → Shows error alert
→ User can retry
```

---

## Configuration Requirements

### Google OAuth

**Required in Google Cloud Console**:
- OAuth 2.0 Client ID
- OAuth 2.0 Client Secret
- Authorized JavaScript origins
- Authorized redirect URIs

**Required in Supabase**:
- Enable Google provider
- Add Client ID
- Add Client Secret

### GitHub OAuth

**Required in GitHub**:
- OAuth App Client ID
- OAuth App Client Secret
- Authorization callback URL

**Required in Supabase**:
- Enable GitHub provider
- Add Client ID
- Add Client Secret

### Supabase Configuration

**Required Settings**:
- Site URL (development and production)
- Redirect URLs (all allowed callback URLs)
- JWT expiry (24 hours)
- Refresh token settings

---

## Testing Checklist

### Development Testing

- [ ] OAuth buttons appear on login page
- [ ] OAuth buttons appear on register page
- [ ] Google OAuth redirects to Google
- [ ] GitHub OAuth redirects to GitHub
- [ ] User can authorize the app
- [ ] User is redirected back to app
- [ ] Profile is created for new users
- [ ] Existing users can sign in
- [ ] User is redirected based on role
- [ ] User can sign out
- [ ] User can sign back in with OAuth

### Production Testing

- [ ] OAuth works with production URLs
- [ ] HTTPS is enforced
- [ ] Redirect URLs are correct
- [ ] Error handling works properly
- [ ] Profile creation works
- [ ] Role-based redirect works
- [ ] Session persistence works

---

## Troubleshooting Guide

### "Redirect URI mismatch"

**Problem**: Callback URL doesn't match configuration

**Solution**:
1. Check Google Cloud Console → Authorized redirect URIs
2. Check GitHub OAuth App → Authorization callback URL
3. Ensure URL matches exactly: `https://PROJECT.supabase.co/auth/v1/callback`
4. No trailing slashes or extra parameters

### "Access blocked"

**Problem**: OAuth consent screen not configured

**Solution**:
1. Go to Google Cloud Console → OAuth consent screen
2. Fill in all required fields
3. Add authorized domains
4. Save and try again

### Profile not created

**Problem**: Database or RLS policy issue

**Solution**:
1. Check that `profiles` table exists
2. Verify RLS policies allow INSERT for authenticated users
3. Check Supabase logs for errors
4. Verify AuthCallback code is correct

### OAuth works in dev but not production

**Problem**: Production URLs not configured

**Solution**:
1. Add production domain to Google authorized origins
2. Add production callback URL to GitHub OAuth app
3. Update Supabase redirect URLs
4. Verify HTTPS is enabled

---

## Summary

The OAuth flow is a secure, multi-step process that:
1. Redirects users to trusted OAuth providers
2. Validates authorization with CSRF protection
3. Creates user accounts and profiles automatically
4. Provides seamless authentication experience
5. Maintains security throughout the process

All components are in place and ready for configuration!
