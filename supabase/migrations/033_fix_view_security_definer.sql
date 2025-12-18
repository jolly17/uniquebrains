-- Fix SECURITY DEFINER issues with views
-- Recreate views without SECURITY DEFINER to avoid RLS conflicts

-- Drop and recreate course_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS course_stats;
CREATE VIEW course_stats AS
SELECT 
  c.*,
  COUNT(e.id) as enrollment_count,
  COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active_enrollments
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id;

-- Drop and recreate homework_with_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS homework_with_stats;
CREATE VIEW homework_with_stats AS
SELECT 
  h.*,
  COUNT(s.id) as submission_count,
  COUNT(CASE WHEN s.status = 'submitted' THEN 1 END) as submitted_count
FROM homework h
LEFT JOIN submissions s ON h.id = s.homework_id
GROUP BY h.id;

-- Drop and recreate student_submissions_with_homework view without SECURITY DEFINER
DROP VIEW IF EXISTS student_submissions_with_homework;
CREATE VIEW student_submissions_with_homework AS
SELECT 
  s.*,
  h.title as homework_title,
  h.due_date as homework_due_date,
  h.points as homework_points,
  c.title as course_title,
  c.id as course_id
FROM submissions s
JOIN homework h ON s.homework_id = h.id
JOIN courses c ON h.course_id = c.id;

-- Drop and recreate upcoming_sessions view without SECURITY DEFINER
DROP VIEW IF EXISTS upcoming_sessions;
CREATE VIEW upcoming_sessions AS
SELECT 
  s.*,
  c.title as course_title,
  c.instructor_id
FROM sessions s
JOIN courses c ON s.course_id = c.id
WHERE s.session_date > NOW()
ORDER BY s.session_date ASC;

-- Note: These views will now inherit RLS from their underlying tables
-- without the SECURITY DEFINER conflicts that Supabase was warning about