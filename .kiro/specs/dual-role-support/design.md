# Dual Role Support - Design Document

## Architecture Overview

The dual role support will be implemented using **path-based portal separation** without modifying the database schema. The system will:
1. Use `/teach` path for instructor portal and `/learn` path for parent portal
2. Detect user capabilities based on their activities (courses created, enrollments)
3. Provide portal switching links when both capabilities exist
4. Maintain current portal preference in localStorage
5. Adapt navigation and dashboard based on active portal

## URL Structure

```
uniquebrains.org/                    → Marketing/Landing page
uniquebrains.org/teach               → Instructor Portal
uniquebrains.org/teach/dashboard     → Instructor Dashboard
uniquebrains.org/teach/marketplace   → Marketplace (instructor view)
uniquebrains.org/teach/my-courses    → Courses you teach

uniquebrains.org/learn               → Parent Portal  
uniquebrains.org/learn/dashboard     → Parent Dashboard
uniquebrains.org/learn/marketplace   → Marketplace (parent view)
uniquebrains.org/learn/my-courses    → Courses enrolled in

uniquebrains.org/marketplace         → Public marketplace (redirects based on login)
```

## Component Architecture

### 1. Enhanced AuthContext
**Location**: `src/context/AuthContext.jsx`

**New State:**
```javascript
const [activePortal, setActivePortal] = useState(null) // 'teach' | 'learn' | null
const [availablePortals, setAvailablePortals] = useState([]) // ['teach', 'learn']
```

**New Methods:**
- `detectAvailablePortals()` - Query user's courses and enrollments
- `switchPortal(portal)` - Change active portal and navigate
- `getActivePortal()` - Return current active portal based on URL path

**Portal Detection Logic:**
```javascript
async function detectAvailablePortals(userId) {
  const portals = []
  
  // Check if user has created courses (teach capability)
  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .eq('instructor_id', userId)
    .limit(1)
  
  if (courses?.length > 0) {
    portals.push('teach')
  }
  
  // Check if user has enrollments (learn capability)
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
  
  if (enrollments?.length > 0) {
    portals.push('learn')
  }
  
  // Always include primary role portal
  if (profile.role === 'instructor' && !portals.includes('teach')) {
    portals.push('teach')
  }
  if (profile.role === 'parent' && !portals.includes('learn')) {
    portals.push('learn')
  }
  
  return portals
}
```


### 2. Portal Switcher Component
**Location**: `src/components/PortalSwitcher.jsx` (new file)

**Props:**
- `currentPortal` - Current portal ('teach' or 'learn')
- `availablePortals` - Array of available portals
- `compact` - Boolean for compact display (footer vs profile dropdown)

**UI Design (Footer):**
```
Currently in Teaching Portal | Switch to Learning Portal →
```

**UI Design (Profile Dropdown):**
```
Profile ▼
├─ My Profile
├─ Settings
├─ ─────────────
└─ Switch to Learning Portal →
```

**Behavior:**
- Only renders when `availablePortals.length > 1`
- Links to opposite portal's dashboard
- Can be placed in footer or profile dropdown
- Simple text link, not a toggle switch

### 3. Modified Registration Flow
**Location**: `src/pages/Register.jsx`

**Changes:**
- Keep existing role selection UI
- Store selected role as primary role in profile
- After registration, redirect to appropriate portal:
  - Instructor → `/teach/dashboard`
  - Parent → `/learn/onboarding`
- OAuth flow captures role preference via localStorage

### 4. Modified Login Flow
**Location**: `src/pages/Login.jsx`

**Changes:**
- Remove role selection UI (role cards and selectedRole state)
- Remove demo accounts section
- Simplify OAuth button text (no role reference)
- Remove role parameter from login function call
- After successful login, redirect based on:
  1. Last visited portal (from localStorage or referrer)
  2. Primary role if no history
  3. Available portals if dual-role user

### 5. Dashboard Adaptations

#### Instructor Dashboard (Teaching Portal)
**Location**: `src/pages/InstructorDashboard.jsx`
**Path**: `/teach/dashboard`

**Changes:**
- Add PortalSwitcher in footer (if user has learn capability)
- Show "Browse Marketplace" button
- When viewing marketplace, show "Enroll" on others' courses
- Show "Manage" button on own courses

#### Parent Dashboard (Learning Portal)
**Location**: `src/pages/MyCourses.jsx`
**Path**: `/learn/dashboard`

**Changes:**
- Add PortalSwitcher in footer (if user has teach capability)
- Add "Create Course" button (links to /teach/create-course)
- Show child selector
- Display enrolled courses


### 6. Marketplace Modifications
**Location**: `src/pages/Marketplace.jsx`
**Paths**: `/teach/marketplace` and `/learn/marketplace`

**Changes:**
- Accessible from both portals
- Detect current portal from URL path
- Detect if viewing user is course owner
- Show "Manage" button for owned courses (teach portal)
- Show "Enroll" button for non-owned courses (both portals)
- Enrollment flow adapts based on portal:
  - `/teach/marketplace` → Enroll current user
  - `/learn/marketplace` → Enroll selected child

### 7. Routing Structure
**Location**: `src/App.jsx`

**New Route Organization:**
```javascript
<Routes>
  {/* Public routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/register" element={<Register />} />
  <Route path="/login" element={<Login />} />
  
  {/* Teaching Portal */}
  <Route path="/teach" element={<TeachPortalLayout />}>
    <Route path="dashboard" element={<InstructorDashboard />} />
    <Route path="marketplace" element={<Marketplace portal="teach" />} />
    <Route path="my-courses" element={<InstructorCourses />} />
    <Route path="course/:id/manage" element={<ManageCourse />} />
    {/* ... other teach routes */}
  </Route>
  
  {/* Learning Portal */}
  <Route path="/learn" element={<LearnPortalLayout />}>
    <Route path="dashboard" element={<ParentDashboard />} />
    <Route path="marketplace" element={<Marketplace portal="learn" />} />
    <Route path="my-courses" element={<MyCourses />} />
    <Route path="course/:id/view" element={<CourseView />} />
    {/* ... other learn routes */}
  </Route>
</Routes>
```

## Data Flow

### Initial Load
```
1. User logs in
2. AuthContext loads profile (primary role)
3. detectAvailablePortals() queries courses and enrollments
4. Set availablePortals state
5. Determine which portal to show:
   - Check URL path (/teach or /learn)
   - Or check localStorage for last portal
   - Or use primary role default
6. Render appropriate portal layout
```

### Portal Switch
```
1. User clicks "Switch to Teaching/Learning Portal" link
2. Navigate to opposite portal's dashboard
3. URL changes (e.g., /learn/dashboard → /teach/dashboard)
4. Portal layout re-renders
5. Save portal preference to localStorage
Note: Portal switching only via explicit link click
```

### Course Creation (Parent → Instructor)
```
1. Parent in learning portal clicks "Create Course"
2. Redirected to /teach/create-course
3. Course saved with instructor_id = user.id
4. detectAvailablePortals() re-runs
5. availablePortals updated to include 'teach'
6. Portal switcher link appears in footer
7. User can now access /teach portal
```

### Course Enrollment (Instructor → Parent)
```
1. Instructor in teaching portal enrolls in course
2. Enrollment saved with user_id = user.id
3. detectAvailablePortals() re-runs
4. availablePortals updated to include 'learn'
5. Portal switcher link appears in footer
6. User can now access /learn portal
7. Enrolled courses visible in /learn/my-courses
```

### Dashboard Separation
```
Teaching Portal (/teach):
- Shows courses user teaches
- Sessions, homework, chat for instructor's courses
- Student roster for instructor's courses
- Course management features
- Marketplace with "Manage" on own courses

Learning Portal (/learn):
- Shows courses user/children are enrolled in
- Sessions, homework, chat for enrolled courses
- Child management (available to all users)
- Enrollment management
- Marketplace with "Enroll" on all courses

No cross-contamination between portals
```

## Database Schema

**No changes required** - Using existing schema:

```sql
-- profiles table (existing)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('instructor', 'parent')),
  -- ... other fields
);

-- courses table (existing)
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  instructor_id UUID REFERENCES profiles(id),
  -- ... other fields
);

-- enrollments table (existing)
CREATE TABLE enrollments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  -- ... other fields
);
```


## UI/UX Design

### Role Toggle Component Specs

**Visual Design:**
- Segmented control style (iOS-inspired)
- 300px width, 44px height
- Rounded corners (22px border-radius)
- Smooth slide animation (200ms ease-in-out)
- Icons + text labels
- Active state: Primary brand color background
- Inactive state: Transparent with border

**Placement:**
- Top-right of dashboard header
- Below main navigation
- Above dashboard content
- Sticky on scroll (optional)

**States:**
- Default: Shows current active role
- Hover: Slight opacity change on inactive side
- Active: Highlighted with brand color
- Disabled: Grayed out (when only one role available)

### Navigation Changes

**Current Navigation:**
```
Home | Marketplace | My Courses | Dashboard
```

**Enhanced Navigation (Dual Role):**
```
Home | Marketplace | My Courses | [Role Toggle] | Dashboard
```

**Role-Specific Links:**
- **Instructor Mode**: Dashboard → Instructor Dashboard
- **Parent Mode**: Dashboard → My Courses (with student selector)

### Dashboard Headers

**Instructor Dashboard:**
```
┌─────────────────────────────────────────────┐
│  UniqueBrains                    [👨‍👩‍👧‍👦|👨‍🏫] │
│                                              │
│  Instructor Dashboard                        │
│  [Create Course] [Browse Marketplace]        │
└─────────────────────────────────────────────┘
```

**Parent Dashboard:**
```
┌─────────────────────────────────────────────┐
│  UniqueBrains                    [👨‍👩‍👧‍👦|👨‍🏫] │
│                                              │
│  My Courses                                  │
│  [Student: Alex ▼] [Create Course]          │
└─────────────────────────────────────────────┘
```


## Implementation Strategy

### Phase 1: Core Infrastructure (High Priority)
1. Enhance AuthContext with role detection
2. Add activeRole and availableRoles state
3. Implement detectAvailableRoles() method
4. Implement switchRole() method
5. Add localStorage persistence

### Phase 2: UI Components (High Priority)
1. Create RoleToggle component
2. Add CSS styling with animations
3. Integrate into Layout component
4. Test responsive behavior

### Phase 3: Dashboard Integration (High Priority)
1. Update InstructorDashboard with toggle
2. Update MyCourses with toggle and create button
3. Ensure proper navigation on role switch
4. Test role-specific content visibility

### Phase 4: Marketplace Enhancement (Medium Priority)
1. Add course ownership detection
2. Implement conditional button rendering (Manage vs Enroll)
3. Test enrollment flow for instructors
4. Verify course management for parents

### Phase 5: Registration & Login (Medium Priority)
1. Verify registration flow captures primary role
2. Remove role selection from login page
3. Test OAuth role preference handling
4. Ensure proper redirect after login

### Phase 6: Testing & Polish (Low Priority)
1. Test all role switching scenarios
2. Verify localStorage persistence
3. Test edge cases (no courses, no enrollments)
4. Performance testing
5. Accessibility testing

## Error Handling

### Role Detection Failures
- Fallback to primary role from profile
- Log error for monitoring
- Show user-friendly message if needed

### Role Switch Failures
- Revert to previous role
- Show error toast
- Maintain UI state consistency

### Navigation Failures
- Redirect to safe default (home or primary dashboard)
- Log navigation error
- Preserve user context


## Testing Strategy

### Unit Tests
- AuthContext role detection logic
- Role switching functionality
- localStorage persistence
- RoleToggle component rendering

### Integration Tests
- Registration flow with role selection
- Login flow without role selection
- Course creation triggers role availability
- Enrollment triggers role availability
- Role toggle updates navigation
- Dashboard content changes on role switch

### E2E Tests
1. **New User Journey (Instructor)**
   - Register as instructor
   - Create first course
   - Browse marketplace
   - Enroll in another course
   - Verify role toggle appears
   - Switch to parent view
   - Verify enrolled courses visible

2. **New User Journey (Parent)**
   - Register as parent
   - Add student profile
   - Enroll in course
   - Create first course
   - Verify role toggle appears
   - Switch to instructor view
   - Verify course management available

3. **Returning User Journey**
   - Login (no role selection)
   - Verify correct dashboard loads
   - Switch roles
   - Verify preference persists
   - Logout and login again
   - Verify last role preference used

### Edge Cases
- User with no courses and no enrollments
- User deletes all courses (loses instructor role?)
- User unenrolls from all courses (loses parent role?)
- Concurrent role switches
- Role switch during form submission

## Performance Considerations

### Optimization Strategies
1. **Cache role detection results**
   - Store in AuthContext state
   - Refresh only on relevant actions (course creation, enrollment)
   - Avoid repeated database queries

2. **Lazy load role-specific components**
   - Load instructor dashboard only when needed
   - Load parent dashboard only when needed
   - Reduce initial bundle size

3. **Debounce role detection**
   - Prevent rapid repeated queries
   - Use 500ms debounce on role switch

4. **Efficient queries**
   - Use `.limit(1)` for existence checks
   - Select only `id` field
   - Add database indexes if needed


## Security Considerations

### Authorization Checks
- Verify user owns course before showing "Manage" button
- Verify enrollment exists before showing enrolled course content
- Maintain existing RLS policies
- No privilege escalation through role switching

### Data Isolation
- Instructor data only visible in instructor mode
- Parent/student data only visible in parent mode
- Role switch doesn't bypass RLS policies
- Course ownership verified server-side

### Session Management
- Role preference stored in localStorage (non-sensitive)
- Actual permissions determined server-side
- Role switch doesn't create new session
- Logout clears role preference

## Accessibility

### Keyboard Navigation
- Role toggle accessible via Tab key
- Arrow keys to switch between roles
- Enter/Space to activate role
- Focus indicators clearly visible

### Screen Readers
- Announce current role on page load
- Announce role change when toggled
- Label toggle with "Switch between Instructor and Parent roles"
- Use semantic HTML (button, not div)

### Visual Accessibility
- High contrast for role toggle
- Clear active state indication
- Minimum 44px touch target
- Works with browser zoom up to 200%

## Monitoring & Analytics

### Metrics to Track
- Role toggle usage frequency
- Percentage of users with dual roles
- Most common role switching patterns
- Time spent in each role
- Conversion: single role → dual role

### Error Monitoring
- Role detection failures
- Role switch failures
- Navigation errors after role switch
- localStorage access errors

### User Behavior
- Which role users start with
- Which role users use more frequently
- Features accessed in each role
- Drop-off points in dual-role flows

## Future Enhancements

### Potential Improvements
1. **Role-specific notifications**
   - Separate notification streams per role
   - Badge counts per role

2. **Role-based profile sections**
   - Instructor bio and credentials
   - Parent preferences and student info

3. **Quick role switch shortcuts**
   - Keyboard shortcut (e.g., Ctrl+Shift+R)
   - Context menu in navigation

4. **Role activity dashboard**
   - Stats for each role
   - Quick links to role-specific actions

5. **Database schema migration**
   - Move to array-based roles
   - Support more than 2 roles
   - Add role permissions system

## Open Questions & Decisions

### Resolved
- ✅ Use application-layer role management (no DB changes)
- ✅ Show toggle only when user has both role activities
- ✅ Persist role preference in localStorage
- ✅ Keep existing registration flow with role selection
- ✅ **No role switching mid-workflow** - Dashboards are distinct and separate
- ✅ **Notifications show on either dashboard** - No role-specific filtering needed
- ✅ **Chat/messaging separated by dashboard** - Sessions, homework, chat are role-specific
- ✅ **No role-specific profile information** - Single profile works for both roles
- ✅ **Child management available to all** - Instructors can add children organically
- ✅ **Rename "Student Management" to "Child Management"** - Avoids confusion with course students

## Dependencies & Integration Points

### Internal Dependencies
- AuthContext (core authentication)
- Navigation/Layout components
- Dashboard components
- Marketplace component
- Course creation flow
- Enrollment flow

### External Dependencies
- Supabase (database queries)
- React Router (navigation)
- localStorage API (persistence)

### API Endpoints Used
- `GET /profiles` - User profile with primary role
- `GET /courses?instructor_id=X` - Check course ownership
- `GET /enrollments?user_id=X` - Check enrollments
- No new endpoints required

## Rollback Plan

If issues arise:
1. Remove RoleToggle component from Layout
2. Revert AuthContext changes (keep backward compatible)
3. Remove role switching logic
4. Users continue with single role (existing behavior)
5. No database rollback needed (no schema changes)

## Success Criteria

### Must Have
- ✅ Users can switch between roles without errors
- ✅ Role toggle appears when user has both activities
- ✅ Navigation updates correctly on role switch
- ✅ Role preference persists across sessions
- ✅ No breaking changes to existing functionality

### Should Have
- ✅ Smooth animations and transitions
- ✅ Clear visual feedback on role state
- ✅ Accessible to keyboard and screen reader users
- ✅ Performance impact < 100ms

### Nice to Have
- ✅ Analytics tracking for role usage
- ✅ Keyboard shortcuts for role switching
- ✅ Role-specific onboarding tips
