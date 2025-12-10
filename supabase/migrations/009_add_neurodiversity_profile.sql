-- =====================================================
-- Add Neurodiversity Profile Support
-- Adds columns to store neurodiversity information for both students and instructors
-- =====================================================

-- Add neurodiversity_profile column to profiles table
ALTER TABLE profiles 
ADD COLUMN neurodiversity_profile TEXT[] DEFAULT '{}';

-- Add expertise/specialization column for instructors
ALTER TABLE profiles 
ADD COLUMN expertise TEXT[] DEFAULT '{}';

-- Add hourly_rate column for instructors
ALTER TABLE profiles 
ADD COLUMN hourly_rate DECIMAL(10,2);

-- Add years_experience column for instructors
ALTER TABLE profiles 
ADD COLUMN years_experience INTEGER;

-- Add comments to clarify usage
COMMENT ON COLUMN profiles.neurodiversity_profile IS 'Array of neurodiversity identifiers (autism, adhd, dyslexia, etc.)';
COMMENT ON COLUMN profiles.expertise IS 'Array of teaching expertise areas for instructors';
COMMENT ON COLUMN profiles.hourly_rate IS 'Hourly rate for instructor services (optional)';
COMMENT ON COLUMN profiles.years_experience IS 'Years of teaching/professional experience';

-- Create index for searching by neurodiversity profile
CREATE INDEX idx_profiles_neurodiversity ON profiles USING GIN (neurodiversity_profile);

-- Create index for searching by expertise
CREATE INDEX idx_profiles_expertise ON profiles USING GIN (expertise);