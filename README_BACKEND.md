# UniqueBrains Backend Setup

This document provides an overview of the backend architecture and setup process for the UniqueBrains learning platform.

## Architecture Overview

The UniqueBrains backend uses a **serverless architecture** built on:

- **Supabase**: PostgreSQL database, authentication, storage, and realtime
- **Vercel**: Hosting and edge functions
- **Stripe**: Payment processing
- **Cloudinary**: Image optimization and CDN
- **Zoom**: Video conferencing
- **Resend/SendGrid**: Email notifications

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- A Supabase account (free tier available)

### 2. Initial Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Follow the Supabase setup guide
# See SUPABASE_SETUP.md for detailed instructions
```

### 3. Configure Supabase

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and API keys to `.env`
4. Run the verification script:

```bash
npm run verify-supabase
```

### 4. Next Steps

Once Supabase is configured, proceed with:

1. **Task 2**: Create Database Schema
2. **Task 3**: Implement Row Level Security
3. **Task 4**: Set up Authentication
4. **Task 5**: Set up File Storage

See `.kiro/specs/backend-architecture/tasks.md` for the complete implementation plan.

## Project Structure

```
uniquebrains/
├── src/
│   ├── lib/
│   │   └── supabase.js          # Supabase client configuration
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   └── utils/                   # Utility functions
├── scripts/
│   └── verify-supabase-setup.js # Setup verification script
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
├── SUPABASE_SETUP.md           # Detailed Supabase setup guide
└── README_BACKEND.md           # This file
```

## Environment Variables

### Required (Supabase)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Optional (Configure Later)

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

# Zoom
ZOOM_API_KEY=your_zoom_key
ZOOM_API_SECRET=your_zoom_secret

# Email
RESEND_API_KEY=re_xxxxx
```

## Development Workflow

### Local Development

```bash
# Start the development server
npm run dev

# Verify Supabase connection
npm run verify-supabase
```

### Using Supabase CLI (Optional)

For advanced local development with Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Start local Supabase (requires Docker)
supabase start

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts
```

## Database Schema

The database schema includes the following core tables:

- **profiles**: User information and roles
- **courses**: Course catalog
- **enrollments**: Student-course relationships
- **sessions**: Scheduled class sessions
- **homework**: Assignments
- **submissions**: Student homework submissions
- **resources**: Course materials
- **messages**: Chat and communication
- **reviews**: Course ratings
- **payments**: Transaction records

See `.kiro/specs/backend-architecture/design.md` for detailed schema design.

## Security

### Best Practices

- ✅ Never commit `.env` file to git
- ✅ Use `VITE_` prefix only for frontend-safe variables
- ✅ Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-side only)
- ✅ Enable Row Level Security (RLS) on all tables
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Validate all user input

### Row Level Security (RLS)

All database tables will have RLS policies that:
- Allow users to read their own data
- Allow instructors to manage their courses
- Allow students to access enrolled courses
- Prevent unauthorized access

## Testing

### Verify Setup

```bash
# Run setup verification
npm run verify-supabase
```

### Test Database Connection

```javascript
import { supabase } from './src/lib/supabase'

// Test query
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1)

if (error) console.error('Error:', error)
else console.log('Success:', data)
```

## Deployment

### Staging

```bash
# Deploy to Vercel staging
vercel

# Run migrations on staging database
supabase db push --db-url your-staging-db-url
```

### Production

```bash
# Deploy to Vercel production
vercel --prod

# Run migrations on production database
supabase db push --db-url your-production-db-url
```

## Monitoring

Once deployed, monitor your backend using:

- **Supabase Dashboard**: Database metrics, API usage
- **Vercel Analytics**: Performance metrics
- **Sentry**: Error tracking (to be configured)

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to Supabase

**Solutions**:
- Verify API keys in `.env` are correct
- Check that Supabase project is not paused
- Ensure internet connection is working
- Run `npm run verify-supabase` for diagnostics

### Environment Variables Not Loading

**Problem**: Environment variables are undefined

**Solutions**:
- Restart the development server after changing `.env`
- Ensure variables start with `VITE_` for frontend access
- Check that `.env` file is in the project root

### Database Errors

**Problem**: Database queries fail

**Solutions**:
- Verify tables exist in Supabase dashboard
- Check RLS policies are configured correctly
- Ensure user is authenticated for protected queries
- Review error messages in browser console

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Backend Architecture Spec](.kiro/specs/backend-architecture/design.md)
- [Implementation Tasks](.kiro/specs/backend-architecture/tasks.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the detailed setup guide in `SUPABASE_SETUP.md`
3. Consult the backend design document
4. Check Supabase status at [status.supabase.com](https://status.supabase.com)

## Next Steps

After completing this setup:

1. ✅ **Task 1 Complete**: Supabase project configured
2. ⏭️ **Task 2**: Create database schema
3. ⏭️ **Task 3**: Implement Row Level Security
4. ⏭️ **Task 4**: Set up authentication
5. ⏭️ **Task 5**: Configure file storage

See the full implementation plan in `.kiro/specs/backend-architecture/tasks.md`.
