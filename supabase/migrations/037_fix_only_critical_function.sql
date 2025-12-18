-- Fix only the critical user_enrolled_in_course function that we created
-- This avoids conflicts with existing functions that may have different signatures

-- Update only our user_enrolled_in_course function to add search_path
-- This is the main function causing security warnings that we control
CREATE OR REPLACE FUNCTION user_enrolled_in_course(course_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE course_id = course_uuid 
    AND student_id = user_uuid 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Update the update_updated_at_column function if it exists
-- This is a common trigger function we likely created
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Grant permission for the function we know we need
GRANT EXECUTE ON FUNCTION user_enrolled_in_course(UUID, UUID) TO authenticated;

-- Note: Other functions mentioned in the warnings may be from Supabase extensions
-- or have different signatures than we expected. We'll only fix the ones we created.