# UniqueBrains Platform - Project Board

**Last Updated**: January 23, 2026

---

## 🎯 BACKLOG

### High Priority
- [ ] **Fix Instructor Session Management**
  - Issue: Cannot save meeting links or create sessions
  - Issue: Student dropdown doesn't show enrolled students for 1-on-1 courses
  - Issue: Group courses shouldn't require student selection for sessions
  - Need to debug API calls and data flow
  - Assigned: Next session

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
- [ ] **Video Conferencing Support**
  - Add meeting link fields to database (DONE in migration 007)
  - Create meeting link management UI
  - Display meeting links to students
  - Support Zoom/Meet/Teams links
  - Assigned: TBD

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

- [ ] **Instructor Session Management (BLOCKED)**
  - Status: Needs debugging
  - Blocker: API integration issues
  - Next: Debug and fix in next session

---

## ✅ DONE

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
- **Completed**: ~40 (40%)
- **In Progress**: 1
- **Backlog**: ~60

### By Category
| Category | Complete | In Progress | Backlog | Total |
|----------|----------|-------------|---------|-------|
| Backend Infrastructure | 6 | 0 | 11 | 17 |
| Instructor Features | 18 | 1 | 3 | 22 |
| Student Features | 12 | 0 | 0 | 12 |
| Parent Features | 5 | 0 | 2 | 7 |
| Marketplace | 3 | 0 | 3 | 6 |
| Security & Testing | 0 | 0 | 8 | 8 |
| Future Features | 0 | 0 | 39 | 39 |

### Sprint Velocity
- **Week of Jan 15-21**: 15 features completed
- **Week of Jan 22-23**: 8 features completed
- **Average**: ~11 features/week

---

## 🎯 NEXT SPRINT PRIORITIES

### Sprint Goal: Fix Critical Issues & Prepare for Launch

1. **Fix Instructor Session Management** (High Priority)
   - Debug API integration
   - Fix student dropdown
   - Fix meeting link save
   - Test session creation

2. **Security Hardening** (Pre-Launch Blocker)
   - Enable CAPTCHA
   - Configure rate limiting
   - Input validation

3. **Monitoring Setup** (Pre-Launch Blocker)
   - Supabase monitoring
   - Error tracking
   - Alerts

4. **Testing** (Pre-Launch Blocker)
   - Critical path testing
   - User acceptance testing
   - Performance testing

---

## 🐛 KNOWN ISSUES

### Critical
- ❌ **Instructor Session Management**: Cannot save meeting links or create sessions
- ❌ **Student Dropdown**: Not showing enrolled students for 1-on-1 courses

### Medium
- ⚠️ **Enrollment Count**: Shows 0 in ManageStudents page
- ⚠️ **Active Student Persistence**: Not remembered across sessions

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

**Last Review**: January 23, 2026
**Next Review**: Next session
**Status**: Active Development - 40% Complete
