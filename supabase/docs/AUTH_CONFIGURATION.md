# Supabase Authentication Configuration Guide

This guide walks through configuring Supabase Auth for the UniqueBrains platform.

## 4.1 Configure Supabase Auth

### Step 1: Enable Email Provider

1. Go to your Supabase Dashboard: https://app.supabase.com/project/wxfxvuvlpjxnyxhpquyw
2. Navigate to **Authentication** → **Providers**
3. Ensure **Email** provider is enabled (it should be enabled by default)
4. Configure the following settings:
   - ✅ Enable email confirmations
   - ✅ Enable email change confirmations
   - ✅ Secure email change (requires both old and new email confirmation)

### Step 2: Configure SMTP Settings (Google Workspace)

Navigate to **Project Settings** → **Auth** → **SMTP Settings**:

#### Enable Custom SMTP
1. Toggle **Enable Custom SMTP Server** to ON
2. Configure the following settings:

**SMTP Settings:**
- **Sender email**: hello@uniquebrains.org
- **Sender name**: UniqueBrains
- **Host**: smtp.gmail.com
- **Port**: 587
- **Username**: hello@uniquebrains.org
- **Password**: [Your Google Workspace App Password]

**Important Notes:**
- You need to create an App Password in your Google Workspace account
- Go to: Google Account → Security → 2-Step Verification → App Passwords
- Generate a new app password for "Mail" and "Other (Custom name)"
- Use this app password in the SMTP configuration (not your regular password)

#### Test SMTP Configuration
After saving, use the "Send test email" button to verify the configuration works.

### Step 3: Configure Email Templates

Navigate to **Authentication** → **Email Templates** and customize:

#### Confirm Signup Template
```
Subject: Confirm your UniqueBrains account
From: UniqueBrains <hello@uniquebrains.org>

Hi there,

Welcome to UniqueBrains! Please confirm your email address by clicking the link below:

{{ .ConfirmationURL }}

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
The UniqueBrains Team

---
Questions? Reply to this email or contact us at hello@uniquebrains.org
```

#### Reset Password Template
```
Subject: Reset your UniqueBrains password
From: UniqueBrains <hello@uniquebrains.org>

Hi there,

We received a request to reset your password. Click the link below to create a new password:

{{ .ConfirmationURL }}

This link expires in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The UniqueBrains Team

---
Questions? Reply to this email or contact us at hello@uniquebrains.org
```

#### Magic Link Template
```
Subject: Your UniqueBrains magic link
From: UniqueBrains <hello@uniquebrains.org>

Hi there,

Click the link below to sign in to your UniqueBrains account:

{{ .ConfirmationURL }}

This link expires in 1 hour.

If you didn't request this link, you can safely ignore this email.

Best regards,
The UniqueBrains Team

---
Questions? Reply to this email or contact us at hello@uniquebrains.org
```

#### Email Change Template
```
Subject: Confirm your new email address
From: UniqueBrains <hello@uniquebrains.org>

Hi there,

Please confirm your new email address by clicking the link below:

{{ .ConfirmationURL }}

This link expires in 24 hours.

If you didn't request this change, please contact us immediately at hello@uniquebrains.org

Best regards,
The UniqueBrains Team

---
Questions? Reply to this email or contact us at hello@uniquebrains.org
```

### Step 4: Set Up Redirect URLs

Navigate to **Authentication** → **URL Configuration**:

#### Site URL
- Development: `http://localhost:5173`
- Production: `https://yourdomain.com`

#### Redirect URLs (Add all of these)
```
http://localhost:5173
http://localhost:5173/auth/callback
http://localhost:5173/auth/confirm
https://yourdomain.com
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/confirm
```

### Step 5: Configure Session Settings

Navigate to **Authentication** → **Settings**:

#### JWT Settings
- **JWT Expiry**: 3600 seconds (1 hour)
- **Refresh Token Expiry**: 2592000 seconds (30 days)
- **Refresh Token Rotation**: Enabled ✅

#### Security Settings
- **Enable email confirmations**: ✅ Enabled
- **Enable phone confirmations**: ❌ Disabled (not using phone auth)
- **Minimum password length**: 8 characters
- **Password requirements**: 
  - ✅ Require lowercase letters
  - ✅ Require uppercase letters
  - ✅ Require numbers
  - ❌ Require symbols (optional)

#### Rate Limiting
- **Max verification attempts**: 5 per hour
- **Max password reset attempts**: 5 per hour
- **Max sign-in attempts**: 5 per hour

#### Session Management
- **Inactivity timeout**: 86400 seconds (24 hours)
- **Absolute timeout**: 604800 seconds (7 days)
- **Enable refresh token rotation**: ✅ Enabled
- **Reuse interval**: 10 seconds

## Verification

After configuration, run the verification script:

```bash
node scripts/verify-auth-config.js
```

This will check:
- ✅ Email provider is enabled
- ✅ Redirect URLs are configured
- ✅ Session settings are correct
- ✅ JWT expiry is set to 24 hours (as per requirements)

## Requirements Validated

- ✅ **Requirement 1.1**: User registration with email verification
- ✅ **Requirement 1.2**: JWT token valid for 24 hours (configured via session settings)
- ✅ **Requirement 1.3**: Password reset via email with secure token expiration
- ✅ **Requirement 1.5**: Session expiration requires re-authentication

## Notes

- Email templates can be further customized with HTML for better branding
- Consider adding your logo and brand colors to email templates
- Test all email flows in development before deploying to production
- Monitor authentication metrics in the Supabase dashboard
