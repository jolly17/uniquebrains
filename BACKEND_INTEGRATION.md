# Backend Integration for Course Creation

This document explains the new backend API services that have been integrated for instructor course management.

## Overview

The backend integration provides a comprehensive set of API services for managing all aspects of course creation and management. The services are organized into logical modules and provide consistent error handling, validation, and security.

## Architecture

### Service Layer Structure

```
src/services/
├── api.js              # Main API interface and utilities
├── courseService.js    # Course CRUD operations
├── sessionService.js   # Session management
├── homeworkService.js  # Homework and submissions
├── resourceService.js  # Course materials and files
├── messageService.js   # Chat and messaging
└── enrollmentService.js # Student enrollments
```

### Key Features

- **Unified API Interface**: All services accessible through a single `api` object
- **Consistent Error Handling**: Standardized error messages and codes
- **Security**: Built-in authorization checks and RLS policy compliance
- **Validation**: Input validation and data sanitization
- **Type Safety**: Clear parameter requirements and return types

## Usage Examples

### 1. Course Management

#### Create a Course
```javascript
import { api, handleApiCall } from '../services/api'

const courseData = {
  title: 'Introduction to Positive Parenting',
  description: 'Learn effective parenting strategies...',
  category: 'parenting',
  courseType: 'group', // or 'one-on-one'
  sessionDuration: 60,
  enrollmentLimit: 15,
  isSelfPaced: false,
  // Schedule data for group courses
  startDate: '2024-02-01',
  sessionTime: '10:00',
  selectedDays: ['Monday', 'Wednesday', 'Friday'],
  hasEndDate: true,
  endDate: '2024-04-01'
}

try {
  const result = await handleApiCall(api.courses.create, courseData, user)
  console.log('Course created:', result.course)
  console.log('Sessions created:', result.sessions)
} catch (error) {
  console.error('Failed to create course:', error.message)
}
```

#### Get Instructor Courses
```javascript
const courses = await handleApiCall(api.courses.getInstructorCourses, instructorId)
```

#### Publish/Unpublish Course
```javascript
await handleApiCall(api.courses.publish, courseId, instructorId)
await handleApiCall(api.courses.unpublish, courseId, instructorId)
```

### 2. Session Management

#### Create Individual Session
```javascript
const sessionData = {
  title: 'Week 1: Getting Started',
  description: 'Introduction to the course concepts',
  session_date: '2024-02-05T10:00:00Z',
  duration: 60,
  meeting_link: 'https://zoom.us/j/123456789',
  meeting_platform: 'zoom'
}

const session = await handleApiCall(
  api.sessions.create, 
  courseId, 
  sessionData, 
  instructorId
)
```

#### Update Meeting Information
```javascript
const meetingData = {
  meeting_link: 'https://meet.google.com/abc-defg-hij',
  meeting_password: 'optional-password',
  meeting_platform: 'google-meet'
}

await handleApiCall(
  api.sessions.updateMeeting, 
  sessionId, 
  meetingData, 
  instructorId
)
```

### 3. Homework Management

#### Create Assignment
```javascript
const homeworkData = {
  title: 'Week 1 Reflection',
  description: 'Write a 500-word reflection on the key concepts...',
  due_date: '2024-02-12T23:59:59Z',
  points: 100,
  submission_type: 'text', // 'text', 'file', or 'checkmark'
  is_published: true
}

const homework = await handleApiCall(
  api.homework.create, 
  courseId, 
  homeworkData, 
  instructorId
)
```

#### Submit Homework (Student)
```javascript
const submissionData = {
  content: 'My reflection on the course concepts...',
  // For file submissions:
  // file_url: 'https://storage.url/file.pdf'
}

const submission = await handleApiCall(
  api.homework.submit, 
  homeworkId, 
  submissionData, 
  studentId
)
```

#### Grade Submission (Instructor)
```javascript
const gradeData = {
  grade: 85,
  feedback: 'Great work! Consider expanding on point 3...'
}

const gradedSubmission = await handleApiCall(
  api.homework.grade, 
  submissionId, 
  gradeData, 
  instructorId
)
```

### 4. Resource Management

#### Add Link Resource
```javascript
const resourceData = {
  title: 'Course Syllabus',
  description: 'Complete course outline and schedule',
  resource_type: 'link',
  link_url: 'https://example.com/syllabus.pdf'
}

const resource = await handleApiCall(
  api.resources.create, 
  courseId, 
  resourceData, 
  instructorId
)
```

#### Upload File Resource
```javascript
// First upload the file
const uploadResult = await handleApiCall(
  api.resources.uploadFile, 
  file, 
  courseId, 
  instructorId
)

// Then create the resource record
const resourceData = {
  title: file.name,
  description: 'Course material',
  resource_type: 'file',
  file_url: uploadResult.file_url,
  file_size: uploadResult.file_size,
  file_type: uploadResult.file_type
}

const resource = await handleApiCall(
  api.resources.create, 
  courseId, 
  resourceData, 
  instructorId
)
```

### 5. Messaging

#### Send Group Message
```javascript
const messageData = {
  content: 'Welcome to the course! Please introduce yourselves.',
  is_announcement: false
}

const message = await handleApiCall(
  api.messages.send, 
  courseId, 
  messageData, 
  senderId
)
```

#### Send Private Message (One-on-One)
```javascript
const messageData = {
  content: 'Great question in class today!',
  recipient_id: studentId // Makes it a private message
}

const message = await handleApiCall(
  api.messages.send, 
  courseId, 
  messageData, 
  instructorId
)
```

#### Get Conversation Threads (Instructor)
```javascript
const threads = await handleApiCall(
  api.messages.getThreads, 
  courseId, 
  instructorId
)

// Returns array of threads with student info and last message
threads.forEach(thread => {
  console.log(`Student: ${thread.student.full_name}`)
  console.log(`Last message: ${thread.lastMessage?.content}`)
})
```

### 6. Enrollment Management

#### Enroll Student
```javascript
const enrollment = await handleApiCall(
  api.enrollments.enroll, 
  courseId, 
  studentId
)
```

#### Get Course Enrollments (Instructor)
```javascript
const enrollments = await handleApiCall(
  api.enrollments.getCourse, 
  courseId, 
  instructorId
)

// Returns array with student profiles and enrollment info
enrollments.forEach(enrollment => {
  console.log(`Student: ${enrollment.profiles.full_name}`)
  console.log(`Progress: ${enrollment.progress}%`)
  console.log(`Status: ${enrollment.status}`)
})
```

#### Update Student Progress
```javascript
const updates = {
  progress: 75,
  status: 'active'
}

const updatedEnrollment = await handleApiCall(
  api.enrollments.update, 
  enrollmentId, 
  updates, 
  instructorId
)
```

## Error Handling

All API calls should be wrapped with `handleApiCall` for consistent error handling:

```javascript
try {
  const result = await handleApiCall(api.courses.create, courseData, user)
  // Handle success
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Handle validation errors
    console.log('Missing fields:', error.details.missingFields)
  } else if (error.code === 'UNAUTHORIZED') {
    // Handle authorization errors
    console.log('Access denied:', error.message)
  } else {
    // Handle other errors
    console.log('Error:', error.message)
  }
}
```

## Security Features

### Authorization
- All operations verify user permissions
- Instructors can only manage their own courses
- Students can only access enrolled courses
- RLS policies enforced at database level

### Validation
- Input validation on all API calls
- URL validation for meeting links and resources
- File size limits for uploads (100MB max)
- Required field validation

### Data Protection
- No sensitive data in error messages
- Proper error logging without exposing internals
- Secure file upload handling

## Statistics and Analytics

### Course Statistics
```javascript
const stats = await handleApiCall(api.courses.getStats, instructorId)
// Returns: totalCourses, publishedCourses, draftCourses, totalEnrollments
```

### Enrollment Analytics
```javascript
const enrollmentStats = await handleApiCall(api.enrollments.getStats, instructorId)
// Returns: totalEnrollments, activeEnrollments, completedEnrollments, etc.
```

### Message Statistics
```javascript
const messageStats = await handleApiCall(api.messages.getStats, instructorId)
// Returns: totalMessages, messagesToday, messagesThisWeek, messagesByCourse
```

## Integration with Existing Components

### Updated CreateCourse Component
The `CreateCourse` component has been updated to use the new API:

```javascript
// Old approach (direct Supabase calls)
const { data: course, error } = await supabase
  .from('courses')
  .insert([courseData])

// New approach (API service)
const result = await handleApiCall(api.courses.create, courseData, user)
```

### Updated InstructorDashboard
The dashboard now uses the API service for fetching courses:

```javascript
// Old approach
const { data } = await supabase
  .from('courses')
  .select('*, sessions(*), enrollments(*)')
  .eq('instructor_id', user.id)

// New approach
const courses = await handleApiCall(api.courses.getInstructorCourses, user.id)
```

## Testing

Use the `BackendIntegrationExample` component for testing API functionality:

```javascript
import BackendIntegrationExample from '../components/BackendIntegrationExample'

// Add to your development routes for testing
<Route path="/test-api" element={<BackendIntegrationExample />} />
```

## Migration Guide

### For Existing Components

1. **Replace direct Supabase imports**:
   ```javascript
   // Remove
   import { supabase } from '../lib/supabase'
   
   // Add
   import { api, handleApiCall } from '../services/api'
   ```

2. **Update API calls**:
   ```javascript
   // Old
   const { data, error } = await supabase.from('courses').select('*')
   if (error) throw error
   
   // New
   const data = await handleApiCall(api.courses.getInstructorCourses, instructorId)
   ```

3. **Update error handling**:
   ```javascript
   // Old
   try {
     const { data, error } = await supabaseCall()
     if (error) throw error
   } catch (error) {
     setError(error.message)
   }
   
   // New
   try {
     const data = await handleApiCall(apiFunction, ...args)
   } catch (error) {
     setError(error.message) // Consistent error format
   }
   ```

## Schema Alignment

⚠️ **Important**: Before using the backend services, you must apply the schema alignment migrations:

### Step 1: Check Current Schema (Optional)
```sql
-- Run this to see your current database state
-- File: supabase/migrations/020_test_schema_state.sql
```

### Step 2: Apply Migration 020 - Frontend-Backend Alignment
```sql
-- Adds missing columns to courses and sessions tables
-- File: supabase/migrations/020_fix_frontend_backend_alignment.sql
-- This migration is safe to run multiple times
```

### Step 3: Verify Migration 020 (Optional)
```sql
-- Run this to verify migration 020 worked correctly
-- File: supabase/migrations/020_verify_migration.sql
```

### Step 4: Apply Migration 021 - Homework and Submissions Alignment
```sql
-- Fixes homework, submissions, and messages tables
-- File: supabase/migrations/021_fix_homework_submissions_alignment.sql
```

**Migration Safety**: All migrations are designed to be idempotent and safe to run multiple times. They check for existing columns and constraints before making changes.

See `SCHEMA_ALIGNMENT_FIXES.md` for detailed information about the schema changes.

## Next Steps

1. **Apply Schema Migrations**: Run the alignment migrations first
2. **Complete Migration**: Update remaining components to use API services
3. **Add Real-time Features**: Implement WebSocket connections for live updates
4. **Enhance Analytics**: Add more detailed statistics and reporting
5. **File Management**: Implement comprehensive file upload/download system
6. **Notifications**: Add notification system for course events

## Support

For questions or issues with the backend integration:

1. Check the error messages - they provide specific guidance
2. Review the service code in `src/services/` for implementation details
3. Use the example component for testing and reference
4. Ensure proper authentication before making API calls

The backend integration provides a solid foundation for all course management features while maintaining security, performance, and maintainability.