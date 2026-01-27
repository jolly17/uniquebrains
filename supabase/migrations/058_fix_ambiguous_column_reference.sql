-- Fix ambiguous column reference in security definer function
-- Need to fully qualify the column name with table alias

-- Drop the policy first (it depends on the function)
DROP POLICY IF EXISTS "Instructors can view enrolled students" ON students;

-- Now drop and recreate the function with proper table qualification
DROP FUNCTION IF EXISTS is_student_enrolled_in_instructor_course(UUID, UUID);

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
    WHERE e.student_profile_id = $1  -- Use parameter reference instead of column name
    AND c.instructor_id = $2
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
