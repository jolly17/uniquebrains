# Requirements Document

## Introduction

This document specifies requirements for enhancing the UniqueBrains course management system with two key features: age group selection for courses and comprehensive course editing capabilities. These enhancements will help instructors better target their courses to appropriate age groups and maintain their course offerings over time.

## Glossary

- **Course_System**: The UniqueBrains course management system that handles course creation, display, and management
- **Instructor**: A user with teaching privileges who can create and manage courses
- **Course_Form**: The user interface for creating or editing course information
- **Course_Card**: The visual component displaying course information in the marketplace
- **Age_Group**: A categorical field representing the target age range for a course
- **Course_Database**: The Supabase database table storing course information
- **Marketplace**: The public-facing page where students browse available courses
- **Instructor_Dashboard**: The interface where instructors manage their courses

## Requirements

### Requirement 1: Age Group Field Addition

**User Story:** As an instructor, I want to specify the target age group for my course, so that students can find courses appropriate for their age.

#### Acceptance Criteria

1. THE Course_Form SHALL include an age group selection field with options: "All ages", "5-8 years", "9-12 years", "13-18 years", and "Adults"
2. WHEN creating a new course, THE Course_System SHALL default the age group field to "All ages"
3. WHEN creating a new course, THE Course_System SHALL store the selected age group in the Course_Database
4. THE Course_Database SHALL include an age_group column that accepts the specified age group values

### Requirement 2: Age Group Display

**User Story:** As a student or parent, I want to see the age group for each course, so that I can quickly identify courses suitable for my needs.

#### Acceptance Criteria

1. WHEN a course has an age group specified, THE Course_Card SHALL display the age group information
2. THE Course_Card SHALL display age group information in a visually clear and consistent manner with existing course metadata

### Requirement 3: Course Edit Interface Creation

**User Story:** As an instructor, I want to access an edit interface for my courses, so that I can update course information after creation.

#### Acceptance Criteria

1. THE Course_System SHALL provide an edit course page accessible via URL pattern `/courses/:id/edit`
2. WHEN an instructor navigates to the edit course page, THE Course_System SHALL load and display the existing course data in an editable form
3. THE Course_Form SHALL pre-populate all fields with current course values when in edit mode
4. THE Course_System SHALL provide a navigation path to the edit course page from the Instructor_Dashboard

### Requirement 4: Editable Course Fields

**User Story:** As an instructor, I want to edit specific course details, so that I can keep my course information current and accurate.

#### Acceptance Criteria

1. WHEN editing a course, THE Course_Form SHALL allow modification of the title field
2. WHEN editing a course, THE Course_Form SHALL allow modification of the description field
3. WHEN editing a course, THE Course_Form SHALL allow modification of the category field
4. WHEN editing a course, THE Course_Form SHALL allow modification of the age group field
5. WHEN editing a course, THE Course_Form SHALL allow modification of timing and schedule fields including session duration, session time, timezone, start date, repeat settings, selected days, and end date
6. WHEN editing a course, THE Course_Form SHALL allow modification of the enrollment limit field
7. WHEN editing a course, THE Course_Form SHALL allow modification of the meeting link field

### Requirement 5: Course Update Persistence

**User Story:** As an instructor, I want my course edits to be saved, so that the updated information is reflected throughout the system.

#### Acceptance Criteria

1. WHEN an instructor submits the edit course form, THE Course_System SHALL validate all required fields
2. WHEN validation passes, THE Course_System SHALL update the course record in the Course_Database with the modified values
3. WHEN the update succeeds, THE Course_System SHALL display a success confirmation to the instructor
4. WHEN the update succeeds, THE Course_System SHALL redirect the instructor to an appropriate page showing the updated course
5. IF the update fails, THEN THE Course_System SHALL display an error message and preserve the instructor's edits in the form

### Requirement 6: Course Edit Authorization

**User Story:** As a platform administrator, I want to ensure only course instructors can edit their own courses, so that course integrity is maintained.

#### Acceptance Criteria

1. WHEN a user attempts to access the edit course page, THE Course_System SHALL verify the user is authenticated
2. WHEN an authenticated user accesses the edit course page, THE Course_System SHALL verify the user's ID matches the course instructor_id
3. IF the user is not the course instructor, THEN THE Course_System SHALL deny access and display an authorization error
4. IF the user is not authenticated, THEN THE Course_System SHALL redirect to the login page
5. THE Course_Database SHALL enforce row-level security policies allowing only course instructors to update their own courses

### Requirement 7: Edit Interface Consistency

**User Story:** As an instructor, I want the edit interface to be familiar and intuitive, so that I can easily update my courses without learning a new interface.

#### Acceptance Criteria

1. THE Course_Form SHALL maintain the same layout and structure in edit mode as in create mode
2. THE Course_Form SHALL use the same validation rules in edit mode as in create mode
3. THE Course_Form SHALL display "Update Course" or similar text on the submit button when in edit mode
4. THE Course_Form SHALL display "Edit Course" or similar text as the page heading when in edit mode

### Requirement 8: Schedule Modification Handling

**User Story:** As an instructor, I want to update course schedules, so that I can accommodate changes in my availability or student needs.

#### Acceptance Criteria

1. WHEN editing a group course, THE Course_Form SHALL allow modification of all schedule-related fields
2. WHEN editing a one-on-one course, THE Course_Form SHALL display the appropriate scheduling interface for individual sessions
3. WHEN schedule changes are saved, THE Course_System SHALL update the course record with the new schedule information
4. THE Course_System SHALL preserve the relationship between the course and any existing scheduled sessions when schedule fields are modified
