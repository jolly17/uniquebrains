# Design Document: Navigation Restructuring

## Overview

This design document outlines the technical approach for restructuring the UniqueBrains application navigation to improve user experience through clearer product-based organization. The restructuring involves:

1. Renaming "Marketplace" to "Courses" throughout the application
2. Simplifying the navigation menu to show only core product links
3. Consolidating student and instructor dashboards under `/courses/my-courses`
4. Improving instructor meeting access with a "Join Meeting" button
5. Maintaining backward compatibility through route redirects

The design preserves all existing functionality while improving the information architecture and user experience.

## Architecture

### Current Structure

```
Routes:
- /marketplace → Browse courses
- /teach/dashboard → Instructor dashboard
- /learn/dashboard → Student dashboard
- /teach/create-course → Create course form

Navigation:
- Marketplace (always visible)
- Community (always visible)
- Dashboard (role-specific)
- Create Course (instructor only, in nav)
```

### New Structure

```
Routes:
- /courses → Browse courses (renamed from marketplace)
- /courses/my-courses → Unified dashboard (shows different content based on activePortal)

Navigation:
- Courses (always visible)
- Community (always visible)
- No role-specific links in main nav

Course Page Actions:
- "My Courses" button (authenticated users) → navigates to /courses/my-courses

Portal Switching:
- Changes activePortal state (learn/teach)
- Same URL, different content rendered
- No navigation/URL change
```

### Route Migration Strategy

The migration will use React Router redirects to maintain backward compatibility:

1. **Direct Redirects**: Legacy routes redirect to new equivalents
2. **Preserve Query Parameters**: Maintain any URL parameters during redirects
3. **Role-Aware Redirects**: Use authentication context to determine appropriate destination
4. **Gradual Deprecation**: Keep redirects indefinitely to avoid breaking bookmarks

**Redirect Mapping:**
- `/marketplace` → `/courses`
- `/teach/dashboard` → `/courses/my-courses`
- `/learn/dashboard` → `/courses/my-courses`
- `/teach/my-courses` → `/courses/my-courses`
- `/learn/my-courses` → `/courses/my-courses`

## Components and Interfaces

### 1. App.jsx (Routing Configuration)

**Changes Required:**
- Rename `/marketplace` route to `/courses`
- Add redirect from `/marketplace` to `/courses`
- Consolidate `/teach/dashboard` and `/learn/dashboard` to `/courses/my-courses`
- Add redirects from legacy dashboard routes to `/courses/my-courses`
- Update component imports if file names change

**Route Structure:**
```javascript
// New primary routes
<Route path="courses" element={<Courses />} />
<Route path="courses/my-courses" element={<MyCoursesUnified />} />

// Legacy redirects
<Route path="marketplace" element={<Navigate to="/courses" replace />} />
<Route path="teach/dashboard" element={<Navigate to="/courses/my-courses" replace />} />
<Route path="learn/dashboard" element={<Navigate to="/courses/my-courses" replace />} />
<Route path="teach/my-courses" element={<Navigate to="/courses/my-courses" replace />} />
<Route path="learn/my-courses" element={<Navigate to="/courses/my-courses" replace />} />
```

### 2. Layout.jsx (Navigation Component)

**Changes Required:**
- Update navigation link from "Marketplace" to "Courses"
- Update link href from `/marketplace` to `/courses`
- Remove "Create Course" link from instructor navigation
- Remove role-specific "Dashboard" or "My Courses" links from navigation
- Maintain portal switcher functionality in footer

**Navigation Structure:**
```javascript
<nav>
  <Link to="/courses">Courses</Link>
  <Link to="/community">Community</Link>
  {/* No role-specific links */}
</nav>
```

### 3. Marketplace.jsx → Courses.jsx (Course Browsing Page)

**Changes Required:**
- Rename file from `Marketplace.jsx` to `Courses.jsx`
- Update page title from "Discover Courses" (keep as is, or update if needed)
- Add "My Courses" button for authenticated users
- Update CSS class names from `marketplace-*` to `courses-*`
- Update CSS file name from `Marketplace.css` to `Courses.css`

**New UI Element:**
```javascript
{user && (
  <Link 
    to="/courses/my-courses"
    className="btn-my-courses"
  >
    My Courses
  </Link>
)}
```

### 4. MyCoursesUnified Component (Single Unified Dashboard)

**Approach:**
Create a single unified component that renders different content based on `activePortal` state:
- When `activePortal === 'learn'` → render student dashboard content
- When `activePortal === 'teach'` → render instructor dashboard content
- Portal switcher updates `activePortal` state, triggering re-render
- URL remains `/courses/my-courses` regardless of portal
- Maintains all existing dashboard functionality

**Implementation Options:**

**Option A: Conditional Rendering in Single Component**
```javascript
function MyCoursesUnified() {
  const { activePortal } = useAuth()
  
  return (
    <div className="my-courses-unified">
      {activePortal === 'teach' ? (
        <InstructorDashboardContent />
      ) : (
        <StudentDashboardContent />
      )}
    </div>
  )
}
```

**Option B: Reuse Existing Components**
```javascript
function MyCoursesUnified() {
  const { activePortal } = useAuth()
  
  if (activePortal === 'teach') {
    return <InstructorDashboard />
  }
  return <MyCourses />
}
```

**Portal Switching:**
- Portal switcher updates `activePortal` in AuthContext
- Component re-renders with new content
- URL stays at `/courses/my-courses`
- No navigation occurs

**Portal Switcher Update:**
```javascript
// In PortalSwitcher component
const handlePortalSwitch = (newPortal) => {
  // Update activePortal in context (triggers re-render)
  setActivePortal(newPortal)
  // No navigation needed - URL stays the same
}
```

### 5. LandingPage.jsx (Marketing Page)

**Changes Required:**
- Update "Explore Courses" button href from `/marketplace` to `/courses`
- Update "Browse Courses" button href from `/marketplace` to `/courses`
- Update any text references from "marketplace" to "courses"
- Update "Start Teaching" button to point to `/courses/my-courses` for authenticated instructors

### 6. InstructorDashboard.jsx (Instructor View)

**Changes Required:**
- Add "Join Meeting" button for each course session with a meeting link
- Add "Edit" button/icon next to meeting link for instructors
- Maintain existing "Create New Course" button in dashboard header
- Update internal navigation links to use new route structure
- Ensure portal switcher continues to work

**Meeting Access UI:**
```javascript
{session.meeting_link && (
  <div className="meeting-actions">
    <a 
      href={session.meeting_link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="btn-join-meeting"
    >
      Join Meeting
    </a>
    <button 
      onClick={() => handleEditMeetingLink(session.id)}
      className="btn-edit-meeting"
    >
      Edit
    </button>
  </div>
)}
```

### 7. ManageSessions.jsx (Session Management)

**Changes Required:**
- Add "Join Meeting" button for sessions with meeting links
- Add inline edit functionality for meeting links
- Maintain existing session management features

## Data Models

No database schema changes are required. This is purely a frontend routing and UI restructuring.

**Affected Data Flows:**
- Course fetching: No changes to API calls
- Enrollment management: No changes to API calls
- Session management: May need to add meeting link update API call if not present

**Meeting Link Update API:**
```javascript
// If not already present in sessionService.js
async updateMeetingLink(sessionId, meetingLink, instructorId) {
  const { data, error } = await supabase
    .from('sessions')
    .update({ meeting_link: meetingLink })
    .eq('id', sessionId)
    .eq('instructor_id', instructorId)
    .select()
    .single()
  
  if (error) throw error
  return data
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

For this navigation restructuring feature, most correctness properties are specific UI and routing examples rather than universal properties, as we are verifying specific elements and behaviors in the user interface.

### UI Text and Terminology Properties

**Example 1: Navigation displays "Courses" terminology**
The navigation menu should display "Courses" as a link text and should not contain "Marketplace" text.
**Validates: Requirements 1.1**

**Example 2: Landing page uses "Courses" terminology**
All buttons and links on the landing page should use "Courses" or "Browse Courses" text instead of "Marketplace".
**Validates: Requirements 1.3, 5.3**

**Example 3: Page titles use "Courses" terminology**
Page titles and headings should display "Courses" instead of "Marketplace".
**Validates: Requirements 1.4**

### Routing Properties

**Example 4: Course browsing uses /courses route**
When navigating to the course browsing page, the URL path should be `/courses`.
**Validates: Requirements 1.2**

**Example 5: Marketplace redirects to Courses**
When a user navigates to `/marketplace`, the system should redirect to `/courses`.
**Validates: Requirements 1.5**

**Example 6: Unified dashboard route**
When any user accesses their dashboard, the URL should be `/courses/my-courses`.
**Validates: Requirements 3.1**

**Example 7: Student content on learn portal**
When viewing `/courses/my-courses` with activePortal set to "learn", the system should display student dashboard content.
**Validates: Requirements 3.2**

**Example 8: Instructor content on teach portal**
When viewing `/courses/my-courses` with activePortal set to "teach", the system should display instructor dashboard content.
**Validates: Requirements 3.3**

**Example 9: Legacy teach dashboard redirects**
When a user navigates to `/teach/dashboard`, the system should redirect to `/courses/my-courses`.
**Validates: Requirements 3.4**

**Example 10: Legacy learn dashboard redirects**
When a user navigates to `/learn/dashboard`, the system should redirect to `/courses/my-courses`.
**Validates: Requirements 3.5**

**Example 11: Portal switching without navigation**
When a user switches portals, the system should update the activePortal state and re-render content without changing the URL.
**Validates: Requirements 3.7**

### Navigation Menu Properties

**Example 12: Navigation shows only core links**
The navigation menu should display only "Courses" and "Community" as primary navigation links for all users.
**Validates: Requirements 2.1**

**Example 13: Instructor navigation excludes Create Course**
When an instructor views the navigation menu, it should not display a "Create Course" link.
**Validates: Requirements 2.2**

**Example 14: No premature feature links**
The navigation menu should not display "Marketplace" or "Shopping" links.
**Validates: Requirements 2.5**

### Course Page Properties

**Example 15: My Courses button for authenticated users**
When an authenticated user views the `/courses` page, a "My Courses" button should be displayed.
**Validates: Requirements 2.3**

**Example 16: My Courses button navigation**
When a user clicks the "My Courses" button on the `/courses` page, the system should navigate to `/courses/my-courses`.
**Validates: Requirements 2.4**

### Dashboard Properties

**Example 17: Unified dashboard route**
When viewing `/courses/my-courses`, the system should display content based on the activePortal state.
**Validates: Requirements 3.1, 3.2, 3.3**

### Role Management Properties

**Example 18: Default student role**
When a new user signs up, their role should be automatically set to "student".
**Validates: Requirements 6.1**

**Example 19: No role selection at signup**
The signup process should not display role selection options.
**Validates: Requirements 6.2**

**Example 20: Instructor profile prompt**
When a user creates their first course, the system should prompt them to complete their instructor profile.
**Validates: Requirements 6.3**

**Example 21: Profile reminder on teaching portal**
When a user with an incomplete instructor profile views the teaching portal, the system should display a reminder button.
**Validates: Requirements 6.5**

### Meeting Access Properties

**Example 22: Instructor Join Meeting button**
When an instructor views a course session with a meeting link, a "Join Meeting" button should be displayed.
**Validates: Requirements 4.1**

**Example 23: Join Meeting opens in new tab**
When an instructor clicks the "Join Meeting" button, the meeting link should open in a new browser tab.
**Validates: Requirements 4.2**

**Example 24: Edit option for meeting links**
When an instructor views a session with a meeting link, an "Edit" option should be displayed adjacent to the "Join Meeting" button.
**Validates: Requirements 4.3**

**Example 25: Edit enables meeting link modification**
When an instructor clicks the "Edit" option, the system should display UI allowing modification of the meeting link.
**Validates: Requirements 4.4**

**Example 26: Student meeting join preserved**
When a student views a session with a meeting link, the existing "Join Meeting" functionality should work as before.
**Validates: Requirements 4.5**

## Error Handling

### Route Not Found
- Invalid routes should display 404 page or redirect to home
- Maintain existing error handling for route errors

### Authentication Errors
- Unauthenticated users accessing `/teach/my-courses` or `/learn/my-courses` should redirect to login
- Maintain existing authentication guards and redirects

### Portal Switching Errors
- If portal switching fails, display error message and maintain current portal
- Preserve existing portal switching error handling

### Meeting Link Errors
- If meeting link update fails, display error message and preserve existing link
- Validate meeting link format before saving (basic URL validation)

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases for the navigation restructuring:

**Navigation Component Tests:**
- Verify "Courses" link appears in navigation
- Verify "Marketplace" text does not appear in navigation
- Verify "Create Course" link does not appear for instructors
- Verify only "Courses" and "Community" links appear

**Routing Tests:**
- Verify `/courses` route renders Courses component
- Verify `/marketplace` redirects to `/courses`
- Verify `/teach/dashboard` redirects to `/teach/my-courses`
- Verify `/learn/dashboard` redirects to `/learn/my-courses`
- Verify `/teach/my-courses` renders InstructorDashboard for instructors
- Verify `/learn/my-courses` renders MyCourses for students

**Landing Page Tests:**
- Verify "Explore Courses" button links to `/courses`
- Verify "Browse Courses" button links to `/courses`
- Verify no "Marketplace" text appears

**Dashboard Tests:**
- Verify instructor dashboard renders at `/teach/my-courses` for instructors
- Verify student dashboard renders at `/learn/my-courses` for students
- Verify portal switcher continues to work
- Verify portal switcher navigates to correct route when switching
- Verify "Create New Course" button appears in instructor dashboard

**Meeting Access Tests:**
- Verify "Join Meeting" button appears for instructors with meeting links
- Verify "Edit" button appears next to "Join Meeting" button
- Verify clicking "Join Meeting" opens link in new tab
- Verify clicking "Edit" displays meeting link edit UI
- Verify student "Join Meeting" functionality unchanged

**Courses Page Tests:**
- Verify "My Courses" button appears for authenticated users
- Verify "My Courses" button does not appear for unauthenticated users
- Verify clicking "My Courses" navigates to appropriate dashboard route based on active portal

### Integration Tests

Integration tests will verify the complete user flows:

**Course Browsing Flow:**
1. Navigate to `/courses`
2. Verify page loads with course listings
3. Verify "My Courses" button appears (if authenticated)
4. Click "My Courses" button
5. Verify navigation to appropriate dashboard route (`/teach/my-courses` or `/learn/my-courses`)

**Legacy Route Redirect Flow:**
1. Navigate to `/marketplace`
2. Verify redirect to `/courses`
3. Navigate to `/teach/dashboard` (as instructor)
4. Verify redirect to `/teach/my-courses`
5. Navigate to `/learn/dashboard` (as student)
6. Verify redirect to `/learn/my-courses`

**Portal Switching Flow:**
1. Navigate to `/teach/my-courses` as dual-role user
2. Verify instructor dashboard content displays
3. Switch to "Learning Portal" using portal switcher
4. Verify navigation to `/learn/my-courses`
5. Verify student dashboard content displays
6. Switch back to "Teaching Portal"
7. Verify navigation to `/teach/my-courses`

**Meeting Access Flow:**
1. Navigate to instructor dashboard
2. View course with sessions
3. Verify "Join Meeting" button appears for sessions with links
4. Click "Join Meeting" and verify new tab opens
5. Click "Edit" and verify edit UI appears
6. Update meeting link and verify save

### Manual Testing Checklist

- [ ] Verify all navigation links work correctly
- [ ] Verify all redirects work correctly
- [ ] Verify portal switching works on unified dashboard
- [ ] Verify instructor can join meetings easily
- [ ] Verify student meeting join still works
- [ ] Verify no "Marketplace" text appears anywhere
- [ ] Verify bookmarked `/marketplace` URLs redirect correctly
- [ ] Test on mobile devices for responsive navigation
- [ ] Test with different user roles (student, instructor, dual-role)
- [ ] Test unauthenticated user experience

### Test Configuration

**Unit Tests:**
- Use React Testing Library for component tests
- Use React Router testing utilities for route tests
- Mock authentication context for role-based tests
- Test coverage target: 80% for modified components

**Integration Tests:**
- Use Cypress or Playwright for end-to-end tests
- Test with real authentication flow
- Test with real routing and navigation
- Focus on critical user paths

**Test Tagging:**
Each test should be tagged with the feature name and requirement it validates:
```javascript
// Example test tag
test('Navigation displays Courses link - Feature: navigation-restructuring, Requirement 1.1', () => {
  // test implementation
})
```


### 8. Registration and Role Management

**Changes Required:**
- Remove role selection from signup flow
- Set all new users to "student" role by default
- Remove RoleSelection.jsx component or redirect to onboarding
- Update Register.jsx to not include role selection
- Update Onboarding.jsx to not include role selection

**Default Role Assignment:**
```javascript
// In registration/OAuth callback
const newProfile = {
  id: user.id,
  email: user.email,
  first_name: firstName,
  last_name: lastName,
  role: 'student', // Always default to student
  // ... other fields
}
```

### 9. Instructor Profile Completion Prompt

**Trigger:**
When a user creates their first course, prompt them to complete their instructor profile.

**Implementation:**
```javascript
// In CreateCourse.jsx or after course creation
const handleCourseCreated = async (courseData) => {
  // Check if instructor profile is complete
  if (!profile.expertise || !profile.bio) {
    setShowInstructorProfilePrompt(true)
  }
}
```

**Prompt UI:**
```javascript
{showInstructorProfilePrompt && (
  <div className="instructor-profile-prompt">
    <h3>Complete Your Instructor Profile</h3>
    <p>Help students learn more about you by completing your instructor profile.</p>
    <button onClick={() => navigate('/profile?section=instructor')}>
      Complete Profile
    </button>
    <button onClick={() => setShowInstructorProfilePrompt(false)}>
      Later
    </button>
  </div>
)}
```

### 10. Incomplete Profile Reminder

**Display Location:**
Teaching portal dashboard when instructor profile is incomplete.

**Implementation:**
```javascript
// In InstructorDashboard or MyCoursesUnified (teach portal)
{activePortal === 'teach' && (!profile.expertise || !profile.bio) && (
  <div className="profile-reminder">
    <p>📝 Complete your instructor profile to help students learn more about you</p>
    <Link to="/profile?section=instructor" className="btn-complete-profile">
      Complete Profile
    </Link>
  </div>
)}
```
