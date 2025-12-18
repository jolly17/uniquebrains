-- Fix Supabase security warnings
-- This migration addresses function search path and security issues

-- Fix search_path for all functions to make them secure
-- Set search_path to 'public' for all our custom functions

-- Fix user_enrolled_in_course function (the one we created)
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

-- Fix update_updated_at_column function (if it exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Create or replace other functions with proper search_path
-- These might not all exist, but we'll create them safely

-- Function to get course enrollment count
CREATE OR REPLACE FUNCTION get_course_enrollment_count(course_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM public.enrollments 
    WHERE course_id = course_uuid 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to check if course is full
CREATE OR REPLACE FUNCTION is_course_full(course_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  max_students INTEGER;
  current_count INTEGER;
BEGIN
  SELECT enrollment_limit INTO max_students 
  FROM public.courses 
  WHERE id = course_uuid;
  
  IF max_students IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT get_course_enrollment_count(course_uuid) INTO current_count;
  
  RETURN current_count >= max_students;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to check if user has submitted homework
CREATE OR REPLACE FUNCTION has_submitted_homework(homework_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.submissions 
    WHERE homework_id = homework_uuid 
    AND student_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to get homework stats
CREATE OR REPLACE FUNCTION get_homework_stats(homework_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_submissions', COUNT(*),
    'submitted_count', COUNT(CASE WHEN status = 'submitted' THEN 1 END),
    'graded_count', COUNT(CASE WHEN grade IS NOT NULL THEN 1 END)
  ) INTO result
  FROM public.submissions 
  WHERE homework_id = homework_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to update notification read status
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function for search vector updates (if using full-text search)
CREATE OR REPLACE FUNCTION courses_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Debug function for student access (should be removed in production)
CREATE OR REPLACE FUNCTION debug_student_access(student_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'student_id', student_uuid,
    'enrollments', (
      SELECT json_agg(json_build_object('course_id', course_id, 'status', status))
      FROM public.enrollments 
      WHERE student_id = student_uuid
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION user_enrolled_in_course(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_course_enrollment_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_course_full(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_submitted_homework(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_homework_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION debug_student_access(UUID) TO authenticated;