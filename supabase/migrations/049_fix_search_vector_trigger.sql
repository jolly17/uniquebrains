-- Migration 049: Fix search vector trigger to remove tags reference
-- The tags column was removed in migration 041, but the trigger still references it
-- Created: January 2026

-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS courses_search_vector_trigger ON courses;

-- Recreate the search vector update function without tags
CREATE OR REPLACE FUNCTION courses_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.category, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER courses_search_vector_trigger
BEFORE INSERT OR UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION courses_search_vector_update();

-- Update existing courses to regenerate search vectors
UPDATE courses 
SET search_vector = to_tsvector('english', 
  COALESCE(title, '') || ' ' || 
  COALESCE(description, '') || ' ' ||
  COALESCE(category, '')
);
