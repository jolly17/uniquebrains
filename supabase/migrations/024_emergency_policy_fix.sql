-- Emergency fix: Temporarily disable all RLS policies to isolate recursion
-- This will help us identify which policy is causing the issue

-- Disable RLS on courses table completely for now
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- Also check if enrollments policies are causing issues
-- Drop any enrollments policies that reference courses
DROP POLICY IF EXISTS "Instructors can view course enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can update course enrollments" ON enrollments;

-- Recreate simple enrollments policies without course table references
CREATE POLICY "enrollments_student_view"
  ON enrollments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "enrollments_student_insert"
  ON enrollments FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "enrollments_student_update"
  ON enrollments FOR UPDATE
  USING (student_id = auth.uid());

-- Note: This temporarily removes RLS from courses table
-- We'll add it back once we identify the recursion source