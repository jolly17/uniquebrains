# Supabase Setup Guide

This guide will walk you through setting up your Supabase project for the UniqueBrains platform.

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign Up"
3. Sign up using GitHub, Google, or email
4. Verify your email address if required

## Step 2: Create New Project

1. Once logged in, click "New Project"
2. Fill in the project details:
   - **Name**: `uniquebrains` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users (e.g., `us-east-1` for US East Coast)
   - **Pricing Plan**: Start with the Free tier
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be provisioned

## Step 3: Get API Keys

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. You'll find the following credentials:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: This is safe to use in the browser
   - **service_role key**: Keep this secret! Only use on the server

## Step 4: Configure Environment Variables

1. Open the `.env` file in your project root
2. Copy the values from Supabase:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. Save the file

## Step 5: Install Supabase Client

The Supabase JavaScript client should already be in your package.json. If not, install it:

```bash
npm install @supabase/supabase-js
```

## Step 6: Set Up Local Development (Optional but Recommended)

For local development with Supabase CLI:

### Install Supabase CLI

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Or using npm:**
```bash
npm install -g supabase
```

### Initialize Supabase Locally

```bash
# Login to Supabase
supabase login

# Link to your remote project
supabase link --project-ref your-project-ref

# Start local Supabase (Docker required)
supabase start
```

This will start:
- PostgreSQL database on `localhost:54322`
- API server on `localhost:54321`
- Studio UI on `localhost:54323`

### Local Development URLs

When running locally, update your `.env.local`:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
```

## Step 7: Verify Connection

Create a test file to verify the connection:

```javascript
// test-supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  const { data, error } = await supabase.from('_test').select('*').limit(1)
  
  if (error && error.code !== 'PGRST116') {
    console.error('Connection error:', error)
  } else {
    console.log('✅ Successfully connected to Supabase!')
  }
}

testConnection()
```

## Step 8: Configure Project Settings

In the Supabase Dashboard:

1. **Authentication Settings** (Settings → Authentication):
   - Enable Email provider
   - Set Site URL: `http://localhost:5173` (development) or your production URL
   - Add Redirect URLs for OAuth providers
   - Configure email templates

2. **Database Settings** (Settings → Database):
   - Note your connection string for direct database access if needed
   - Connection pooling is enabled by default

3. **Storage Settings** (Storage):
   - Create buckets in the next task (Task 5)

4. **API Settings** (Settings → API):
   - Review rate limiting settings
   - Note the PostgREST endpoint

## Step 9: Security Checklist

- [ ] Database password is strong and saved securely
- [ ] `.env` file is in `.gitignore`
- [ ] Service role key is never exposed to the frontend
- [ ] Project region is optimal for your users
- [ ] Email verification is enabled
- [ ] RLS (Row Level Security) will be enabled on all tables (Task 3)

## Next Steps

Now that your Supabase project is set up, you can proceed to:
- **Task 2**: Create Database Schema
- **Task 3**: Implement Row Level Security
- **Task 4**: Set up Authentication

## Troubleshooting

### Connection Issues
- Verify your API keys are correct
- Check that your project is not paused (free tier projects pause after 1 week of inactivity)
- Ensure you're using the correct project URL

### Local Development Issues
- Make sure Docker is running for `supabase start`
- Check that ports 54321-54323 are not in use
- Run `supabase status` to see if services are running

### API Rate Limiting
- Free tier: 50,000 monthly active users
- If you hit limits, consider upgrading to Pro tier

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter issues:
- Check [Supabase Status](https://status.supabase.com/)
- Visit [Supabase Discord](https://discord.supabase.com/)
- Review [GitHub Discussions](https://github.com/supabase/supabase/discussions)
