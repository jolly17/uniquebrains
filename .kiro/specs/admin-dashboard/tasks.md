# Implementation Tasks: Admin Dashboard

## Phase 1: Foundation and Authentication

### Task 1: Set up admin route protection
- [x] 1.1 Create AdminRoute component with role-based access control
- [x] 1.2 Add admin role check using AuthContext
- [x] 1.3 Implement redirect to home page for unauthorized users
- [x] 1.4 Add unauthorized message display
- [x] 1.5 Test admin route protection with different user roles

### Task 2: Create admin service layer
- [x] 2.1 Create src/services/adminService.js
- [x] 2.2 Implement fetchAllCourses() function
- [x] 2.3 Implement fetchAllInstructors() function
- [x] 2.4 Implement fetchAllStudents() function
- [x] 2.5 Implement fetchAllEnrollments() function
- [x] 2.6 Implement fetchAllSessions() function
- [x] 2.7 Add error handling for all service functions

### Task 3: Create admin layout and navigation
- [x] 3.1 Create src/pages/admin/AdminLayout.jsx
- [x] 3.2 Implement sidebar navigation with links to all admin pages
- [x] 3.3 Add mobile-responsive hamburger menu
- [x] 3.4 Style sidebar with brand colors (indigo #4f46e5)
- [x] 3.5 Add active route highlighting
- [x] 3.6 Create AdminLayout.css with responsive styles

## Phase 2: Dashboard Overview and Analytics

### Task 4: Create dashboard overview page
- [x] 4.1 Create src/pages/admin/AdminDashboard.jsx
- [x] 4.2 Implement statistics cards for courses, instructors, students, enrollments
- [x] 4.3 Fetch real-time counts from database
- [x] 4.4 Add loading states for statistics
- [x] 4.5 Create quick action buttons (create course, view reports, manage users)
- [x] 4.6 Style dashboard with responsive grid layout

### Task 5: Implement activity feed
- [ ] 5.1 Create activity feed component
- [ ] 5.2 Fetch 20 most recent platform events
- [ ] 5.3 Display events with timestamps and user info
- [ ] 5.4 Add icons for different event types
- [ ] 5.5 Implement auto-refresh every 30 seconds
- [ ] 5.6 Style activity feed with scrollable container

### Task 6: Create analytics service
- [ ] 6.1 Create src/services/analyticsService.js
- [ ] 6.2 Implement fetchUserSignups(timeRange) function
- [ ] 6.3 Implement fetchCoursesCreated(timeRange) function
- [ ] 6.4 Implement fetchActiveStudents(timeRange) function
- [ ] 6.5 Implement fetchCommunityQuestions(timeRange) function
- [ ] 6.6 Implement fetchCommunityAnswers(timeRange) function
- [ ] 6.7 Add data aggregation by day/week based on time range

### Task 7: Create analytics page with timeline graphs
- [ ] 7.1 Create src/pages/admin/AdminAnalytics.jsx
- [ ] 7.2 Install and configure chart library (recharts or chart.js)
- [ ] 7.3 Create LineChart component for continuous metrics
- [ ] 7.4 Create BarChart component for discrete events
- [ ] 7.5 Implement time range selector (7d, 30d, 90d, 1y, all)
- [ ] 7.6 Add percentage change indicators
- [ ] 7.7 Implement hover tooltips with exact values
- [ ] 7.8 Create responsive grid layout for graphs
- [ ] 7.9 Handle "no data available" states

## Phase 3: Shared Components

### Task 8: Create DataTable component
- [x] 8.1 Create src/components/admin/DataTable.jsx
- [x] 8.2 Implement column sorting (ascending/descending)
- [x] 8.3 Add search functionality with real-time filtering
- [x] 8.4 Implement pagination with page controls
- [x] 8.5 Add filter controls for multiple criteria
- [x] 8.6 Display current page and total pages
- [x] 8.7 Preserve filters and sort order during pagination
- [x] 8.8 Style table with responsive design
- [x] 8.9 Add loading skeleton for table rows

### Task 9: Create EditModal component
- [x] 9.1 Create src/components/admin/EditModal.jsx
- [x] 9.2 Implement modal overlay and content container
- [x] 9.3 Add form fields with validation
- [x] 9.4 Implement save and cancel buttons
- [x] 9.5 Add field-specific error messages
- [x] 9.6 Handle form submission with loading state
- [x] 9.7 Close modal on successful save
- [x] 9.8 Discard changes on cancel
- [x] 9.9 Style modal with responsive design

### Task 10: Create ConfirmDialog component
- [ ] 10.1 Create src/components/admin/ConfirmDialog.jsx
- [ ] 10.2 Implement dialog overlay and content
- [ ] 10.3 Display record identifier in confirmation message
- [ ] 10.4 Add confirm and cancel buttons
- [ ] 10.5 Handle confirmation callback
- [ ] 10.6 Style dialog with warning colors for destructive actions

### Task 11: Create CSV export utility
- [ ] 11.1 Create src/utils/exportCSV.js
- [ ] 11.2 Implement exportToCSV(data, filename) function
- [ ] 11.3 Format dates and numbers appropriately
- [ ] 11.4 Handle special characters and escaping
- [ ] 11.5 Trigger browser download
- [ ] 11.6 Add error handling for export failures

## Phase 4: Courses Management

### Task 12: Create courses management page
- [x] 12.1 Create src/pages/admin/AdminCourses.jsx
- [x] 12.2 Fetch all courses with instructor names
- [x] 12.3 Display courses in DataTable with columns: title, instructor, category, status, enrollment count
- [ ] 12.4 Add filters for instructor, category, status
- [ ] 12.5 Implement search by title or description
- [x] 12.6 Add edit button for each course
- [x] 12.7 Add delete button with confirmation
- [ ] 12.8 Implement CSV export for courses
- [ ] 12.9 Set pagination to 20 courses per page

### Task 13: Implement course editing
- [x] 13.1 Create course edit modal with all fields
- [x] 13.2 Implement updateCourse() in adminService
- [x] 13.3 Validate course fields before saving
- [x] 13.4 Refresh table after successful update
- [x] 13.5 Display success/error messages

### Task 14: Implement course deletion
- [x] 14.1 Show confirmation dialog with course title
- [x] 14.2 Implement deleteCourse() in adminService
- [x] 14.3 Handle foreign key constraint errors
- [x] 14.4 Refresh table after successful deletion
- [x] 14.5 Display informative error messages

### Task 15: Add course details view
- [ ] 15.1 Create course details modal
- [ ] 15.2 Display enrollment list
- [ ] 15.3 Display session schedule
- [ ] 15.4 Add link to view course on main site

## Phase 5: Instructors Management

### Task 16: Create instructors management page
- [x] 16.1 Create src/pages/admin/AdminInstructors.jsx
- [x] 16.2 Fetch all users with 'instructor' role
- [x] 16.3 Display instructors in DataTable with columns: name, email, courses count, students taught
- [x] 16.4 Calculate instructor statistics
- [x] 16.5 Add edit button for each instructor
- [ ] 16.6 Add suspend/approve toggle
- [ ] 16.7 Implement CSV export for instructors
- [ ] 16.8 Set pagination to 20 instructors per page

### Task 17: Implement instructor editing
- [x] 17.1 Create instructor edit modal
- [x] 17.2 Allow editing first name, last name, bio, expertise
- [x] 17.3 Implement updateInstructor() in adminService
- [x] 17.4 Validate instructor fields
- [x] 17.5 Refresh table after update

### Task 18: Implement instructor suspension
- [ ] 18.1 Create suspend confirmation dialog
- [ ] 18.2 Implement suspendInstructor() in adminService
- [ ] 18.3 Unpublish all instructor's courses
- [ ] 18.4 Update instructor status
- [ ] 18.5 Display success message

### Task 19: Add instructor details view
- [ ] 19.1 Create instructor details modal
- [ ] 19.2 Display profile information
- [ ] 19.3 Display list of courses created
- [ ] 19.4 Show total students taught
- [ ] 19.5 Add link to instructor profile

## Phase 6: Students Management

### Task 20: Create students management page
- [x] 20.1 Create src/pages/admin/AdminStudents.jsx
- [x] 20.2 Fetch all users with 'student' role
- [x] 20.3 Display students in DataTable with columns: name, email, enrollments count, created date
- [x] 20.4 Add edit button for each student
- [ ] 20.5 Implement CSV export for students
- [ ] 20.6 Set pagination to 20 students per page

### Task 21: Implement student editing
- [x] 21.1 Create student edit modal
- [x] 21.2 Allow editing first name, last name, email
- [x] 21.3 Implement updateStudent() in adminService
- [x] 21.4 Validate student fields
- [x] 21.5 Refresh table after update

### Task 22: Add student details view
- [ ] 22.1 Create student details modal
- [ ] 22.2 Display profile information
- [ ] 22.3 Display enrollment history
- [ ] 22.4 Show course progress
- [ ] 22.5 Add link to student profile

## Phase 7: Enrollments Management

### Task 23: Create enrollments management page
- [ ] 23.1 Create src/pages/admin/AdminEnrollments.jsx
- [ ] 23.2 Fetch all enrollments with student and course names
- [ ] 23.3 Display enrollments in DataTable with columns: student, course, status, enrollment date
- [ ] 23.4 Add filters for course, student, status
- [ ] 23.5 Add status update dropdown
- [ ] 23.6 Implement CSV export for enrollments
- [ ] 23.7 Set pagination to 50 enrollments per page

### Task 24: Implement enrollment status updates
- [ ] 24.1 Create status dropdown with options: active, completed, dropped, pending
- [ ] 24.2 Implement updateEnrollmentStatus() in adminService
- [ ] 24.3 Update related statistics after status change
- [ ] 24.4 Refresh table after update
- [ ] 24.5 Display success message

### Task 25: Add enrollment details view
- [ ] 25.1 Create enrollment details modal
- [ ] 25.2 Display student and course information
- [ ] 25.3 Show enrollment date and status
- [ ] 25.4 Display completion date if applicable
- [ ] 25.5 Show student progress

## Phase 8: Sessions Management

### Task 26: Create sessions management page
- [ ] 26.1 Create src/pages/admin/AdminSessions.jsx
- [ ] 26.2 Fetch all sessions with course titles
- [ ] 26.3 Display sessions in DataTable with columns: course, title, date, time, status
- [ ] 26.4 Add filters for course, date range, status
- [ ] 26.5 Sort sessions chronologically (upcoming first)
- [ ] 26.6 Add edit button for each session
- [ ] 26.7 Add delete button with confirmation
- [ ] 26.8 Implement CSV export for sessions
- [ ] 26.9 Set pagination to 50 sessions per page

### Task 27: Implement session editing
- [ ] 27.1 Create session edit modal
- [ ] 27.2 Allow editing title, description, date, time, meeting link
- [ ] 27.3 Implement updateSession() in adminService
- [ ] 27.4 Validate session fields
- [ ] 27.5 Refresh table after update

### Task 28: Implement session deletion
- [ ] 28.1 Show confirmation dialog with session details
- [ ] 28.2 Implement deleteSession() in adminService
- [ ] 28.3 Refresh table after deletion
- [ ] 28.4 Display success message

## Phase 9: Polish and Testing

### Task 29: Add inline editing to tables
- [ ] 29.1 Enable double-click to edit cells
- [ ] 29.2 Save on Enter or click outside
- [ ] 29.3 Cancel on Escape key
- [ ] 29.4 Show loading indicator during save
- [ ] 29.5 Display error messages for failed saves

### Task 30: Implement error handling and loading states
- [ ] 30.1 Add loading spinners for all data fetches
- [ ] 30.2 Display user-friendly error messages
- [ ] 30.3 Add retry buttons for failed requests
- [ ] 30.4 Implement toast notifications for actions
- [ ] 30.5 Handle network errors gracefully

### Task 31: Mobile optimization
- [ ] 31.1 Test all pages on mobile devices
- [ ] 31.2 Optimize table display for small screens
- [ ] 31.3 Make modals responsive
- [ ] 31.4 Ensure touch-friendly buttons and controls
- [ ] 31.5 Test navigation on mobile

### Task 32: Add admin routes to App.jsx
- [x] 32.1 Import AdminRoute component
- [x] 32.2 Add routes for all admin pages
- [x] 32.3 Add /admin base route with AdminLayout
- [ ] 32.4 Test route protection
- [x] 32.5 Add admin link to main navigation (for admin users only)

### Task 33: Final testing and documentation
- [ ] 33.1 Test all CRUD operations
- [ ] 33.2 Test filters and search on all pages
- [ ] 33.3 Test CSV exports
- [ ] 33.4 Test role-based access control
- [ ] 33.5 Verify mobile responsiveness
- [ ] 33.6 Create admin user guide documentation
- [ ] 33.7 Test with different data volumes
- [ ] 33.8 Verify all error states display correctly
