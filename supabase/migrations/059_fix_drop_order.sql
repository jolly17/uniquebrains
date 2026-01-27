-- Fix drop order: drop policy before dropping function
-- This resolves the dependency error

-- Drop the policy first (it depends on the function)
DROP POLICY IF EXISTS "Instructors can view enrolled students" ON students;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS is_student_enrolled_in_instructor_course(UUID, UUID);

-- Recreate the function with proper parameter references
CREATE OR REPLACE FUNCTION is_student_enrolled_in_instructor_course(p_student_profile_id UUID, p_instructor_id UUID)
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
    WHERE e.student_profile_id = p_student_profile_id
    AND c.instructor_id = p_instructor_id
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_student_enrolled_in_instructor_course(UUID, UUID) TO authenticated;

-- Recreate the policy using the updated function
CREATE POLICY "Instructors can view enrolled students"
  ON students FOR SELECT
  USING (
    is_student_enrolled_in_instructor_course(id, auth.uid())
  );
