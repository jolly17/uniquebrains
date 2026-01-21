-- =====================================================
-- Migration 040: Set is_published and status defaults
-- Created: January 2026
-- Purpose: Auto-publish new courses by default
-- =====================================================

-- Change the default value for is_published to true
ALTER TABLE courses 
ALTER COLUMN is_published SET DEFAULT true;

-- Change the default value for status to 'published'
ALTER TABLE courses 
ALTER COLUMN status SET DEFAULT 'published';

-- Update existing courses with status='draft' to 'published'
UPDATE courses 
SET status = 'published', is_published = true 
WHERE status = 'draft';

-- Update existing courses to be published if they have status='published' but is_published=false
UPDATE courses 
SET is_published = true 
WHERE status = 'published' AND is_published = false;

-- Add comments explaining the columns
COMMENT ON COLUMN courses.is_published IS 'Whether the course is visible in the marketplace. Defaults to true for new courses.';
COMMENT ON COLUMN courses.status IS 'Course publication status. Defaults to published for new courses.';
