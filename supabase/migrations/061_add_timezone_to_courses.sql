-- Add timezone column to courses table
-- This allows instructors to specify their timezone when creating courses
-- Students will see times converted to their local timezone

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Add comment to clarify usage
COMMENT ON COLUMN courses.timezone IS 'IANA timezone identifier for course schedule (e.g., America/New_York, Europe/London)';
