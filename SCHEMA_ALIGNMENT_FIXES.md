# Database Schema Alignment Fixes

This document outlines the schema mismatches that were identified and fixed to ensure proper alignment between the frontend and backend.

## Issues Identified

### 1. Courses Table Mismatches

**Missing Columns:**
- `course_type` - Frontend expects 'group' or 'one-on-one'
- `session_duration` - Default session duration for group courses
- `enrollment_limit` - Maximum students (frontend uses this instead of `max_students`)
- `is_self_paced` - Whether course has fixed schedule
- `status` - Course lifecycle status ('draft', 'published', 'archived')

**Solution:** Migration `020_fix_frontend_backend_alignment.sql`
- Added all missing columns with proper constraints
- Updated existing courses with default values
- Added indexes for performance

### 2. Sessions Table Mismatches

**Field Name Issues:**
- Database has `duration_minutes`, frontend expects `duration`
- Database has Zoom-specific fields, frontend uses generic meeting fields

**Missing Columns:**
- `meeting_link` - Generic meeting URL
- `meeting_password` - Meeting password
- `meeting_platform` - Platform type for UI customization

**Solution:** Migration `020_fix_frontend_backend_alignment.sql`
- Added generic meeting fields
- Added `duration` column and copied data from `duration_minutes`
- Migrated Zoom-specific data to generic fields

### 3. Homework Table Mismatches

**Field Name Issues:**
- Database has `max_points`, frontend expects `points`

**Missing Columns:**
- `submission_type` - Type of submission expected ('text', 'file', 'checkmark')
- `attachments` - JSON array for multiple attachments

**Solution:** Migration `021_fix_homework_submissions_alignment.sql`
- Added `points` column and migrated data from `max_points`
- Added `submission_type` with proper constraints
- Added `attachments` as JSONB column
- Made `due_date` nullable for flexibility

### 4. Submissions Table Mismatches

**Field Name Issues:**
- Database has `submission_text`, frontend expects `content`
- Database has `attachment_url`, frontend expects `file_url`

**Solution:** Migration `021_fix_homework_submissions_alignment.sql`
- Added `content` column and migrated data from `submission_text`
- Added `file_url` column and migrated data from `attachment_url`

### 5. Messages Table Enhancements

**Missing Columns for One-on-One Messaging:**
- `recipient_id` - For private messages between instructor and student
- `is_announcement` - Flag for announcement messages
- `attachments` - JSON array for message attachments

**Solution:** Migration `021_fix_homework_submissions_alignment.sql`
- Added all missing columns
- Updated RLS policies to handle both group and private messages

### 6. Profiles Table Enhancement

**Missing Computed Column:**
- `full_name` - Computed from first_name + last_name for easier queries

**Solution:** Migration `020_fix_frontend_backend_alignment.sql`
- Added generated column for full_name

## Migration Files Created

### Migration 020: Frontend-Backend Alignment
```sql
-- File: supabase/migrations/020_fix_frontend_backend_alignment.sql
-- Fixes: courses, sessions, profiles tables
-- Adds: course_type, session_duration, enrollment_limit, is_self_paced, status
-- Adds: meeting_link, meeting_password, meeting_platform, duration
-- Adds: full_name computed column
```

### Migration 021: Homework and Submissions Alignment
```sql
-- File: supabase/migrations/021_fix_homework_submissions_alignment.sql
-- Fixes: homework, submissions, messages tables
-- Adds: points, submission_type, attachments to homework
-- Adds: content, file_url to submissions
-- Adds: recipient_id, is_announcement, attachments to messages
```

## Service Layer Updates

### Removed Automatic Timestamps
The database has triggers that automatically handle `created_at` and `updated_at`, so these were removed from service layer inserts:

**Before:**
```javascript
const data = {
  title: 'Test',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}
```

**After:**
```javascript
const data = {
  title: 'Test'
  // Timestamps handled by database triggers
}
```

### Updated Field Names
All services now use the correct field names that match the database schema:

- `course_type` instead of `courseType`
- `session_duration` instead of `sessionDuration`
- `enrollment_limit` instead of `enrollmentLimit`
- `is_self_paced` instead of `isSelfPaced`
- `submission_type` instead of `submissionType`
- `is_published` instead of `isPublished`

## New Database Features Added

### Helper Functions
```sql
-- Check if course is full
SELECT is_course_full('course-uuid');

-- Get enrollment count
SELECT get_course_enrollment_count('course-uuid');

-- Get homework statistics
SELECT * FROM get_homework_stats('course-uuid');

-- Check if student submitted homework
SELECT has_submitted_homework('homework-uuid', 'student-uuid');
```

### Helpful Views
```sql
-- Course statistics with enrollment data
SELECT * FROM course_stats WHERE instructor_id = 'instructor-uuid';

-- Upcoming sessions with course info
SELECT * FROM upcoming_sessions WHERE instructor_id = 'instructor-uuid';

-- Homework with submission statistics
SELECT * FROM homework_with_stats WHERE course_id = 'course-uuid';

-- Student submissions with homework info
SELECT * FROM student_submissions_with_homework WHERE student_id = 'student-uuid';
```

### Enhanced Indexes
Added indexes for all new columns to ensure optimal query performance:
- Course type and status filtering
- Session meeting platform queries
- Homework submission type filtering
- Message recipient lookups

## RLS Policy Updates

### Messages Table
Updated RLS policies to handle both group and private messaging:
- Group messages: Visible to all course participants
- Private messages: Visible only to sender and recipient
- Instructors can manage all messages in their courses

### Maintained Security
All existing security measures maintained:
- Users can only access their own data
- Instructors can only manage their own courses
- Students can only access enrolled courses
- Parents can manage children's profiles

## Verification Steps

### 1. Run Migrations
```bash
# Apply the migrations in order
supabase db push
```

### 2. Test Course Creation
```javascript
const courseData = {
  title: 'Test Course',
  description: 'Test Description',
  category: 'parenting',
  courseType: 'group',
  sessionDuration: 60,
  enrollmentLimit: 15,
  isSelfPaced: false
}

const result = await api.courses.create(courseData, user)
```

### 3. Test Homework Creation
```javascript
const homeworkData = {
  title: 'Week 1 Assignment',
  description: 'Complete the reading',
  points: 100,
  submission_type: 'text',
  is_published: true
}

const homework = await api.homework.create(courseId, homeworkData, instructorId)
```

### 4. Test Session Management
```javascript
const sessionData = {
  title: 'Session 1',
  session_date: '2024-02-01T10:00:00Z',
  duration: 60,
  meeting_link: 'https://zoom.us/j/123456789',
  meeting_platform: 'zoom'
}

const session = await api.sessions.create(courseId, sessionData, instructorId)
```

## Benefits of Alignment

### 1. Consistency
- Frontend and backend use identical field names
- No more field mapping or translation needed
- Reduced confusion and bugs

### 2. Performance
- Proper indexes on all queried columns
- Optimized views for common queries
- Helper functions reduce complex joins

### 3. Maintainability
- Clear schema documentation
- Consistent naming conventions
- Proper constraints and validation

### 4. Functionality
- Support for both group and one-on-one courses
- Flexible homework submission types
- Private messaging capabilities
- Course lifecycle management

## Next Steps

1. **Apply Migrations**: Run both migration files in your Supabase instance
2. **Test Integration**: Use the updated services to create courses, homework, etc.
3. **Update Frontend**: Ensure all frontend components use the new API services
4. **Monitor Performance**: Check query performance with new indexes
5. **Add Features**: Build upon the solid foundation for advanced features

The schema is now properly aligned and ready for production use with all the features needed for comprehensive course management.