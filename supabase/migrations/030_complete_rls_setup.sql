-- =====================================================
-- COMPLETE RLS SETUP FOR COURSES TABLE AND ALL VIEWS
-- This migration enables RLS on courses table and all views with proper policies
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

-- Create new, clean policies for courses table
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

-- 4. Admins have full access
CREATE POLICY "courses_admin_access"
  ON courses FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- STEP 3: Enable RLS on all views
-- =====================================================
ALTER VIEW course_stats ENABLE ROW LEVEL SECURITY;
ALTER VIEW homework_with_stats ENABLE ROW LEVEL SECURITY;
ALTER VIEW student_submissions_with_homework ENABLE ROW LEVEL SECURITY;
ALTER VIEW upcoming_sessions ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create policies for course_stats view
-- =====================================================
-- Same access rules as courses table
CREATE POLICY "course_stats_public_published"
  ON course_stats FOR SELECT
  USING (is_published = true);

CREATE POLICY "course_stats_instructor_own"
  ON course_stats FOR SELECT
  USING (instructor_id = auth.uid());

CREATE POLICY "course_stats_enrolled_students"
  ON course_stats FOR SELECT
  USING (user_enrolled_in_course(id, auth.uid()));

CREATE POLICY "course_stats_admin_access"
  ON course_stats FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- STEP 5: Create policies for homework_with_stats view
-- =====================================================
-- Students can view published homework for courses they're enrolled in
CREATE POLICY "homework_stats_enrolled_students"
  ON homework_with_stats FOR SELECT
  USING (
    is_published = true AND
    user_enrolled_in_course(course_id, auth.uid())
  );

-- Instructors can view all homework for their courses
CREATE POLICY "homework_stats_instructors"
  ON homework_with_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = homework_with_stats.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

-- Admins can view all homework
CREATE POLICY "homework_stats_admin_access"
  ON homework_with_stats FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- STEP 6: Create policies for student_submissions_with_homework view
-- =====================================================
-- Students can view their own submissions
CREATE POLICY "submissions_homework_student_own"
  ON student_submissions_with_homework FOR SELECT
  USING (student_id = auth.uid());

-- Instructors can view submissions for their course homework
CREATE POLICY "submissions_homework_instructors"
  ON student_submissions_with_homework FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = student_submissions_with_homework.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

-- Admins can view all submissions
CREATE POLICY "submissions_homework_admin_access"
  ON student_submissions_with_homework FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- STEP 7: Create policies for upcoming_sessions view
-- =====================================================
-- Enrolled students can view sessions for their courses
CREATE POLICY "upcoming_sessions_enrolled_students"
  ON upcoming_sessions FOR SELECT
  USING (user_enrolled_in_course(course_id, auth.uid()));

-- Instructors can view sessions for their courses
CREATE POLICY "upcoming_sessions_instructors"
  ON upcoming_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = upcoming_sessions.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

-- Admins can view all sessions
CREATE POLICY "upcoming_sessions_admin_access"
  ON upcoming_sessions FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- STEP 8: Verification - Check that RLS is enabled
-- =====================================================
-- This will show which tables/views have RLS enabled
-- You can run this query after the migration to verify:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('courses', 'course_stats', 'homework_with_stats', 'student_submissions_with_homework', 'upcoming_sessions');