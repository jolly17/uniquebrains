-- =====================================================
-- FIX SUPABASE SECURITY ADVISOR ISSUES
-- 1. Remove SECURITY DEFINER from 4 views
-- 2. Enable RLS on spatial_ref_sys table
-- =====================================================

-- =====================================================
-- ISSUE 1: Fix course_stats view (SECURITY DEFINER)
-- Must DROP first - CREATE OR REPLACE doesn't remove SECURITY DEFINER
-- =====================================================
DROP VIEW IF EXISTS public.course_stats CASCADE;

CREATE VIEW public.course_stats
WITH (security_invoker = true) AS
SELECT 
  c.*,
  COUNT(e.id) as enrollment_count,
  COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active_enrollments,
  COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_enrollments,
  ROUND(AVG(CASE WHEN e.status = 'active' THEN e.progress END), 0) as avg_progress
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id;

GRANT SELECT ON public.course_stats TO authenticated;
GRANT SELECT ON public.course_stats TO anon;

COMMENT ON VIEW public.course_stats IS 'Course statistics - uses SECURITY INVOKER to respect RLS of querying user';

-- =====================================================
-- ISSUE 2: Fix upcoming_sessions view (SECURITY DEFINER)
-- =====================================================
DROP VIEW IF EXISTS public.upcoming_sessions CASCADE;

CREATE VIEW public.upcoming_sessions
WITH (security_invoker = true) AS
SELECT 
  s.id,
  s.course_id,
  s.title,
  s.description,
  s.session_date,
  s.duration_minutes,
  s.status,
  s.created_at,
  c.title as course_title,
  c.instructor_id,
  c.meeting_link,
  c.timezone
FROM sessions s
JOIN courses c ON s.course_id = c.id
WHERE s.session_date > NOW()
  AND s.status = 'scheduled'
ORDER BY s.session_date ASC;

GRANT SELECT ON public.upcoming_sessions TO authenticated;

COMMENT ON VIEW public.upcoming_sessions IS 'Upcoming sessions - uses SECURITY INVOKER to respect RLS of querying user';

-- =====================================================
-- ISSUE 3: Fix homework_with_stats view (SECURITY DEFINER)
-- =====================================================
DROP VIEW IF EXISTS public.homework_with_stats CASCADE;

CREATE VIEW public.homework_with_stats
WITH (security_invoker = true) AS
SELECT 
  h.*,
  COUNT(DISTINCT s.id) as total_submissions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'submitted') as pending_submissions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graded') as graded_submissions
FROM homework h
LEFT JOIN submissions s ON h.id = s.homework_id
GROUP BY h.id;

GRANT SELECT ON public.homework_with_stats TO authenticated;

COMMENT ON VIEW public.homework_with_stats IS 'Homework with stats - uses SECURITY INVOKER to respect RLS of querying user';

-- =====================================================
-- ISSUE 4: Fix student_submissions_with_homework view (SECURITY DEFINER)
-- =====================================================
DROP VIEW IF EXISTS public.student_submissions_with_homework CASCADE;

CREATE VIEW public.student_submissions_with_homework
WITH (security_invoker = true) AS
SELECT 
  s.*,
  h.title as homework_title,
  h.description as homework_description,
  h.due_date,
  h.course_id,
  c.title as course_title,
  c.instructor_id
FROM submissions s
JOIN homework h ON s.homework_id = h.id
JOIN courses c ON h.course_id = c.id;

GRANT SELECT ON public.student_submissions_with_homework TO authenticated;

COMMENT ON VIEW public.student_submissions_with_homework IS 'Student submissions with homework - uses SECURITY INVOKER to respect RLS of querying user';

-- =====================================================
-- ISSUE 5: Enable RLS on spatial_ref_sys table
-- This table comes from PostGIS extension
-- =====================================================
ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Allow read access to spatial_ref_sys for all users (it's reference data)
DROP POLICY IF EXISTS "spatial_ref_sys_public_read" ON public.spatial_ref_sys;
CREATE POLICY "spatial_ref_sys_public_read"
  ON public.spatial_ref_sys FOR SELECT
  USING (true);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this migration, verify in Supabase SQL Editor:
--
-- Check views are no longer SECURITY DEFINER:
-- SELECT viewname, definition FROM pg_views WHERE schemaname = 'public' AND viewname IN ('course_stats', 'upcoming_sessions', 'homework_with_stats', 'student_submissions_with_homework');
--
-- Check RLS is enabled on spatial_ref_sys:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'spatial_ref_sys';
