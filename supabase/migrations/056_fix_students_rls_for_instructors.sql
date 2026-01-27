-- Fix RLS policy for students table to allow instructors to view enrolled students
-- The existing policy doesn't work well in JOIN contexts

-- Drop the existing instructor policy
DROP POLICY IF EXISTS "Instructors can view enrolled students" ON students;

-- Create a simpler policy that works in JOIN contexts
-- This allows instructors to see student profiles when they're joined through enrollments
CREATE POLICY "Instructors can view enrolled students"
  ON students FOR SELECT
  USING (
    -- Allow if there's any enrollment for this student in a course owned by the current user
    id IN (
      SELECT e.student_profile_id 
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      WHERE e.student_profile_id = students.id
      AND c.instructor_id = auth.uid()
      AND e.student_profile_id IS NOT NULL
    )
  );

-- Alternative: If the above doesn't work in JOINs, we can make it more permissive
-- This version allows instructors to see any student that has an enrollment in their courses
-- Uncomment if needed:
/*
DROP POLICY IF EXISTS "Instructors can view enrolled students" ON students;

CREATE POLICY "Instructors can view enrolled students"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      WHERE e.student_profile_id = students.id
      AND c.instructor_id = auth.uid()
    )
  );
*/
