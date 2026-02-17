-- Migration: Update missing meeting links for courses and remove session meeting_link column
-- Auto-generate Jitsi meeting links based on instructor ID
-- Simplify to use only course-level meeting links

-- Update courses where meeting_link is NULL or empty
UPDATE courses
SET meeting_link = 'https://meet.jit.si/' || SPLIT_PART(instructor_id::text, '-', 1)
WHERE meeting_link IS NULL OR meeting_link = '';

-- Drop meeting_link column from sessions table (use course meeting_link instead)
-- Use CASCADE to drop dependent views
ALTER TABLE sessions DROP COLUMN IF EXISTS meeting_link CASCADE;
ALTER TABLE sessions DROP COLUMN IF EXISTS meeting_password CASCADE;
ALTER TABLE sessions DROP COLUMN IF EXISTS meeting_platform CASCADE;

-- Recreate the upcoming_sessions view without meeting_link
CREATE OR REPLACE VIEW upcoming_sessions AS
SELECT 
  s.id,
  s.course_id,
  s.title,
  s.description,
  s.session_date,
  s.duration_minutes,
  s.status,
  s.created_at,
  c.title as course_title,
  c.instructor_id,
  c.meeting_link,
  c.timezone
FROM sessions s
JOIN courses c ON s.course_id = c.id
WHERE s.session_date > NOW()
  AND s.status = 'scheduled'
ORDER BY s.session_date ASC;

-- Add comment explaining the meeting link format
COMMENT ON COLUMN courses.meeting_link IS 'Auto-generated Jitsi meeting link based on instructor ID prefix - used for all sessions in this course';
