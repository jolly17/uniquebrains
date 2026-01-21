-- =====================================================
-- Migration 042: Fix enrollment RLS policies
-- Created: January 2026
-- Purpose: Clean up duplicate enrollment policies and ensure students can enroll
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

-- Enable RLS on enrollments table
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Create clean, simple policies for enrollments
-- Students can view their own enrollments
CREATE POLICY "enrollments_select_own"
  ON enrollments FOR SELECT
  USING (student_id = auth.uid());

-- Students can create their own enrollments
-- WITH CHECK verifies the student_id in the INSERT matches the authenticated user
CREATE POLICY "enrollments_insert_own"
  ON enrollments FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Students can update their own enrollments
CREATE POLICY "enrollments_update_own"
  ON enrollments FOR UPDATE
  USING (student_id = auth.uid());

-- Instructors can view enrollments for their courses
CREATE POLICY "enrollments_select_instructor"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can update enrollments for their courses
CREATE POLICY "enrollments_update_instructor"
  ON enrollments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Add comments
COMMENT ON TABLE enrollments IS 'Course enrollments - RLS policies updated to allow student self-enrollment';
