-- =====================================================
-- Homework and Submissions Alignment Migration
-- Fixes schema mismatches for homework and submissions
-- =====================================================

-- =====================================================
-- UPDATE HOMEWORK TABLE
-- Add missing columns that frontend expects
-- =====================================================

-- Add points column (rename from max_points for consistency)
ALTER TABLE homework 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 100 CHECK (points >= 0);

-- Copy data from max_points to points
UPDATE homework 
SET points = max_points 
WHERE points IS NULL AND max_points IS NOT NULL;

-- Add submission_type column
ALTER TABLE homework 
ADD COLUMN IF NOT EXISTS submission_type TEXT NOT NULL DEFAULT 'text' 
CHECK (submission_type IN ('text', 'file', 'checkmark'));

-- Add attachments column (JSON for multiple attachments)
ALTER TABLE homework 
ADD COLUMN IF NOT EXISTS attachments JSONB;

-- Make due_date nullable (some assignments might not have due dates)
ALTER TABLE homework 
ALTER COLUMN due_date DROP NOT NULL;

-- =====================================================
-- UPDATE SUBMISSIONS TABLE
-- Add missing columns and rename fields for consistency
-- =====================================================

-- Add content column (rename from submission_text for consistency)
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Copy data from submission_text to content
UPDATE submissions 
SET content = submission_text 
WHERE content IS NULL AND submission_text IS NOT NULL;

-- Add file_url column (rename from attachment_url for consistency)
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Copy data from attachment_url to file_url
UPDATE submissions 
SET file_url = attachment_url 
WHERE file_url IS NULL AND attachment_url IS NOT NULL;

-- =====================================================
-- UPDATE RESOURCES TABLE
-- Check if resources table needs alignment
-- =====================================================

-- The resources table structure looks good, but let's add some missing indexes
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_is_public ON resources(is_public);

-- =====================================================
-- UPDATE MESSAGES TABLE
-- Add missing columns for better message handling
-- =====================================================

-- Add recipient_id for one-on-one messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Add is_announcement flag
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN NOT NULL DEFAULT false;

-- Add attachments support
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachments JSONB;

-- =====================================================
-- ADD MISSING INDEXES
-- Add indexes for new columns
-- =====================================================

-- Homework indexes
CREATE INDEX IF NOT EXISTS idx_homework_points ON homework(points) WHERE points IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_homework_submission_type ON homework(submission_type);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_graded_at ON submissions(graded_at) WHERE graded_at IS NOT NULL;

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id) WHERE recipient_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_is_announcement ON messages(is_announcement);

-- =====================================================
-- UPDATE RLS POLICIES FOR MESSAGES
-- Add policies for one-on-one messaging
-- =====================================================

-- Drop existing message policies to recreate them
DROP POLICY IF EXISTS "Course participants can view messages" ON messages;
DROP POLICY IF EXISTS "Course participants can create messages" ON messages;

-- Recreate message policies with recipient support
-- Users can view messages in courses they participate in
CREATE POLICY "Course participants can view messages"
  ON messages FOR SELECT
  USING (
    -- Group messages (no recipient) - course participants can see
    (recipient_id IS NULL AND (
      -- Enrolled students can see group messages
      EXISTS (
        SELECT 1 FROM enrollments
        WHERE enrollments.course_id = messages.course_id
        AND enrollments.student_id = auth.uid()
        AND enrollments.status = 'active'
      )
      OR
      -- Instructors can see group messages in their courses
      EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = messages.course_id
        AND courses.instructor_id = auth.uid()
      )
    ))
    OR
    -- Private messages - sender or recipient can see
    (recipient_id IS NOT NULL AND (
      auth.uid() = sender_id OR auth.uid() = recipient_id
    ))
  );

-- Users can create messages in courses they participate in
CREATE POLICY "Course participants can create messages"
  ON messages FOR INSERT
  WITH CHECK (
    -- Must be enrolled student or course instructor
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = messages.course_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = messages.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can update/delete messages in their courses
CREATE POLICY "Instructors can manage course messages"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = messages.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete course messages"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = messages.course_id
      AND courses.instructor_id = auth.uid()
    )
    OR
    auth.uid() = sender_id
  );

-- =====================================================
-- CREATE HELPER FUNCTIONS
-- Functions to support homework and submissions
-- =====================================================

-- Function to get homework statistics for a course
CREATE OR REPLACE FUNCTION get_homework_stats(course_uuid UUID)
RETURNS TABLE(
  total_assignments INTEGER,
  published_assignments INTEGER,
  total_submissions INTEGER,
  graded_submissions INTEGER,
  average_grade NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(h.id)::INTEGER as total_assignments,
    COUNT(CASE WHEN h.is_published THEN 1 END)::INTEGER as published_assignments,
    COUNT(s.id)::INTEGER as total_submissions,
    COUNT(CASE WHEN s.status = 'graded' THEN 1 END)::INTEGER as graded_submissions,
    ROUND(AVG(s.grade), 2) as average_grade
  FROM homework h
  LEFT JOIN submissions s ON h.id = s.homework_id
  WHERE h.course_id = course_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if student has submitted homework
CREATE OR REPLACE FUNCTION has_submitted_homework(homework_uuid UUID, student_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM submissions
    WHERE homework_id = homework_uuid
      AND student_id = student_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CREATE HELPFUL VIEWS
-- Views for common frontend queries
-- =====================================================

-- View for homework with submission counts
CREATE OR REPLACE VIEW homework_with_stats AS
SELECT 
  h.*,
  COUNT(s.id) as submission_count,
  COUNT(CASE WHEN s.status = 'graded' THEN 1 END) as graded_count,
  ROUND(AVG(s.grade), 2) as average_grade,
  c.title as course_title,
  c.instructor_id
FROM homework h
JOIN courses c ON h.course_id = c.id
LEFT JOIN submissions s ON h.id = s.homework_id
GROUP BY h.id, c.id;

-- View for student submissions with homework info
CREATE OR REPLACE VIEW student_submissions_with_homework AS
SELECT 
  s.*,
  h.title as homework_title,
  h.description as homework_description,
  h.due_date,
  h.points as max_points,
  h.submission_type,
  c.title as course_title,
  c.id as course_id
FROM submissions s
JOIN homework h ON s.homework_id = h.id
JOIN courses c ON h.course_id = c.id;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN homework.points IS 'Maximum points for this assignment';
COMMENT ON COLUMN homework.submission_type IS 'Type of submission expected: text, file, or checkmark';
COMMENT ON COLUMN homework.attachments IS 'JSON array of attachment URLs and metadata';

COMMENT ON COLUMN submissions.content IS 'Text content of the submission';
COMMENT ON COLUMN submissions.file_url IS 'URL of uploaded file submission';

COMMENT ON COLUMN messages.recipient_id IS 'For one-on-one messages, the recipient user ID';
COMMENT ON COLUMN messages.is_announcement IS 'Whether this message is an announcement';
COMMENT ON COLUMN messages.attachments IS 'JSON array of message attachments';

COMMENT ON VIEW homework_with_stats IS 'Homework assignments with submission statistics';
COMMENT ON VIEW student_submissions_with_homework IS 'Student submissions with homework and course information';

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify the migration worked
-- =====================================================

-- Verify homework table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'homework'
-- ORDER BY ordinal_position;

-- Verify submissions table structure  
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'submissions'
-- ORDER BY ordinal_position;

-- Test homework creation with new fields
-- INSERT INTO homework (course_id, title, description, points, submission_type, is_published)
-- VALUES ('your-course-id', 'Test Assignment', 'Test Description', 100, 'text', true);