# UniqueBrains Platform - Project Board

**Last Updated**: January 27, 2026

---

## 🎯 BACKLOG

### High Priority
- [ ] **Security Hardening**
  - Enable CAPTCHA for sign-ups
  - Configure rate limiting
  - Input validation and sanitization
  - Audit logging
  - Assigned: Pre-launch

- [ ] **Monitoring & Observability**
  - Set up Supabase monitoring
  - Configure error tracking
  - Set up alerts for critical issues
  - Monitor API usage and quotas
  - Assigned: Pre-launch

### Medium Priority
- [ ] **Search & Filtering**
  - Full-text search across courses
  - Category filtering
  - Price range filtering
  - Rating filtering
  - Pagination
  - Assigned: TBD

- [ ] **Testing Suite**
  - Write unit tests
  - Write integration tests
  - End-to-end testing
  - Load testing
  - Assigned: TBD

- [ ] **Performance Optimization**
  - Optimize database queries
  - Add caching
  - Optimize media delivery
  - Lazy loading for frontend
  - Assigned: TBD

### Low Priority
- [ ] **Notification System Enhancement**
  - Toast notifications for new messages
  - Email notifications
  - Push notifications
  - Assigned: TBD

- [ ] **Accessibility Improvements**
  - Keyboard navigation
  - Screen reader support
  - WCAG compliance
  - Assigned: TBD

---

## 🚧 IN PROGRESS

- None currently

---

## ✅ DONE

### January 27, 2026 - MAJOR SIMPLIFICATION
- [x] **Simplified to 1-Account-1-Student Model - COMPLETE**
  - **Why**: Parent-child profile system was causing complex RLS issues, infinite recursion, and blocking progress
  - **Database Changes**:
    - Migration 060: Dropped students table entirely
    - Removed student_profile_id from enrollments, sessions, homework_submissions
    - Simplified all RLS policies to only use student_id
    - Dropped security definer functions and parent-related policies
  - **Backend Services Updated**:
    - enrollmentService.js: Removed dual enrollment paths
    - sessionService.js: Removed student_profile_id handling
    - messageService.js: Removed students table queries, simplified access checks
  - **Frontend Pages Updated**:
    - Register.jsx: Changed "Parent" → "Student" role
    - RoleSelection.jsx: Changed "Parent" → "Student" role
    - Onboarding.jsx: Completely rewritten, removed child profile creation
    - StudentProfile.jsx: Removed "Child Management" section
    - Layout.jsx: Removed student switcher UI, fixed navigation
    - AuthContext.jsx: Simplified enrollment checking, removed parent logic
    - TermsOfService.jsx: Updated legal language
    - PrivacyPolicy.jsx: Updated privacy language
  - **Result**: Clean, maintainable codebase with single enrollment path
  - **Future**: Parent-child profiles can be added back as P1 post-launch if needed

- [x] **Chat Feature - Real-Time Messaging - COMPLETE**
  - Restored CourseChat.jsx and StudentChat.jsx from backups
  - Implemented real-time message delivery using Supabase Broadcast
  - Added presence tracking (online/offline status with 🟢 indicator)
  - Fixed sender seeing own messages in real-time (not just on refresh)
  - Fixed message queries to avoid students table joins
  - Group chat for group courses
  - 1-on-1 chat for individual courses with conversation threads
  - Messages persist in database
  - Real-time updates without page refresh

- [x] **Bug Fixes & UI Polish**
  - Fixed "My Courses" button not appearing for student profiles
  - Removed role display from navigation (was confusing when switching portals)
  - Fixed Layout.jsx to use 'student' role instead of 'parent'
  - Fixed AuthContext.jsx portal detection for students
  - Removed student switcher UI (no longer needed)

- [x] **Course Categories Update**
  - Changed from old categories (music, dance, drama, art)
  - New categories: Performing Arts 🎭, Visual Arts 🎨, Parenting 👨‍👩‍👧‍👦, Academics 📚, Language 🌍, Spirituality 🧘, Life Skills 🐷
  - Updated CreateCourse.jsx and courseImageGenerator.js
  - New color gradients for each category

- [x] **Contact Us Link**
  - Added "Contact Us" email link in footer
  - Links to hello@uniquebrains.org

- [x] **Coming Soon Banners**
  - Replaced Students, Homework, Resources, and Chat tabs with "Coming Soon" banners
  - Location-aware donation links (India → Milaap, Others → GoFundMe)
  - Created ComingSoonBanner component
  - Updated instructor portal: CourseStudents, CourseHomework, CourseResources, CourseChat
  - Updated student portal: StudentHomework, StudentResources, StudentChat
  - Created backup files for future restoration

- [x] **Session Management for 1-on-1 Courses**
  - Fixed recurring session generation for 1-on-1 courses
  - Instructor sees "Set Schedule" button after discussing with student
  - Creates 5 initial sessions if no end date
  - Creates all sessions until end date if provided
  - Students see sessions immediately after setup

- [x] **Real Student Management**
  - Restored CourseStudents.jsx with real data
  - Displays enrolled students with names and neurodiversity profiles
  - Added "Remove from Course" functionality
  - Fixed student names not displaying
  - Removed neurodiversity badges from Sessions tab (only in Students tab)
  - Fixed course category icons in marketplace

- [x] **Session Creation Fixes**
  - Fixed "null value in column duration_minutes" error
  - Updated duration field to duration_minutes in all session functions
  - Added support for student_id in session creation
  - Fixed sessionService.js to use correct field names

### January 26, 2026
- [x] **Dual Role Support - COMPLETE**
  - Path-based routing (/teach and /learn portals)
  - Portal detection based on user activities
  - Portal switcher component in footer
  - AuthContext enhanced with portal management
  - Updated all dashboards with portal-aware navigation
  - Marketplace supports both portals with different CTAs
  - Login simplified (no role selection)
  - Registration supports role pre-selection from landing page
  - Landing page updated with "Start Teaching" CTA
  - Renamed "Student Management" to "Child Management"
  - Documentation updated (README, PROJECT_BOARD)
  - All phases complete and tested

### January 23, 2026
- [x] **Student Dashboard Redesign**
  - Dashboard-style layout with stat cards
  - Stats: Enrolled Courses, Instructors, Sessions Completed
  - Two action buttons: "View Details" and "Continue Learning"
  - Neurodiversity badge display
  - Responsive design

- [x] **Instructor Session Management - Initial Implementation**
  - Replaced mock data with real API calls
  - Fetch real course details, sessions, and enrolled students
  - Create and update sessions via API
  - Generate recurring sessions
  - Note: Has bugs, moved to backlog

### January 22, 2026
- [x] **Privacy Policy & Terms of Service**
  - Created comprehensive legal pages
  - Added footer links
  - Google OAuth verification ready

- [x] **Backend Services Update**
  - Updated all services for dual enrollment support
  - homeworkService.js, resourceService.js, messageService.js, sessionService.js
  - Support both student_id and student_profile_id

- [x] **Database Migration 048**
  - Added student_profile_id to submissions table
  - Updated RLS policies

- [x] **Smart Donation Button**
  - Geolocation-based routing
  - India → Milaap, Others → GoFundMe

### January 21, 2026
- [x] **Parent Multi-Student Feature - DEPRECATED**
  - ⚠️ This feature was removed on January 27, 2026
  - Replaced with simpler 1-account-1-student model
  - See "Future Features" for potential re-implementation

- [x] **Marketplace & Course Display Fixes**
  - Removed dev mode check
  - Fixed instructor names display
  - Fixed course detail page errors
  - Added safe defaults

- [x] **Course Auto-Publishing**
  - Migration 040: Default is_published = true
  - Courses auto-publish on creation

- [x] **Database Cleanup**
  - Migration 041: Removed unused columns
  - Updated course_stats view

- [x] **Enrollment System - Simplified**
  - Now supports only direct student enrollments (student_id)
  - Dual support removed in favor of simplicity

### Earlier
- [x] **Core Platform**
  - User authentication (email + OAuth)
  - Profile management with neurodiversity profiles
  - Course creation and publishing
  - Course marketplace
  - File storage (profiles, courses, resources)
  - Real-time messaging

- [x] **Instructor Features**
  - Course management dashboard
  - Session scheduling (recurring and single)
  - Homework creation and grading
  - Resource management
  - Student roster with profiles
  - Chat with students
  - Submission review and feedback

- [x] **Student Features**
  - Browse and enroll in courses
  - View course materials
  - Submit homework
  - Access resources
  - Chat with instructor and classmates
  - Track homework completion
  - View feedback

- [x] **Technical Infrastructure**
  - Supabase backend (database, auth, storage, realtime)
  - Row Level Security (RLS) policies
  - GitHub Pages deployment
  - Responsive design

---

## 🔮 FUTURE FEATURES (Post-Launch)

### Parent-Child Profile System (P1)
- [ ] **Multi-Student Support for Parents**
  - Parent accounts that can manage multiple children
  - Student profile creation and management
  - Profile switcher for parents
  - Parent-managed enrollments
  - Separate student logins (optional)
  - **Note**: Removed in v1.0 for simplicity, can be added back based on user feedback

### Payment Integration
- [ ] Stripe integration
- [ ] Multiple payment methods
- [ ] Instructor payouts
- [ ] Platform fees
- [ ] Subscription tiers

### Advanced Course Features
- [ ] Course modules and lessons
- [ ] Self-paced courses
- [ ] Assessments and grading
- [ ] Completion certificates
- [ ] Progress analytics

### Video Conferencing
- [ ] Integrated video calls (WebRTC)
- [ ] In-app video interface
- [ ] Recording capabilities
- [ ] Attendance tracking

### Enterprise Features
- [ ] Multi-tenancy
- [ ] Custom branding per tenant
- [ ] Analytics dashboards
- [ ] White-label solution

### Community Features
- [ ] **Course Ratings and Reviews**
  - Course rating submission (1-5 stars)
  - Review text with ratings
  - Course average rating calculation
  - Instructor rating aggregation
  - Rating display in marketplace
  - Review moderation
- [ ] Student achievements
- [ ] Learning history
- [ ] Social features

### Offline Support
- [ ] Offline course access
- [ ] Content download
- [ ] Offline progress tracking
- [ ] DRM protection

---

## 📊 METRICS

### Overall Progress
- **Total Features**: 100+
- **Completed**: ~70 (70%)
- **In Progress**: 0
- **Backlog**: ~30

### By Category
| Category | Complete | In Progress | Backlog | Total |
|----------|----------|-------------|---------|-------|
| Backend Infrastructure | 10 | 0 | 7 | 17 |
| Instructor Features | 22 | 0 | 0 | 22 |
| Student Features | 16 | 0 | 0 | 16 |
| Chat & Messaging | 5 | 0 | 0 | 5 |
| Marketplace | 4 | 0 | 2 | 6 |
| Security & Testing | 0 | 0 | 8 | 8 |
| Future Features | 0 | 0 | 40 | 40 |

### Sprint Velocity
- **Week of Jan 15-21**: 15 features completed
- **Week of Jan 22-23**: 8 features completed
- **Week of Jan 26**: 8 features completed (Dual Role Support)
- **Week of Jan 27**: 18 features completed (Simplification + Chat + Bug Fixes)
- **Average**: ~12 features/week

---

## 🎯 NEXT SPRINT PRIORITIES

### Sprint Goal: Pre-Launch Preparation

1. **Security Hardening** (Pre-Launch Blocker)
   - Enable CAPTCHA
   - Configure rate limiting
   - Input validation
   - Audit logging

2. **Monitoring Setup** (Pre-Launch Blocker)
   - Supabase monitoring
   - Error tracking
   - Alerts
   - Usage analytics

3. **Testing & QA**
   - End-to-end testing of all flows
   - Cross-browser testing
   - Mobile responsiveness testing
   - Performance testing

4. **Documentation**
   - User guide
   - Instructor onboarding
   - Student onboarding
   - FAQ

---

## 🐛 KNOWN ISSUES

### Critical
- None currently

### Medium
- None currently

### Low
- ℹ️ **OAuth Branding**: Shows Supabase URL instead of UniqueBrains
- ℹ️ **Email Templates**: Supabase branding in confirmation emails

---

## 📝 NOTES

### Technical Debt
- ✅ Simplified data model (removed parent-child complexity)
- ✅ Cleaned up RLS policies
- Need to add comprehensive error handling across all API calls
- Need to add loading states to all async operations
- Need to optimize database queries (add indexes where needed)
- Need to implement proper caching strategy

### Documentation Needed
- API documentation
- Component documentation
- Database schema documentation
- Deployment guide updates

### Design Decisions
- ✅ **Simplified to 1-account-1-student model** for v1.0 launch
  - Easier to maintain and debug
  - Faster development
  - Can add parent-child support as P1 based on user feedback
- Decided to auto-publish courses instead of requiring manual publishing
- Decided to use path-based portals (/teach and /learn) for dual-role support

### Major Achievements Today (Jan 27)
- 🎉 **Completed major simplification** - removed complex parent-child system
- 🎉 **Chat feature working** - real-time messaging with presence tracking
- 🎉 **All critical bugs fixed** - navigation, roles, sessions
- 🎉 **Codebase is clean and maintainable** - ready for launch
- 🎉 **18 features completed in one day** - highest velocity yet!

---

## 🔗 QUICK LINKS

- **Live Site**: https://jolly17.github.io/uniquebrains
- **GitHub Repo**: https://github.com/jolly17/uniquebrains
- **Supabase Dashboard**: https://supabase.com/dashboard/project/wxfxvuvlpjxnyxhpquyw
- **Google Cloud Console**: https://console.cloud.google.com/

---

**Last Review**: January 27, 2026
**Next Review**: Next session
**Status**: Active Development - 70% Complete - Ready for Pre-Launch Testing



---

## 🎯 BACKLOG

### High Priority
- [ ] **Security Hardening**
  - Enable CAPTCHA for sign-ups
  - Configure rate limiting
  - Input validation and sanitization
  - Audit logging
  - Assigned: Pre-launch

- [ ] **Monitoring & Observability**
  - Set up Supabase monitoring
  - Configure error tracking
  - Set up alerts for critical issues
  - Monitor API usage and quotas
  - Assigned: Pre-launch

### Medium Priority
- [ ] **Search & Filtering**
  - Full-text search across courses
  - Category filtering
  - Price range filtering
  - Rating filtering
  - Pagination
  - Assigned: TBD

- [ ] **Testing Suite**
  - Write unit tests
  - Write integration tests
  - End-to-end testing
  - Load testing
  - Assigned: TBD

- [ ] **Performance Optimization**
  - Optimize database queries
  - Add caching
  - Optimize media delivery
  - Lazy loading for frontend
  - Assigned: TBD

### Low Priority
- [ ] **localStorage Persistence for Active Student**
  - Remember selected student across sessions
  - Improve parent UX
  - Assigned: TBD

- [ ] **Dynamic Enrollment Count in ManageStudents**
  - Fetch actual enrollment count per student
  - Currently shows 0
  - Assigned: TBD

- [ ] **Notification System Enhancement**
  - Toast notifications for new messages
  - Email notifications
  - Push notifications
  - Assigned: TBD

- [ ] **Accessibility Improvements**
  - Keyboard navigation
  - Screen reader support
  - WCAG compliance
  - Assigned: TBD

---

## 🚧 IN PROGRESS

- [ ] **Student Management System (NEXT UP)**
  - Status: Queued for next session
  - Features needed:
    - View enrolled students under manage courses
    - View student profiles and neurodiversity needs
    - Ability to unenroll a student from the course
  - Priority: High

- [ ] **UI fixes before launch**
  - Add Contact Us button
  - Change category of courses
  - Put "Coming Soon" for homework, feedback, resources and chat tabs

---

## ✅ DONE

### January 27, 2026
- [x] **Session Management & Display - COMPLETE**
  - Moved stats cards to ManageCourse page (visible across all tabs)
  - Fixed stats counters: Enrolled Students, Spots Remaining, Upcoming Sessions
  - Updated Instructor Dashboard "Sessions Completed" to count actual completed sessions
  - Added sessions display in Student portal (read-only)
  - Added course progress bar showing completion % based on sessions passed
  - Students can see all sessions with date, time, duration, and meeting links
  - Sessions marked as Completed or Upcoming based on current date/time
  - Auto-create 5 session placeholders for new group courses
  - Fixed sessions visibility for child profiles
  - Meeting links now show for all sessions (fallback to course meeting link)
  - Enhanced session editing: date, time, duration, topic
  - Added delete session functionality
  - Removed meeting link editing from individual sessions (managed at course level)

- [x] **Meeting Link Management - COMPLETE**
  - Added meeting_link column to courses table (migration 051)
  - Updated backfill migration to use course meeting links (migration 050)
  - Added optional meeting link field in course creation form
  - Fixed meeting link update API call with instructor ID
  - Meeting link now managed centrally at course level
  - All sessions inherit course's meeting link

- [x] **Bug Fixes & API Improvements**
  - Fixed course deletion (missing instructor ID parameter)
  - Fixed unenroll functionality (use withdraw API instead of delete)
  - Fixed enrollment status for child profiles (check both student_id and student_profile_id)
  - Fixed sessions not appearing for students (updated checkCourseAccess)
  - Audited all API calls for correct parameter passing

### January 26, 2026
- [x] **Dual Role Support - COMPLETE**
  - Path-based routing (/teach and /learn portals)
  - Portal detection based on user activities
  - Portal switcher component in footer
  - AuthContext enhanced with portal management
  - Updated all dashboards with portal-aware navigation
  - Marketplace supports both portals with different CTAs
  - Login simplified (no role selection)
  - Registration supports role pre-selection from landing page
  - Landing page updated with "Start Teaching" CTA
  - Renamed "Student Management" to "Child Management"
  - Documentation updated (README, PROJECT_BOARD)
  - All phases complete and tested

### January 23, 2026
- [x] **Student Dashboard Redesign**
  - Dashboard-style layout with stat cards
  - Stats: Enrolled Courses, Instructors, Sessions Completed
  - Two action buttons: "View Details" and "Continue Learning"
  - Neurodiversity badge display
  - Responsive design

- [x] **Instructor Session Management - Initial Implementation**
  - Replaced mock data with real API calls
  - Fetch real course details, sessions, and enrolled students
  - Create and update sessions via API
  - Generate recurring sessions
  - Note: Has bugs, moved to backlog

### January 22, 2026
- [x] **Privacy Policy & Terms of Service**
  - Created comprehensive legal pages
  - Added footer links
  - Google OAuth verification ready

- [x] **Backend Services Update**
  - Updated all services for dual enrollment support
  - homeworkService.js, resourceService.js, messageService.js, sessionService.js
  - Support both student_id and student_profile_id

- [x] **Database Migration 048**
  - Added student_profile_id to submissions table
  - Updated RLS policies

- [x] **Smart Donation Button**
  - Geolocation-based routing
  - India → Milaap, Others → GoFundMe

### January 21, 2026
- [x] **Parent Multi-Student Feature - COMPLETE**
  - Parent registration with role selection
  - Student profile management (CRUD)
  - Profile switcher in navigation
  - Active student context
  - Enrollment flow with student selection
  - "My Courses" filtered by active student

- [x] **Marketplace & Course Display Fixes**
  - Removed dev mode check
  - Fixed instructor names display
  - Fixed course detail page errors
  - Added safe defaults

- [x] **Course Auto-Publishing**
  - Migration 040: Default is_published = true
  - Courses auto-publish on creation

- [x] **Database Cleanup**
  - Migration 041: Removed unused columns
  - Updated course_stats view

- [x] **Enrollment System - Dual Support**
  - Migration 044: Added student_profile_id to enrollments
  - Migration 047: Made student_id nullable
  - RLS policies updated
  - Support both direct and parent-managed enrollments

### Earlier
- [x] **Core Platform**
  - User authentication (email + OAuth)
  - Profile management with neurodiversity profiles
  - Course creation and publishing
  - Course marketplace
  - File storage (profiles, courses, resources)
  - Real-time messaging

- [x] **Instructor Features**
  - Course management dashboard
  - Session scheduling (recurring and single)
  - Homework creation and grading
  - Resource management
  - Student roster with profiles
  - Chat with students
  - Submission review and feedback

- [x] **Student Features**
  - Browse and enroll in courses
  - View course materials
  - Submit homework
  - Access resources
  - Chat with instructor and classmates
  - Track homework completion
  - View feedback

- [x] **Technical Infrastructure**
  - Supabase backend (database, auth, storage, realtime)
  - Row Level Security (RLS) policies
  - GitHub Pages deployment
  - Responsive design

---

## 🔮 FUTURE FEATURES (Post-Launch)

### Payment Integration
- [ ] Stripe integration
- [ ] Multiple payment methods
- [ ] Instructor payouts
- [ ] Platform fees
- [ ] Subscription tiers

### Advanced Course Features
- [ ] Course modules and lessons
- [ ] Self-paced courses
- [ ] Assessments and grading
- [ ] Completion certificates
- [ ] Progress analytics

### Video Conferencing
- [ ] Integrated video calls (WebRTC)
- [ ] In-app video interface
- [ ] Recording capabilities
- [ ] Attendance tracking

### Enterprise Features
- [ ] Multi-tenancy
- [ ] Custom branding per tenant
- [ ] Analytics dashboards
- [ ] White-label solution

### Community Features
- [ ] **Course Ratings and Reviews**
  - Course rating submission (1-5 stars)
  - Review text with ratings
  - Course average rating calculation
  - Instructor rating aggregation
  - Rating display in marketplace
  - Review moderation
- [ ] Student achievements
- [ ] Learning history
- [ ] Social features

### Offline Support
- [ ] Offline course access
- [ ] Content download
- [ ] Offline progress tracking
- [ ] DRM protection

---

## 📊 METRICS

### Overall Progress
- **Total Features**: 100+
- **Completed**: ~58 (58%)
- **In Progress**: 1
- **Backlog**: ~41

### By Category
| Category | Complete | In Progress | Backlog | Total |
|----------|----------|-------------|---------|-------|
| Backend Infrastructure | 8 | 0 | 9 | 17 |
| Instructor Features | 22 | 0 | 0 | 22 |
| Student Features | 15 | 1 | 0 | 16 |
| Parent Features | 5 | 0 | 2 | 7 |
| Marketplace | 3 | 0 | 3 | 6 |
| Security & Testing | 0 | 0 | 8 | 8 |
| Future Features | 0 | 0 | 39 | 39 |

### Sprint Velocity
- **Week of Jan 15-21**: 15 features completed
- **Week of Jan 22-23**: 8 features completed
- **Week of Jan 26**: 8 features completed (Dual Role Support)
- **Week of Jan 27**: 10 features completed (Session Management & Bug Fixes)
- **Average**: ~10 features/week

---

## 🎯 NEXT SPRINT PRIORITIES

### Sprint Goal: Student Management & UI Polish

1. **Student Management System** (High Priority - NEXT UP)
   - View all students across all courses
   - Filter students by course
   - View student profiles and neurodiversity needs
   - Track student progress and attendance
   - Communication tools

2. **UI Enhancements** (Quick Wins)
   - Add Contact Us button
   - Update course categories
   - Add "Coming Soon" placeholders for Homework, Feedback, and Chat tabs

3. **Security Hardening** (Pre-Launch Blocker)
   - Enable CAPTCHA
   - Configure rate limiting
   - Input validation

4. **Monitoring Setup** (Pre-Launch Blocker)
   - Supabase monitoring
   - Error tracking
   - Alerts

---

## 🐛 KNOWN ISSUES

### Critical
- None currently

### Medium
- None currently

### Low
- ℹ️ **OAuth Branding**: Shows Supabase URL instead of UniqueBrains
- ℹ️ **Email Templates**: Supabase branding in confirmation emails

---

## 📝 NOTES

### Technical Debt
- Need to add comprehensive error handling across all API calls
- Need to add loading states to all async operations
- Need to optimize database queries (add indexes where needed)
- Need to implement proper caching strategy

### Documentation Needed
- API documentation
- Component documentation
- Database schema documentation
- Deployment guide updates

### Design Decisions
- Decided to support both direct student enrollments and parent-managed enrollments
- Decided to auto-publish courses instead of requiring manual publishing
- Decided to use profile switcher instead of separate logins for students

---

## 🔗 QUICK LINKS

- **Live Site**: https://uniquebrains.org
- **GitHub Repo**: https://github.com/jolly17/uniquebrains
- **Supabase Dashboard**: https://supabase.com/dashboard/project/wxfxvuvlpjxnyxhpquyw
- **Google Cloud Console**: https://console.cloud.google.com/

---

**Last Review**: January 26, 2026
**Next Review**: Next session
**Status**: Active Development - 48% Complete
