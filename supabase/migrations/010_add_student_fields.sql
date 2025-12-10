-- =====================================================
-- Add Student-Specific Fields
-- Adds fields needed for student profiles created by parents
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

-- Create index for searching by age range
CREATE INDEX idx_profiles_age ON profiles (age) WHERE role = 'student';

-- Create index for searching by interests
CREATE INDEX idx_profiles_interests ON profiles USING GIN (interests) WHERE role = 'student';

-- Create index for searching by grade level
CREATE INDEX idx_profiles_grade_level ON profiles (grade_level) WHERE role = 'student';