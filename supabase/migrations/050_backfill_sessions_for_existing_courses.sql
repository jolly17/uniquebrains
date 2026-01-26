-- Migration 050: Backfill sessions for existing courses
-- Created: January 2026
-- Purpose: Generate sessions for existing group courses that have schedule information

-- Function to generate sessions for a course
CREATE OR REPLACE FUNCTION generate_sessions_for_course(
  p_course_id UUID,
  p_selected_days TEXT[],
  p_session_time TEXT,
  p_start_date DATE,
  p_end_date DATE,
  p_has_end_date BOOLEAN,
  p_session_duration INTEGER,
  p_meeting_link TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_current_date DATE;
  v_end_date DATE;
  v_session_datetime TIMESTAMP;
  v_session_number INTEGER := 1;
  v_sessions_created INTEGER := 0;
  v_max_sessions INTEGER;
  v_day_name TEXT;
  v_hour INTEGER;
  v_minute INTEGER;
BEGIN
  -- Determine end date and max sessions
  IF p_has_end_date AND p_end_date IS NOT NULL THEN
    v_end_date := p_end_date;
    v_max_sessions := 1000; -- Large number for courses with end date
  ELSE
    v_end_date := p_start_date + INTERVAL '365 days'; -- 1 year max for open-ended
    v_max_sessions := 5; -- Only 5 sessions for open-ended courses
  END IF;
  
  -- Parse time
  v_hour := SPLIT_PART(p_session_time, ':', 1)::INTEGER;
  v_minute := SPLIT_PART(p_session_time, ':', 2)::INTEGER;
  
  -- Start from start date
  v_current_date := p_start_date;
  
  -- Loop through dates
  WHILE v_current_date <= v_end_date AND v_sessions_created < v_max_sessions LOOP
    -- Get day name
    v_day_name := TO_CHAR(v_current_date, 'Day');
    v_day_name := TRIM(v_day_name);
    
    -- Check if this day is in selected days
    IF v_day_name = ANY(p_selected_days) THEN
      -- Create session datetime
      v_session_datetime := v_current_date + (v_hour || ' hours')::INTERVAL + (v_minute || ' minutes')::INTERVAL;
      
      -- Insert session
      INSERT INTO sessions (
        course_id,
        title,
        description,
        session_date,
        duration_minutes,
        zoom_link,
        status
      ) VALUES (
        p_course_id,
        'Topic ' || v_session_number,
        '',
        v_session_datetime,
        COALESCE(p_session_duration, 60),
        COALESCE(p_meeting_link, ''),
        'scheduled'
      );
      
      v_session_number := v_session_number + 1;
      v_sessions_created := v_sessions_created + 1;
    END IF;
    
    -- Move to next day
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN v_sessions_created;
END;
$$ LANGUAGE plpgsql;

-- Backfill sessions for existing group courses
DO $$
DECLARE
  v_course RECORD;
  v_sessions_created INTEGER;
  v_total_sessions INTEGER := 0;
  v_courses_processed INTEGER := 0;
BEGIN
  -- Loop through all group courses with schedule information
  FOR v_course IN 
    SELECT 
      id,
      selected_days,
      session_time,
      start_date,
      end_date,
      has_end_date,
      session_duration,
      meeting_link
    FROM courses
    WHERE course_type = 'group'
      AND selected_days IS NOT NULL
      AND array_length(selected_days, 1) > 0
      AND session_time IS NOT NULL
      AND start_date IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM sessions WHERE course_id = courses.id
      )
  LOOP
    -- Generate sessions for this course
    v_sessions_created := generate_sessions_for_course(
      v_course.id,
      v_course.selected_days,
      v_course.session_time,
      v_course.start_date,
      v_course.end_date,
      v_course.has_end_date,
      v_course.session_duration,
      v_course.meeting_link
    );
    
    v_total_sessions := v_total_sessions + v_sessions_created;
    v_courses_processed := v_courses_processed + 1;
    
    RAISE NOTICE 'Generated % sessions for course %', v_sessions_created, v_course.id;
  END LOOP;
  
  RAISE NOTICE 'Backfill complete: % sessions created for % courses', v_total_sessions, v_courses_processed;
END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS generate_sessions_for_course;

-- Verify results
SELECT 
  c.id,
  c.title,
  COUNT(s.id) as session_count
FROM courses c
LEFT JOIN sessions s ON s.course_id = c.id
WHERE c.course_type = 'group'
  AND c.selected_days IS NOT NULL
  AND array_length(c.selected_days, 1) > 0
GROUP BY c.id, c.title
ORDER BY c.created_at DESC;
