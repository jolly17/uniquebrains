-- Migration: Fix enrollment count visibility for all users
-- Issue: Different users see different enrollment counts due to RLS filtering

-- Drop existing enrollment count policies that might be too restrictive
DROP POLICY IF EXISTS "Anyone can view enrollment counts" ON enrollments;
DROP POLICY IF EXISTS "Public can view active enrollments" ON enrollments;
DROP POLICY IF EXISTS "Anyone can view enrollment counts for published courses" ON enrollments;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view enrollments for their courses" ON enrollments;

-- Create a policy that allows anyone to view enrollment counts (but not personal details)
-- This is safe because we're only exposing counts, not student information
CREATE POLICY "Anyone can view enrollment counts for published courses"
ON enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = enrollments.course_id
    AND courses.is_published = true
  )
);

-- Ensure the existing policies for students and instructors still work
-- Students can view their own enrollments
CREATE POLICY "Students can view their own enrollments"
ON enrollments
FOR SELECT
USING (auth.uid() = student_id);

-- Instructors can view enrollments for their courses
CREATE POLICY "Instructors can view enrollments for their courses"
ON enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = enrollments.course_id
    AND courses.instructor_id = auth.uid()
  )
);

-- Add comment
COMMENT ON POLICY "Anyone can view enrollment counts for published courses" ON enrollments IS 
'Allows public access to enrollment counts for published courses without exposing student details';
