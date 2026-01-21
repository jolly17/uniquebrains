# Supabase Backend

This directory contains all Supabase-related files for the UniqueBrains platform backend.

---

## 📁 Directory Structure

```
supabase/
├── README.md (this file)
├── migrations/          ⭐ Database schema and migrations
│   ├── README.md
│   ├── 001-038_*.sql   (applied migrations)
│   └── 039_*.sql       (storage policies)
└── docs/               📚 Documentation
    ├── AUTH_CONFIGURATION.md
    ├── AUTH_SETUP_COMPLETE.md
    ├── OAUTH_CONFIGURATION.md
    ├── OAUTH_FLOW_DIAGRAM.md
    ├── OAUTH_SETUP_INSTRUCTIONS.md
    ├── RLS_POLICIES.md
    ├── SCHEMA_SUMMARY.md
    └── STORAGE_SETUP.md
```

---

## 🚀 Quick Start

### 1. Database Setup
All database migrations are in the `migrations/` folder. Apply them in order:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually in Supabase Dashboard → SQL Editor
# Copy and run each migration file in order
```

**See**: [migrations/README.md](./migrations/README.md) for detailed instructions

### 2. Authentication Setup
Configure authentication providers and settings:

**See**: [docs/AUTH_CONFIGURATION.md](./docs/AUTH_CONFIGURATION.md)

### 3. Storage Setup
Configure storage buckets and policies:

**See**: [docs/STORAGE_SETUP.md](./docs/STORAGE_SETUP.md)

---

## 📋 Migrations

### Core Migrations (Applied)
1. **001** - Core tables (profiles, courses, enrollments, sessions)
2. **002** - Content tables (homework, submissions, resources, messages)
3. **003** - Supporting tables (reviews, payments, notifications)
4. **004** - Additional indexes
5. **005** - Missing RLS policies
6. **006-038** - Various fixes and updates
7. **039** - Storage bucket policies

### Migration Status
- ✅ **Applied**: 001-038 (database schema, RLS policies, fixes)
- ⏳ **Pending**: 039 (storage policies - apply if using file storage)

**See**: [migrations/README.md](./migrations/README.md) for complete list and instructions

---

## 📚 Documentation

### Authentication
- **[AUTH_CONFIGURATION.md](./docs/AUTH_CONFIGURATION.md)** - Auth provider configuration
- **[AUTH_SETUP_COMPLETE.md](./docs/AUTH_SETUP_COMPLETE.md)** - Auth setup completion checklist
- **[OAUTH_CONFIGURATION.md](./docs/OAUTH_CONFIGURATION.md)** - OAuth provider setup
- **[OAUTH_FLOW_DIAGRAM.md](./docs/OAUTH_FLOW_DIAGRAM.md)** - OAuth flow diagrams
- **[OAUTH_SETUP_INSTRUCTIONS.md](./docs/OAUTH_SETUP_INSTRUCTIONS.md)** - Step-by-step OAuth setup

### Security
- **[RLS_POLICIES.md](./docs/RLS_POLICIES.md)** - Complete RLS policy documentation
  - All table policies
  - Security principles
  - Testing instructions

### Database
- **[SCHEMA_SUMMARY.md](./docs/SCHEMA_SUMMARY.md)** - Database schema overview
  - Table structures
  - Relationships
  - Indexes

### Storage
- **[STORAGE_SETUP.md](./docs/STORAGE_SETUP.md)** - Storage bucket configuration
  - Bucket creation
  - Policy setup
  - Usage examples

---

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ Enabled on all tables
- ✅ Role-based access control (Student, Instructor, Parent, Admin)
- ✅ Least privilege principle
- ✅ Comprehensive policy coverage

**See**: [docs/RLS_POLICIES.md](./docs/RLS_POLICIES.md)

### Storage Security
- ✅ Bucket-level policies
- ✅ User-specific access control
- ✅ Enrollment-based resource access
- ✅ File size limits (100MB max)

**See**: [migrations/039_create_storage_policies.sql](./migrations/039_create_storage_policies.sql)

### Authentication
- ✅ Email/password authentication
- ✅ OAuth providers (Google, GitHub)
- ✅ JWT token-based sessions
- ✅ Email verification
- ✅ Password reset

**See**: [docs/AUTH_CONFIGURATION.md](./docs/AUTH_CONFIGURATION.md)

---

## 🗄️ Database Schema

### Core Tables
- **profiles** - User profiles with roles
- **courses** - Course information
- **enrollments** - Student-course relationships
- **sessions** - Scheduled class sessions

### Content Tables
- **homework** - Assignments
- **submissions** - Student homework submissions
- **resources** - Course materials
- **messages** - Chat messages

### Supporting Tables
- **reviews** - Course reviews and ratings
- **payments** - Payment transactions
- **notifications** - User notifications

**See**: [docs/SCHEMA_SUMMARY.md](./docs/SCHEMA_SUMMARY.md) for complete schema

---

## 🧪 Testing

### Test RLS Policies
```sql
-- Test as a specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'user-uuid-here';

-- Run your query
SELECT * FROM courses;

-- Reset
RESET ROLE;
```

### Verify RLS is Enabled
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Policy Count
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**See**: [docs/RLS_POLICIES.md](./docs/RLS_POLICIES.md) for more testing examples

---

## 🔧 Configuration

### Environment Variables
Required environment variables for your application:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Project Settings
- **Region**: Choose closest to your users
- **Database**: PostgreSQL 15+
- **Auth**: Email + OAuth providers enabled
- **Storage**: 3 buckets (profiles, courses, homework)

---

## 📊 Current Status

### Database
- ✅ Schema created and migrated
- ✅ RLS policies applied
- ✅ Indexes optimized
- ✅ Relationships configured

### Authentication
- ✅ Email/password enabled
- ✅ Google OAuth configured
- ✅ GitHub OAuth configured
- ✅ Email templates customized

### Storage
- ✅ Buckets created
- ⏳ Policies pending (migration 039)
- ✅ File upload working
- ✅ Size limits configured

### Realtime
- ✅ Broadcast channels configured
- ✅ Message broadcasting working
- ✅ Connection management implemented

---

## 🚦 Next Steps

### Immediate
1. Apply migration 039 (storage policies) if using file storage
2. Test all RLS policies with different user roles
3. Verify OAuth providers are working

### Short-term
1. Set up monitoring and alerts
2. Configure rate limiting
3. Enable CAPTCHA for sign-ups
4. Set up automated backups

### Long-term
1. Optimize query performance
2. Implement caching strategy
3. Add full-text search
4. Set up analytics

**See**: [../.kiro/specs/CONSOLIDATED_TASKS.md](../.kiro/specs/CONSOLIDATED_TASKS.md) for complete roadmap

---

## 📞 Support

### Documentation
- **Supabase Docs**: https://supabase.com/docs
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Storage Guide**: https://supabase.com/docs/guides/storage

### Project Documentation
- **Main README**: [../README.md](../README.md)
- **Features**: [../FEATURES.md](../FEATURES.md)
- **Troubleshooting**: [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- **Backend Setup**: [../BACKEND_SETUP.md](../BACKEND_SETUP.md)

### Specs
- **Consolidated Tasks**: [../.kiro/specs/CONSOLIDATED_TASKS.md](../.kiro/specs/CONSOLIDATED_TASKS.md)
- **Backend Architecture**: [../.kiro/specs/archive/backend-architecture/](../.kiro/specs/archive/backend-architecture/)

---

**Last Updated**: January 2026
**Status**: Production Ready (core features)
**Supabase Version**: Latest
