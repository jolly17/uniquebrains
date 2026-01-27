-- Fix infinite recursion in students RLS policy
-- Use a security definer function to break the circular dependency

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Instructors can view enrolled students" ON students;

-- Create a security definer function that checks if a student is enrolled in instructor's course
-- This runs with elevated privileges and breaks the RLS recursion
CREATE OR REPLACE FUNCTION is_student_enrolled_in_instructor_course(student_profile_id UUID, instructor_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM enrollments e
    INNER JOIN courses c ON e.course_id = c.id
    WHERE e.student_profile_id = student_profile_id
    AND c.instructor_id = instructor_id
  );
END;
$$;

-- Now create the policy using the function
CREATE POLICY "Instructors can view enrolled students"
  ON students FOR SELECT
  USING (
    is_student_enrolled_in_instructor_course(id, auth.uid())
  );

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_student_enrolled_in_instructor_course(UUID, UUID) TO authenticated;
