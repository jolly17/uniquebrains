# Database Migrations

This directory contains all database migrations for the UniqueBrains platform.

---

## 📋 Migration Files

### Core Schema (Applied ✅)
1. **001_create_core_tables.sql** - Core tables (profiles, courses, enrollments, sessions) with RLS
2. **002_create_content_tables.sql** - Content tables (homework, submissions, resources, messages) with RLS
3. **003_create_supporting_tables.sql** - Supporting tables (reviews, payments, notifications) with RLS
4. **004_create_additional_indexes.sql** - Performance optimization indexes
5. **005_add_missing_rls_policies.sql** - Additional RLS policies for complete security coverage

### Schema Updates (Applied ✅)
6. **006_fix_rls_infinite_recursion.sql** - Fixed RLS policy recursion issues
7. **007_update_sessions_for_manual_meeting_links.sql** - Added meeting link fields
8. **008_create_storage_buckets.sql** - Created storage buckets
9. **009_add_neurodiversity_profile.sql** - Added neurodiversity profile fields
10. **010_add_student_fields.sql** - Added student-specific fields

### Student Profile System (Applied ✅)
11. **011_create_students_table.sql** - Created students table
12. **011_fix_student_profiles.sql** - Fixed student profile structure
13. **012_update_enrollments_for_students.sql** - Updated enrollments for students
14. **013_fix_existing_students_table.sql** - Fixed existing students table
15. **014_fix_enrollments_for_students.sql** - Fixed enrollments for students
16. **016_final_students_setup.sql** - Final students setup
17. **017_fix_students_rls.sql** - Fixed students RLS policies
18. **018_fix_rls_recursion.sql** - Fixed RLS recursion
19. **019_complete_rls_reset.sql** - Complete RLS reset

### Frontend-Backend Alignment (Applied ✅)
20. **020_fix_frontend_backend_alignment.sql** - Fixed frontend-backend alignment
21. **021_fix_homework_submissions_alignment.sql** - Fixed homework submissions alignment

### RLS Policy Fixes (Applied ✅)
22. **022_fix_courses_policy_recursion.sql** - Fixed courses policy recursion
23. **023_complete_courses_policy_fix.sql** - Complete courses policy fix
24. **024_emergency_policy_fix.sql** - Emergency policy fix
25. **025_fix_resources_table_schema.sql** - Fixed resources table schema
26. **026_restore_courses_rls_properly.sql** - Restored courses RLS properly
27. **027_fix_rls_with_correct_syntax.sql** - Fixed RLS with correct syntax
28. **030_complete_rls_setup.sql** - Complete RLS setup
29. **031_fix_rls_courses_only.sql** - Fixed RLS courses only
30. **032_simple_rls_fix.sql** - Simple RLS fix

### Security & Functions (Applied ✅)
31. **033_fix_view_security_definer.sql** - Fixed view security definer
32. **034_fix_security_warnings.sql** - Fixed security warnings
33. **035_enable_password_protection.sql** - Enabled password protection
34. **036_fix_function_conflicts.sql** - Fixed function conflicts
35. **037_fix_only_critical_function.sql** - Fixed only critical function
36. **038_add_missing_course_date_fields.sql** - Added missing course date fields

### Storage Policies (Pending ⏳)
39. **039_create_storage_policies.sql** - Storage bucket policies
   - Profiles bucket policies
   - Courses bucket policies
   - Homework bucket policies

---

## 📊 Migration Status

| Category | Count | Status |
|----------|-------|--------|
| Core Schema | 5 | ✅ Applied |
| Schema Updates | 5 | ✅ Applied |
| Student System | 9 | ✅ Applied |
| Alignment Fixes | 2 | ✅ Applied |
| RLS Fixes | 11 | ✅ Applied |
| Security | 6 | ✅ Applied |
| Storage | 1 | ⏳ Pending |

**Total**: 38 applied, 1 pending

---

## ⚠️ Note on Migration Numbers

Some migration numbers are skipped (e.g., 015, 028, 029) due to temporary/test migrations that were removed during development. This is normal and doesn't affect the migration sequence.

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
