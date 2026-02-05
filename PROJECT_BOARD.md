# UniqueBrains Platform - Project Board

**Last Updated**: January 28, 2026

---

## 🎯 BACKLOG

### High Priority (P0 - Pre-Launch)
- [ ] **Email Notifications System** 🔥
  - Set up Resend with custom domain email
  - Configure DNS records (SPF, DKIM, DMARC)
  - Create Supabase Edge Functions for email sending
  - Database triggers for enrollment events
  - Email templates:
    - Student enrollment confirmation
    - Instructor enrollment notification
    - Unenrollment notifications
    - Course updates/announcements
  - Assigned: Next session (Jan 29)

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
  - Check Supabase free tier limits
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

### January 28, 2026 - Bug Fixes & Production Updates
- [x] **Email Verification Check - COMPLETE** ✅
  - Verified Supabase Auth email settings
  - Tested confirmation email delivery
  - Email verification working correctly

- [x] **Enrollment Count Fix - COMPLETE**
  - Fixed enrollment counts to exclude dropped students
  - Updated courseService.js to filter out dropped enrollments in all queries
  - Fixed course deletion check to exclude dropped enrollments
  - Students properly removed from course after unenrollment
  - Instructors can now delete courses after removing all students
  - Deployed to production

- [x] **UX Improvements - COMPLETE**
  - Removed "Edit Profile" button from profile page
  - Profile fields always editable
  - Save/Cancel buttons appear automatically on form changes
  - Replaced "Change Password" with "Delete Account" button
  - Improved profile page user experience

- [x] **Default Role Fix - COMPLETE**
  - Changed default role from 'parent' to 'student' after signup
  - Updated AuthCallback.jsx (3 places)
  - Updated auth.js with correct valid roles
  - New users now default to student role

- [x] **Instructor Profile Fields - COMPLETE**
  - Removed profile completion banner from InstructorDashboard
  - Added instructor fields to StudentProfile page:
    - Bio (About You) - consolidated from multiple fields
    - Teaching Specializations (expertise checkboxes)
  - Implemented actual database save functionality
  - Profile information now saves to profiles table

- [x] **Timezone Support - COMPLETE**
  - Added timezone selector to course creation form
  - Major timezones: US, Europe, Asia, Australia
  - Auto-detects instructor's timezone as default
  - Created timezoneUtils.js with conversion functions
  - CourseDetail page displays times in student's local timezone
  - Shows "(converted to your timezone)" note when applicable
  - Added timezone column to courses table (migration 061)
  - Updated courseService.js to store timezone

- [x] **Instructor Expertise Display - COMPLETE**
  - Course detail page shows "🎯 Specializes in: [expertise areas]"
  - Updated courseService.js to fetch expertise from profiles
  - Displays below instructor name on course pages

- [x] **Marketplace Category Filters - COMPLETE**
  - Updated filters to match course creation categories
  - Categories: Performing Arts, Visual Arts, Parenting, Academics, Language, Spirituality, Life Skills
  - Added icons to each category

- [x] **Student Dashboard Updates - COMPLETE**
  - Removed Course Progress bar from My Courses list
  - Added course description display (similar to instructor dashboard)
  - Progress bar remains in Sessions tab as requested

- [x] **Enrollment Popup Navigation - COMPLETE**
  - Removed 3-second auto-redirect
  - "View My Courses" button → /learn/my-courses
  - "Continue Browsing" button → /learn/marketplace
  - Fixed both buttons leading to correct destinations

- [x] **Unenroll/Remove Student Functionality - COMPLETE**
  - Fixed unenroll button for students
  - Fixed remove student button for instructors
  - Removed non-existent withdrawn_at column
  - Changed status from 'withdrawn' to 'dropped' (valid status)
  - Added .neq('status', 'dropped') filter to all enrollment queries
  - Updated course deletion check to exclude dropped enrollments
  - Works from both student and instructor sides

- [x] **Portal Switching - COMPLETE**
  - Enabled portal switching for all users
  - Simplified detectAvailablePortals to always return both portals
  - Updated PortalSwitcher to always show switcher
  - All users can switch between learning and teaching portals

- [x] **Meeting Link Fixes - COMPLETE**
  - Fixed meeting link not saving to courses table
  - Added meeting_link to dbCourseData in createCourse
  - Meeting link now appears in Manage Course page
  - Allowed meeting link for 1:1 courses at creation time
  - Field is optional for both group and 1:1 courses

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

### Community Q&A Platform (P1)
- [ ] **Neurodiversity Q&A Forum**
  - Quora-style Q&A interface with topic tiles
  - Curated topics: Book Recommendations, Special Foods, Schooling, Therapies, Activities, etc.
  - Easy question posting and answering
  - Rich media support: images, videos, external links
  - Fun and quirky UI design
  - Topic creation by users
  - Upvoting/downvoting answers
  - Best answer selection
  - Search and filtering by topic
  - User reputation system
  - Moderation tools

### Session Recording Library (P1)
- [ ] **YouTube Recording Integration**
  - Instructors can add YouTube links for session recordings
  - Video thumbnails displayed on course pages
  - Organized by session/date
  - Accessible to enrolled students only
  - Automatic thumbnail extraction from YouTube
  - Video player embedded in course view
  - Recording library tab in course dashboard
  - Optional: Download links for offline viewing

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
- **Completed**: ~85 (85%)
- **In Progress**: 0
- **Backlog**: ~15

### By Category
| Category | Complete | In Progress | Backlog | Total |
|----------|----------|-------------|---------|-------|
| Backend Infrastructure | 12 | 0 | 5 | 17 |
| Instructor Features | 22 | 0 | 0 | 22 |
| Student Features | 16 | 0 | 0 | 16 |
| Chat & Messaging | 5 | 0 | 0 | 5 |
| Marketplace | 5 | 0 | 1 | 6 |
| Security & Testing | 0 | 0 | 8 | 8 |
| Future Features | 0 | 0 | 40 | 40 |

### Sprint Velocity
- **Week of Jan 15-21**: 15 features completed
- **Week of Jan 22-23**: 8 features completed
- **Week of Jan 26**: 8 features completed (Dual Role Support)
- **Week of Jan 27**: 18 features completed (Simplification + Chat + Bug Fixes)
- **Week of Jan 28**: 13 features completed (UX improvements + Bug fixes)
- **Average**: ~12 features/week

---

## 🎯 NEXT SPRINT PRIORITIES

### Sprint Goal: Email Notifications & Pre-Launch Preparation

1. **Email Notifications System** (P0 - NEXT UP)
   - Set up Resend with custom domain
   - Configure DNS records
   - Create Supabase Edge Functions
   - Implement enrollment notifications
   - Test email delivery

2. **Email Verification Check** (P0)
   - Verify Supabase Auth settings
   - Test confirmation emails
   - Fix if needed

3. **Security & Monitoring** (P0)
   - Enable CAPTCHA
   - Configure rate limiting
   - Set up monitoring
   - Check Supabase limits

4. **Final Testing** (P0)
   - End-to-end testing
   - Cross-browser testing
   - Mobile testing
   - Performance testing

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

### Launch Readiness Assessment (Jan 28, 2026)

**✅ Ready for Soft Launch:**
- User signup/login (email + Google OAuth)
- ✅ Email verification working
- Course creation (group and 1:1)
- Course enrollment/unenrollment
- Student/instructor portal switching
- Profile management with instructor fields
- Timezone support for courses
- Course marketplace with filters
- Real-time chat with presence tracking
- Session management
- Course deletion

**⚠️ P0 Items Before Wide Launch:**
1. **Email Notifications** - Users won't get enrollment confirmations (manual communication needed)
2. **Security Hardening** - CAPTCHA, rate limiting
3. **Monitoring** - Error tracking, alerts, usage monitoring

**Recommendation:**
- **Soft Launch Now**: Share with 1-2 small WhatsApp groups (10-20 people)
- **Wide Launch Tomorrow**: After email notifications are set up

### Technical Debt
- ✅ Simplified data model (removed parent-child complexity)
- ✅ Cleaned up RLS policies
- ✅ Fixed enrollment counting to exclude dropped students
- Need to add comprehensive error handling across all API calls
- Need to add loading states to all async operations
- Need to optimize database queries (add indexes where needed)
- Need to implement proper caching strategy

### Documentation Needed
- API documentation
- Component documentation
- Database schema documentation
- Deployment guide updates
- User guide for instructors
- User guide for students

### Design Decisions
- ✅ **Simplified to 1-account-1-student model** for v1.0 launch
  - Easier to maintain and debug
  - Faster development
  - Can add parent-child support as P1 based on user feedback
- Decided to auto-publish courses instead of requiring manual publishing
- Decided to use path-based portals (/teach and /learn) for dual-role support
- Using 'dropped' status for unenrolled students (not 'withdrawn')
- All enrollment queries exclude dropped students
- Portal switcher always available for all users

### Major Achievements This Week (Jan 27-28)
- 🎉 **Completed major simplification** - removed complex parent-child system
- 🎉 **Chat feature working** - real-time messaging with presence tracking
- 🎉 **All critical bugs fixed** - navigation, roles, sessions, enrollment
- 🎉 **UX improvements** - profile page, enrollment popup, portal switching
- 🎉 **Timezone support** - courses display in student's local timezone
- 🎉 **Instructor profiles** - expertise display on course pages
- 🎉 **Enrollment system robust** - proper unenroll, course deletion works
- 🎉 **31 features completed in 2 days** - highest velocity yet!
- 🎉 **Platform is 85% complete** - ready for soft launch!

---

## 🔗 QUICK LINKS

- **Live Site**: https://jolly17.github.io/uniquebrains
- **GitHub Repo**: https://github.com/jolly17/uniquebrains
- **Supabase Dashboard**: https://supabase.com/dashboard/project/wxfxvuvlpjxnyxhpquyw
- **Google Cloud Console**: https://console.cloud.google.com/

---

**Last Review**: January 28, 2026
**Next Review**: Next session (Email Notifications Setup)
**Status**: Active Development - 85% Complete - Ready for Soft Launch 🚀

**Launch Status**: 
- ✅ Core features complete
- ⚠️ Email notifications pending (P0)
- ⚠️ Security hardening pending (P0)
- 📊 Recommended: Soft launch with 1-2 small groups, wide launch after email setup
