# Supabase Setup Checklist

Use this checklist to track your progress through Task 1: Set up Supabase Project.

## Pre-Setup

- [ ] Node.js 18+ installed
- [ ] npm package manager available
- [ ] Git configured
- [ ] Internet connection stable

## Supabase Account & Project

- [ ] Created Supabase account at [supabase.com](https://supabase.com)
- [ ] Verified email address
- [ ] Created new project named "uniquebrains" (or your preferred name)
- [ ] Selected appropriate region (closest to your users)
- [ ] Saved database password securely
- [ ] Waited for project provisioning (2-3 minutes)

## API Keys & Configuration

- [ ] Navigated to Settings → API in Supabase dashboard
- [ ] Copied Project URL
- [ ] Copied anon/public key
- [ ] Copied service_role key (keep secret!)
- [ ] Updated `.env` file with all three values
- [ ] Verified `.env` is in `.gitignore`

## Local Development Setup

- [ ] Installed dependencies: `npm install`
- [ ] Verified `@supabase/supabase-js` is installed
- [ ] Created `src/lib/supabase.js` client configuration
- [ ] Environment variables are properly formatted

## Verification

- [ ] Ran `npm run verify-supabase` successfully
- [ ] Connection test passed
- [ ] No missing required environment variables
- [ ] Reviewed optional services (Stripe, Cloudinary, etc.)

## Optional: Supabase CLI (Advanced)

- [ ] Installed Supabase CLI globally
- [ ] Logged in: `supabase login`
- [ ] Linked project: `supabase link --project-ref <ref>`
- [ ] Docker installed (for local Supabase)
- [ ] Started local instance: `supabase start`
- [ ] Verified local Studio UI at `localhost:54323`

## Documentation Review

- [ ] Read `SUPABASE_SETUP.md` guide
- [ ] Reviewed `README_BACKEND.md` overview
- [ ] Understood security best practices
- [ ] Familiar with project structure

## Security Checklist

- [ ] `.env` file is NOT committed to git
- [ ] Service role key is kept secret
- [ ] Database password is strong and saved
- [ ] HTTPS will be enforced in production
- [ ] Understand RLS will be implemented in Task 3

## Next Steps Preparation

- [ ] Reviewed Task 2: Create Database Schema
- [ ] Understand the database tables to be created
- [ ] Ready to implement RLS policies (Task 3)
- [ ] Familiar with authentication requirements (Task 4)

## Completion Criteria

✅ **Task 1 is complete when:**

1. Supabase project is created and active
2. All API keys are saved in `.env`
3. `npm run verify-supabase` passes successfully
4. Supabase client is configured in `src/lib/supabase.js`
5. Local development environment is ready

## Troubleshooting Reference

If you encounter issues, refer to:
- `SUPABASE_SETUP.md` - Detailed setup instructions
- `README_BACKEND.md` - Troubleshooting section
- [Supabase Status](https://status.supabase.com/) - Service status
- [Supabase Discord](https://discord.supabase.com/) - Community support

## Time Estimate

- Account creation: 5 minutes
- Project setup: 10 minutes
- Environment configuration: 5 minutes
- Verification: 5 minutes
- **Total: ~25 minutes**

---

**Status**: ⏳ In Progress

Once all items are checked, mark Task 1 as complete and proceed to Task 2!
