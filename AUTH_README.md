# UniqueBrains Authentication System

Complete authentication system using Supabase Auth with email, OAuth, and comprehensive security features.

## 🚀 Quick Start

### 1. Configure Supabase Dashboard

Follow detailed instructions in:
- **Email & Sessions**: `supabase/AUTH_CONFIGURATION.md`
- **OAuth (Google/GitHub)**: `supabase/OAUTH_CONFIGURATION.md`

### 2. Set Up Google Workspace SMTP

Configure in Supabase Dashboard → Project Settings → Auth → SMTP Settings:
- **Email**: hello@uniquebrains.org
- **Host**: smtp.gmail.com
- **Port**: 587
- Create App Password in Google Workspace

### 3. Verify Configuration

```bash
npm run verify-auth
```

## 📚 Documentation

- **Setup Guide**: `supabase/AUTH_CONFIGURATION.md`
- **OAuth Guide**: `supabase/OAUTH_CONFIGURATION.md`
- **Completion Summary**: `supabase/AUTH_SETUP_COMPLETE.md`
- **Code Examples**: `src/lib/auth.examples.js`

## 🔧 Usage

### Sign Up
```javascript
import { signUp } from './lib/auth'

const result = await signUp({
  email: 'user@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe',
  role: 'student'
})
```

### Sign In
```javascript
import { signIn } from './lib/auth'

const result = await signIn('user@example.com', 'SecurePass123!')
```

### OAuth
```javascript
import { OAuthButton } from './components/OAuthButton'

<OAuthButton provider="google">
  Continue with Google
</OAuthButton>
```

## ✅ Features

- ✅ Email authentication with verification
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Password reset
- ✅ Role-based access control (student, instructor, parent, admin)
- ✅ JWT tokens (24-hour expiry)
- ✅ Session management
- ✅ Rate limiting
- ✅ PKCE flow for OAuth
- ✅ Custom email templates

## 🔐 Security

- Password minimum 8 characters
- Email verification required
- JWT tokens with automatic refresh
- HTTPS enforcement
- Rate limiting (5 attempts per hour)
- Bcrypt password hashing (10 rounds)
- Session timeout (24 hours)

## 📁 Key Files

### Helper Functions
- `src/lib/auth.js` - All auth functions
- `src/lib/auth.examples.js` - Usage examples

### Components
- `src/components/OAuthButton.jsx` - OAuth sign-in button
- `src/pages/AuthCallback.jsx` - OAuth callback handler
- `src/context/AuthContext.jsx` - Auth state management

### Configuration
- `supabase/AUTH_CONFIGURATION.md` - Email & session setup
- `supabase/OAUTH_CONFIGURATION.md` - OAuth setup
- `scripts/verify-auth-config.js` - Verification script

## 🧪 Testing

Test all authentication flows:
- [ ] Email sign up
- [ ] Email verification
- [ ] Email sign in
- [ ] Password reset
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Sign out
- [ ] Session expiration

## 📞 Support

Questions? Contact hello@uniquebrains.org
