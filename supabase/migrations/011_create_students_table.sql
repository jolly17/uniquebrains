-- =====================================================
-- Create Students Table
-- Students are managed by parents and don't have auth accounts
-- =====================================================

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

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
-- Parents can manage their own students
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
      WHERE e.student_id = students.id
      AND c.instructor_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_students_parent_id ON students (parent_id);
CREATE INDEX idx_students_age ON students (age);
CREATE INDEX idx_students_grade_level ON students (grade_level);
CREATE INDEX idx_students_neurodiversity ON students USING GIN (neurodiversity_profile);
CREATE INDEX idx_students_interests ON students USING GIN (interests);

-- Add comments
COMMENT ON TABLE students IS 'Student profiles managed by parents (no auth accounts)';
COMMENT ON COLUMN students.parent_id IS 'Links to the parent profile who manages this student';
COMMENT ON COLUMN students.neurodiversity_profile IS 'Array of neurodiversity identifiers (autism, adhd, dyslexia, etc.)';
COMMENT ON COLUMN students.other_needs IS 'Custom description of specific learning needs or accommodations';
COMMENT ON COLUMN students.interests IS 'Array of student interests/hobbies for course matching';

-- Update trigger for updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();