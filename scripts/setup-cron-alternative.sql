-- Alternative Cron Setup Using Database Function
-- This approach doesn't require pg_net extension
-- Instead, it uses a database function that the edge function can call

-- Step 1: Create a database function to get tomorrow's sessions
CREATE OR REPLACE FUNCTION get_tomorrows_sessions()
RETURNS TABLE (
  session_id uuid,
  session_title text,
  session_date timestamptz,
  duration_minutes integer,
  meeting_link text,
  course_id uuid,
  course_title text,
  instructor_id uuid,
  instructor_name text,
  instructor_email text,
  timezone text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as session_id,
    s.title as session_title,
    s.session_date,
    s.duration_minutes,
    s.meeting_link,
    c.id as course_id,
    c.title as course_title,
    c.instructor_id,
    p.full_name as instructor_name,
    p.email as instructor_email,
    COALESCE(c.timezone, 'UTC') as timezone
  FROM sessions s
  JOIN courses c ON s.course_id = c.id
  JOIN profiles p ON c.instructor_id = p.id
  WHERE s.status = 'scheduled'
    AND s.session_date >= (CURRENT_DATE + INTERVAL '1 day')::timestamp
    AND s.session_date < (CURRENT_DATE + INTERVAL '2 days')::timestamp
  ORDER BY s.session_date;
END;
$$;

-- Step 2: Grant execute permission
GRANT EXECUTE ON FUNCTION get_tomorrows_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tomorrows_sessions() TO service_role;

-- Step 3: Test the function
SELECT * FROM get_tomorrows_sessions();

-- This function can be called from your edge function
-- The edge function can then process the results and send emails
