-- =====================================================
-- Migration 041: Remove unused course columns
-- Created: January 2026
-- Purpose: Clean up courses table by removing unused columns
-- =====================================================

-- Drop the course_stats view first (it depends on courses table columns)
DROP VIEW IF EXISTS course_stats CASCADE;

-- Remove unused columns from courses table
ALTER TABLE courses 
DROP COLUMN IF EXISTS max_students,
DROP COLUMN IF EXISTS duration_weeks,
DROP COLUMN IF EXISTS difficulty_level,
DROP COLUMN IF EXISTS tags;

-- Recreate course_stats view without the removed columns
CREATE OR REPLACE VIEW course_stats AS
SELECT 
  c.*,
  COUNT(e.id) as enrollment_count,
  COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active_enrollments,
  COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_enrollments,
  ROUND(AVG(CASE WHEN e.status = 'active' THEN e.progress END), 0) as avg_progress
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id;

-- Add comments
COMMENT ON TABLE courses IS 'Courses table - cleaned up unused columns. Use enrollment_limit instead of max_students.';
COMMENT ON VIEW course_stats IS 'Course statistics including enrollment counts and progress - updated after column cleanup';
