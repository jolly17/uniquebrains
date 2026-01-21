-- =====================================================
-- Migration 044: Add student_profile_id column to enrollments
-- Created: January 2026
-- Purpose: Add missing student_profile_id column to support parent-managed enrollments
-- =====================================================

-- Add student_profile_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'enrollments' AND column_name = 'student_profile_id'
    ) THEN
        ALTER TABLE enrollments 
        ADD COLUMN student_profile_id UUID REFERENCES students(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added student_profile_id column to enrollments table';
    ELSE
        RAISE NOTICE 'student_profile_id column already exists';
    END IF;
END $$;

-- Update enrollments constraints to ensure either student_id OR student_profile_id is set (not both)
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS check_student_reference;
ALTER TABLE enrollments 
ADD CONSTRAINT check_student_reference 
CHECK (
  (student_id IS NOT NULL AND student_profile_id IS NULL) OR 
  (student_id IS NULL AND student_profile_id IS NOT NULL)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_enrollments_student_profile_id ON enrollments (student_profile_id);

-- Add comment
COMMENT ON COLUMN enrollments.student_profile_id IS 'References students table for parent-managed student enrollments. Either student_id OR student_profile_id must be set, not both.';

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'enrollments' 
  AND column_name IN ('student_id', 'student_profile_id')
ORDER BY column_name;
