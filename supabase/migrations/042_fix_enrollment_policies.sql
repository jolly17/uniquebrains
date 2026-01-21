-- =====================================================
-- Migration 042: Fix enrollment RLS policies (UPDATED)
-- Created: January 2026
-- Purpose: Support both direct student enrollments AND parent-managed student enrollments
-- =====================================================

-- Drop ALL existing enrollment policies to start fresh
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can create enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can update own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view course enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can update course enrollments" ON enrollments;
DROP POLICY IF EXISTS "Parents can view their students' enrollments" ON enrollments;
DROP POLICY IF EXISTS "Parents can create enrollments for their students" ON enrollments;
DROP POLICY IF EXISTS "Admins have full access to enrollments" ON enrollments;
DROP POLICY IF EXISTS "enrollments_student_view" ON enrollments;
DROP POLICY IF EXISTS "enrollments_student_insert" ON enrollments;
DROP POLICY IF EXISTS "enrollments_student_update" ON enrollments;
DROP POLICY IF EXISTS "enrollments_select_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_insert_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_select_instructor" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_instructor" ON enrollments;

-- Enable RLS on enrollments table
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies that support BOTH direct student enrollments AND parent-managed enrollments

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

-- Add comments
COMMENT ON TABLE enrollments IS 'Course enrollments - supports both direct student enrollments (student_id) and parent-managed enrollments (student_profile_id)';

