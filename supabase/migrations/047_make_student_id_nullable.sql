-- =====================================================
-- Migration 047: Make student_id nullable in enrollments
-- Created: January 2026
-- Purpose: Allow student_id to be null for parent-managed enrollments
-- =====================================================

-- Make student_id nullable (it was NOT NULL before)
ALTER TABLE enrollments 
ALTER COLUMN student_id DROP NOT NULL;

-- Verify the constraint was updated
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'enrollments' 
  AND column_name IN ('student_id', 'student_profile_id')
ORDER BY column_name;

-- Add comment
COMMENT ON COLUMN enrollments.student_id IS 'User ID for direct student enrollments. NULL for parent-managed enrollments (use student_profile_id instead).';
