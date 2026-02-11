-- Check if cron job exists
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job 
WHERE jobname = 'send-session-reminders';

-- Check recent cron job executions
SELECT 
  runid,
  jobid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-session-reminders')
ORDER BY start_time DESC 
LIMIT 20;

-- Check if there are any sessions scheduled for tomorrow
SELECT 
  s.id,
  s.title,
  s.session_date,
  s.status,
  c.title as course_title,
  p.full_name as instructor_name,
  p.email as instructor_email,
  (
    SELECT COUNT(*) 
    FROM enrollments e 
    WHERE e.course_id = s.course_id 
    AND e.status = 'active'
  ) as enrolled_students_count
FROM sessions s
JOIN courses c ON s.course_id = c.id
JOIN profiles p ON c.instructor_id = p.id
WHERE s.status = 'scheduled'
  AND s.session_date >= (CURRENT_DATE + INTERVAL '1 day')::timestamp
  AND s.session_date < (CURRENT_DATE + INTERVAL '2 days')::timestamp
ORDER BY s.session_date;
