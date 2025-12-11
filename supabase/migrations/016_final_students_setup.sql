-- =====================================================
-- Final Students Setup - Step by Step
-- 1. Drop and recreate students table cleanly
-- 2. Add student_profile_id to enrollments
-- 3. Create all policies correctly
-- =====================================================

-- Step 1: Clean students table setup
DROP TABLE IF EXISTS students CASCADE;

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER,
  date_of_birth DATE,
  grade_level TEXT,
  neurodiversity_profile TEXT[] DEFAULT '{}',
  other_needs TEXT,
  interests TEXT[] DEFAULT '{}',
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Step 2: Add student_profile_id to enrollments if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'enrollments' AND column_name = 'student_profile_id'
    ) THEN
        ALTER TABLE enrollments 
        ADD COLUMN student_profile_id UUID REFERENCES students(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 3: Update enrollments constraints
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS check_student_reference;
ALTER TABLE enrollments 
ADD CONSTRAINT check_student_reference 
CHECK (
  (student_id IS NOT NULL AND student_profile_id IS NULL) OR 
  (student_id IS NULL AND student_profile_id IS NOT NULL)
);

-- Step 4: Create students table policies
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

-- Step 5: Create instructor policy for students (now that student_profile_id exists)
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

-- Step 6: Update enrollments policies
DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can create enrollments" ON enrollments;
DROP POLICY IF EXISTS "Parents can view their students' enrollments" ON enrollments;
DROP POLICY IF EXISTS "Parents can create enrollments for their students" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view course enrollments" ON enrollments;

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

CREATE POLICY "Instructors can view course enrollments"
  ON enrollments FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

-- Step 7: Create indexes
CREATE INDEX idx_students_parent_id ON students (parent_id);
CREATE INDEX idx_students_age ON students (age);
CREATE INDEX idx_students_grade_level ON students (grade_level);
CREATE INDEX idx_students_neurodiversity ON students USING GIN (neurodiversity_profile);
CREATE INDEX idx_students_interests ON students USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_profile_id ON enrollments (student_profile_id);

-- Step 8: Add update trigger
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Add comments
COMMENT ON TABLE students IS 'Student profiles managed by parents (no auth accounts)';
COMMENT ON COLUMN students.parent_id IS 'Links to the parent profile who manages this student';
COMMENT ON COLUMN students.neurodiversity_profile IS 'Array of neurodiversity identifiers (autism, adhd, dyslexia, etc.)';
COMMENT ON COLUMN students.other_needs IS 'Custom description of specific learning needs or accommodations';
COMMENT ON COLUMN students.interests IS 'Array of student interests/hobbies for course matching';
COMMENT ON COLUMN enrollments.student_profile_id IS 'References students table for student enrollments (managed by parents)';