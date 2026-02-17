-- Migration: Update missing meeting links for courses and remove session meeting_link column
-- Auto-generate Jitsi meeting links based on instructor ID
-- Simplify to use only course-level meeting links

-- Update courses where meeting_link is NULL or empty
UPDATE courses
SET meeting_link = 'https://meet.jit.si/' || SPLIT_PART(instructor_id::text, '-', 1)
WHERE meeting_link IS NULL OR meeting_link = '';

-- Drop meeting_link column from sessions table (use course meeting_link instead)
ALTER TABLE sessions DROP COLUMN IF EXISTS meeting_link;
ALTER TABLE sessions DROP COLUMN IF EXISTS meeting_password;
ALTER TABLE sessions DROP COLUMN IF EXISTS meeting_id;

-- Add comment explaining the meeting link format
COMMENT ON COLUMN courses.meeting_link IS 'Auto-generated Jitsi meeting link based on instructor ID prefix - used for all sessions in this course';
