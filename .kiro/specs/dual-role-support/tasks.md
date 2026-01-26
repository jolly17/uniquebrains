# Dual Role Support - Implementation Tasks

## Phase 1: Core Infrastructure

### 1. Enhance AuthContext with Portal Detection
- [ ] 1.1 Add `activePortal` state to AuthContext
- [ ] 1.2 Add `availablePortals` state to AuthContext
- [ ] 1.3 Implement `detectAvailablePortals()` method
  - [ ] 1.3.1 Query courses table for teach capability
  - [ ] 1.3.2 Query enrollments table for learn capability
  - [ ] 1.3.3 Include primary role portal by default
  - [ ] 1.3.4 Return array of available portals
- [ ] 1.4 Implement `getActivePortal()` method
  - [ ] 1.4.1 Detect portal from URL path (/teach or /learn)
  - [ ] 1.4.2 Fallback to localStorage preference
  - [ ] 1.4.3 Fallback to primary role default
- [ ] 1.5 Load portal preference from localStorage on mount
- [ ] 1.6 Call detectAvailablePortals() after login
- [ ] 1.7 Export new methods in AuthContext provider

## Phase 2: Portal Switcher Component

### 2. Create PortalSwitcher Component
- [ ] 2.1 Create `src/components/PortalSwitcher.jsx`
- [ ] 2.2 Create `src/components/PortalSwitcher.css`
- [ ] 2.3 Implement component structure
  - [ ] 2.3.1 Accept currentPortal, availablePortals, compact props
  - [ ] 2.3.2 Render only when availablePortals.length > 1
  - [ ] 2.3.3 Display link to opposite portal
  - [ ] 2.3.4 Support compact mode for footer
- [ ] 2.4 Add styling
  - [ ] 2.4.1 Simple text link design
  - [ ] 2.4.2 Icon/arrow indicator
  - [ ] 2.4.3 Hover states
  - [ ] 2.4.4 Responsive design
- [ ] 2.5 Add accessibility features
  - [ ] 2.5.1 Proper link semantics
  - [ ] 2.5.2 ARIA labels
  - [ ] 2.5.3 Keyboard navigation support


## Phase 3: Routing & Portal Structure

### 3. Implement Path-Based Routing
- [ ] 3.1 Update App.jsx with portal routes
  - [ ] 3.1.1 Create /teach route group
  - [ ] 3.1.2 Create /learn route group
  - [ ] 3.1.3 Add portal-specific layouts
- [ ] 3.2 Create TeachPortalLayout component
  - [ ] 3.2.1 Teaching-specific navigation
  - [ ] 3.2.2 Include PortalSwitcher in footer
- [ ] 3.3 Create LearnPortalLayout component
  - [ ] 3.3.1 Learning-specific navigation
  - [ ] 3.3.2 Include PortalSwitcher in footer
  - [ ] 3.3.3 Include child selector
- [ ] 3.4 Update existing routes to use portal paths
  - [ ] 3.4.1 Move instructor routes to /teach/*
  - [ ] 3.4.2 Move parent routes to /learn/*
- [ ] 3.5 Add portal detection utility
  - [ ] 3.5.1 Function to get current portal from URL
  - [ ] 3.5.2 Function to generate portal-specific URLs

## Phase 4: Dashboard Integration

### 4. Update Instructor Dashboard (Teaching Portal)
- [ ] 4.1 Move to /teach/dashboard route
- [ ] 4.2 Add PortalSwitcher in footer (conditional)
- [ ] 4.3 Add "Browse Marketplace" button
- [ ] 4.4 Test portal switching from instructor view
- [ ] 4.5 Verify teach-specific content only

### 5. Update Parent Dashboard (Learning Portal)
- [ ] 5.1 Move to /learn/dashboard route
- [ ] 5.2 Add PortalSwitcher in footer (conditional)
- [ ] 5.3 Add "Create Course" button (links to /teach/create-course)
- [ ] 5.4 Test portal switching from parent view
- [ ] 5.5 Verify learn-specific content only

## Phase 5: Marketplace Enhancement

### 6. Update Marketplace for Dual Portal Access
- [ ] 6.1 Add portal prop to Marketplace component
- [ ] 6.2 Create /teach/marketplace route
- [ ] 6.3 Create /learn/marketplace route
- [ ] 6.4 Detect current portal from route/prop
- [ ] 6.5 Implement course ownership detection
- [ ] 6.6 Conditionally render buttons based on portal
  - [ ] 6.6.1 Teaching portal: "Manage" for own courses, "Enroll" for others
  - [ ] 6.6.2 Learning portal: "Enroll" for all courses
- [ ] 6.7 Update enrollment flow based on portal
  - [ ] 6.7.1 Teaching portal: Enroll current user
  - [ ] 6.7.2 Learning portal: Enroll selected child
- [ ] 6.8 Test marketplace from both portals

### 7. Enable Cross-Portal Course Actions
- [ ] 7.1 Verify instructor enrollment flow works
- [ ] 7.2 Test enrollment creates learn capability
- [ ] 7.3 Verify portal switcher appears after enrollment
- [ ] 7.4 Test enrolled courses appear in /learn/my-courses
- [ ] 7.5 Verify parent course creation redirects to /teach


## Phase 6: Registration & Login Updates

### 8. Update Registration Flow
- [ ] 8.1 Keep role selection during registration
- [ ] 8.2 Update redirect after registration
  - [ ] 8.2.1 Instructor → /teach/dashboard
  - [ ] 8.2.2 Parent → /learn/onboarding
- [ ] 8.3 Test OAuth registration with role preference
- [ ] 8.4 Verify localStorage role preference handling
- [ ] 8.5 Support pre-selected role from landing page
  - [ ] 8.5.1 Check URL parameter or localStorage for role hint
  - [ ] 8.5.2 Pre-select instructor role if coming from "Start Teaching" button
  - [ ] 8.5.3 Allow user to change selection if desired

### 9. Update Login Flow
- [ ] 9.1 Remove role selection UI from login page
  - [ ] 9.1.1 Remove role-selection div and role cards
  - [ ] 9.1.2 Remove selectedRole state
  - [ ] 9.1.3 Remove role parameter from login function call
  - [ ] 9.1.4 Update OAuth button text (remove role reference)
- [ ] 9.2 Remove demo accounts section
  - [ ] 9.2.1 Remove demo-accounts div from Login.jsx
  - [ ] 9.2.2 Remove demo account styling from Auth.css if present
- [ ] 9.3 Update login redirect logic
  - [ ] 9.3.1 Check for last visited portal (localStorage or referrer)
  - [ ] 9.3.2 Fallback to primary role portal
  - [ ] 9.3.3 Redirect to appropriate portal dashboard
- [ ] 9.4 Test OAuth login for returning users
- [ ] 9.5 Verify portal preference persists across sessions

### 10. Update Landing Page CTAs
- [ ] 10.1 Update hero section buttons
  - [ ] 10.1.1 Keep "Explore Courses" button (links to /marketplace)
  - [ ] 10.1.2 Keep "Support Our Mission" button (donation link)
  - [ ] 10.1.3 Add "Start Teaching" button
    - [ ] 10.1.3.1 Link to /register with instructor role hint
    - [ ] 10.1.3.2 Style as tertiary/outline button
    - [ ] 10.1.3.3 Position as third button in hero-actions
- [ ] 10.2 Update "Help Us Keep UniqueBrains Free" section
  - [ ] 10.2.1 Keep "Support Our Mission" donation button
  - [ ] 10.2.2 Update "Volunteer as Instructor" button
    - [ ] 10.2.2.1 Change from mailto link to /register link
    - [ ] 10.2.2.2 Add instructor role hint to registration
    - [ ] 10.2.2.3 Update button text to "Sign Up to Teach"
    - [ ] 10.2.2.4 Keep volunteer messaging in surrounding text
- [ ] 10.3 Test landing page CTA flows
  - [ ] 10.3.1 Test "Start Teaching" → Register with instructor pre-selected
  - [ ] 10.3.2 Test "Sign Up to Teach" → Register with instructor pre-selected
  - [ ] 10.3.3 Verify user can still change role selection
  - [ ] 10.3.4 Test on mobile and desktop

## Phase 7: Parent Course Creation

### 11. Enable Course Creation for Parents
- [ ] 11.1 Add "Create Course" button to learning portal
- [ ] 11.2 Link button to /teach/create-course
- [ ] 11.3 Verify course creation flow works for parents
- [ ] 11.4 Test course saves with parent as instructor_id
- [ ] 11.5 Verify portal switcher appears after course creation
- [ ] 11.6 Test access to teaching portal features

## Phase 8: Testing & Quality Assurance

### 12. Unit Testing
- [ ] 12.1 Test detectAvailablePortals() method
- [ ] 12.2 Test getActivePortal() method
- [ ] 12.3 Test localStorage persistence
- [ ] 12.4 Test PortalSwitcher component rendering
- [ ] 12.5 Test portal detection edge cases

### 13. Integration Testing
- [ ] 13.1 Test complete registration flow
- [ ] 13.2 Test complete login flow
- [ ] 13.3 Test course creation triggers portal availability
- [ ] 13.4 Test enrollment triggers portal availability
- [ ] 13.5 Test portal switcher updates navigation
- [ ] 13.6 Test dashboard content changes on portal switch
- [ ] 13.7 Test marketplace behavior in both portals
- [ ] 13.8 Test landing page CTAs
  - [ ] 13.8.1 Test "Start Teaching" button flow
  - [ ] 13.8.2 Test "Sign Up to Teach" button flow
  - [ ] 13.8.3 Verify instructor role pre-selection works


### 14. End-to-End Testing
- [ ] 14.1 Test new instructor user journey
  - [ ] 14.1.1 Register as instructor
  - [ ] 14.1.2 Redirected to /teach/dashboard
  - [ ] 14.1.3 Create first course
  - [ ] 14.1.4 Browse marketplace and enroll
  - [ ] 14.1.5 Verify portal switcher appears
  - [ ] 14.1.6 Switch to learning portal
  - [ ] 14.1.7 Verify enrolled courses visible in /learn/my-courses
- [ ] 14.2 Test new parent user journey
  - [ ] 14.2.1 Register as parent
  - [ ] 14.2.2 Redirected to /learn/onboarding
  - [ ] 14.2.3 Add student profile
  - [ ] 14.2.4 Enroll in course
  - [ ] 14.2.5 Click "Create Course" button
  - [ ] 14.2.6 Redirected to /teach/create-course
  - [ ] 14.2.7 Create course
  - [ ] 14.2.8 Verify portal switcher appears
  - [ ] 14.2.9 Switch to teaching portal
  - [ ] 14.2.10 Verify course management available
- [ ] 14.3 Test returning user journey
  - [ ] 14.3.1 Login without role selection
  - [ ] 14.3.2 Verify correct portal loads (last visited)
  - [ ] 14.3.3 Switch portals via footer link
  - [ ] 14.3.4 Verify preference persists
  - [ ] 14.3.5 Logout and login again
  - [ ] 14.3.6 Verify last portal preference used
- [ ] 14.4 Test direct URL access
  - [ ] 14.4.1 Access /teach/dashboard directly
  - [ ] 14.4.2 Access /learn/dashboard directly
  - [ ] 14.4.3 Verify proper authentication checks
  - [ ] 14.4.4 Verify portal-specific content loads
- [ ] 14.5 Test landing page instructor signup flow
  - [ ] 14.5.1 Click "Start Teaching" from hero section
  - [ ] 14.5.2 Verify redirected to /register with instructor pre-selected
  - [ ] 14.5.3 Complete registration
  - [ ] 14.5.4 Verify redirected to /teach/dashboard
- [ ] 14.6 Test volunteer instructor signup flow
  - [ ] 14.6.1 Click "Sign Up to Teach" from support section
  - [ ] 14.6.2 Verify redirected to /register with instructor pre-selected
  - [ ] 14.6.3 Complete registration
  - [ ] 14.6.4 Verify redirected to /teach/dashboard

### 15. Edge Case Testing
- [ ] 15.1 Test user with no courses and no enrollments
- [ ] 15.2 Test rapid portal switching
- [ ] 15.3 Test portal switch during form submission
- [ ] 15.4 Test localStorage unavailable scenario
- [ ] 15.5 Test concurrent sessions with different portals
- [ ] 15.6 Test invalid portal URLs (/teach/invalid-route)
- [ ] 15.7 Test portal access without proper capabilities

### 16. Accessibility Testing
- [ ] 15.1 Test keyboard navigation
- [ ] 15.2 Test screen reader compatibility
- [ ] 15.3 Test high contrast mode
- [ ] 15.4 Test browser zoom (up to 200%)
- [ ] 15.5 Verify WCAG 2.1 AA compliance

### 16. Performance Testing
- [ ] 16.1 Measure portal detection query time
- [ ] 16.2 Measure portal switch response time
- [ ] 16.3 Test with large number of courses/enrollments
- [ ] 16.4 Verify no memory leaks on portal switching
- [ ] 16.5 Test on slow network connections
- [ ] 16.6 Test route loading performance


## Phase 9: Polish & Documentation

### 17. UI/UX Polish
- [ ] 17.1 Add loading states during portal detection
- [ ] 17.2 Add error messages for portal switch failures
- [ ] 17.3 Add success feedback on portal switch
- [ ] 17.4 Refine animations and transitions
- [ ] 17.5 Test responsive design on all screen sizes
- [ ] 17.6 Add tooltips for portal switcher
- [ ] 17.7 Rename "Student Management" to "Child Management"
  - [ ] 17.7.1 Update navigation labels
  - [ ] 17.7.2 Update page titles and headings
  - [ ] 17.7.3 Update button text and UI labels
  - [ ] 17.7.4 Update any related documentation

### 18. Error Handling
- [ ] 18.1 Handle portal detection failures gracefully
- [ ] 18.2 Handle invalid portal URLs with redirects
- [ ] 18.3 Handle navigation failures with safe defaults
- [ ] 18.4 Add error logging for monitoring
- [ ] 18.5 Display user-friendly error messages
- [ ] 18.6 Handle unauthorized portal access attempts

### 19. Documentation
- [ ] 19.1 Update README with dual portal feature
- [ ] 19.2 Document AuthContext API changes
- [ ] 19.3 Document PortalSwitcher component usage
- [ ] 19.4 Document routing structure
- [ ] 19.5 Add inline code comments
- [ ] 19.6 Create user guide for portal switching
- [ ] 19.7 Update PROJECT_BOARD.md status

### 20. Monitoring & Analytics
- [ ] 20.1 Add analytics tracking for portal switching
- [ ] 20.2 Track percentage of dual-portal users
- [ ] 20.3 Monitor portal usage patterns
- [ ] 20.4 Set up error monitoring for portal-related issues
- [ ] 20.5 Create dashboard for portal usage metrics
- [ ] 20.6 Track most common user journeys

## Optional Enhancements

### 21. Advanced Features (Optional)
- [ ] 21.1* Add keyboard shortcut for portal switching
- [ ] 21.2* Add portal indicator in page title/favicon
- [ ] 21.3* Add portal-specific notification streams
- [ ] 21.4* Add portal activity dashboard
- [ ] 21.5* Add onboarding tips for dual-portal users
- [ ] 21.6* Add breadcrumb navigation showing current portal

## Notes
- Tasks marked with * are optional enhancements
- Phases 1-7 are high priority for MVP
- Phases 8-9 are required before production release
- Phase 21 can be implemented post-launch based on user feedback
- Path-based routing (/teach and /learn) is simpler than subdomains
- Portal switcher is a simple link, not a prominent toggle
