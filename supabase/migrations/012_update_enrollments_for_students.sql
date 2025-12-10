-- =====================================================
-- Update Enrollments Table for Students
-- Update foreign key to reference students table for student enrollments
-- =====================================================

-- Add new column for student references
ALTER TABLE enrollments 
ADD COLUMN student_profile_id UUID REFERENCES students(id) ON DELETE CASCADE;

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

-- Create index for new column
CREATE INDEX idx_enrollments_student_profile_id ON enrollments (student_profile_id);

-- Add comment
COMMENT ON COLUMN enrollments.student_profile_id IS 'References students table for student enrollments (managed by parents)';