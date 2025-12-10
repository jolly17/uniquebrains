-- =====================================================
-- Fix Existing Students Table
-- Add any missing columns, indexes, and policies to existing students table
-- =====================================================

-- Check if columns exist and add them if missing
DO $$ 
BEGIN
    -- Add grade_level if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'grade_level') THEN
        ALTER TABLE students ADD COLUMN grade_level TEXT;
    END IF;
    
    -- Add other_needs if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'other_needs') THEN
        ALTER TABLE students ADD COLUMN other_needs TEXT;
    END IF;
    
    -- Add interests if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'interests') THEN
        ALTER TABLE students ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add bio if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'bio') THEN
        ALTER TABLE students ADD COLUMN bio TEXT;
    END IF;
    
    -- Add avatar_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'avatar_url') THEN
        ALTER TABLE students ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Parents can view their own students" ON students;
DROP POLICY IF EXISTS "Parents can insert students" ON students;
DROP POLICY IF EXISTS "Parents can update their own students" ON students;
DROP POLICY IF EXISTS "Parents can delete their own students" ON students;
DROP POLICY IF EXISTS "Instructors can view enrolled students" ON students;

-- Create correct policies
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

-- Instructors can view students enrolled in their courses
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students (parent_id);
CREATE INDEX IF NOT EXISTS idx_students_age ON students (age);
CREATE INDEX IF NOT EXISTS idx_students_grade_level ON students (grade_level);
CREATE INDEX IF NOT EXISTS idx_students_neurodiversity ON students USING GIN (neurodiversity_profile);
CREATE INDEX IF NOT EXISTS idx_students_interests ON students USING GIN (interests);

-- Add comments
COMMENT ON TABLE students IS 'Student profiles managed by parents (no auth accounts)';
COMMENT ON COLUMN students.parent_id IS 'Links to the parent profile who manages this student';
COMMENT ON COLUMN students.neurodiversity_profile IS 'Array of neurodiversity identifiers (autism, adhd, dyslexia, etc.)';
COMMENT ON COLUMN students.other_needs IS 'Custom description of specific learning needs or accommodations';
COMMENT ON COLUMN students.interests IS 'Array of student interests/hobbies for course matching';

-- Ensure update trigger exists
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();