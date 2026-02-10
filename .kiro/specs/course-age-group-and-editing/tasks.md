# Implementation Plan: Course Age Group and Editing

## Overview

This implementation plan breaks down the course age group and editing features into discrete, incremental coding tasks. Each task builds on previous work, starting with database changes, then API enhancements, and finally UI components. The plan ensures all code is integrated and functional at each step.

## Tasks

- [x] 1. Database schema update for age group field
  - Create a new migration file to add age_group column to courses table
  - Add CHECK constraint to enforce valid age group values: 'All ages', '5-8 years', '9-12 years', '13-18 years', 'Adults'
  - Set default value to 'All ages'
  - Test migration by running it against development database
  - _Requirements: 1.4_

- [ ] 2. Update course creation API to support age group
  - [x] 2.1 Modify createCourse function in courseService.js
    - Add age_group field to dbCourseData object
    - Default to 'All ages' if not provided
    - Ensure field is included in database insert
    - _Requirements: 1.2_
  
  - [ ]* 2.2 Write property test for age group persistence
    - **Property 1: Age Group Persistence**
    - **Validates: Requirements 1.2, 1.3**
  
  - [ ]* 2.3 Write property test for default age group
    - **Property 2: Age Group Default Value**
    - **Validates: Requirements 1.2**

- [ ] 3. Add age group selection to course creation form
  - [x] 3.1 Update CreateCourse.jsx component
    - Add ageGroup field to formData state with default value 'All ages'
    - Add age group dropdown after category field with all five options
    - Include age group in form submission data
    - Add emoji icons to each age group option for visual clarity
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 3.2 Write unit tests for age group form field
    - Test dropdown renders with all options
    - Test default selection is 'All ages'
    - Test selected value is included in form data
    - _Requirements: 1.1_

- [ ] 4. Display age group on course cards
  - [x] 4.1 Update CourseCard.jsx component
    - Add age group display element after category
    - Style age group badge consistently with existing design
    - Ensure age group displays for all courses
    - _Requirements: 2.1, 2.2_
  
  - [x] 4.2 Add CSS styling for age group badge
    - Create .course-age-group class in CourseCard.css
    - Style with subtle background, padding, and border radius
    - Ensure responsive design on mobile devices
    - _Requirements: 2.2_
  
  - [ ]* 4.3 Write property test for age group display
    - **Property 3: Age Group Display Consistency**
    - **Validates: Requirements 2.1, 2.2**

- [x] 5. Checkpoint - Test age group feature end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Create EditCourse component
  - [x] 6.1 Create EditCourse.jsx file
    - Set up component structure with routing hooks (useParams, useNavigate)
    - Add state management for formData, loading, saving, and error states
    - Implement useEffect to load course data on mount
    - Add authorization check to verify user is course instructor
    - _Requirements: 3.1, 3.2, 6.1, 6.2_
  
  - [x] 6.2 Implement loadCourseData function
    - Fetch course by ID using api.courses.getById
    - Verify current user matches course instructor_id
    - Transform course data to match form structure
    - Populate formData state with existing values
    - Handle loading and error states
    - _Requirements: 3.2, 3.3, 6.2_
  
  - [ ]* 6.3 Write unit tests for course data loading
    - Test successful data fetch and form population
    - Test authorization check for course owner
    - Test error handling for non-existent course
    - Test error handling for unauthorized user
    - _Requirements: 3.2, 6.2, 6.3_

- [ ] 7. Implement edit form UI
  - [x] 7.1 Copy form structure from CreateCourse.jsx to EditCourse.jsx
    - Include all editable fields: title, description, category, age group, course type, enrollment limit, session duration, session time, timezone, start date, repeat settings, selected days, end date, meeting link
    - Update page heading to "Edit Course"
    - Update submit button text to "Update Course"
    - Maintain two-column grid layout
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 7.1, 7.4_
  
  - [x] 7.2 Implement form change handlers
    - Add handleChange function for text inputs and selects
    - Add toggleDay function for day selection
    - Ensure all form interactions update formData state
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [ ]* 7.3 Write property test for editable fields coverage
    - **Property 7: Editable Fields Coverage**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

- [ ] 8. Implement course update submission
  - [x] 8.1 Create handleSubmit function in EditCourse.jsx
    - Validate all required fields
    - Transform formData to API format
    - Call api.courses.update with courseId, updates, and user.id
    - Handle success: show message and redirect to course detail page
    - Handle errors: display error message and preserve form data
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 8.2 Write property test for update persistence
    - **Property 6: Update Persistence**
    - **Validates: Requirements 5.2**
  
  - [ ]* 8.3 Write property test for validation consistency
    - **Property 8: Form Validation Consistency**
    - **Validates: Requirements 7.2**

- [ ] 9. Add routing for edit course page
  - [x] 9.1 Add route in App.jsx or main routing file
    - Add route path "/courses/:courseId/edit" pointing to EditCourse component
    - Ensure route is protected (requires authentication)
    - _Requirements: 3.1_
  
  - [ ]* 9.2 Write unit test for edit route
    - Test route renders EditCourse component
    - Test route extracts courseId from URL params
    - _Requirements: 3.1_

- [ ] 10. Add navigation to edit page from instructor dashboard
  - [x] 10.1 Update instructor dashboard course list
    - Add "Edit Course" button/link for each course
    - Link to /courses/:id/edit route
    - Style button consistently with existing UI
    - _Requirements: 3.4_
  
  - [x] 10.2 Add edit button to course detail page
    - Show edit button only when current user is course instructor
    - Add conditional rendering based on user.id === course.instructor_id
    - Link to edit page on click
    - _Requirements: 3.4_

- [ ] 11. Implement authorization checks
  - [ ]* 11.1 Write property test for edit authorization
    - **Property 4: Edit Authorization**
    - **Validates: Requirements 6.2, 6.3**
  
  - [ ]* 11.2 Write property test for unauthorized access denial
    - **Property 9: Unauthorized Access Denial**
    - **Validates: Requirements 6.3**
  
  - [ ]* 11.3 Write unit tests for authorization flows
    - Test unauthenticated user redirect to login
    - Test unauthorized user sees error message
    - Test authorized user can access edit page
    - _Requirements: 6.1, 6.3, 6.4_

- [ ] 12. Handle schedule updates for existing courses
  - [x] 12.1 Update EditCourse to handle schedule modifications
    - Ensure schedule fields are editable for group courses
    - Display appropriate UI for one-on-one courses
    - Include schedule data in update API call
    - _Requirements: 4.5, 8.1, 8.2, 8.3_
  
  - [ ]* 12.2 Write property test for schedule update preservation
    - **Property 10: Schedule Update Preservation**
    - **Validates: Requirements 8.3, 8.4**
  
  - [ ]* 12.3 Write unit tests for schedule editing
    - Test group course schedule fields are editable
    - Test one-on-one course shows correct UI
    - Test schedule changes are included in update
    - _Requirements: 8.1, 8.2_

- [x] 13. Final checkpoint - Integration testing
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Polish and error handling
  - [x] 14.1 Add comprehensive error messages
    - Add user-friendly error messages for all failure scenarios
    - Display validation errors inline on form fields
    - Show network error messages with retry options
    - _Requirements: 5.5_
  
  - [x] 14.2 Add loading states and feedback
    - Show loading spinner while fetching course data
    - Show saving indicator during form submission
    - Display success confirmation after successful update
    - _Requirements: 5.3_
  
  - [ ]* 14.3 Write integration tests for complete flows
    - Test create course with age group flow
    - Test edit course flow from start to finish
    - Test authorization flow for unauthorized access
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with minimum 100 iterations each
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows the existing codebase patterns and conventions
- All code should be tested incrementally to catch issues early
