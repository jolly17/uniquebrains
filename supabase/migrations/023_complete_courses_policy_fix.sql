-- Complete fix for courses table policy recursion
-- This migration completely removes all policies and recreates them with no circular references

-- First, disable RLS temporarily to clear all policies
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on courses table (including any we might have missed)
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'courses' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON courses';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- 1. Public can view published courses (no recursion)
CREATE POLICY "courses_public_view"
  ON courses FOR SELECT
  USING (is_published = true);

-- 2. Instructors can manage their own courses (direct comparison, no subquery)
CREATE POLICY "courses_instructor_all"
  ON courses FOR ALL
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

-- 3. Students can view courses they're enrolled in (using a simple EXISTS)
-- This is the most likely source of recursion, so we'll make it very simple
CREATE POLICY "courses_enrolled_view"
  ON courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.course_id = courses.id 
      AND enrollments.student_id = auth.uid()
    )
  );

-- Note: Removed admin policy for now to eliminate any potential recursion
-- Admins can be handled at the application level or with a separate approach