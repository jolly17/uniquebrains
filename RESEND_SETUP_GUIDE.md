# Resend Email Setup Guide for UniqueBrains

## Overview
This guide will help you set up Resend for automated email notifications with your custom domain (uniquebrains.org).

---

## Step 1: Create Resend Account

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email address

---

## Step 2: Get API Key

1. Go to Resend Dashboard → API Keys
2. Click "Create API Key"
3. Name it: "UniqueBrains Production"
4. Copy the API key (starts with `re_`)
5. **Save this key securely** - you'll need it for Supabase

---

## Step 3: Add Custom Domain

1. In Resend Dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter: `uniquebrains.org`
4. Resend will provide DNS records to add

### DNS Records to Add (Example - Resend will give you specific values):

You'll need to add these records to your domain registrar (where you bought uniquebrains.org):

**SPF Record (TXT):**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

**DKIM Records (TXT):**
```
Type: TXT
Name: resend._domainkey
Value: [Resend will provide this]
```

**DMARC Record (TXT):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@uniquebrains.org
```

**MX Record (if using Resend for receiving):**
```
Type: MX
Name: @
Value: [Resend will provide this]
Priority: 10
```

### How to Add DNS Records:

1. Log in to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
2. Find DNS settings or DNS management
3. Add each record exactly as Resend provides
4. Wait 24-48 hours for DNS propagation (usually faster)
5. Return to Resend and click "Verify Domain"

---

## Step 4: Configure Supabase Environment Variables

1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add environment variable:
   - Name: `RESEND_API_KEY`
   - Value: [Your Resend API key from Step 2]

---

## Step 5: Test Email Sending

Once DNS is verified and Supabase is configured, we'll test with:
- Enrollment confirmation emails
- Instructor notification emails

---

## Email Addresses We'll Use:

- **From Address**: `notifications@uniquebrains.org`
- **Reply-To**: `hello@uniquebrains.org`
- **Support**: `hello@uniquebrains.org`

---

## Troubleshooting:

### DNS Not Verifying?
- Wait 24-48 hours for propagation
- Use https://mxtoolbox.com to check DNS records
- Ensure records are added exactly as Resend provides

### Emails Going to Spam?
- Ensure SPF, DKIM, and DMARC are all verified
- Start with low volume (don't send 100s of emails immediately)
- Ask recipients to mark as "Not Spam"

### API Key Not Working?
- Ensure you copied the full key (starts with `re_`)
- Check that it's added to Supabase environment variables
- Verify the key hasn't been revoked in Resend dashboard

---

## Next Steps:

Once you complete Steps 1-4, let me know and I'll:
1. Create the Supabase Edge Function for sending emails
2. Set up database triggers for enrollment events
3. Create beautiful email templates
4. Test the entire system

---

**Status Checklist:**
- [ ] Resend account created
- [ ] API key obtained
- [ ] Domain added to Resend
- [ ] DNS records added to domain registrar
- [ ] DNS verified in Resend (may take 24-48 hours)
- [ ] API key added to Supabase environment variables
- [ ] Ready for Edge Function setup

