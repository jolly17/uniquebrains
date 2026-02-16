# Design Document: Admin Dashboard

## Overview

The Admin Dashboard is a comprehensive web-based administrative interface for the UniqueBrains learning platform. It provides administrators with tools to manage courses, instructors, students, enrollments, and sessions through an intuitive, responsive interface. The dashboard includes data visualization, analytics with timeline graphs, search and filtering capabilities, and inline editing functionality.

The system is built as a React-based single-page application (SPA) that integrates with the existing Supabase backend. It uses role-based access control to ensure only authorized administrators can access sensitive platform data.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           React Admin Dashboard SPA                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Pages      │  │  Components  │  │   Services   │ │ │
│  │  │  - Dashboard │  │  - DataTable │  │  - Admin     │ │ │
│  │  │  - Courses   │  │  - EditModal │  │  - Analytics │ │ │
│  │  │  - Analytics │  │  - Charts    │  │  - Export    │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / Supabase Client
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Auth Service  │  │  PostgreSQL DB │  │  Row Level   │  │
│  │  - JWT Tokens  │  │  - Tables      │  │  Security    │  │
│  │  - Role Check  │  │  - Views       │  │  - Policies  │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

The application follows a layered architecture:

1. **Presentation Layer**: React components for UI rendering
2. **Service Layer**: Business logic and API communication
3. **Data Layer**: Supabase client for database operations
4. **Routing Layer**: Protected routes with role-based access control

### Technology Stack

- **Frontend Framework**: React 18+
- **Routing**: React Router v6
- **State Management**: React Context API + useState/useEffect hooks
- **UI Components**: Custom components with Tailwind CSS
- **Charts**: Recharts library for timeline graphs
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Authentication**: Supabase Auth with JWT tokens
- **Styling**: Tailwind CSS with custom brand colors

## Components and Interfaces

### Core Components

#### 1. AdminRoute Component
**Purpose**: Protect admin routes with role-based access control

**Interface**:
```javascript
<AdminRoute>
  <ChildComponent />
</AdminRoute>
```

**Behavior**:
- Checks if user has 'admin' role in profiles table
- Redirects unauthorized users to home page
- Displays unauthorized message
- Renders children for authorized users

#### 2. AdminLayout Component
**Purpose**: Provide consistent layout with sidebar navigation

**Interface**:
```javascript
<AdminLayout>
  <Outlet />
</AdminLayout>
```

**Features**:
- Sidebar navigation with links to all admin pages
- Mobile-responsive hamburger menu
- Active route highlighting
- Brand color styling (indigo #4f46e5)

#### 3. DataTable Component
**Purpose**: Reusable table with sorting, filtering, pagination, and search

**Props**:
```javascript
{
  columns: Array<{
    key: string,
    label: string,
    sortable: boolean,
    render?: (value, row) => ReactNode
  }>,
  data: Array<Object>,
  onEdit?: (row) => void,
  onDelete?: (row) => void,
  filters?: Array<{
    key: string,
    label: string,
    options: Array<{value, label}>
  }>,
  searchPlaceholder?: string,
  pageSize: number,
  exportFilename?: string
}
```

**Features**:
- Column sorting (ascending/descending)
- Real-time search filtering
- Multi-criteria filtering
- Pagination with page controls
- CSV export functionality
- Loading skeleton states
- Responsive design

#### 4. EditModal Component
**Purpose**: Modal dialog for editing records

**Props**:
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onSave: (data) => Promise<void>,
  title: string,
  fields: Array<{
    name: string,
    label: string,
    type: 'text' | 'textarea' | 'select' | 'date' | 'time',
    required: boolean,
    options?: Array<{value, label}>,
    validation?: (value) => string | null
  }>,
  initialData: Object
}
```

**Features**:
- Form validation with field-specific errors
- Save and cancel buttons
- Loading state during submission
- Discard changes on cancel
- Responsive design

#### 5. ConfirmDialog Component
**Purpose**: Confirmation dialog for destructive actions

**Props**:
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => Promise<void>,
  title: string,
  message: string,
  confirmText?: string,
  cancelText?: string,
  variant?: 'danger' | 'warning'
}
```

#### 6. Chart Components
**Purpose**: Display timeline graphs for analytics

**LineChart Props**:
```javascript
{
  data: Array<{date: string, value: number}>,
  title: string,
  color: string,
  showPercentageChange: boolean,
  previousPeriodData?: Array<{date: string, value: number}>
}
```

**BarChart Props**:
```javascript
{
  data: Array<{date: string, value: number}>,
  title: string,
  color: string,
  showPercentageChange: boolean
}
```

**Features**:
- Hover tooltips with exact values
- Responsive sizing
- Percentage change indicators
- "No data available" states
- Date formatting based on time range

### Service Layer

#### AdminService
**Purpose**: Handle all admin-related API calls

**Methods**:
```javascript
// Fetch operations
fetchAllCourses(): Promise<Array<Course>>
fetchAllInstructors(): Promise<Array<Instructor>>
fetchAllStudents(): Promise<Array<Student>>
fetchAllEnrollments(): Promise<Array<Enrollment>>
fetchAllSessions(): Promise<Array<Session>>
fetchDashboardStats(): Promise<DashboardStats>

// Update operations
updateCourse(id, data): Promise<Course>
updateInstructor(id, data): Promise<Instructor>
updateStudent(id, data): Promise<Student>
updateEnrollmentStatus(id, status): Promise<Enrollment>
updateSession(id, data): Promise<Session>

// Delete operations
deleteCourse(id): Promise<void>
deleteSession(id): Promise<void>

// Special operations
suspendInstructor(id): Promise<void>
approveInstructor(id): Promise<void>
```

#### AnalyticsService
**Purpose**: Handle analytics data fetching and aggregation

**Methods**:
```javascript
fetchUserSignups(timeRange): Promise<Array<DataPoint>>
fetchCoursesCreated(timeRange): Promise<Array<DataPoint>>
fetchActiveStudents(timeRange): Promise<Array<DataPoint>>
fetchCommunityQuestions(timeRange): Promise<Array<DataPoint>>
fetchCommunityAnswers(timeRange): Promise<Array<DataPoint>>

// Helper methods
aggregateByDay(data): Array<DataPoint>
aggregateByWeek(data): Array<DataPoint>
calculatePercentageChange(current, previous): number
```

**Time Ranges**:
- 7 days: Daily aggregation
- 30 days: Daily aggregation
- 90 days: Daily aggregation
- 1 year: Weekly aggregation
- All time: Weekly aggregation

#### ExportService
**Purpose**: Handle CSV export functionality

**Methods**:
```javascript
exportToCSV(data, columns, filename): void
formatDate(date): string
formatNumber(number): string
escapeCSVValue(value): string
```

### Page Components

#### 1. AdminDashboard
- Display statistics cards (courses, instructors, students, enrollments)
- Activity feed with 20 most recent events
- Quick action buttons
- Real-time data fetching
- Loading states

#### 2. AdminAnalytics
- Timeline graphs for 5 metrics
- Time range selector (7d, 30d, 90d, 1y, all)
- Percentage change indicators
- Responsive grid layout
- Hover tooltips

#### 3. AdminCourses
- DataTable with courses
- Filters: instructor, category, status
- Search by title/description
- Edit and delete actions
- Course details view
- 20 items per page

#### 4. AdminInstructors
- DataTable with instructors
- Statistics: courses created, students taught
- Edit and suspend/approve actions
- Instructor details view
- 20 items per page

#### 5. AdminStudents
- DataTable with students
- Statistics: enrollment count, account age
- Edit action
- Student details view with enrollment history
- 20 items per page

#### 6. AdminEnrollments
- DataTable with enrollments
- Filters: course, student, status
- Status update dropdown
- Enrollment details view
- 50 items per page

#### 7. AdminSessions
- DataTable with sessions
- Filters: course, date range, status
- Chronological sorting (upcoming first)
- Edit and delete actions
- 50 items per page

## Data Models

### Course
```javascript
{
  id: string,
  title: string,
  description: string,
  instructor_id: string,
  instructor_name: string,  // joined from profiles
  category: string,
  status: 'published' | 'draft',
  enrollment_count: number,  // calculated
  created_at: timestamp,
  updated_at: timestamp
}
```

### Instructor
```javascript
{
  id: string,
  first_name: string,
  last_name: string,
  email: string,
  bio: string,
  expertise: string,
  role: 'instructor',
  status: 'active' | 'suspended',
  courses_count: number,  // calculated
  students_taught: number,  // calculated
  created_at: timestamp
}
```

### Student
```javascript
{
  id: string,
  first_name: string,
  last_name: string,
  email: string,
  role: 'student',
  enrollments_count: number,  // calculated
  created_at: timestamp
}
```

### Enrollment
```javascript
{
  id: string,
  student_id: string,
  student_name: string,  // joined from profiles
  course_id: string,
  course_title: string,  // joined from courses
  status: 'active' | 'completed' | 'dropped' | 'pending',
  progress: number,  // 0-100
  enrolled_at: timestamp,
  completed_at: timestamp | null
}
```

### Session
```javascript
{
  id: string,
  course_id: string,
  course_title: string,  // joined from courses
  title: string,
  description: string,
  scheduled_at: timestamp,
  duration_minutes: number,
  meeting_link: string,
  status: 'scheduled' | 'completed' | 'cancelled',
  created_at: timestamp
}
```

### DashboardStats
```javascript
{
  total_courses: number,
  total_instructors: number,
  total_students: number,
  total_enrollments: number,
  recent_activities: Array<Activity>
}
```

### Activity
```javascript
{
  id: string,
  type: 'course_created' | 'enrollment' | 'session_scheduled' | 'user_registered',
  description: string,
  user_name: string,
  timestamp: timestamp
}
```

### DataPoint (for analytics)
```javascript
{
  date: string,  // ISO date string
  value: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

