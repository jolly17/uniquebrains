-- Migration: Remove milestone CHECK constraint to allow flexible milestone additions
-- Description: Makes the milestone system flexible - new milestones can be added without database changes
-- Date: 2026-02-25

-- Drop the existing CHECK constraint on milestone column
ALTER TABLE care_resources 
DROP CONSTRAINT IF EXISTS care_resources_milestone_check;

-- Update column comment to reflect the change
COMMENT ON COLUMN care_resources.milestone IS 'Care stage - defined in src/data/milestones.js configuration file (no database constraint for flexibility)';
