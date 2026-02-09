# Requirements Document

## Introduction

This document specifies the requirements for restructuring the UniqueBrains application navigation to improve user experience through clearer product-based organization. The restructuring involves renaming the Marketplace to Courses, simplifying navigation menus, consolidating dashboards under a unified route structure, and improving instructor meeting access.

## Glossary

- **System**: The UniqueBrains web application
- **Navigation_Menu**: The primary navigation bar displayed in the application header
- **Marketplace**: The current course browsing interface (to be renamed to Courses)
- **Courses**: The renamed course browsing interface (formerly Marketplace)
- **Dashboard**: The user-specific interface showing enrolled courses or created courses
- **Instructor**: A user with teaching privileges who creates and manages courses
- **Student**: A user who enrolls in and participates in courses
- **Portal**: A role-specific section of the application (teach or learn)
- **Route**: A URL path in the application
- **Meeting_Link**: A URL for joining a live course session

## Requirements

### Requirement 1: Rename Marketplace to Courses

**User Story:** As a user, I want to see "Courses" instead of "Marketplace" throughout the application, so that the terminology is clearer and more intuitive.

#### Acceptance Criteria

1. THE System SHALL display "Courses" in all Navigation_Menu links where "Marketplace" previously appeared
2. WHEN a user navigates to the course browsing page, THE System SHALL use the URL path `/courses` instead of `/marketplace`
3. THE System SHALL update all button text from "Marketplace" to "Courses" or "Browse Courses"
4. THE System SHALL update all page titles and headings from "Marketplace" to "Courses"
5. THE System SHALL maintain backward compatibility by redirecting `/marketplace` requests to `/courses`

### Requirement 2: Simplify Navigation Menu

**User Story:** As a user, I want a cleaner navigation menu with only main product links, so that I can easily find the core features without clutter.

#### Acceptance Criteria

1. THE Navigation_Menu SHALL display only "Courses" and "Community" as primary navigation links for all users
2. WHEN an Instructor views the Navigation_Menu, THE System SHALL NOT display a "Create Course" link in the navigation
3. WHEN an authenticated user views the `/courses` page, THE System SHALL display a "My Courses" button
4. WHEN a user clicks the "My Courses" button on the `/courses` page, THE System SHALL navigate to `/courses/my-courses`
5. THE System SHALL NOT display future "Marketplace" or "Shopping" navigation links until those features are implemented

### Requirement 3: Consolidate Dashboard Under Single Unified Route

**User Story:** As a user, I want a single "My Courses" dashboard that shows different content based on which portal I'm viewing, so that the experience is seamless and the URL structure is simple.

#### Acceptance Criteria

1. WHEN any user accesses their dashboard, THE System SHALL use the route `/courses/my-courses`
2. WHEN a user views `/courses/my-courses` with activePortal set to "learn", THE System SHALL display student dashboard content
3. WHEN a user views `/courses/my-courses` with activePortal set to "teach", THE System SHALL display instructor dashboard content
4. THE System SHALL redirect legacy route `/teach/dashboard` to `/courses/my-courses`
5. THE System SHALL redirect legacy route `/learn/dashboard` to `/courses/my-courses`
6. THE System SHALL preserve all existing dashboard functionality during the route consolidation
7. WHEN a user switches portals, THE System SHALL update the activePortal state and re-render the dashboard content without changing the URL

### Requirement 4: Improve Instructor Meeting Access

**User Story:** As an instructor, I want a "Join Meeting" button similar to what students see, so that I can easily join my own course sessions without copying and pasting links.

#### Acceptance Criteria

1. WHEN an Instructor views a course session with a Meeting_Link, THE System SHALL display a "Join Meeting" button
2. WHEN an Instructor clicks the "Join Meeting" button, THE System SHALL open the Meeting_Link in a new browser tab
3. THE System SHALL display an "Edit" option adjacent to the "Join Meeting" button for Instructors
4. WHEN an Instructor clicks the "Edit" option, THE System SHALL allow modification of the Meeting_Link
5. THE System SHALL maintain the existing student "Join Meeting" functionality without changes

### Requirement 5: Update All Application References

**User Story:** As a developer, I want all hardcoded references to marketplace and legacy routes updated, so that the application is consistent and maintainable.

#### Acceptance Criteria

1. THE System SHALL update all route definitions in the routing configuration to use new path structures
2. THE System SHALL update all navigation link components to reference new routes
3. THE System SHALL update all button and link text in the landing page to use "Courses" terminology
4. THE System SHALL update all internal redirects to use new route structures
5. WHEN the System encounters a legacy route, THE System SHALL redirect to the equivalent new route
6. THE System SHALL update all component imports and references to reflect new naming conventions


### Requirement 6: Default All Users to Student Role

**User Story:** As a new user, I want to be automatically set up as a student without choosing a role, so that I can immediately explore courses, join the community, or shop without friction.

#### Acceptance Criteria

1. WHEN a new user signs up, THE System SHALL automatically set their role to "student"
2. THE System SHALL NOT display role selection during the signup process
3. WHEN a user creates their first course, THE System SHALL prompt them to complete their instructor profile
4. THE System SHALL allow users to update their specialization and bio when prompted
5. WHEN a user has an incomplete instructor profile, THE System SHALL display a reminder button on the teaching portal
6. THE System SHALL allow users to access both learning and teaching portals regardless of their initial role
