# Admin Role Setup Guide

This guide explains how to assign admin roles to users in UniqueBrains.

## Prerequisites

- Access to Supabase dashboard
- User must already have an account (registered through the app)

## Method 1: Supabase Dashboard (Recommended)

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Table Editor** in the left sidebar
4. Click on the **profiles** table
5. Find the user you want to make admin (search by email)
6. Click on the row to edit
7. Change the `role` field from `'student'` or `'instructor'` to `'admin'`
8. Click **Save**
9. User needs to log out and log back in for changes to take effect

## Method 2: SQL Query

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this query (replace with actual email):

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

3. Click **Run**
4. User needs to log out and log back in

## Method 3: Development Utility (Dev Only)

For development/testing, you can use the browser console:

1. Log in to the app as any user
2. Open browser console (F12)
3. Run:
```javascript
makeAdmin('user-email@example.com')
```
4. Refresh the page

**Note:** This method only works in development mode and requires RLS policies to allow profile updates.

## Verifying Admin Access

After assigning admin role:

1. User should log out and log back in
2. They should see an "Admin" link in the main navigation
3. Clicking it takes them to `/admin` dashboard
4. They can now manage courses, instructors, and students

## Security Notes

- Admin role grants full access to all platform data
- Only assign admin role to trusted users
- Consider creating a separate admin account (not your personal account)
- In production, always use Supabase Dashboard method (Method 1)

## Troubleshooting

**Admin link not showing:**
- Clear browser cache and cookies
- Log out completely and log back in
- Verify role is 'admin' in profiles table (not 'Admin' or 'ADMIN')

**Can't access admin dashboard:**
- Check that AdminRoute component is working
- Verify user's profile.role === 'admin'
- Check browser console for errors

**Changes not taking effect:**
- User must log out and log back in
- AuthContext caches profile data on login
- Refreshing page may not be enough

## Future Enhancements

Consider implementing:
- Admin invitation system
- Role management page within admin dashboard
- Audit log for admin actions
- Multi-level admin roles (super admin, moderator, etc.)
