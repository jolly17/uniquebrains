# Database Migrations

This directory contains all database migrations for the UniqueBrains platform.

## Migration Files

### Applied Migrations
1. **001_create_core_tables.sql** - Core tables (profiles, courses, enrollments, sessions) with RLS
2. **002_create_content_tables.sql** - Content tables (homework, submissions, resources, messages) with RLS
3. **003_create_supporting_tables.sql** - Supporting tables (reviews, payments, notifications) with RLS
4. **004_create_additional_indexes.sql** - Performance optimization indexes

### New Migration (To Be Applied)
5. **005_add_missing_rls_policies.sql** - Additional RLS policies for complete security coverage
   - Admin full access policies for all tables
   - Student access to enrolled courses (even if unpublished)

## How to Apply Migrations

### Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply all pending migrations
supabase db push

# Or apply a specific migration
supabase db push --file supabase/migrations/005_add_missing_rls_policies.sql
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `005_add_missing_rls_policies.sql`
4. Paste into the SQL editor
5. Click **Run** to execute

### Using psql

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i supabase/migrations/005_add_missing_rls_policies.sql
```

## Verifying RLS Policies

After applying migrations, verify RLS policies are active:

```sql
-- Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- View all policies for a specific table
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

## Testing RLS Policies

Test policies by impersonating different users:

```sql
-- Test as a student
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'student-uuid-here';
SELECT * FROM courses; -- Should only see published courses and enrolled courses
RESET ROLE;

-- Test as an instructor
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'instructor-uuid-here';
SELECT * FROM courses; -- Should see own courses
RESET ROLE;

-- Test as an admin
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'admin-uuid-here';
SELECT * FROM courses; -- Should see all courses
RESET ROLE;
```

## Migration Best Practices

1. **Always backup** before applying migrations to production
2. **Test migrations** in development/staging first
3. **Version control** all migration files
4. **Never modify** existing migration files after they've been applied
5. **Create new migrations** for schema changes
6. **Document** all changes in this README

## Rollback

If you need to rollback the latest migration:

```sql
-- Drop the policies added in 005_add_missing_rls_policies.sql
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Enrolled students can view their courses" ON courses;
DROP POLICY IF EXISTS "Admins have full access to enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins have full access to sessions" ON sessions;
DROP POLICY IF EXISTS "Admins have full access to homework" ON homework;
DROP POLICY IF EXISTS "Admins have full access to submissions" ON submissions;
DROP POLICY IF EXISTS "Admins have full access to resources" ON resources;
DROP POLICY IF EXISTS "Admins have full access to messages" ON messages;
DROP POLICY IF EXISTS "Admins have full access to reviews" ON reviews;
DROP POLICY IF EXISTS "Admins have full access to payments" ON payments;
DROP POLICY IF EXISTS "Admins have full access to notifications" ON notifications;
```

## Next Steps

After applying migration 005:
1. Test all RLS policies with different user roles
2. Verify admin users can access all data
3. Verify students can only access their enrolled courses
4. Review the comprehensive documentation in `RLS_POLICIES.md`
5. Proceed to Task 4: Set up Authentication

## Support

For issues or questions:
- Review `RLS_POLICIES.md` for complete policy documentation
- Check Supabase documentation: https://supabase.com/docs/guides/auth/row-level-security
- Review the design document: `.kiro/specs/backend-architecture/design.md`
