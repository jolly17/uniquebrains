# Course Creation/Edit Improvements - Requirements

## Overview
Improvements to course creation and editing based on instructor feedback to make the process clearer and more intuitive.

## User Stories

### 1. Time Format Clarity
**As an instructor**, I want to select course time in 12-hour format (AM/PM) so that I don't get confused by 24-hour time.

**Acceptance Criteria:**
- Time input shows 12-hour format with AM/PM selector
- Clear visual indication of AM vs PM
- Converts properly to database format

### 2. Bulk Session Time Update
**As an instructor**, when I update the course time, I want all existing sessions to update automatically so that I don't have to manually change each session.

**Acceptance Criteria:**
- When course time is edited, all future sessions update to new time
- Past sessions remain unchanged
- User sees confirmation of how many sessions will be updated

### 3. My Courses Button in Profile
**As an instructor**, I want to see "My Courses" button in my profile so that I can quickly access my courses.

**Acceptance Criteria:**
- "My Courses" button appears in instructor profile
- Navigates to instructor's course list
- Consistent with other navigation patterns

### 4. Edit Schedule in Manage Course
**As an instructor**, I want to edit course schedule (time, days, duration) from the manage course page so that I don't have to navigate to a separate edit page.

**Acceptance Criteria:**
- Schedule editing section in manage course page
- Can update: time, days, session duration
- Updates apply to future sessions
- Similar UI to meeting link update section

### 5. Meeting Link Validation
**As an instructor**, I want the system to validate that meeting link is a proper URL so that I don't accidentally enter invalid links.

**Acceptance Criteria:**
- Validates URL format (http:// or https://)
- Shows error message for invalid URLs
- Accepts common meeting platforms (Zoom, Google Meet, etc.)

### 6. Session Duration Default
**As an instructor**, when I create a new session, I want it to default to the course's session duration so that I don't have to set it every time.

**Acceptance Criteria:**
- New session duration defaults to course session duration
- Can still be overridden if needed
- Clear indication of default value

### 7. Better Session Topic Labels
**As an instructor**, I want session topics labeled as "Session 1 Topics", "Session 2 Topics" so that it's clear what they represent.

**Acceptance Criteria:**
- Topics labeled as "Session X Topics" instead of "Topic X"
- Note during course creation that topics can be edited later in manage course
- Consistent labeling throughout the app
