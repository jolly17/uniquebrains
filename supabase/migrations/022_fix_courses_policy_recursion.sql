-- Fix infinite recursion in courses table policies
-- This migration drops all existing courses policies and recreates them properly

-- Drop all existing policies on courses table
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Instructors can view own courses" ON courses;
DROP POLICY IF EXISTS "Instructors can create courses" ON courses;
DROP POLICY IF EXISTS "Instructors can update own courses" ON courses;
DROP POLICY IF EXISTS "Instructors can delete own courses" ON courses;
DROP POLICY IF EXISTS "Enrolled students can view their courses" ON courses;
DROP POLICY IF EXISTS "Admins have full access to courses" ON courses;

-- Recreate courses policies without recursion
-- 1. Public can view published courses
CREATE POLICY "courses_public_select"
  ON courses FOR SELECT
  USING (is_published = true);

-- 2. Instructors can manage their own courses
CREATE POLICY "courses_instructor_select"
  ON courses FOR SELECT
  USING (instructor_id = auth.uid());

CREATE POLICY "courses_instructor_insert"
  ON courses FOR INSERT
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "courses_instructor_update"
  ON courses FOR UPDATE
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "courses_instructor_delete"
  ON courses FOR DELETE
  USING (instructor_id = auth.uid());

-- 3. Students can view courses they're enrolled in (simplified to avoid recursion)
CREATE POLICY "courses_enrolled_student_select"
  ON courses FOR SELECT
  USING (
    id IN (
      SELECT course_id 
      FROM enrollments 
      WHERE student_id = auth.uid() 
      AND status = 'active'
    )
  );

-- 4. Admins have full access
CREATE POLICY "courses_admin_all"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Verify RLS is enabled
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;