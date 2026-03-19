-- Add display_order column to courses table for admin reordering
ALTER TABLE courses ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial display_order based on created_at (oldest first = lowest order)
WITH ordered_courses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM courses
)
UPDATE courses
SET display_order = ordered_courses.rn
FROM ordered_courses
WHERE courses.id = ordered_courses.id;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_courses_display_order ON courses(display_order);
