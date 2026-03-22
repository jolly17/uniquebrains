-- Migration: Add condition column to care_resources table
-- Description: Adds a 'condition' array column for filtering resources by condition (e.g., autism, ADHD, dyslexia)
-- Date: 2026-03-22

-- Add condition column as TEXT array (same pattern as tags)
ALTER TABLE care_resources
ADD COLUMN IF NOT EXISTS condition TEXT[] DEFAULT '{}';

-- Create GIN index for efficient array queries on condition
CREATE INDEX IF NOT EXISTS idx_care_resources_condition ON care_resources USING GIN(condition);

-- Add comment to column
COMMENT ON COLUMN care_resources.condition IS 'Array of conditions for filtering (e.g., autism, ADHD, dyslexia, anxiety)';
