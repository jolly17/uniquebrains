# Troubleshooting Guide

Common issues and solutions for the UniqueBrains platform.

---

## Table of Contents
1. [Authentication Issues](#authentication-issues)
2. [Course Management Issues](#course-management-issues)
3. [Real-time Messaging Issues](#real-time-messaging-issues)
4. [Database & API Issues](#database--api-issues)
5. [Deployment Issues](#deployment-issues)
6. [Performance Issues](#performance-issues)

---

## Authentication Issues

### Issue: Cannot Sign Up / Login

**Symptoms:**
- Error message: "Authentication failed"
- Stuck on login page
- No redirect after login

**Solutions:**

1. **Check Supabase Configuration:**
   ```javascript
   // Verify .env file has correct values
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Check Email Confirmation Settings:**
   - Go to Supabase Dashboard → Authentication → Settings
   - Check if "Enable email confirmations" is enabled
   - For development, disable email confirmation

3. **Clear Browser Cache:**
   - Clear cookies and local storage
   - Try incognito/private mode
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for error messages
   - Check Network tab for failed requests

---

### Issue: "Unauthorized" Error After Login

**Symptoms:**
- Successfully logged in but can't access features
- Error: "Unauthorized: You do not have access"

**Solutions:**

1. **Check User Role:**
   ```sql
   -- In Supabase SQL Editor
   SELECT id, email, role FROM profiles WHERE email = 'your-email@test.com';
   ```

2. **Verify Profile Creation:**
   - Profile should be created automatically on signup
   - Check if `profiles` table has entry for user
   - Role should be 'instructor' or 'student'

3. **Check RLS Policies:**
   - Ensure Row Level Security policies are enabled
   - Verify policies allow user to read their own profile

---

## Course Management Issues

### Issue: "View" and "Manage Course" Buttons Not Working

**Symptoms:**
- Clicking buttons shows "Course not found"
- Blank page or loading forever
- Error in console: "Failed to fetch course"

**Solutions:**

1. **Verify Course Exists in Database:**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM courses WHERE instructor_id = 'your-user-id';
   ```

2. **Check Course Status:**
   - Course must have `status = 'published'`
   - Check `is_published = true`

3. **Verify API Functions:**
   - Ensure `api.courses.getById()` exists
   - Check `src/services/courseService.js` has `getCourseById` function

4. **Clear Cache and Rebuild:**
   ```bash
   npm run build
   ```

---

### Issue: Courses Not Appearing in Marketplace

**Symptoms:**
- Created course doesn't show in marketplace
- Marketplace shows "No courses found"
- Error: "Failed to load courses"

**Solutions:**

1. **Check Course Status:**
   - Only published courses appear in marketplace
   - Verify `status = 'published'` and `is_published = true`

2. **Verify API Function:**
   - Ensure `api.courses.getAll()` exists
   - Check it filters by published status

3. **Check RLS Policies:**
   ```sql
   -- Courses table should allow public read for published courses
   CREATE POLICY "Public courses are viewable by everyone"
   ON courses FOR SELECT
   USING (status = 'published' AND is_published = true);
   ```

4. **Check Browser Console:**
   - Look for API errors
   - Verify network requests succeed

---

## Real-time Messaging Issues

### Issue: Messages Not Appearing in Real-time

**Symptoms:**
- Messages only appear after page refresh
- Connection status shows "🔴 Disconnected"
- Error: "Realtime is not enabled"

**Solutions:**

1. **Enable Realtime in Supabase:**
   - Go to Supabase Dashboard → Settings → API
   - Ensure Realtime is enabled
   - Check WebSocket connections are allowed

2. **Check Channel Subscription:**
   ```javascript
   // In browser console
   console.log('Channel status:', channel.state)
   // Should show 'SUBSCRIBED'
   ```

3. **Verify Broadcast Configuration:**
   - Using Broadcast (not postgres_changes)
   - No database replication required
   - Check channel name matches: `course:${courseId}:messages`

4. **Check Firewall/Network:**
   - WebSocket connections may be blocked
   - Try different network
   - Check browser console for WebSocket errors

5. **Clear Channels and Reconnect:**
   ```javascript
   // In browser console
   await supabase.removeAllChannels()
   // Then refresh page
   ```

---

### Issue: "Cookie __cf_bm has been rejected"

**Symptoms:**
- Warning in console about Cloudflare cookie
- Doesn't affect functionality

**Solution:**
- This is a harmless Cloudflare bot management cookie
- Can be safely ignored
- Doesn't impact real-time features

---

### Issue: Presence Channel Closes Immediately

**Symptoms:**
- Presence channel status: CLOSED
- Online user count shows 0
- Error: "Channel limit reached"

**Solutions:**

1. **Check Channel Limits:**
   - Supabase Free tier: 200 concurrent connections
   - Each presence channel counts as 1 connection
   - Reduce number of active channels

2. **Disable Presence Temporarily:**
   - Focus on message channels first
   - Add presence later when needed

3. **Upgrade Supabase Plan:**
   - Pro plan: 500+ concurrent connections

---

## Database & API Issues

### Issue: "Failed to fetch" or Network Errors

**Symptoms:**
- API calls fail
- Error: "Failed to fetch"
- Network tab shows failed requests

**Solutions:**

1. **Check Supabase Status:**
   - Visit status.supabase.com
   - Verify service is operational

2. **Verify Environment Variables:**
   ```bash
   # Check .env file
   cat .env
   ```

3. **Check CORS Settings:**
   - Supabase should allow your domain
   - Check Supabase Dashboard → Settings → API

4. **Verify API Key:**
   - Use anon key (not service role key)
   - Regenerate key if compromised

---

### Issue: RLS Policy Errors

**Symptoms:**
- Error: "new row violates row-level security policy"
- Cannot insert/update/delete data
- Permission denied errors

**Solutions:**

1. **Check RLS Policies:**
   ```sql
   -- View all policies
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

2. **Common Policy Patterns:**
   ```sql
   -- Allow users to read their own data
   CREATE POLICY "Users can view own data"
   ON table_name FOR SELECT
   USING (auth.uid() = user_id);
   
   -- Allow users to insert their own data
   CREATE POLICY "Users can insert own data"
   ON table_name FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   ```

3. **Disable RLS Temporarily (Development Only):**
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```

---

## Deployment Issues

### Issue: GitHub Pages Shows Blank Page

**Symptoms:**
- Deployed site shows blank white page
- Console error: "Failed to load resource"
- 404 errors for assets

**Solutions:**

1. **Check Base Path in vite.config.js:**
   ```javascript
   export default defineConfig({
     base: '/uniquebrains/', // Must match repo name
   })
   ```

2. **Verify Homepage in package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/uniquebrains"
   }
   ```

3. **Rebuild and Redeploy:**
   ```bash
   npm run build
   git add docs
   git commit -m "Fix deployment"
   git push
   ```

4. **Check GitHub Pages Settings:**
   - Repository → Settings → Pages
   - Source: gh-pages branch
   - Folder: / (root)

---

### Issue: Environment Variables Not Working on Deployment

**Symptoms:**
- App works locally but not on deployment
- Supabase connection fails
- Blank API responses

**Solutions:**

1. **Vite Environment Variables:**
   - Must start with `VITE_`
   - Example: `VITE_SUPABASE_URL`

2. **Build Time Variables:**
   - Environment variables are embedded at build time
   - Rebuild after changing .env:
     ```bash
     npm run build
     ```

3. **Check .env.example:**
   - Ensure all required variables are documented
   - Copy to .env and fill in values

---

## Performance Issues

### Issue: Slow Page Load Times

**Symptoms:**
- Pages take > 3 seconds to load
- Laggy interactions
- High memory usage

**Solutions:**

1. **Check Network Tab:**
   - Identify slow requests
   - Look for large bundle sizes
   - Check for unnecessary API calls

2. **Optimize Images:**
   - Compress images
   - Use appropriate formats (WebP)
   - Lazy load images

3. **Code Splitting:**
   - Already implemented with React Router
   - Verify lazy loading works

4. **Database Queries:**
   - Add indexes to frequently queried columns
   - Limit result sets with pagination
   - Use select() to fetch only needed columns

---

### Issue: Real-time Messages Delayed

**Symptoms:**
- Messages take > 1 second to appear
- Inconsistent delivery times
- Some messages don't arrive

**Solutions:**

1. **Check Connection Quality:**
   - Test on different network
   - Check ping to Supabase servers

2. **Verify Channel Configuration:**
   - Using Broadcast (fastest method)
   - Not using postgres_changes

3. **Reduce Channel Count:**
   - Unsubscribe from unused channels
   - Reuse channels when possible

4. **Check Supabase Region:**
   - Choose region closest to users
   - Consider upgrading plan for better performance

---

## General Debugging Tips

### Browser Console
```javascript
// Check authentication
console.log('User:', supabase.auth.getUser())

// Check active channels
console.log('Channels:', supabase.getChannels())

// Check local storage
console.log('Storage:', localStorage)
```

### Supabase Dashboard
- **Table Editor**: View and edit data directly
- **SQL Editor**: Run custom queries
- **Logs**: View real-time logs
- **API**: Test API endpoints

### Network Tab
- Check request/response
- Verify status codes
- Inspect headers
- Check payload

### React DevTools
- Inspect component state
- Check props
- View component tree
- Profile performance

---

## Getting More Help

### Resources
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

### Project Documentation
- `README.md` - Project overview
- `FEATURES.md` - Feature documentation
- `BACKEND_SETUP.md` - Backend configuration
- `TESTING_CHECKLIST.md` - Testing guide

### Support Channels
- Check GitHub Issues
- Review Supabase community forum
- Stack Overflow for general questions

---

**Last Updated:** January 2026
