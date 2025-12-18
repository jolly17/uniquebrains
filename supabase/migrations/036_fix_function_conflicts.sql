-- Fix function conflicts by dropping existing functions first
-- Then recreate them with proper security settings

-- Drop all existing functions that might conflict
DROP FUNCTION IF EXISTS user_enrolled_in_course(UUID, UUID);
DROP FUNCTION IF EXISTS get_course_enrollment_count(UUID);
DROP FUNCTION IF EXISTS is_course_full(UUID);
DROP FUNCTION IF EXISTS has_submitted_homework(UUID, UUID);
DROP FUNCTION IF EXISTS get_homework_stats(UUID);
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_notification_read_at();
DROP FUNCTION IF EXISTS courses_search_vector_update();
DROP FUNCTION IF EXISTS debug_student_access(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Now recreate them with proper search_path settings

-- Function to check if user is enrolled in course
CREATE FUNCTION user_enrolled_in_course(course_uuid UUID, user_uuid UUID)
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

-- Function to update updated_at column
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function to get course enrollment count
CREATE FUNCTION get_course_enrollment_count(course_uuid UUID)
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
CREATE FUNCTION is_course_full(course_uuid UUID)
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
CREATE FUNCTION has_submitted_homework(homework_uuid UUID, user_uuid UUID)
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
CREATE FUNCTION get_homework_stats(homework_uuid UUID)
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
CREATE FUNCTION handle_new_user()
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION user_enrolled_in_course(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_course_enrollment_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_course_full(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_submitted_homework(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_homework_stats(UUID) TO authenticated;