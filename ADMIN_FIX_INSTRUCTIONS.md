# Admin Dashboard Fix Instructions

## Problem
The admin dashboard edit/delete functionality is not working because the Row Level Security (RLS) policies need to be updated to properly recognize admin users.

## Solution
A new migration file has been created that:
1. Creates a helper function `is_admin()` to check if a user has admin role
2. Updates all RLS policies to use this function
3. Adds `WITH CHECK` clauses for write operations

## How to Apply the Fix

### Option 1: Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/071_fix_admin_policies.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. You should see "Success. No rows returned"

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project root
cd /path/to/uniquebrains

# Apply the migration
supabase db push
```

### Option 3: Manual SQL Execution

Copy and paste the SQL from `supabase/migrations/071_fix_admin_policies.sql` directly into your Supabase SQL editor.

## Verification

After applying the migration, test the admin dashboard:

1. Log in as an admin user
2. Go to `/admin/courses`
3. Try to edit a course - it should work now
4. Try to delete a course - it should work now

You can also verify the function exists by running this query in SQL Editor:

```sql
-- Check if the function exists
SELECT is_admin(auth.uid());
-- Should return true if you're logged in as admin

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE policyname LIKE '%admin%';
```

## What Changed

### Before
Admin policies used a recursive query that could fail:
```sql
EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
```

### After
Admin policies use a SECURITY DEFINER function:
```sql
is_admin(auth.uid())
```

This function:
- Runs with elevated privileges (SECURITY DEFINER)
- Avoids RLS recursion issues
- Is cached for better performance (STABLE)
- Works consistently across all tables

## Troubleshooting

**Migration fails with "policy already exists":**
- The migration includes `DROP POLICY IF EXISTS` statements
- If it still fails, manually drop the policies first

**Still can't edit/delete after migration:**
1. Verify you're logged in as admin: Check `profiles` table, your `role` should be `'admin'`
2. Clear browser cache and cookies
3. Log out and log back in
4. Check browser console for errors
5. Verify the migration ran successfully:
   ```sql
   SELECT is_admin(auth.uid());
   ```

**Function doesn't exist error:**
- Make sure the migration ran completely
- Check if the function exists:
  ```sql
  SELECT proname FROM pg_proc WHERE proname = 'is_admin';
  ```

## Security Notes

- The `is_admin()` function uses `SECURITY DEFINER` which means it runs with the privileges of the function owner (postgres)
- This is safe because it only checks the role field and doesn't expose sensitive data
- The function is marked as `STABLE` which means it can be cached within a single query for better performance

## Next Steps

After applying this fix:
1. Test all admin dashboard functionality
2. Verify edit operations work on all pages (courses, instructors, students)
3. Verify delete operations work with proper confirmation
4. Check that non-admin users still can't access admin routes

## Need Help?

If you encounter issues:
1. Check the Supabase logs in Dashboard → Logs
2. Check browser console for JavaScript errors
3. Verify your user has `role = 'admin'` in the profiles table
4. Try the verification queries above
