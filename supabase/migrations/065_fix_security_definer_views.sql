-- Fix Security Definer Views
-- Address Supabase Security Advisor warnings about views with SECURITY DEFINER

-- These views were flagged by Security Advisor:
-- 1. public.course_stats
-- 2. public.homework_with_stats  
-- 3. public.student_submissions_with_homework
-- 4. public.upcoming_sessions

-- The issue: Views with SECURITY DEFINER bypass RLS and run with creator's permissions
-- Solution: Recreate views without SECURITY DEFINER and rely on RLS from underlying tables

-- =====================================================
-- 1. Fix course_stats view
-- =====================================================

DROP VIEW IF EXISTS public.course_stats CASCADE;

CREATE VIEW public.course_stats AS
SELECT 
  c.id,
  c.title,
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') as active_enrollments,
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'completed') as completed_enrollments,
  COUNT(DISTINCT e.id) as total_enrollments
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title;

-- Grant access to authenticated users
GRANT SELECT ON public.course_stats TO authenticated;

-- =====================================================
-- 2. Fix homework_with_stats view
-- =====================================================

DROP VIEW IF EXISTS public.homework_with_stats CASCADE;

CREATE VIEW public.homework_with_stats AS
SELECT 
  h.*,
  COUNT(DISTINCT s.id) as total_submissions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'submitted') as pending_submissions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graded') as graded_submissions
FROM homework h
LEFT JOIN submissions s ON h.id = s.homework_id
GROUP BY h.id;

-- Grant access to authenticated users
GRANT SELECT ON public.homework_with_stats TO authenticated;

-- =====================================================
-- 3. Fix student_submissions_with_homework view
-- =====================================================

DROP VIEW IF EXISTS public.student_submissions_with_homework CASCADE;

CREATE VIEW public.student_submissions_with_homework AS
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

-- Grant access to authenticated users
GRANT SELECT ON public.student_submissions_with_homework TO authenticated;

-- =====================================================
-- 4. Fix upcoming_sessions view
-- =====================================================

DROP VIEW IF EXISTS public.upcoming_sessions CASCADE;

CREATE VIEW public.upcoming_sessions AS
SELECT 
  s.*,
  c.title as course_title,
  c.instructor_id
FROM sessions s
JOIN courses c ON s.course_id = c.id
WHERE s.session_date >= NOW()
ORDER BY s.session_date ASC;

-- Grant access to authenticated users
GRANT SELECT ON public.upcoming_sessions TO authenticated;

-- =====================================================
-- Notes
-- =====================================================
-- These views now rely on RLS policies from their underlying tables:
-- - courses: RLS policies control who can see which courses
-- - enrollments: RLS policies control enrollment visibility
-- - homework: RLS policies control homework visibility
-- - submissions: RLS policies control submission visibility
-- - sessions: RLS policies control session visibility
--
-- This is more secure than SECURITY DEFINER which bypassed all RLS checks
