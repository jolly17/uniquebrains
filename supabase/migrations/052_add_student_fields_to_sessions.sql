-- Add student_id and student_profile_id to sessions table for 1-on-1 courses
-- student_id: for direct student enrollments (user is the student)
-- student_profile_id: for parent-managed enrollments (child profiles)

ALTER TABLE sessions 
ADD COLUMN student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN student_profile_id UUID REFERENCES students(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_student_profile_id ON sessions(student_profile_id);

-- Add check constraint: for 1-on-1 sessions, either student_id or student_profile_id should be set
-- For group sessions, both should be NULL
-- Note: We can't enforce this at DB level easily, so we'll handle it in application logic

-- Update RLS policies to allow students to see their own sessions
-- Students can view sessions where they are the student_id
CREATE POLICY "Students can view their own sessions"
  ON sessions FOR SELECT
  USING (
    student_id = auth.uid()
  );

-- Parents can view sessions for their children (student_profile_id)
CREATE POLICY "Parents can view their children's sessions"
  ON sessions FOR SELECT
  USING (
    student_profile_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )
  );

COMMENT ON COLUMN sessions.student_id IS 'For 1-on-1 courses: direct student enrollment (user is the student). NULL for group courses.';
COMMENT ON COLUMN sessions.student_profile_id IS 'For 1-on-1 courses: parent-managed enrollment (child profile). NULL for group courses and direct enrollments.';
