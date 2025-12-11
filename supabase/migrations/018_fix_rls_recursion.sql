-- =====================================================
-- Fix RLS Recursion Issue
-- Simplify policies to avoid infinite recursion
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Parents can view their own students" ON students;
DROP POLICY IF EXISTS "Parents can insert students" ON students;
DROP POLICY IF EXISTS "Parents can update their own students" ON students;
DROP POLICY IF EXISTS "Parents can delete their own students" ON students;
DROP POLICY IF EXISTS "Instructors can view enrolled students" ON students;

-- Create simple, non-recursive policies
CREATE POLICY "Parents can view their own students"
  ON students FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert students"
  ON students FOR INSERT
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update their own students"
  ON students FOR UPDATE
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can delete their own students"
  ON students FOR DELETE
  USING (parent_id = auth.uid());

-- Instructors can view students enrolled in their courses (simplified)
CREATE POLICY "Instructors can view enrolled students"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_profile_id = students.id
      AND c.instructor_id = auth.uid()
    )
  );