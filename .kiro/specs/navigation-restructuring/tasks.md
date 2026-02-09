# Implementation Plan: Navigation Restructuring

## Overview

This implementation plan restructures the UniqueBrains application navigation to improve user experience through clearer product-based organization. The work involves renaming "Marketplace" to "Courses", simplifying navigation menus, updating dashboard routes, and improving instructor meeting access.

## Tasks

- [x] 1. Update routing configuration in App.jsx
  - [x] 1.1 Rename `/marketplace` route to `/courses`
    - Update route path from `path="marketplace"` to `path="courses"`
    - Update element from `<Marketplace />` to `<Courses />`
    - Add redirect from `/marketplace` to `/courses`
    - _Requirements: 1.2, 1.5_
  
  - [x] 1.2 Rename dashboard routes
    - Update `/teach/dashboard` route to `/teach/my-courses`
    - Update `/learn/dashboard` route to `/learn/my-courses`
    - Add redirects from old dashboard routes to new routes
    - _Requirements: 3.1, 3.2, 3.4, 3.5_
  
  - [ ]* 1.3 Write unit tests for routing changes
    - Test `/courses` route renders Courses component
    - Test `/marketplace` redirects to `/courses`
    - Test `/teach/dashboard` redirects to `/teach/my-courses`
    - Test `/learn/dashboard` redirects to `/learn/my-courses`
    - _Requirements: 1.2, 1.5, 3.4, 3.5_

- [x] 2. Rename Marketplace component to Courses
  - [x] 2.1 Rename Marketplace.jsx to Courses.jsx
    - Rename file from `src/pages/Marketplace.jsx` to `src/pages/Courses.jsx`
    - Update component name from `Marketplace` to `Courses`
    - Update all imports in App.jsx
    - _Requirements: 1.1_
  
  - [x] 2.2 Rename Marketplace.css to Courses.css
    - Rename file from `src/pages/Marketplace.css` to `src/pages/Courses.css`
    - Update CSS class names from `marketplace-*` to `courses-*`
    - Update import in Courses.jsx
    - _Requirements: 1.1_
  
  - [x] 2.3 Add "My Courses" button to Courses page
    - Add button that appears only for authenticated users
    - Button should navigate to appropriate dashboard based on `activePortal`
    - Use `activePortal === 'teach' ? '/teach/my-courses' : '/learn/my-courses'`
    - Style button prominently in header area
    - _Requirements: 2.3, 2.4_
  
  - [ ]* 2.4 Write unit tests for Courses component
    - Test "My Courses" button appears for authenticated users
    - Test "My Courses" button does not appear for unauthenticated users
    - Test button navigates to correct route based on active portal
    - _Requirements: 2.3, 2.4_

- [x] 3. Update Layout navigation component
  - [x] 3.1 Update navigation links
    - Change "Marketplace" link text to "Courses"
    - Update link href from `/marketplace` to `/courses`
    - Remove "Create Course" link from instructor navigation
    - Remove role-specific "Dashboard" or "My Courses" links from navigation
    - Keep only "Courses" and "Community" in main navigation
    - _Requirements: 1.1, 2.1, 2.2_
  
  - [ ]* 3.2 Write unit tests for Layout navigation
    - Test navigation displays "Courses" link
    - Test navigation does not display "Marketplace" text
    - Test navigation does not display "Create Course" for instructors
    - Test only "Courses" and "Community" appear in navigation
    - _Requirements: 1.1, 2.1, 2.2_

- [x] 4. Update LandingPage component
  - [x] 4.1 Update course browsing links
    - Change "Explore Courses" button href from `/marketplace` to `/courses`
    - Change "Browse Courses" button href from `/marketplace` to `/courses`
    - Update "Start Teaching" button to navigate to `/teach/my-courses` for authenticated instructors
    - _Requirements: 1.3, 5.3_
  
  - [x] 4.2 Update text references
    - Search for any "marketplace" text and replace with "courses"
    - Verify all button text uses "Courses" or "Browse Courses"
    - _Requirements: 1.3, 1.4, 5.3_
  
  - [ ]* 4.3 Write unit tests for LandingPage
    - Test "Explore Courses" button links to `/courses`
    - Test "Browse Courses" button links to `/courses`
    - Test no "Marketplace" text appears on page
    - _Requirements: 1.3, 5.3_

- [x] 5. Checkpoint - Verify routing and navigation changes
  - Ensure all tests pass
  - Manually test navigation between pages
  - Verify redirects work correctly
  - Ask the user if questions arise

- [x] 6. Update PortalSwitcher component for route navigation
  - [x] 6.1 Implement portal switching with navigation
    - Update portal switch handler to navigate to appropriate route
    - Switching to "Teaching Portal" should navigate to `/teach/my-courses`
    - Switching to "Learning Portal" should navigate to `/learn/my-courses`
    - Use `useNavigate` hook from react-router-dom
    - Maintain existing `activePortal` state update in AuthContext
    - _Requirements: 3.7_
  
  - [ ]* 6.2 Write unit tests for PortalSwitcher navigation
    - Test switching to teaching portal navigates to `/teach/my-courses`
    - Test switching to learning portal navigates to `/learn/my-courses`
    - Test activePortal state updates correctly
    - _Requirements: 3.7_

- [x] 7. Update InstructorDashboard for meeting access
  - [x] 7.1 Add "Join Meeting" button for sessions
    - Display "Join Meeting" button for sessions with meeting_link
    - Button should open meeting link in new tab (target="_blank", rel="noopener noreferrer")
    - Add appropriate styling and icon
    - _Requirements: 4.1, 4.2_
  
  - [x] 7.2 Add "Edit" button for meeting links
    - Display "Edit" button adjacent to "Join Meeting" button
    - Clicking "Edit" should show inline edit UI or modal
    - Implement meeting link update functionality
    - _Requirements: 4.3, 4.4_
  
  - [x] 7.3 Implement meeting link update API call
    - Add `updateMeetingLink` function to sessionService.js if not present
    - Function should update meeting_link in sessions table
    - Include instructor_id check for security
    - Handle errors appropriately
    - _Requirements: 4.4_
  
  - [ ]* 7.4 Write unit tests for meeting access features
    - Test "Join Meeting" button appears for sessions with meeting links
    - Test "Join Meeting" button opens link in new tab
    - Test "Edit" button appears adjacent to "Join Meeting"
    - Test clicking "Edit" displays edit UI
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Update ManageSessions component for meeting access
  - [x] 8.1 Add "Join Meeting" button to session list
    - Display "Join Meeting" button for sessions with meeting links
    - Button should open meeting link in new tab
    - Add inline edit functionality for meeting links
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [ ]* 8.2 Write unit tests for ManageSessions meeting access
    - Test "Join Meeting" button appears and works correctly
    - Test inline edit functionality for meeting links
    - _Requirements: 4.1, 4.2, 4.4_

- [x] 9. Verify student meeting join functionality
  - [x] 9.1 Test student meeting join still works
    - Verify StudentCourseView component still displays "Join Meeting" button
    - Verify button still opens meeting link correctly
    - No changes should be needed, just verification
    - _Requirements: 4.5_
  
  - [ ]* 9.2 Write regression tests for student meeting join
    - Test student "Join Meeting" button appears for sessions with links
    - Test button opens link correctly
    - _Requirements: 4.5_

- [x] 10. Update all internal navigation links
  - [x] 10.1 Search and update dashboard links
    - Search codebase for `/teach/dashboard` and update to `/teach/my-courses`
    - Search codebase for `/learn/dashboard` and update to `/learn/my-courses`
    - Update any hardcoded links in components
    - _Requirements: 3.4, 3.5, 5.2_
  
  - [x] 10.2 Search and update marketplace links
    - Search codebase for `/marketplace` and update to `/courses`
    - Update any hardcoded links in components
    - Verify all "Browse Courses" or similar links point to `/courses`
    - _Requirements: 1.2, 5.2_

- [x] 11. Final checkpoint - Integration testing
  - [x] 11.1 Test complete user flows
    - Test browsing courses as unauthenticated user
    - Test browsing courses and navigating to "My Courses" as authenticated user
    - Test portal switching between teaching and learning dashboards
    - Test instructor meeting join and edit functionality
    - Test student meeting join functionality
    - Test all legacy route redirects
  
  - [x] 11.2 Test on different user roles
    - Test as student-only user
    - Test as instructor-only user
    - Test as dual-role user with portal switching
    - Test as unauthenticated user
  
  - [x] 11.3 Verify no "Marketplace" terminology remains
    - Search entire codebase for "marketplace" (case-insensitive)
    - Verify only appropriate references remain (CSS files, comments)
    - Verify all user-facing text uses "Courses"
  
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The implementation maintains backward compatibility through redirects
- Portal switching functionality is preserved with route-based navigation
- All existing dashboard functionality is maintained
