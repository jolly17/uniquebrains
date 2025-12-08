# OAuth Providers Configuration Guide

This guide walks through setting up Google and GitHub OAuth for the UniqueBrains platform.

## 4.2 Implement OAuth Providers

### Prerequisites

Before configuring OAuth providers, you need:
- Supabase project URL: `https://wxfxvuvlpjxnyxhpquyw.supabase.co`
- OAuth callback URL: `https://wxfxvuvlpjxnyxhpquyw.supabase.co/auth/v1/callback`

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it "UniqueBrains" or similar

### Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (or Internal if using Google Workspace)
3. Fill in the application information:
   - **App name**: UniqueBrains
   - **User support email**: hello@uniquebrains.org
   - **App logo**: Upload your logo (optional)
   - **Application home page**: https://yourdomain.com
   - **Application privacy policy**: https://yourdomain.com/privacy
   - **Application terms of service**: https://yourdomain.com/terms
   - **Authorized domains**: 
     - uniquebrains.org
     - supabase.co
   - **Developer contact email**: hello@uniquebrains.org
4. Click **Save and Continue**

### Step 3: Configure Scopes

1. Click **Add or Remove Scopes**
2. Add the following scopes:
   - `userinfo.email` - See your primary Google Account email address
   - `userinfo.profile` - See your personal info, including any personal info you've made publicly available
3. Click **Update** and then **Save and Continue**

### Step 4: Add Test Users (Development Only)

1. Add test email addresses for development
2. Click **Save and Continue**

### Step 5: Create OAuth Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: UniqueBrains Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `https://wxfxvuvlpjxnyxhpquyw.supabase.co/auth/v1/callback`
5. Click **Create**
6. **Save your Client ID and Client Secret** - you'll need these for Supabase

### Step 6: Configure in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Enter your credentials:
   - **Client ID**: [Your Google Client ID]
   - **Client Secret**: [Your Google Client Secret]
6. Click **Save**

### Step 7: Test Google OAuth

Test the integration:
```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:5173/auth/callback'
  }
})
```

---

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the application information:
   - **Application name**: UniqueBrains
   - **Homepage URL**: https://yourdomain.com
   - **Application description**: Where every brain learns differently
   - **Authorization callback URL**: `https://wxfxvuvlpjxnyxhpquyw.supabase.co/auth/v1/callback`
4. Click **Register application**

### Step 2: Generate Client Secret

1. After creating the app, click **Generate a new client secret**
2. **Save your Client ID and Client Secret** - you'll need these for Supabase

### Step 3: Configure in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **GitHub** and click to expand
4. Toggle **Enable Sign in with GitHub** to ON
5. Enter your credentials:
   - **Client ID**: [Your GitHub Client ID]
   - **Client Secret**: [Your GitHub Client Secret]
6. Click **Save**

### Step 4: Test GitHub OAuth

Test the integration:
```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: 'http://localhost:5173/auth/callback'
  }
})
```

---

## Frontend Implementation

### OAuth Sign-In Component

Create a reusable OAuth button component:

```javascript
// src/components/OAuthButton.jsx
import { supabase } from '../lib/supabase'

export function OAuthButton({ provider, children }) {
  const handleOAuthSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      console.error('OAuth error:', error)
      alert(`Failed to sign in with ${provider}: ${error.message}`)
    }
  }

  return (
    <button onClick={handleOAuthSignIn} className="oauth-button">
      {children}
    </button>
  )
}
```

### Usage Example

```javascript
import { OAuthButton } from './components/OAuthButton'

function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      
      <OAuthButton provider="google">
        <img src="/google-icon.svg" alt="" />
        Continue with Google
      </OAuthButton>
      
      <OAuthButton provider="github">
        <img src="/github-icon.svg" alt="" />
        Continue with GitHub
      </OAuthButton>
    </div>
  )
}
```

---

## OAuth Callback Handler

Create a callback page to handle OAuth redirects:

```javascript
// src/pages/AuthCallback.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Handle the OAuth callback
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Redirect to dashboard or home page
        navigate('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        navigate('/login')
      }
    })
  }, [navigate])

  return (
    <div className="auth-callback">
      <p>Completing sign in...</p>
    </div>
  )
}
```

---

## Environment Variables

Add OAuth credentials to your `.env` file (for reference only - actual config is in Supabase):

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Note**: These credentials are configured in Supabase Dashboard, not in your frontend code.

---

## Security Considerations

### 1. Redirect URL Validation
- Always validate redirect URLs to prevent open redirect vulnerabilities
- Only allow redirects to your own domains

### 2. State Parameter
- Supabase automatically handles CSRF protection via state parameter
- Don't disable this security feature

### 3. Token Storage
- OAuth tokens are securely stored by Supabase
- Never expose tokens in client-side code or logs

### 4. Scope Minimization
- Only request the minimum scopes needed (email and profile)
- Don't request additional permissions unless necessary

---

## Testing OAuth Integration

### Manual Testing Checklist

- [ ] Google OAuth sign-in works in development
- [ ] GitHub OAuth sign-in works in development
- [ ] User profile is created after OAuth sign-in
- [ ] User role is properly assigned (default: student)
- [ ] Redirect after sign-in works correctly
- [ ] Sign-out works properly
- [ ] OAuth works in production environment

### Automated Testing

Run the verification script:
```bash
npm run verify-oauth
```

---

## Troubleshooting

### Common Issues

**Issue**: "Redirect URI mismatch"
- **Solution**: Ensure the callback URL in Google/GitHub matches exactly: `https://wxfxvuvlpjxnyxhpquyw.supabase.co/auth/v1/callback`

**Issue**: "Access blocked: This app's request is invalid"
- **Solution**: Check that your OAuth consent screen is properly configured with all required fields

**Issue**: "User profile not created after OAuth sign-in"
- **Solution**: Ensure you have a database trigger to create profile on auth.users insert

**Issue**: "OAuth works in development but not production"
- **Solution**: Add production domain to authorized origins in Google/GitHub OAuth settings

---

## Requirements Validated

- ✅ **Requirement 1.6**: OAuth providers (Google, GitHub) for social login
- ✅ **Requirement 1.1**: User registration (via OAuth)
- ✅ **Requirement 1.2**: JWT token generation (handled by Supabase)
- ✅ **Requirement 8.1**: HTTPS enforcement (OAuth requires HTTPS)

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Update Google OAuth authorized origins with production domain
- [ ] Update GitHub OAuth callback URL with production domain
- [ ] Update Supabase redirect URLs with production domain
- [ ] Test OAuth flow in production environment
- [ ] Monitor OAuth sign-in metrics in Supabase dashboard
- [ ] Set up error tracking for OAuth failures

---

## Additional Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
