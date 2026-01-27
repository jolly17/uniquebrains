# Simplification to Single Student Model

## Date: January 27, 2026

## Overview
Reverted from complex parent-child profile system to simpler **1 Account = 1 Student** model for P0 launch.

## Why This Change?
The parent-child profile system was causing:
- Complex RLS policies with infinite recursion issues
- Dual enrollment paths (student_id vs student_profile_id) creating bugs
- Join issues between messages and students tables
- Difficult debugging and maintenance
- Blocking progress on core features

## What Was Removed

### Database Changes (Migration 060)
1. **Dropped `students` table entirely**
   - No more parent-child relationships
   - No more separate student profiles

2. **Removed `student_profile_id` columns from:**
   - `enrollments` table
   - `sessions` table  
   - `homework_submissions` table

3. **Dropped all parent-related RLS policies:**
   - "Parents can view their own students"
   - "Parents can create students"
   - "Parents can view their children's sessions"
   - "Instructors can view enrolled students" (with complex joins)

4. **Dropped security definer function:**
   - `is_student_enrolled_in_instructor_course()`

5. **Simplified all RLS policies** to only use `student_id`

### Code Changes

#### Services Updated:
1. **enrollmentService.js**
   - `enrollStudent()` - removed `studentProfileId` parameter
   - `getStudentEnrollments()` - removed `isStudentProfile` parameter
   - `getCourseEnrollments()` - removed students table join
   - `checkEnrollment()` - simplified to single query

2. **sessionService.js**
   - Removed `student_profile_id` from session creation
   - Simplified `checkCourseAccess()` - removed parent checks

3. **messageService.js**
   - Removed all students table queries
   - Simplified `checkCourseAccess()` - removed parent checks
   - `getConversationThreads()` - removed students table join
   - All message queries now only use profiles table

#### Components Updated:
1. **CourseStudents.jsx**
   - Removed dual enrollment path logic
   - Now only handles profiles (student_id)

2. **ManageSessions.jsx**
   - Removed `enrollmentType` tracking
   - Removed `student_profile_id` logic
   - Simplified session filtering to only use `student_id`

## New Simplified Model

### User Types
- **Instructor**: Creates and manages courses
- **Student**: Each user account represents ONE student
  - Parents create separate accounts for each child
  - Each account enrolls independently

### Enrollment Flow
1. User creates account (becomes a profile)
2. User enrolls in course (creates enrollment with `student_id`)
3. For 1-on-1 courses, sessions are created with `student_id`

### Data Model
```
profiles (users)
  ├─> enrollments (student_id → profiles.id)
  │     └─> sessions (student_id → profiles.id for 1-on-1)
  └─> messages (sender_id → profiles.id)
```

## Migration Instructions

### To Apply Changes:
1. **Run migration 060:**
   ```bash
   # In Supabase SQL Editor
   # Run: supabase/migrations/060_simplify_to_single_student_model.sql
   ```

2. **Deploy updated code:**
   - All service files have been updated
   - All component files have been updated
   - No breaking changes to existing direct enrollments

3. **Data Impact:**
   - Existing direct enrollments (student_id) will continue to work
   - Any parent-managed enrollments (student_profile_id) will be lost
   - Students table data will be deleted

### Rollback (if needed):
- Migration 060 drops tables with CASCADE
- To rollback, you would need to:
  1. Restore from database backup
  2. Revert code changes to previous commit

## Benefits of Simplified Model

✅ **Simpler RLS policies** - No circular dependencies  
✅ **Single enrollment path** - Easier to debug  
✅ **No complex joins** - Better performance  
✅ **Faster development** - Less edge cases  
✅ **Easier maintenance** - Less code to maintain  

## Future Considerations

The parent-child profile feature can be added back as **P1** (post-launch) if user feedback indicates it's needed. At that point:
- Core platform will be stable
- We'll have real user data to inform the design
- Can implement with lessons learned

## Files Modified

### Database:
- `supabase/migrations/060_simplify_to_single_student_model.sql` (NEW)

### Services:
- `src/services/enrollmentService.js`
- `src/services/sessionService.js`
- `src/services/messageService.js`

### Components:
- `src/pages/CourseStudents.jsx`
- `src/pages/ManageSessions.jsx`

### Documentation:
- `SIMPLIFICATION_SUMMARY.md` (this file)

## Testing Checklist

After applying changes, test:
- [ ] Student enrollment in courses
- [ ] Viewing enrolled students (instructor)
- [ ] Creating sessions for 1-on-1 courses
- [ ] Viewing sessions (student and instructor)
- [ ] Sending messages in chat
- [ ] Viewing conversation threads
- [ ] Removing students from courses

## Status

✅ Migration created  
✅ All services updated  
✅ All components updated  
⏳ Ready to run migration 060  
⏳ Ready to deploy and test  
