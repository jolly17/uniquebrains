-- Remove content column from questions table
-- Questions should only have titles (and optional images), not additional content

ALTER TABLE questions DROP COLUMN IF EXISTS content;
