# UniqueBrains Platform - Features Documentation

## Overview

UniqueBrains is a live learning marketplace platform connecting instructors with students for personalized courses. Built with React, Supabase, and modern web technologies.

---

## Core Features

### 1. User Authentication & Profiles

**Authentication:**
- Email/password signup and login
- Role-based access (Instructor, Student, Parent)
- Secure JWT token-based authentication
- Session management with Supabase Auth

**User Profiles:**
- Profile creation with bio, avatar, and contact info
- Neurodiversity profile support (ADHD, Autism, Dyslexia, etc.)
- Role-specific dashboards
- Profile editing and updates

**Files:**
- `src/context/AuthContext.jsx` - Authentication state management
- `src/pages/Login.jsx`, `src/pages/Register.jsx` - Auth UI
- `src/pages/StudentProfile.jsx` - Profile management

---

### 2. Course Management

**Course Creation (Instructors):**
- Create group or one-on-one courses
- Set course details (title, description, category)
- Configure session schedules with recurring patterns
- Set enrollment limits
- Auto-publish courses to marketplace

**Course Types:**
- **Group Classes**: Shared sessions for multiple students
- **One-on-One**: Individual sessions per student

**Categories:**
- Parenting 👨‍👩‍👧‍👦
- Music 🎵
- Dance 💃
- Drama 🎭
- Art 🎨
- Language 🌍

**Files:**
- `src/pages/CreateCourse.jsx` - Course creation form
- `src/pages/ManageCourse.jsx` - Course management dashboard
- `src/services/courseService.js` - Course API functions

---

### 3. Marketplace & Course Discovery

**Features:**
- Browse all published courses
- Search by title or description
- Filter by category
- View course details (instructor, schedule, enrollment)
- Enroll in courses

**Files:**
- `src/pages/Marketplace.jsx` - Course marketplace
- `src/pages/CourseDetail.jsx` - Course details page
- `src/components/CourseCard.jsx` - Course display component

---

### 4. Session Management

**Features:**
- Automatic session generation based on schedule
- Recurring sessions (daily, weekly, monthly)
- Session time and duration management
- Meeting link integration
- Upcoming sessions view

**Files:**
- `src/pages/ManageSessions.jsx` - Session management
- `src/services/sessionService.js` - Session API functions

---

### 5. Homework & Assignments

**Instructor Features:**
- Create assignments with title, description, instructions
- Set due dates and max points
- View all submissions
- Grade submissions with feedback
- Track completion rates

**Student Features:**
- View all assignments
- Submit text or file uploads
- See submission status (Not Submitted, Submitted, Graded)
- View grades and feedback
- Track assignment deadlines

**Files:**
- `src/pages/CourseHomework.jsx` - Homework management (instructor)
- `src/pages/StudentHomework.jsx` - Homework view (student)
- `src/services/homeworkService.js` - Homework API functions

---

### 6. Real-time Messaging 🚀

**Features:**
- Instant message delivery (< 1 second)
- WebSocket-based communication
- Group chat for courses
- One-on-one messaging
- Connection status indicators
- Automatic reconnection
- Message persistence

**Technical Implementation:**
- Uses Supabase Realtime Broadcast
- No database replication required
- Automatic cleanup on disconnect
- React hooks for easy integration

**Files:**
- `src/services/realtimeService.js` - Core realtime functionality
- `src/services/messageService.js` - Message API with broadcasting
- `src/hooks/useRealtime.js` - React hooks
- `src/pages/CourseChat.jsx` - Chat interface

**Usage Example:**
```javascript
import { useCourseMessages } from '../hooks/useRealtime'

function Chat({ courseId }) {
  const { isConnected } = useCourseMessages(courseId, {
    onMessage: (msg) => console.log('New message:', msg)
  })
  
  return <div>Status: {isConnected ? '🟢' : '🔴'}</div>
}
```

---

### 7. Enrollment Management

**Features:**
- Student enrollment in courses
- Enrollment status tracking
- Course capacity management
- Enrollment history
- Withdrawal support

**Files:**
- `src/services/enrollmentService.js` - Enrollment API functions
- `src/pages/MyCourses.jsx` - Student enrollments view

---

### 8. Resource Management

**Features:**
- Upload course materials
- Share files with students
- Organize resources by type
- Track resource access
- Download resources

**Files:**
- `src/pages/CourseResources.jsx` - Resource management
- `src/services/resourceService.js` - Resource API functions

---

### 9. Instructor Dashboard

**Features:**
- Overview of all courses
- Student enrollment statistics
- Recent activity feed
- Quick access to course management
- Pending enrollment requests

**Files:**
- `src/pages/InstructorDashboard.jsx` - Instructor dashboard

---

### 10. Student Dashboard

**Features:**
- View enrolled courses
- Access course materials
- Submit homework
- Participate in chat
- Track progress

**Files:**
- `src/pages/StudentCourseView.jsx` - Student course view
- `src/pages/MyCourses.jsx` - Student dashboard

---

## Technical Architecture

### Frontend Stack
- **React 18** - UI framework
- **React Router** - Navigation
- **Vite** - Build tool
- **CSS Modules** - Styling

### Backend Stack
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Storage for file uploads

### Key Services

**API Service (`src/services/api.js`):**
- Unified API interface
- Error handling
- Request/response formatting
- Validation utilities

**Service Modules:**
- `courseService.js` - Course CRUD operations
- `sessionService.js` - Session management
- `homeworkService.js` - Assignments and grading
- `messageService.js` - Chat and messaging
- `enrollmentService.js` - Student enrollments
- `resourceService.js` - Course materials
- `realtimeService.js` - WebSocket connections

---

## Security Features

### Authentication
- JWT token-based authentication
- Secure password hashing
- Session management
- Automatic token refresh

### Authorization
- Role-based access control (RBAC)
- Row Level Security (RLS) policies
- Instructor-only routes
- Student-only routes
- Course access verification

### Data Protection
- HTTPS encryption
- Secure WebSocket connections (WSS)
- Input validation
- SQL injection prevention
- XSS protection

---

## Performance Optimizations

### Real-time Features
- WebSocket connections (no polling)
- Automatic reconnection with exponential backoff
- Channel deduplication
- Resource cleanup

### Database
- Indexed queries
- Efficient joins
- Pagination support
- Caching strategies

### Frontend
- Code splitting
- Lazy loading
- Optimized bundle size
- Production builds with minification

---

## Deployment

### GitHub Pages
- Automated deployment via gh-pages branch
- Production builds in `docs/` folder
- Custom domain support
- HTTPS enabled

### Environment Variables
- Supabase URL and API keys
- Environment-specific configuration
- Secure credential management

---

## Testing

### Manual Testing
- Comprehensive testing checklist (`TESTING_CHECKLIST.md`)
- Detailed testing guide (`COMPLETE_TESTING_GUIDE.md`)
- Cross-browser testing
- Mobile responsiveness testing

### Test Coverage
- User authentication flows
- Course creation and management
- Homework submission and grading
- Real-time messaging
- Enrollment processes

---

## Future Enhancements

### Planned Features
1. **Typing Indicators** - Show when users are typing
2. **Read Receipts** - Track message read status
3. **File Sharing** - Real-time file upload notifications
4. **Video Integration** - Integrate video conferencing
5. **Payment Processing** - Enable paid courses
6. **Reviews & Ratings** - Course feedback system
7. **Calendar Integration** - Sync with Google Calendar
8. **Mobile App** - Native iOS/Android apps
9. **Analytics Dashboard** - Instructor insights
10. **Certificates** - Course completion certificates

---

## Documentation Index

- **README.md** - Project overview and quick start
- **FEATURES.md** (this file) - Complete feature documentation
- **DEPLOYMENT.md** - Deployment instructions
- **BACKEND_SETUP.md** - Backend configuration
- **SUPABASE_SETUP.md** - Supabase setup guide
- **TESTING_CHECKLIST.md** - Quick testing reference
- **COMPLETE_TESTING_GUIDE.md** - Detailed testing guide
- **TROUBLESHOOTING.md** - Common issues and solutions
- **LAUNCH_CHECKLIST.md** - Pre-launch checklist
- **BRANDING.md** - Brand guidelines
- **COURSE_TYPES.md** - Course type specifications

---

## Support & Resources

### Documentation
- All documentation in root directory
- Code comments throughout codebase
- API documentation in service files

### Getting Help
- Check TROUBLESHOOTING.md for common issues
- Review testing guides for usage examples
- Inspect browser console for errors
- Check Supabase dashboard for backend issues

---

**Last Updated:** January 2026
**Version:** 1.0.0
**Status:** Production Ready 🚀
