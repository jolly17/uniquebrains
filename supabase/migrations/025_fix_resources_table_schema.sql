-- Fix resources table schema to match API expectations
-- Add missing columns that the API is trying to use

-- Add missing columns to resources table
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS link_url TEXT;

-- Update the resource_type check constraint to include more types
ALTER TABLE resources 
DROP CONSTRAINT IF EXISTS resources_resource_type_check;

ALTER TABLE resources 
ADD CONSTRAINT resources_resource_type_check 
CHECK (resource_type IN ('document', 'video', 'link', 'image', 'file', 'other'));

-- Create index for link_url
CREATE INDEX IF NOT EXISTS idx_resources_link_url ON resources(link_url);

-- Update the file_url column to be nullable since we now have link_url
ALTER TABLE resources 
ALTER COLUMN file_url DROP NOT NULL;