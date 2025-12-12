-- =====================================================
-- SIMPLE RLS SETUP - COURSES TABLE ONLY (NO ADMIN POLICY)
-- This avoids the JWT parsing syntax issues
-- =====================================================

-- STEP 1: Create helper function to avoid recursion
-- =====================================================
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION user_enrolled_in_course(UUID, UUID) TO authenticated;

-- STEP 2: Enable RLS on courses table and create policies
-- =====================================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first to avoid conflicts
DROP POLICY IF EXISTS "courses_public_view" ON courses;
DROP POLICY IF EXISTS "courses_instructor_all" ON courses;
DROP POLICY IF EXISTS "courses_enrolled_view" ON courses;
DROP POLICY IF EXISTS "courses_public_published" ON courses;
DROP POLICY IF EXISTS "courses_instructor_select" ON courses;
DROP POLICY IF EXISTS "courses_instructor_insert" ON courses;
DROP POLICY IF EXISTS "courses_instructor_update" ON courses;
DROP POLICY IF EXISTS "courses_instructor_delete" ON courses;
DROP POLICY IF EXISTS "courses_enrolled_student_select" ON courses;
DROP POLICY IF EXISTS "courses_admin_all" ON courses;
DROP POLICY IF EXISTS "courses_instructor_own" ON courses;
DROP POLICY IF EXISTS "courses_enrolled_students" ON courses;
DROP POLICY IF EXISTS "courses_admin_access" ON courses;

-- Create simple, working policies for courses table
-- 1. Public can view published courses
CREATE POLICY "courses_public_published"
  ON courses FOR SELECT
  USING (is_published = true);

-- 2. Instructors can manage their own courses (all operations)
CREATE POLICY "courses_instructor_all"
  ON courses FOR ALL
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

-- 3. Students can view courses they're enrolled in
CREATE POLICY "courses_enrolled_students"
  ON courses FOR SELECT
  USING (user_enrolled_in_course(id, auth.uid()));

-- Note: Admin access can be handled at the application level for now
-- to avoid JWT parsing syntax issues in PostgreSQL

-- STEP 3: Verification
-- =====================================================
-- After this migration:
-- - Courses table will have proper RLS enabled
-- - Views will inherit security from their underlying tables
-- - Your backend tests should continue to work
-- - Admin users can be handled in your application code