-- =====================================================
-- Fix Enrollments Table for Students
-- Safely add student_profile_id column and update policies
-- =====================================================

-- Add new column for student references if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'enrollments' AND column_name = 'student_profile_id') THEN
        ALTER TABLE enrollments 
        ADD COLUMN student_profile_id UUID REFERENCES students(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Drop existing constraint if it exists and recreate
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS check_student_reference;

-- Add constraint to ensure either student_id (auth user) OR student_profile_id (student table) is set
ALTER TABLE enrollments 
ADD CONSTRAINT check_student_reference 
CHECK (
  (student_id IS NOT NULL AND student_profile_id IS NULL) OR 
  (student_id IS NULL AND student_profile_id IS NOT NULL)
);

-- Update RLS policies for enrollments to handle both cases
DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can create enrollments" ON enrollments;
DROP POLICY IF EXISTS "Parents can view their students' enrollments" ON enrollments;
DROP POLICY IF EXISTS "Parents can create enrollments for their students" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view course enrollments" ON enrollments;

-- New policies for student enrollments
CREATE POLICY "Parents can view their students' enrollments"
  ON enrollments FOR SELECT
  USING (
    student_id = auth.uid() OR  -- Direct student enrollment (legacy)
    student_profile_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create enrollments for their students"
  ON enrollments FOR INSERT
  WITH CHECK (
    student_id = auth.uid() OR  -- Direct student enrollment (legacy)
    student_profile_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )
  );

-- Instructors can view enrollments for their courses
CREATE POLICY "Instructors can view course enrollments"
  ON enrollments FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

-- Create index for new column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_enrollments_student_profile_id ON enrollments (student_profile_id);

-- Add comment
COMMENT ON COLUMN enrollments.student_profile_id IS 'References students table for student enrollments (managed by parents)';