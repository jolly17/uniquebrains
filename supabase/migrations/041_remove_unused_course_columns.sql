-- =====================================================
-- Migration 041: Remove unused course columns
-- Created: January 2026
-- Purpose: Clean up courses table by removing unused columns
-- =====================================================

-- Remove unused columns from courses table
ALTER TABLE courses 
DROP COLUMN IF EXISTS max_students,
DROP COLUMN IF EXISTS duration_weeks,
DROP COLUMN IF EXISTS difficulty_level,
DROP COLUMN IF EXISTS tags;

-- Add comment explaining the cleanup
COMMENT ON TABLE courses IS 'Courses table - cleaned up unused columns. Use enrollment_limit instead of max_students.';
