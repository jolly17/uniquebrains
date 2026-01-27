-- Add recipient_id to messages table for 1-on-1 messaging
-- NULL recipient_id = group message (visible to all course participants)
-- Non-NULL recipient_id = direct message (visible only to sender and recipient)

ALTER TABLE messages 
ADD COLUMN recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);

-- Update RLS policies to handle 1-on-1 messages
-- Drop existing policy
DROP POLICY IF EXISTS "Course participants can view messages" ON messages;

-- Create new policy for group messages (recipient_id IS NULL)
CREATE POLICY "Course participants can view group messages"
  ON messages FOR SELECT
  USING (
    recipient_id IS NULL
    AND (
      EXISTS (
        SELECT 1 FROM enrollments
        WHERE enrollments.course_id = messages.course_id
        AND enrollments.student_id = auth.uid()
        AND enrollments.status = 'active'
      )
      OR EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = messages.course_id
        AND courses.instructor_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM enrollments
        INNER JOIN students ON students.id = enrollments.student_profile_id
        WHERE enrollments.course_id = messages.course_id
        AND students.parent_id = auth.uid()
        AND enrollments.status = 'active'
      )
    )
  );

-- Create policy for 1-on-1 messages (recipient_id IS NOT NULL)
CREATE POLICY "Users can view their own 1-on-1 messages"
  ON messages FOR SELECT
  USING (
    recipient_id IS NOT NULL
    AND (sender_id = auth.uid() OR recipient_id = auth.uid())
  );

-- Policy for inserting messages
CREATE POLICY "Course participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = messages.course_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = messages.course_id
      AND courses.instructor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM enrollments
      INNER JOIN students ON students.id = enrollments.student_profile_id
      WHERE enrollments.course_id = messages.course_id
      AND students.parent_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Policy for deleting own messages
CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (sender_id = auth.uid());

-- Policy for instructors to delete any message in their courses
CREATE POLICY "Instructors can delete messages in their courses"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = messages.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

COMMENT ON COLUMN messages.recipient_id IS 'For 1-on-1 messages: the recipient user ID. NULL for group messages visible to all course participants.';
