-- =====================================================
-- Fix Student Profiles - Remove Auth Constraint
-- Allows student profiles without auth.users entries
-- =====================================================

-- Drop the existing foreign key constraint
ALTER TABLE profiles 
DROP CONSTRAINT profiles_id_fkey;

-- Add a new constraint that allows NULLs for students
-- This allows student profiles to exist without auth.users entries
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;

-- Actually, let's use a different approach - make ID nullable for students
-- and add a separate student_id field

-- First, let's create a separate students table instead
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  age INTEGER,
  grade_level TEXT,
  neurodiversity_profile TEXT[] DEFAULT '{}',
  other_needs TEXT,
  interests TEXT[] DEFAULT '{}',
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
-- Parents can manage their own students
CREATE POLICY "Parents can manage their own students"
  ON students FOR ALL
  USING (parent_id = auth.uid());

-- Instructors can view students in their courses
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

-- Create indexes for performance
CREATE INDEX idx_students_parent_id ON students (parent_id);
CREATE INDEX idx_students_age ON students (age);
CREATE INDEX idx_students_neurodiversity ON students USING GIN (neurodiversity_profile);
CREATE INDEX idx_students_interests ON students USING GIN (interests);

-- Add trigger for updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();