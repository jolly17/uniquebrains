# Dual Role Support - Architecture Diagram

## URL Structure

```
uniquebrains.org
│
├── / (Landing Page)
│   └── Marketing content, login/register
│
├── /teach (Teaching Portal) 🎓
│   ├── /dashboard → Instructor Dashboard
│   ├── /marketplace → Browse courses (manage own, enroll in others)
│   ├── /my-courses → Courses you teach
│   ├── /course/:id/manage → Manage course
│   ├── /course/:id/sessions → Manage sessions
│   ├── /course/:id/students → View students
│   ├── /course/:id/homework → Manage homework
│   └── /create-course → Create new course
│
└── /learn (Learning Portal) 📚
    ├── /dashboard → Parent Dashboard
    ├── /marketplace → Browse courses (enroll for children)
    ├── /my-courses → Enrolled courses
    ├── /course/:id/view → View course content
    ├── /course/:id/homework → Submit homework
    ├── /course/:id/resources → View resources
    └── /onboarding → Add children
```

## User Flow Diagram

### Single-Role User (Instructor)
```
Register as Instructor
        ↓
   /teach/dashboard
        ↓
   Create courses
        ↓
   Manage students
        ↓
   (Optional) Browse /teach/marketplace
        ↓
   Enroll in a course
        ↓
   Portal switcher appears!
        ↓
   Can now access /learn portal
```

### Single-Role User (Parent)
```
Register as Parent
        ↓
   /learn/onboarding
        ↓
   Add children
        ↓
   /learn/marketplace
        ↓
   Enroll children in courses
        ↓
   (Optional) Click "Create Course"
        ↓
   Redirected to /teach/create-course
        ↓
   Portal switcher appears!
        ↓
   Can now access /teach portal
```

### Dual-Role User
```
Has both teaching and learning activities
        ↓
   Bookmarks both URLs:
   - /teach/dashboard (for teaching)
   - /learn/dashboard (for learning)
        ↓
   Footer shows: "Switch to [Other] Portal →"
        ↓
   Can navigate between portals freely
```

## Component Architecture

```
App.jsx
├── Public Routes
│   ├── LandingPage (/)
│   ├── Register (/register)
│   └── Login (/login)
│
├── TeachPortalLayout (/teach/*)
│   ├── TeachingNavigation
│   │   ├── Dashboard
│   │   ├── Marketplace
│   │   ├── My Courses
│   │   └── Profile
│   ├── Portal Content (varies by route)
│   └── Footer
│       └── PortalSwitcher (if has learn capability)
│           └── "Switch to Learning Portal →"
│
└── LearnPortalLayout (/learn/*)
    ├── LearningNavigation
    │   ├── Dashboard
    │   ├── Marketplace
    │   ├── My Courses
    │   ├── Child Selector
    │   └── Profile
    ├── Portal Content (varies by route)
    └── Footer
        └── PortalSwitcher (if has teach capability)
            └── "Switch to Teaching Portal →"
```

## Data Flow

### Portal Detection on Login
```
1. User logs in
        ↓
2. AuthContext.detectAvailablePortals()
        ↓
3. Query: SELECT id FROM courses WHERE instructor_id = user.id LIMIT 1
        ↓
4. Query: SELECT id FROM enrollments WHERE user_id = user.id LIMIT 1
        ↓
5. Build availablePortals array
   - Has courses? → Add 'teach'
   - Has enrollments? → Add 'learn'
   - Always include primary role portal
        ↓
6. Determine redirect:
   - Check last visited portal (localStorage)
   - Or use primary role default
        ↓
7. Navigate to portal dashboard
```

### Portal Switching
```
User clicks "Switch to Teaching Portal"
        ↓
Navigate to /teach/dashboard
        ↓
URL changes
        ↓
TeachPortalLayout renders
        ↓
Teaching-specific navigation loads
        ↓
Teaching dashboard content displays
        ↓
Save portal preference to localStorage
```

### Marketplace Behavior

#### Teaching Portal Marketplace
```
User at /teach/marketplace
        ↓
For each course:
  ├── Is user the instructor?
  │   ├── Yes → Show [Manage Course] button
  │   └── No → Show [Enroll] button
        ↓
Click [Enroll]
        ↓
Enroll current user
        ↓
detectAvailablePortals() runs
        ↓
'learn' added to availablePortals
        ↓
Portal switcher appears in footer
```

#### Learning Portal Marketplace
```
User at /learn/marketplace
        ↓
For each course:
  └── Show [Enroll] button
        ↓
Click [Enroll]
        ↓
Show child selector modal
        ↓
Select child
        ↓
Enroll selected child
        ↓
Course appears in /learn/my-courses
```

## State Management

### AuthContext State
```javascript
{
  user: { id, email },
  profile: { role, first_name, last_name, ... },
  activePortal: 'teach' | 'learn' | null,
  availablePortals: ['teach', 'learn'],
  students: [...],
  activeStudent: { ... }
}
```

### localStorage
```javascript
{
  'last_portal': 'teach' | 'learn',
  'oauth_role_preference': 'instructor' | 'parent'
}
```

## Security & Authorization

### Portal Access Rules
```
/teach/* routes:
  ├── Require authentication
  ├── Check if user has teach capability
  │   ├── Has created courses? → Allow
  │   ├── Primary role is instructor? → Allow
  │   └── Otherwise → Redirect to /learn
  └── RLS policies enforce instructor_id checks

/learn/* routes:
  ├── Require authentication
  ├── Check if user has learn capability
  │   ├── Has enrollments? → Allow
  │   ├── Primary role is parent? → Allow
  │   └── Otherwise → Redirect to /teach
  └── RLS policies enforce user_id/student_id checks
```

## Performance Considerations

### Portal Detection Optimization
```
1. Run detectAvailablePortals() only:
   - On login
   - After course creation
   - After enrollment
   - Not on every page load

2. Cache results in AuthContext state

3. Use LIMIT 1 for existence checks:
   - Don't need to count all courses
   - Just need to know if any exist

4. Queries are fast:
   - Indexed columns (instructor_id, user_id)
   - Simple SELECT with LIMIT 1
   - < 50ms typical response time
```

## Migration Path

### Phase 1: Current Implementation
- Single role per user
- Role toggle in navigation
- Shared dashboard with conditional rendering

### Phase 2: Path-Based Portals (This Spec)
- Separate /teach and /learn paths
- Portal switcher links
- Distinct portal layouts
- Backward compatible

### Phase 3: Future (Optional)
- Subdomain migration (teach.uniquebrains.org)
- Same code, just DNS changes
- No application changes needed

---

**Last Updated**: January 26, 2026  
**Status**: Architecture finalized, ready for implementation
