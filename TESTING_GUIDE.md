# 🧪 Testing Guide: Course Creation & Enrollment

## Prerequisites

Before testing, we need to apply database migrations in Supabase Dashboard:

### 1. Apply Database Migrations

**In Supabase Dashboard:**
1. Go to your project dashboard
2. Navigate to **SQL Editor**
3. Run Migration 007:
```sql
-- Update Sessions Table for Manual Meeting Links
ALTER TABLE sessions 
  RENAME COLUMN zoom_link TO meeting_link;

ALTER TABLE sessions 
  RENAME COLUMN zoom_meeting_id TO meeting_id;

ALTER TABLE sessions 
  RENAME COLUMN zoom_password TO meeting_password;

ALTER TABLE sessions 
  ADD COLUMN meeting_platform TEXT CHECK (meeting_platform IN ('zoom', 'google_meet', 'microsoft_teams', 'other', NULL));

COMMENT ON COLUMN sessions.meeting_link IS 'URL for video conference - instructor provides their own link from any platform';
COMMENT ON COLUMN sessions.meeting_platform IS 'Platform being used: zoom, google_meet, microsoft_teams, or other';
COMMENT ON COLUMN sessions.meeting_password IS 'Optional password for the meeting';
COMMENT ON COLUMN sessions.meeting_id IS 'Optional meeting ID (if applicable for the platform)';
```

4. Run Migration 008:
```sql
-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses',
  'courses',
  true,
  104857600,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/ogg'
  ]
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'homework',
  'homework',
  false,
  104857600,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;
```

### 2. Create Storage Policies

**In Supabase Dashboard > Storage > Policies:**

Create these policies for each bucket:

**Profiles Bucket:**
- **Public Read**: `bucket_id = 'profiles'`
- **Authenticated Upload**: `bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]`

**Courses Bucket:**
- **Public Read**: `bucket_id = 'courses'`
- **Instructor Upload**: `bucket_id = 'courses' AND auth.uid() IN (SELECT instructor_id FROM courses WHERE id::text = (storage.foldername(name))[1])`

**Homework Bucket:**
- **Student/Instructor Read**: `bucket_id = 'homework' AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() IN (SELECT instructor_id FROM courses WHERE id IN (SELECT course_id FROM homework WHERE id::text = (storage.foldername(name))[2])))`

---

## 🧑‍🏫 Testing as Instructor

### Test 1: Account Creation & Profile Setup

1. **Go to**: http://localhost:5173
2. **Click**: "Get Started" or "Sign Up"
3. **Select Role**: Choose "Instructor" 
4. **Create Account**: Use a test email (e.g., instructor@test.com)
5. **Complete Registration**: Fill in name, email, password
6. **Verify Email**: Check email and click verification link
7. **Complete Profile**: 
   - Upload profile picture
   - Fill in bio, expertise, etc.
   - Set hourly rate

### Test 2: Course Creation

1. **Navigate to**: Instructor Dashboard
2. **Click**: "Create New Course"
3. **Fill Course Details**:
   - Title: "Introduction to Python Programming"
   - Description: "Learn Python basics from scratch"
   - Category: "Programming"
   - Age Group: "13-18"
   - Duration: "8 weeks"
   - Price: "$200" (or mark as free)
   - Upload thumbnail image

4. **Add Sessions**:
   - Session 1: "Python Basics" - Date/Time
   - Add meeting link (Zoom/Meet/Teams)
   - Session 2: "Variables and Data Types"
   - Continue adding sessions...

5. **Upload Resources**:
   - Course syllabus (PDF)
   - Sample code files
   - Reference materials

6. **Publish Course**: Click "Publish"

### Test 3: Homework Creation

1. **Go to**: Course Management > Homework
2. **Create Assignment**:
   - Title: "Variables Practice"
   - Description: "Create 5 variables of different types"
   - Due Date: Next week
   - Instructions: Detailed steps
   - Upload example files

3. **Set Submission Requirements**:
   - File types allowed
   - Maximum file size
   - Submission deadline

### Test 4: Session Management

1. **Go to**: Course Management > Sessions
2. **Edit Session**:
   - Update meeting link
   - Change date/time
   - Add session notes
   - Upload session materials

3. **Test Meeting Links**:
   - Verify links work
   - Test different platforms (Zoom, Meet, Teams)

---

## 👨‍👩‍👧‍👦 Testing as Parent

### Test 1: Account Creation & Student Profile Setup

1. **Go to**: http://localhost:5173
2. **Select Role**: Choose "Parent"
3. **Create Account**: Use different email (parent@test.com)
4. **Complete Registration**: Fill in parent details
5. **Onboarding - Add Children (Students)**:
   - Child 1: Name, age, neurodiversity profile
   - Child 2: (if applicable)
   - Note: Students don't get login credentials - only profiles

### Test 2: Course Discovery

1. **Browse Marketplace**: View available courses
2. **Search Functionality**:
   - Search by subject: "Python"
   - Filter by age group: "13-18"
   - Filter by price range
   - Sort by rating/popularity

3. **Course Details**:
   - View course description
   - Check instructor profile
   - Review session schedule
   - Read reviews/ratings

### Test 3: Enrollment Process

1. **Select Course**: "Introduction to Python Programming"
2. **Choose Child**: Select which child to enroll
3. **Review Details**:
   - Course schedule
   - Total cost
   - Instructor info
   - Meeting requirements

4. **Complete Enrollment**:
   - Confirm enrollment
   - (Payment would be here in full version)
   - Receive confirmation

### Test 4: Student Experience (Managed by Parent)

1. **Parent Access**: Go to "My Courses" 
2. **Select Student**: Choose which child's courses to view
3. **View Schedule**: See upcoming sessions for selected student
4. **Join Session**: Parent helps student click meeting link
5. **Submit Homework** (Parent assists):
   - View assignment details
   - Upload completed work on behalf of student
   - Submit before deadline

---

## 🔍 Key Things to Test

### Functionality Tests

- [ ] **Authentication**: Sign up, login, logout
- [ ] **Profile Management**: Upload pictures, edit info
- [ ] **Course Creation**: All fields, file uploads
- [ ] **Session Scheduling**: Date/time, meeting links
- [ ] **Homework System**: Create, assign, submit
- [ ] **File Uploads**: All file types, size limits
- [ ] **Enrollment Flow**: Browse, select, enroll
- [ ] **Access Control**: Students see only their courses

### Security Tests

- [ ] **RLS Policies**: Users can't access others' data
- [ ] **File Access**: Private files stay private
- [ ] **Role Permissions**: Instructors can't see other instructors' courses
- [ ] **Authentication**: Logged out users can't access protected pages

### UI/UX Tests

- [ ] **Responsive Design**: Test on mobile/tablet
- [ ] **Navigation**: All links work correctly
- [ ] **Forms**: Validation, error messages
- [ ] **File Uploads**: Progress bars, error handling
- [ ] **Loading States**: Spinners, feedback

### Edge Cases

- [ ] **Large Files**: Test file size limits
- [ ] **Invalid Data**: Test form validation
- [ ] **Network Issues**: Test offline behavior
- [ ] **Empty States**: No courses, no homework
- [ ] **Long Text**: Very long descriptions, names

---

## 🐛 Common Issues to Watch For

1. **Database Errors**: Check browser console for SQL errors
2. **File Upload Failures**: Check file size/type restrictions
3. **Authentication Issues**: Verify Supabase config
4. **Missing Data**: Check if migrations were applied
5. **Permission Errors**: Verify RLS policies are correct

---

## 📊 Success Criteria

### Instructor Flow ✅
- [ ] Can create account and profile
- [ ] Can create and publish courses
- [ ] Can schedule sessions with meeting links
- [ ] Can create and manage homework
- [ ] Can upload course materials
- [ ] Can view enrolled students

### Parent/Student Flow ✅
- [ ] Can create account and add children
- [ ] Can browse and search courses
- [ ] Can enroll in courses
- [ ] Can access course materials
- [ ] Can join video sessions
- [ ] Can submit homework

### Technical Requirements ✅
- [ ] All data persists correctly
- [ ] File uploads work reliably
- [ ] Security policies prevent unauthorized access
- [ ] UI is responsive and user-friendly
- [ ] No console errors or warnings

---

## 🚀 Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Apply Task 6**: Implement realtime chat
3. **Add notifications** for new homework, messages
4. **Implement search** and filtering improvements
5. **Add payment integration** (post-launch)

---

**Ready to test? Start with applying the migrations, then follow the testing flows above!** 🎯