# Fixing "Unauthorized" Error

## The Problem

You're seeing: **"Failed to send message: Unauthorized: You do not have access to this course"**

This happens because the realtime messaging system checks if you have access to the course before allowing you to send messages. You need to be either:
1. The instructor of the course, OR
2. Enrolled as a student in the course

## Quick Fix (2 minutes)

### Option 1: Use the Setup Page (Easiest!)

1. Go to: **http://localhost:5173/realtime-setup**
2. Click **"✨ Create Test Course"**
3. Wait 2 seconds - it will auto-redirect to the test page with the course ID
4. Start testing! ✅

### Option 2: Enroll in an Existing Course

1. Go to: **http://localhost:5173/realtime-setup**
2. Find a course in the list
3. Click **"📝 Enroll"** on any course
4. Click **"🚀 Test Now"** to start testing

### Option 3: Manual Database Setup

If you prefer to do it manually:

**Create a test course:**
```sql
INSERT INTO courses (
  instructor_id,
  title,
  description,
  category,
  course_type,
  price,
  is_published,
  max_students
) VALUES (
  'YOUR_USER_ID',  -- Replace with your user ID
  'Realtime Test Course',
  'Test course for realtime features',
  'test',
  'group',
  0,
  true,
  10
);
```

**Or enroll in an existing course:**
```sql
INSERT INTO enrollments (
  course_id,
  student_id,
  enrollment_status
) VALUES (
  'COURSE_ID',     -- Replace with course ID
  'YOUR_USER_ID',  -- Replace with your user ID
  'active'
);
```

## Why This Happens

The `checkCourseAccess` function in `messageService.js` verifies:

1. **Is the user the instructor?**
   - Checks `courses.instructor_id === user.id`

2. **Is the user enrolled?**
   - Checks `enrollments` table for matching `course_id` and `student_id`

If neither is true, you get the "Unauthorized" error.

## Debug Mode

I've added console logging to help debug. Open browser console (F12) and look for:

```
Checking course access: { courseId: '...', userId: '...' }
Course query result: { course: {...}, courseError: null }
User is the instructor - access granted
```

Or:

```
Checking course access: { courseId: '...', userId: '...' }
Course query result: { course: {...}, courseError: null }
Enrollment query result: { enrollment: {...}, enrollmentError: null }
Access check result: true
```

If you see errors, they'll show up here too.

## Testing with Two Users

To test realtime features properly:

**Window 1 (Instructor):**
1. Sign in as instructor
2. Go to `/realtime-setup`
3. Create a test course
4. Copy the course ID

**Window 2 (Student):**
1. Sign in as a different user (or incognito)
2. Go to `/realtime-setup`
3. Find the course by ID
4. Click "Enroll"
5. Click "Test Now"

Now both users can send messages!

## Common Issues

### "Course not found"
- The course ID doesn't exist in the database
- Check Supabase Dashboard → courses table

### "Not enrolled or error"
- You're not enrolled in the course
- Use the setup page to enroll

### RLS Policy Issues
- Check Supabase Dashboard → Authentication → Policies
- Ensure RLS policies allow reading courses and enrollments
- Ensure RLS policies allow inserting messages

## Next Steps

Once you have access:
1. Open test page in two windows
2. Use the same course ID in both
3. Send messages back and forth
4. Watch them appear instantly! 🎉

## Need More Help?

Check the browser console for detailed error messages. The debug logging will show exactly where the access check is failing.
