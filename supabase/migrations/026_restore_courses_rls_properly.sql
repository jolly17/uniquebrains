-- Restore RLS on courses table with proper non-recursive policies
-- This fixes the security issue while avoiding infinite recursion

-- Re-enable RLS on courses table
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for courses table
-- 1. Public can view published courses
CREATE POLICY "courses_public_published"
  ON courses FOR SELECT
  USING (is_published = true);

-- 2. Instructors can manage their own courses (all operations)
CREATE POLICY "courses_instructor_own"
  ON courses FOR ALL
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

-- 3. For enrolled students viewing courses, we'll use a function to avoid recursion
-- First create a helper function that checks enrollment without causing recursion
CREATE OR REPLACE FUNCTION user_enrolled_in_course(course_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM enrollments 
    WHERE course_id = course_uuid 
    AND student_id = user_uuid 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Students can view courses they're enrolled in (using the helper function)
CREATE POLICY "courses_enrolled_students"
  ON courses FOR SELECT
  USING (user_enrolled_in_course(id, auth.uid()));

-- 5. Admins have full access (simplified to avoid recursion)
-- We'll check admin status directly from auth.jwt() instead of profiles table
CREATE POLICY "courses_admin_access"
  ON courses FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin'
  );

-- Grant execute permission on the helper function to authenticated users
GRANT EXECUTE ON FUNCTION user_enrolled_in_course(UUID, UUID) TO authenticated;