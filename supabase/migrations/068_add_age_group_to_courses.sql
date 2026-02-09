-- Add age_group column to courses table
-- This allows instructors to specify the target age range for their courses
-- Students and parents can filter courses by appropriate age groups

-- Add the age_group column with default value and CHECK constraint
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT 'All ages'
CHECK (age_group IN ('All ages', '5-8 years', '9-12 years', '13-18 years', 'Adults'));

-- Add comment to clarify usage
COMMENT ON COLUMN courses.age_group IS 'Target age range for the course. Options: All ages, 5-8 years, 9-12 years, 13-18 years, Adults';

-- Create index for filtering courses by age group
CREATE INDEX IF NOT EXISTS idx_courses_age_group ON courses(age_group);
