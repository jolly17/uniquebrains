# Session Reminders Troubleshooting

## Issue
Session reminder emails are only going to instructors, not to students.

## Code Analysis

The `send-session-reminders` function has the correct logic:

1. Fetches sessions happening tomorrow (lines 66-88)
2. For each session:
   - Fetches enrollments with student profiles (lines 113-125)
   - Sends email to instructor (lines 148-157)
   - Loops through enrollments and sends email to each student (lines 159-175)

## Potential Issues

### 1. Enrollment Query Issue
The enrollment query (lines 113-125) might not be returning student data correctly:

```typescript
const { data: enrollments, error: enrollmentsError } = await supabase
  .from('enrollments')
  .select(`
    student_id,
    profiles (
      id,
      full_name,
      email
    )
  `)
  .eq('course_id', session.course_id)
  .eq('status', 'active')
```

**Possible problems:**
- The `profiles` relationship might not be properly configured
- The foreign key relationship between `enrollments.student_id` and `profiles.id` might be missing or incorrect
- Students might not have `status='active'` in their enrollments

### 2. Missing full_name Field
The query selects `profiles.full_name`, but the profiles table might use `first_name` and `last_name` instead.

### 3. Email Field Issues
- Students might not have email addresses in their profiles
- The email field might be null or empty

## Recommended Fixes

### Fix 1: Update the enrollment query to use first_name and last_name
Change line 116-121 to:
```typescript
.select(`
  student_id,
  profiles!student_id (
    id,
    first_name,
    last_name,
    email
  )
`)
```

### Fix 2: Construct full_name from first_name and last_name
Update the student email sending loop (line 163) to:
```typescript
const studentFullName = `${enrollment.profiles.first_name} ${enrollment.profiles.last_name}`.trim()
await sendStudentReminderEmail(
  sessionData,
  studentFullName,
  enrollment.profiles.email
)
```

### Fix 3: Add better logging
Add console.log statements to debug:
- Number of enrollments found
- Each student's email address
- Whether the email sending succeeds or fails

## Testing Steps

1. Check the database schema for the profiles table
2. Verify the foreign key relationship between enrollments and profiles
3. Check if students have email addresses in their profiles
4. Test the function manually with a session that has enrolled students
5. Check the function logs in Supabase dashboard
