# Dual Role Support - Requirements

## Feature Overview
Enable users to have both instructor and parent roles simultaneously, allowing them to teach courses and manage their children's learning within the same account. The system should intelligently adapt the UI based on the user's activities and provide seamless role switching.

## User Stories

### 1. First-Time Visitor Registration
**As a first-time visitor**  
**I want to** see an option to sign up as either an instructor OR a parent  
**So that** the welcome flow is tailored to my primary role

**Acceptance Criteria:**
- 1.1 Registration page displays two distinct role options: "Instructor" and "Parent"
- 1.2 User can select only one role during initial registration
- 1.3 Role selection is visually clear with icons and descriptions
- 1.4 Selected role determines the initial onboarding flow
- 1.5 OAuth registration also captures role preference

### 2. Repeat Visitor Login
**As a repeat visitor**  
**I want to** see a standard login screen regardless of my role  
**So that** I can quickly access my account without role selection

**Acceptance Criteria:**
- 2.1 Login page does not show role selection
- 2.2 Login page does not show demo accounts section
- 2.3 Login works for all users regardless of their role(s)
- 2.4 After login, user is redirected based on their current role state
- 2.5 OAuth login works seamlessly for returning users

### 3. Dashboard Role Toggle
**As a user with both instructor and parent activities**  
**I want to** see a toggle on my dashboard to switch between instructor and parent views  
**So that** I can access both sets of features without logging out


**Acceptance Criteria:**
- 3.1 Dashboard displays a role toggle when user has created courses OR enrolled students
- 3.2 Toggle shows current active role (Instructor/Parent)
- 3.3 Clicking toggle switches the dashboard view and navigation
- 3.4 Role preference persists across sessions
- 3.5 If user only has one role activity, no toggle is shown

### 4. Instructor Course Enrollment
**As an instructor**  
**I want to** enroll in other instructors' courses from the marketplace  
**So that** I can learn new skills while also teaching

**Acceptance Criteria:**
- 4.1 Instructors see "Enroll" button on courses they don't own
- 4.2 Instructors see "Manage" button on their own courses
- 4.3 Enrollment flow works identically for instructors as for parents
- 4.4 Enrolled courses appear in "My Courses" section
- 4.5 After first enrollment, role toggle becomes available

### 5. Parent Course Creation
**As a parent**  
**I want to** create and teach courses from my dashboard  
**So that** I can share my expertise while managing my children's education

**Acceptance Criteria:**
- 5.1 Parents see "Create Course" option in their dashboard
- 5.2 Course creation flow works identically for parents as for instructors
- 5.3 After creating first course, role toggle becomes available
- 5.4 Created courses appear in instructor dashboard view
- 5.5 Parent can access instructor features (manage sessions, homework, etc.)

### 6. Universal Child Management
**As any user (instructor or parent)**  
**I want to** manage my children's profiles  
**So that** I can enroll them in courses regardless of my primary role

**Acceptance Criteria:**
- 6.1 Child management is available to all users in profile section
- 6.2 Section is labeled "Child Management" (not "Student Management")
- 6.3 Instructors can add children and enroll them in courses
- 6.4 Child management works identically for both roles
- 6.5 Adding a child does not affect primary role or capabilities

## Business Rules

### Role Determination Logic
1. **Primary Role**: The role selected during registration
2. **Secondary Role Activation**: Automatically enabled when user performs cross-role activity
   - Parent creates a course → Gains instructor capabilities
   - Instructor enrolls in a course → Gains parent-like enrollment capabilities
3. **Role Toggle Visibility**: Only shown when user has activities in both roles

### Dashboard Separation
- **Distinct Dashboards**: Instructor and Parent dashboards are completely separate
- **No Mid-Workflow Switching**: Users cannot switch roles while in a workflow (e.g., creating a course)
- **Role-Specific Content**: Sessions, homework, chat, and resources are separated by dashboard
- **Notifications**: Can appear on either dashboard regardless of role

### Child Management
- **Universal Access**: Both instructors and parents can manage children
- **Terminology**: Use "Child Management" instead of "Student Management" to avoid confusion
- **Organic Discovery**: Instructors who enroll in courses can naturally discover child management features
- **Profile Agnostic**: Single profile works for both roles; no role-specific profile sections needed

### Database Considerations
- Current: Single `role` column with CHECK constraint (instructor/parent)
- Solution: Keep existing schema, manage dual roles in application layer
- Profile table maintains primary role
- Role capabilities determined by user activities (courses created, enrollments)

### Navigation & Routing
- `/teach/*` - Teaching portal (instructor features)
- `/learn/*` - Learning portal (parent/student features)
- Portal switcher links in footer when user has both capabilities
- Deep links work regardless of current portal
- No portal switching allowed during active workflows
- URL path determines portal context


## Technical Constraints

### Must Maintain
- Existing database schema (no breaking changes)
- Current RLS policies
- Existing authentication flow
- OAuth integration

### Performance Requirements
- Role detection query < 100ms
- Role toggle response < 200ms
- No additional database migrations required

## Out of Scope
- Changing database schema to array-based roles
- Creating separate accounts for different roles
- Role-based pricing or permissions
- Admin role or moderation features
- Role-specific profile sections or information
- Role-specific notification filtering
- Mid-workflow role switching
- Unified chat identity across roles (chat remains role-specific)

## Success Metrics
- Users can successfully switch between roles without errors
- No increase in authentication-related support tickets
- Reduced need for multiple accounts (track account creation rate)
- Increased user engagement (users active in both roles)

## Dependencies
- Existing authentication system (AuthContext)
- Profile management system
- Course creation and enrollment services
- Navigation and routing system

## Assumptions
- Users understand the concept of dual roles
- Most users will primarily use one role
- Role switching is an occasional action, not frequent
- UI can clearly communicate current role state

## Open Questions
1. Should we allow role switching mid-workflow (e.g., while creating a course)?
2. How do we handle notifications for dual-role users?
3. Should chat/messaging show different identities based on role?
4. Do we need role-specific profile information?

## Related Documentation
- PROJECT_BOARD.md - Dual Role Support section
- src/context/AuthContext.jsx - Current authentication implementation
- src/pages/RoleSelection.jsx - Initial role selection flow
- src/pages/Register.jsx - Registration with role selection
