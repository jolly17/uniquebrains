-- =====================================================
-- Update Sessions Table for Manual Meeting Links
-- Makes meeting link fields generic to support any platform
-- (Zoom, Google Meet, Microsoft Teams, etc.)
-- =====================================================

-- Rename zoom_link to meeting_link (more generic)
ALTER TABLE sessions 
  RENAME COLUMN zoom_link TO meeting_link;

-- Rename zoom_meeting_id to meeting_id (more generic)
ALTER TABLE sessions 
  RENAME COLUMN zoom_meeting_id TO meeting_id;

-- Rename zoom_password to meeting_password (more generic)
ALTER TABLE sessions 
  RENAME COLUMN zoom_password TO meeting_password;

-- Add meeting_platform column to track which platform is being used
ALTER TABLE sessions 
  ADD COLUMN meeting_platform TEXT CHECK (meeting_platform IN ('zoom', 'google_meet', 'microsoft_teams', 'other', NULL));

-- Add comment to clarify usage
COMMENT ON COLUMN sessions.meeting_link IS 'URL for video conference - instructor provides their own link from any platform';
COMMENT ON COLUMN sessions.meeting_platform IS 'Platform being used: zoom, google_meet, microsoft_teams, or other';
COMMENT ON COLUMN sessions.meeting_password IS 'Optional password for the meeting';
COMMENT ON COLUMN sessions.meeting_id IS 'Optional meeting ID (if applicable for the platform)';
