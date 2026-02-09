# Design Document: Course Age Group and Editing

## Overview

This design document outlines the implementation approach for adding age group selection to courses and enabling comprehensive course editing capabilities in the UniqueBrains platform. The solution extends the existing course creation flow and database schema while maintaining consistency with the current architecture.

The implementation consists of two main features:
1. **Age Group Selection**: Adding a categorical field for target age ranges with "All ages" as the default
2. **Course Editing**: Creating a full edit interface that mirrors the create course experience

## Architecture

### System Components

The implementation touches the following layers of the application:

1. **Database Layer**: Supabase PostgreSQL database with RLS policies
2. **API Layer**: Course service functions for CRUD operations
3. **UI Layer**: React components for forms and display
4. **Routing Layer**: React Router for navigation to edit pages

### Data Flow

**Course Creation with Age Group**:
```
User selects age group → Form submission → API validation → Database insert → Success response
```

**Course Editing**:
```
User clicks edit → Route to /courses/:id/edit → Fetch course data → Populate form → User edits → Validation → API update → Database update → Redirect to course view
```

### Component Relationships

```
CreateCourse.jsx (existing)
     ↓
EditCourse.jsx (new) ← shares form structure
     ↓
CourseForm.jsx (refactored) ← shared form component
     ↓
courseService.js (enhanced) ← API calls
     ↓
Supabase Database (enhanced schema)
```

## Components and Interfaces

### Database Schema Changes

**Add age_group column to courses table**:

```sql
ALTER TABLE courses 
ADD COLUMN age_group TEXT DEFAULT 'All ages' 
CHECK (age_group IN ('All ages', '5-8 years', '9-12 years', '13-18 years', 'Adults'));
```

The column:
- Accepts only the five specified values
- Defaults to "All ages" for new courses
- Is nullable for backward compatibility with existing courses
- Uses TEXT type for readability

### API Service Updates

**Update courseService.js**:

The `createCourse` function will be enhanced to accept and store the age_group field:

```javascript
const dbCourseData = {
  // ... existing fields
  age_group: courseData.ageGroup || 'All ages'
}
```

The `updateCourse` function already exists and supports updating arbitrary fields, so it will automatically support age_group updates without modification.

The `getAllPublishedCourses` and `getCourseById` functions will automatically return the age_group field since they use `SELECT *`.

### UI Components

#### 1. Age Group Selection in Course Form

Add a new form group in CreateCourse.jsx after the category field:

```jsx
<div className="form-group">
  <label htmlFor="ageGroup">Age Group *</label>
  <select
    id="ageGroup"
    name="ageGroup"
    value={formData.ageGroup}
    onChange={handleChange}
    required
    style={{ padding: '0.5rem' }}
  >
    <option value="All ages">All ages 👥</option>
    <option value="5-8 years">5-8 years 🧒</option>
    <option value="9-12 years">9-12 years 👦</option>
    <option value="13-18 years">13-18 years 🧑</option>
    <option value="Adults">Adults 👨</option>
  </select>
</div>
```

The formData state will be initialized with:
```javascript
ageGroup: 'All ages'
```

#### 2. Age Group Display in CourseCard

Add age group display in CourseCard.jsx after the category:

```jsx
<div className="course-metadata">
  <div className="course-category">{course.category}</div>
  {course.age_group && (
    <div className="course-age-group">{course.age_group}</div>
  )}
</div>
```

CSS styling:
```css
.course-age-group {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 0.5rem;
}
```

#### 3. EditCourse Component

Create a new EditCourse.jsx component that:
- Fetches existing course data using the courseId from URL params
- Pre-populates the form with existing values
- Uses the same form structure as CreateCourse
- Calls the update API instead of create API

**Component structure**:

```jsx
function EditCourse() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  async function loadCourseData() {
    // Fetch course by ID
    // Verify user is the instructor
    // Populate formData state
  }

  async function handleSubmit(e) {
    // Validate form
    // Call api.courses.update
    // Handle success/error
    // Redirect to course page
  }

  // Render form identical to CreateCourse but with:
  // - "Edit Course" heading
  // - "Update Course" button text
  // - Pre-populated values
}
```

#### 4. Shared Form Component (Optional Refactoring)

To reduce code duplication, the form structure can be extracted into a reusable CourseForm component:

```jsx
function CourseForm({ 
  formData, 
  onChange, 
  onSubmit, 
  loading, 
  error, 
  mode = 'create' // 'create' or 'edit'
}) {
  // Render the form with all fields
  // Use mode to determine button text and heading
}
```

This refactoring is optional and can be done after the initial implementation.

### Routing

Add a new route in the main App routing configuration:

```jsx
<Route path="/courses/:courseId/edit" element={<EditCourse />} />
```

### Navigation to Edit Page

Add an "Edit Course" button in the instructor dashboard course list:

```jsx
{course.instructor_id === user.id && (
  <Link to={`/courses/${course.id}/edit`} className="btn-secondary">
    Edit Course
  </Link>
)}
```

Also add an edit button on the course detail page when viewed by the instructor:

```jsx
{course.instructor_id === user?.id && (
  <button onClick={() => navigate(`/courses/${course.id}/edit`)}>
    Edit Course
  </button>
)}
```

## Data Models

### Course Model (Enhanced)

```typescript
interface Course {
  id: string
  instructor_id: string
  title: string
  description: string
  category: string
  age_group: string // NEW FIELD
  course_type: 'group' | 'one-on-one'
  price: number
  session_duration: number | null
  enrollment_limit: number | null
  timezone: string
  meeting_link: string | null
  start_date: string | null
  end_date: string | null
  has_end_date: boolean
  session_time: string | null
  selected_days: string[] | null
  frequency: string
  is_published: boolean
  status: string
  created_at: string
  updated_at: string
}
```

### Form Data Model

```typescript
interface CourseFormData {
  title: string
  description: string
  category: string
  ageGroup: string // NEW FIELD
  courseType: 'group' | 'one-on-one'
  price: string
  sessionDuration: string
  sessionTime: string
  timezone: string
  enrollmentLimit: string
  meetingLink: string
  startDate: string
  repeatEvery: number
  repeatUnit: 'day' | 'week' | 'month'
  selectedDays: string[]
  endDate: string
  hasEndDate: boolean
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Age Group Persistence

*For any* course created with an age group selection, retrieving that course from the database should return the same age group value.

**Validates: Requirements 1.2, 1.3**

### Property 2: Age Group Default Value

*For any* course created without explicitly setting an age group, the stored age group should be "All ages".

**Validates: Requirements 1.2**

### Property 3: Age Group Display Consistency

*For any* course with an age group value, the CourseCard component should display that age group value.

**Validates: Requirements 2.1, 2.2**

### Property 4: Edit Authorization

*For any* course and any authenticated user, the edit page should only be accessible if the user's ID matches the course's instructor_id.

**Validates: Requirements 6.2, 6.3**

### Property 5: Edit Form Pre-population

*For any* course being edited, all form fields should be pre-populated with the current course values from the database.

**Validates: Requirements 3.3**

### Property 6: Update Persistence

*For any* course field that is modified and saved, retrieving the course after the update should return the new value.

**Validates: Requirements 5.2**

### Property 7: Editable Fields Coverage

*For any* course, the edit form should allow modification of title, description, category, age group, session duration, session time, timezone, start date, repeat settings, selected days, end date, enrollment limit, and meeting link.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

### Property 8: Form Validation Consistency

*For any* course data submitted through the edit form, the same validation rules should apply as in the create form.

**Validates: Requirements 7.2**

### Property 9: Unauthorized Access Denial

*For any* user attempting to access an edit page for a course they don't own, the system should deny access and display an error.

**Validates: Requirements 6.3**

### Property 10: Schedule Update Preservation

*For any* course with existing sessions, updating the schedule fields should preserve the course-session relationship.

**Validates: Requirements 8.3, 8.4**

## Error Handling

### Database Errors

**Age Group Constraint Violation**:
- Scenario: Invalid age group value submitted
- Handling: Database CHECK constraint will reject the insert/update
- User feedback: "Invalid age group selected. Please choose from the available options."

**Course Not Found**:
- Scenario: User navigates to edit page for non-existent course
- Handling: API returns 404 error
- User feedback: "Course not found. It may have been deleted."

### Authorization Errors

**Unauthenticated Access**:
- Scenario: User not logged in tries to access edit page
- Handling: Redirect to login page with return URL
- User feedback: "Please log in to edit courses."

**Unauthorized Access**:
- Scenario: User tries to edit another instructor's course
- Handling: API returns 403 error, display error message
- User feedback: "You don't have permission to edit this course."

### Validation Errors

**Required Field Missing**:
- Scenario: User submits form with empty required fields
- Handling: Client-side validation prevents submission
- User feedback: Highlight missing fields with error messages

**Invalid Schedule Data**:
- Scenario: End date before start date, no days selected for weekly courses
- Handling: Client-side validation with specific error messages
- User feedback: "End date must be after start date" or "Please select at least one day for weekly courses"

### Network Errors

**API Call Failure**:
- Scenario: Network timeout or server error during save
- Handling: Catch error, preserve form data, display retry option
- User feedback: "Failed to save changes. Please try again."

**Data Loading Failure**:
- Scenario: Cannot fetch course data for editing
- Handling: Display error state with retry button
- User feedback: "Failed to load course data. Please try again."

## Testing Strategy

### Unit Tests

Unit tests will focus on specific examples, edge cases, and error conditions:

**Age Group Tests**:
- Test that age group dropdown renders with all five options
- Test that "All ages" is the default selection
- Test that selected age group is included in form submission data

**Form Pre-population Tests**:
- Test that EditCourse loads course data on mount
- Test that form fields are populated with correct values
- Test that loading state is displayed while fetching data

**Authorization Tests**:
- Test that edit page redirects unauthenticated users
- Test that edit page shows error for unauthorized users
- Test that edit page loads successfully for course owner

**Validation Tests**:
- Test that required fields show validation errors when empty
- Test that invalid schedule combinations are rejected
- Test that form submission is prevented when validation fails

### Property-Based Tests

Property-based tests will verify universal properties across all inputs. Each test should run a minimum of 100 iterations.

**Property Test 1: Age Group Round Trip**
- Generate random course data with random age group selection
- Create course via API
- Fetch course by ID
- Assert age group matches original selection
- **Feature: course-age-group-and-editing, Property 1: Age Group Persistence**

**Property Test 2: Default Age Group**
- Generate random course data without age group field
- Create course via API
- Fetch course by ID
- Assert age group is "All ages"
- **Feature: course-age-group-and-editing, Property 2: Age Group Default Value**

**Property Test 3: Update Persistence**
- Generate random course data
- Create course via API
- Generate random updates to editable fields
- Update course via API
- Fetch course by ID
- Assert all updated fields match new values
- **Feature: course-age-group-and-editing, Property 6: Update Persistence**

**Property Test 4: Authorization Enforcement**
- Generate random course data with instructor A
- Create course via API
- Attempt to update course with instructor B's credentials
- Assert update is rejected with authorization error
- **Feature: course-age-group-and-editing, Property 4: Edit Authorization**

**Property Test 5: Validation Consistency**
- Generate random invalid course data (missing required fields, invalid dates)
- Attempt to create course via API
- Attempt to update existing course with same invalid data via API
- Assert both operations fail with same validation errors
- **Feature: course-age-group-and-editing, Property 8: Form Validation Consistency**

### Integration Tests

Integration tests will verify the complete user flows:

**Create Course with Age Group Flow**:
1. Navigate to create course page
2. Fill in all required fields including age group
3. Submit form
4. Verify course appears in instructor dashboard
5. Verify course card displays age group in marketplace

**Edit Course Flow**:
1. Create a course as instructor A
2. Navigate to course detail page
3. Click "Edit Course" button
4. Verify form is pre-populated with course data
5. Modify several fields including age group
6. Submit form
7. Verify success message and redirect
8. Verify changes are reflected in course detail page

**Authorization Flow**:
1. Create a course as instructor A
2. Log in as instructor B
3. Attempt to navigate to edit URL for instructor A's course
4. Verify access is denied with appropriate error message

### Manual Testing Checklist

- [ ] Age group dropdown displays all five options
- [ ] "All ages" is selected by default in create form
- [ ] Age group is saved when creating a new course
- [ ] Age group displays correctly on course cards
- [ ] Edit button appears for course owner in dashboard
- [ ] Edit button appears for course owner on course detail page
- [ ] Edit page loads with pre-populated form data
- [ ] All fields can be modified in edit form
- [ ] Changes are saved when update form is submitted
- [ ] Success message displays after successful update
- [ ] Error message displays when update fails
- [ ] Unauthorized users cannot access edit page
- [ ] Unauthenticated users are redirected to login
- [ ] Form validation works identically in create and edit modes
- [ ] Schedule changes are saved correctly for group courses
- [ ] One-on-one course editing works correctly
