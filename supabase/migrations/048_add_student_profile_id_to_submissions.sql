-- Migration 048: Add student_profile_id to submissions table
-- This allows homework submissions from parent-managed student profiles

-- Add student_profile_id column to submissions table
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS student_profile_id UUID REFERENCES students(id) ON DELETE CASCADE;

-- Make student_id nullable (was previously required)
ALTER TABLE submissions
ALTER COLUMN student_id DROP NOT NULL;

-- Add constraint: Either student_id OR student_profile_id must be set (not both, not neither)
ALTER TABLE submissions
ADD CONSTRAINT check_submission_student_reference CHECK (
  (student_id IS NOT NULL AND student_profile_id IS NULL) OR 
  (student_id IS NULL AND student_profile_id IS NOT NULL)
);

-- Create index for student_profile_id lookups
CREATE INDEX IF NOT EXISTS idx_submissions_student_profile_id 
ON submissions(student_profile_id);

-- Update RLS policies for submissions table

-- Drop existing policies
DROP POLICY IF EXISTS "submissions_select_policy" ON submissions;
DROP POLICY IF EXISTS "submissions_insert_policy" ON submissions;
DROP POLICY IF EXISTS "submissions_update_policy" ON submissions;

-- SELECT: View own submissions or student's submissions or instructor's course submissions
CREATE POLICY "submissions_select_policy" ON submissions FOR SELECT
USING (
  student_id = auth.uid() OR
  student_profile_id IN (SELECT id FROM students WHERE parent_id = auth.uid()) OR
  homework_id IN (
    SELECT h.id FROM homework h
    INNER JOIN courses c ON h.course_id = c.id
    WHERE c.instructor_id = auth.uid()
  )
);

-- INSERT: Create own submission or student's submission
CREATE POLICY "submissions_insert_policy" ON submissions FOR INSERT
WITH CHECK (
  student_id = auth.uid() OR
  student_profile_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
);

-- UPDATE: Update own submission or student's submission or instructor can update (for grading)
CREATE POLICY "submissions_update_policy" ON submissions FOR UPDATE
USING (
  student_id = auth.uid() OR
  student_profile_id IN (SELECT id FROM students WHERE parent_id = auth.uid()) OR
  homework_id IN (
    SELECT h.id FROM homework h
    INNER JOIN courses c ON h.course_id = c.id
    WHERE c.instructor_id = auth.uid()
  )
);

-- Add comment
COMMENT ON COLUMN submissions.student_profile_id IS 'Reference to student profile for parent-managed enrollments';
