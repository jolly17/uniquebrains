-- Migration 051: Add meeting_link column to courses table
-- Created: January 2026
-- Purpose: Store course-level meeting link that applies to all sessions

-- Add meeting_link column to courses table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'meeting_link') THEN
    ALTER TABLE courses ADD COLUMN meeting_link TEXT;
  END IF;
END $$;

-- Add comment to clarify usage
COMMENT ON COLUMN courses.meeting_link IS 'Default meeting link for all sessions in this course (Zoom, Google Meet, Teams, etc.)';
