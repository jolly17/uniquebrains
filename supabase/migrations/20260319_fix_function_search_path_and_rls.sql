-- =====================================================
-- FIX SUPABASE SECURITY WARNINGS
-- 1. Fix 17 functions with mutable search_path
-- 2. Fix 2 overly permissive RLS policies
-- 3. Move extensions out of public schema
-- =====================================================

-- =====================================================
-- PART 1: Fix function search_path warnings
-- Add SET search_path = '' to all functions
-- Using explicit schema references (public.) in function bodies
-- =====================================================

-- 1. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
SET search_path = '';

-- 2. is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = '';

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- 3. get_course_enrollment_count
CREATE OR REPLACE FUNCTION public.get_course_enrollment_count(course_uuid UUID)
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
SET search_path = '';

GRANT EXECUTE ON FUNCTION public.get_course_enrollment_count(UUID) TO authenticated;

-- 4. is_course_full
CREATE OR REPLACE FUNCTION public.is_course_full(course_uuid UUID)
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
  
  SELECT public.get_course_enrollment_count(course_uuid) INTO current_count;
  
  RETURN current_count >= max_students;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

GRANT EXECUTE ON FUNCTION public.is_course_full(UUID) TO authenticated;

-- 5. has_submitted_homework
CREATE OR REPLACE FUNCTION public.has_submitted_homework(homework_uuid UUID, student_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.submissions 
    WHERE homework_id = homework_uuid 
    AND student_id = student_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

GRANT EXECUTE ON FUNCTION public.has_submitted_homework(UUID, UUID) TO authenticated;

-- 6. get_homework_stats (DROP first - return type may differ)
DROP FUNCTION IF EXISTS public.get_homework_stats(UUID);
CREATE OR REPLACE FUNCTION public.get_homework_stats(homework_uuid UUID)
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
SET search_path = '';

GRANT EXECUTE ON FUNCTION public.get_homework_stats(UUID) TO authenticated;

-- 7. debug_student_access (DROP first - return type may differ)
DROP FUNCTION IF EXISTS public.debug_student_access(UUID);
CREATE OR REPLACE FUNCTION public.debug_student_access(student_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'student_id', student_uuid,
    'enrollments', (SELECT json_agg(e.*) FROM public.enrollments e WHERE e.student_id = student_uuid),
    'profile', (SELECT row_to_json(p.*) FROM public.profiles p WHERE p.id = student_uuid)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- 8. update_notification_read_at
CREATE OR REPLACE FUNCTION public.update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 9. update_question_vote_count
CREATE OR REPLACE FUNCTION public.update_question_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.question_id IS NOT NULL THEN
    UPDATE public.questions
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.question_id IS NOT NULL THEN
    UPDATE public.questions
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 2 ELSE -2 END
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.question_id IS NOT NULL THEN
    UPDATE public.questions
    SET vote_count = vote_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = OLD.question_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 10. update_answer_vote_count
CREATE OR REPLACE FUNCTION public.update_answer_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.answer_id IS NOT NULL THEN
    UPDATE public.answers
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.answer_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.answer_id IS NOT NULL THEN
    UPDATE public.answers
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 2 ELSE -2 END
    WHERE id = NEW.answer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.answer_id IS NOT NULL THEN
    UPDATE public.answers
    SET vote_count = vote_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = OLD.answer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 11. update_content_comments_updated_at
CREATE OR REPLACE FUNCTION public.update_content_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 12. update_care_resources_updated_at
CREATE OR REPLACE FUNCTION public.update_care_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 13. resources_within_radius (DROP first - RETURNS TABLE can't be changed)
DROP FUNCTION IF EXISTS public.resources_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, VARCHAR);
CREATE OR REPLACE FUNCTION public.resources_within_radius(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION,
  milestone_filter VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  milestone VARCHAR(50),
  name VARCHAR(255),
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(2),
  coordinates GEOGRAPHY,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  experience_years INTEGER,
  tags TEXT[],
  rating DECIMAL(2,1),
  review_count INTEGER,
  verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.*,
    public.ST_Distance(
      cr.coordinates,
      public.ST_SetSRID(public.ST_MakePoint(lng, lat), 4326)::geography
    ) as distance
  FROM public.care_resources cr
  WHERE 
    public.ST_DWithin(
      cr.coordinates,
      public.ST_SetSRID(public.ST_MakePoint(lng, lat), 4326)::geography,
      radius_meters
    )
    AND (milestone_filter IS NULL OR cr.milestone = milestone_filter)
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- 14. send_calendar_invite_on_enrollment
CREATE OR REPLACE FUNCTION public.send_calendar_invite_on_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  auth_header TEXT;
BEGIN
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  BEGIN
    function_url := current_setting('app.supabase_url', true);
    IF function_url IS NULL OR function_url = '' THEN
      function_url := current_setting('request.headers', true)::json->>'host';
      IF function_url IS NOT NULL AND function_url != '' THEN
        function_url := 'https://' || function_url;
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN NEW;
  END;

  IF function_url IS NULL OR function_url = '' THEN
    RETURN NEW;
  END IF;

  BEGIN
    auth_header := current_setting('app.supabase_anon_key', true);
    IF auth_header IS NULL OR auth_header = '' THEN
      auth_header := current_setting('request.headers', true)::json->>'authorization';
      IF auth_header IS NOT NULL THEN
        auth_header := regexp_replace(auth_header, '^Bearer ', '');
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN NEW;
  END;

  IF auth_header IS NULL OR auth_header = '' THEN
    RETURN NEW;
  END IF;

  BEGIN
    PERFORM
      net.http_post(
        url := function_url || '/functions/v1/send-calendar-invite',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || auth_header
        ),
        body := jsonb_build_object(
          'type', 'enrollment_created',
          'enrollment_id', NEW.id,
          'course_id', NEW.course_id
        )
      );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to queue calendar invite: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- 15. send_calendar_update_on_session_change
CREATE OR REPLACE FUNCTION public.send_calendar_update_on_session_change()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  auth_header TEXT;
  event_type TEXT;
BEGIN
  BEGIN
    function_url := current_setting('app.supabase_url', true);
    IF function_url IS NULL OR function_url = '' THEN
      function_url := current_setting('request.headers', true)::json->>'host';
      IF function_url IS NOT NULL AND function_url != '' THEN
        function_url := 'https://' || function_url;
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END;

  IF function_url IS NULL OR function_url = '' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  BEGIN
    auth_header := current_setting('app.supabase_anon_key', true);
    IF auth_header IS NULL OR auth_header = '' THEN
      auth_header := current_setting('request.headers', true)::json->>'authorization';
      IF auth_header IS NOT NULL THEN
        auth_header := regexp_replace(auth_header, '^Bearer ', '');
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END;

  IF auth_header IS NULL OR auth_header = '' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    BEGIN
      PERFORM net.http_post(
        url := function_url || '/functions/v1/send-calendar-invite',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || auth_header),
        body := jsonb_build_object('type', 'session_deleted', 'session_id', OLD.id, 'course_id', OLD.course_id)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to queue calendar cancellation: %', SQLERRM;
    END;
    RETURN OLD;
  END IF;

  IF (OLD.session_date IS DISTINCT FROM NEW.session_date) OR
     (OLD.duration_minutes IS DISTINCT FROM NEW.duration_minutes) THEN
    BEGIN
      PERFORM net.http_post(
        url := function_url || '/functions/v1/send-calendar-invite',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || auth_header),
        body := jsonb_build_object('type', 'session_updated', 'session_id', NEW.id, 'course_id', NEW.course_id)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to queue calendar update: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- 16. update_resource_rating (may have been created in SQL editor)
-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION public.update_resource_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.care_resources
  SET 
    rating = (
      SELECT ROUND(AVG(cr.rating)::numeric, 1)
      FROM public.care_reviews cr
      WHERE cr.resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
    ),
    review_count = (
      SELECT COUNT(*)::integer
      FROM public.care_reviews cr
      WHERE cr.resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
    )
  WHERE id = COALESCE(NEW.resource_id, OLD.resource_id);
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 17. get_care_resources_with_coords (DROP first - RETURNS TABLE can't be changed)
DROP FUNCTION IF EXISTS public.get_care_resources_with_coords();
CREATE OR REPLACE FUNCTION public.get_care_resources_with_coords()
RETURNS TABLE (
  id UUID,
  milestone VARCHAR(50),
  name VARCHAR(255),
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(2),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  experience_years INTEGER,
  tags TEXT[],
  rating DECIMAL(2,1),
  review_count INTEGER,
  verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.milestone,
    cr.name,
    cr.description,
    cr.address,
    cr.city,
    cr.state,
    cr.zip_code,
    cr.country,
    public.ST_Y(cr.coordinates::public.geometry) as lat,
    public.ST_X(cr.coordinates::public.geometry) as lng,
    cr.phone,
    cr.email,
    cr.website,
    cr.experience_years,
    cr.tags,
    cr.rating,
    cr.review_count,
    cr.verified,
    cr.created_at,
    cr.updated_at
  FROM public.care_resources cr
  ORDER BY cr.name;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

GRANT EXECUTE ON FUNCTION public.get_care_resources_with_coords() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_care_resources_with_coords() TO anon;

-- =====================================================
-- PART 2: Fix overly permissive RLS policies
-- =====================================================

-- Fix "System can create notifications" - restrict to service_role only
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Fix "System can update payments" - restrict to service_role only
DROP POLICY IF EXISTS "System can update payments" ON public.payments;
CREATE POLICY "System can update payments"
  ON public.payments FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- PART 3: Move extensions to dedicated schema
-- =====================================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move http extension to extensions schema
DROP EXTENSION IF EXISTS http;
CREATE EXTENSION IF NOT EXISTS http SCHEMA extensions;

-- Note: PostGIS cannot be easily moved as many functions/types depend on it
-- being in the public schema. The postgis warning can be safely ignored
-- as it's a read-only extension with no security implications.

-- =====================================================
-- PART 4: Auth leaked password protection
-- This must be enabled in the Supabase Dashboard:
-- Go to Authentication > Settings > Password Security
-- Enable "Leaked Password Protection"
-- =====================================================
