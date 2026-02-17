-- Migration: Update missing meeting links for existing courses
-- Auto-generate Jitsi meeting links based on instructor ID

-- Update courses where meeting_link is NULL or empty
UPDATE courses
SET meeting_link = 'https://meet.jit.si/' || SPLIT_PART(instructor_id::text, '-', 1)
WHERE meeting_link IS NULL OR meeting_link = '';

-- Add comment explaining the meeting link format
COMMENT ON COLUMN courses.meeting_link IS 'Auto-generated Jitsi meeting link based on instructor ID prefix (first part before dash)';
