-- Test query to check if session reminder query works
-- Run this in Supabase SQL Editor to debug the issue

-- First, check what sessions exist for tomorrow
SELECT 
  id,
  title,
  session_date,
  duration_minutes,
  status,
  course_id
FROM sessions
WHERE status = 'scheduled'
  AND session_date >= (CURRENT_DATE + INTERVAL '1 day')::timestamp
  AND session_date < (CURRENT_DATE + INTERVAL '2 days')::timestamp;

-- Now test the full query with joins (this is what the edge function uses)
SELECT 
  s.id,
  s.title,
  s.session_date,
  s.duration_minutes,
  s.status,
  s.course_id,
  c.id as course_id,
  c.title as course_title,
  c.instructor_id,
  c.timezone,
  c.meeting_link,
  p.id as instructor_id,
  p.full_name as instructor_name,
  p.email as instructor_email
FROM sessions s
INNER JOIN courses c ON s.course_id = c.id
INNER JOIN profiles p ON c.instructor_id = p.id
WHERE s.status = 'scheduled'
  AND s.session_date >= (CURRENT_DATE + INTERVAL '1 day')::timestamp
  AND s.session_date < (CURRENT_DATE + INTERVAL '2 days')::timestamp;

-- Check enrollments for those courses
SELECT 
  e.student_id,
  e.course_id,
  p.id,
  p.full_name,
  p.email
FROM enrollments e
INNER JOIN profiles p ON e.student_id = p.id
WHERE e.status = 'active'
  AND e.course_id IN (
    SELECT course_id 
    FROM sessions 
    WHERE status = 'scheduled'
      AND session_date >= (CURRENT_DATE + INTERVAL '1 day')::timestamp
      AND session_date < (CURRENT_DATE + INTERVAL '2 days')::timestamp
  );
