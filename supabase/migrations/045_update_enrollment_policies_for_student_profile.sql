-- =====================================================
-- Migration 045: Update enrollment RLS policies to use student_profile_id
-- Created: January 2026
-- Purpose: Update existing policies to support the newly added student_profile_id column
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "enrollments_select_policy" ON enrollments;
DROP POLICY IF EXISTS "enrollments_insert_policy" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_policy" ON enrollments;

-- Recreate policies with student_profile_id support

-- SELECT: Users can view their own enrollments OR enrollments for their student profiles
CREATE POLICY "enrollments_select_policy"
  ON enrollments FOR SELECT
  USING (
    student_id = auth.uid() OR  -- Direct student enrollment
    student_profile_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    ) OR  -- Parent viewing their student's enrollment
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )  -- Instructor viewing course enrollments
  );

-- INSERT: Users can create enrollments for themselves OR for their student profiles
CREATE POLICY "enrollments_insert_policy"
  ON enrollments FOR INSERT
  WITH CHECK (
    student_id = auth.uid() OR  -- Direct student enrollment
    student_profile_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )  -- Parent enrolling their student
  );

-- UPDATE: Users can update their own enrollments OR their students' enrollments OR instructor can update
CREATE POLICY "enrollments_update_policy"
  ON enrollments FOR UPDATE
  USING (
    student_id = auth.uid() OR  -- Direct student enrollment
    student_profile_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    ) OR  -- Parent updating their student's enrollment
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )  -- Instructor updating course enrollments
  );

-- Verify policies were created
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies 
WHERE tablename = 'enrollments'
ORDER BY policyname;
