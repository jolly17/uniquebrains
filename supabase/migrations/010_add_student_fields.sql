-- =====================================================
-- Add Student-Specific Fields
-- Adds fields needed for student profiles created by parents
-- Note: parent_id field already exists to link students to parents
-- =====================================================

-- Add age field for students (can be calculated from date_of_birth, but useful for quick access)
ALTER TABLE profiles 
ADD COLUMN age INTEGER;

-- Add other_needs field for custom neurodiversity descriptions
ALTER TABLE profiles 
ADD COLUMN other_needs TEXT;

-- Add grade_level field for educational context
ALTER TABLE profiles 
ADD COLUMN grade_level TEXT;

-- Add interests field for matching with appropriate courses
ALTER TABLE profiles 
ADD COLUMN interests TEXT[] DEFAULT '{}';

-- Add comments to clarify usage
COMMENT ON COLUMN profiles.age IS 'Student age (for quick access, can also be calculated from date_of_birth)';
COMMENT ON COLUMN profiles.other_needs IS 'Custom description of specific learning needs or accommodations';
COMMENT ON COLUMN profiles.grade_level IS 'Current grade level or educational stage';
COMMENT ON COLUMN profiles.interests IS 'Array of student interests/hobbies for course matching';
COMMENT ON COLUMN profiles.parent_id IS 'Links student profiles to their parent (NULL for parents and instructors)';

-- Create index for searching by age range
CREATE INDEX idx_profiles_age ON profiles (age) WHERE role = 'student';

-- Create index for searching by interests
CREATE INDEX idx_profiles_interests ON profiles USING GIN (interests) WHERE role = 'student';

-- Create index for searching by grade level
CREATE INDEX idx_profiles_grade_level ON profiles (grade_level) WHERE role = 'student';

-- Create index for parent-student relationships
CREATE INDEX idx_profiles_parent_id ON profiles (parent_id) WHERE parent_id IS NOT NULL;

-- =====================================================
-- Student Profile Constraints
-- =====================================================

-- Ensure students have a parent_id (students must be linked to parents)
ALTER TABLE profiles 
ADD CONSTRAINT check_student_has_parent 
CHECK (
  (role = 'student' AND parent_id IS NOT NULL) OR 
  (role != 'student' AND parent_id IS NULL)
);

-- Ensure parent_id references a profile with 'parent' role
-- Note: This is enforced at application level since we can't easily do cross-row checks in PostgreSQL