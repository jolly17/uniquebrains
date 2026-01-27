-- =====================================================
-- Migration 060: Simplify to Single Student Model (1 Account = 1 Student)
-- =====================================================
-- This migration removes the parent-child profile complexity
-- and reverts to a simpler model where each user account represents one student
-- 
-- Changes:
-- 1. Drop students table and all related policies/functions
-- 2. Remove student_profile_id from enrollments, sessions, homework_submissions
-- 3. Simplify all RLS policies to only use student_id
-- 4. Clean up any parent-related logic
-- =====================================================

-- Step 1: Drop all policies and functions that reference students table
-- =====================================================

-- Drop policies on students table
DROP POLICY IF EXISTS "Parents can view their own students" ON students;
DROP POLICY IF EXISTS "Parents can create students" ON students;
DROP POLICY IF EXISTS "Parents can update their own students" ON students;
DROP POLICY IF EXISTS "Parents can delete their own students" ON students;
DROP POLICY IF EXISTS "Instructors can view enrolled students" ON students;

-- Drop the security definer function
DROP FUNCTION IF EXISTS is_student_enrolled_in_instructor_course(UUID, UUID);

-- Drop policies on sessions that reference student_profile_id
DROP POLICY IF EXISTS "Parents can view their children's sessions" ON sessions;

-- Step 2: Drop policies that depend on student_profile_id columns
-- =====================================================

-- Drop enrollment policies that reference student_profile_id
DROP POLICY IF EXISTS "enrollments_select_policy" ON enrollments;
DROP POLICY IF EXISTS "enrollments_insert_policy" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_policy" ON enrollments;

-- Drop message policies that reference student_profile_id in enrollments
DROP POLICY IF EXISTS "Course participants can view group messages" ON messages;
DROP POLICY IF EXISTS "Course participants can send messages" ON messages;

-- Step 3: Remove student_profile_id columns from tables
-- =====================================================

-- Remove from sessions table
ALTER TABLE sessions 
DROP COLUMN IF EXISTS student_profile_id;

-- Remove index
DROP INDEX IF EXISTS idx_sessions_student_profile_id;

-- Remove from enrollments table
ALTER TABLE enrollments 
DROP COLUMN IF EXISTS student_profile_id;

-- Remove from homework_submissions table (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'homework_submissions') THEN
    ALTER TABLE homework_submissions DROP COLUMN IF EXISTS student_profile_id;
  END IF;
END $$;

-- Step 4: Drop students table entirely
-- =====================================================

DROP TABLE IF EXISTS students CASCADE;

-- Step 5: Simplify RLS policies to only use student_id
-- =====================================================

-- ENROLLMENTS TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "enrollments_select_policy" ON enrollments;
DROP POLICY IF EXISTS "enrollments_insert_policy" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_policy" ON enrollments;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can enroll in courses" ON enrollments;
DROP POLICY IF EXISTS "Students can update their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view enrollments for their courses" ON enrollments;
DROP POLICY IF EXISTS "Instructors can update enrollments for their courses" ON enrollments;

-- Create simplified enrollment policies
CREATE POLICY "Students can view their own enrollments"
  ON enrollments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can enroll in courses"
  ON enrollments FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own enrollments"
  ON enrollments FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Instructors can view enrollments for their courses"
  ON enrollments FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update enrollments for their courses"
  ON enrollments FOR UPDATE
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

-- SESSIONS TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "Students can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Instructors can manage sessions for their courses" ON sessions;

-- Create simplified session policies
CREATE POLICY "Students can view sessions for enrolled courses"
  ON sessions FOR SELECT
  USING (
    -- Group course sessions (no student_id)
    (student_id IS NULL AND course_id IN (
      SELECT course_id FROM enrollments WHERE student_id = auth.uid()
    ))
    OR
    -- 1-on-1 course sessions (with student_id)
    student_id = auth.uid()
  );

CREATE POLICY "Instructors can manage sessions for their courses"
  ON sessions FOR ALL
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

-- MESSAGES TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages in their courses" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their courses" ON messages;

-- Create simplified message policies
CREATE POLICY "Users can view messages in their courses"
  ON messages FOR SELECT
  USING (
    -- User is the instructor
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
    OR
    -- User is enrolled as a student
    course_id IN (
      SELECT course_id FROM enrollments WHERE student_id = auth.uid()
    )
    OR
    -- User is the sender
    sender_id = auth.uid()
    OR
    -- User is the recipient (for 1-on-1 messages)
    recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages in their courses"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      -- User is the instructor
      course_id IN (
        SELECT id FROM courses WHERE instructor_id = auth.uid()
      )
      OR
      -- User is enrolled as a student
      course_id IN (
        SELECT course_id FROM enrollments WHERE student_id = auth.uid()
      )
    )
  );

-- HOMEWORK_SUBMISSIONS TABLE POLICIES (if table exists)
-- Drop existing policies
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'homework_submissions') THEN
    DROP POLICY IF EXISTS "Students can view their own submissions" ON homework_submissions;
    DROP POLICY IF EXISTS "Students can create submissions" ON homework_submissions;
    DROP POLICY IF EXISTS "Students can update their own submissions" ON homework_submissions;
    DROP POLICY IF EXISTS "Instructors can view submissions for their courses" ON homework_submissions;

    -- Create simplified homework submission policies
    EXECUTE 'CREATE POLICY "Students can view their own submissions"
      ON homework_submissions FOR SELECT
      USING (student_id = auth.uid())';

    EXECUTE 'CREATE POLICY "Students can create submissions"
      ON homework_submissions FOR INSERT
      WITH CHECK (student_id = auth.uid())';

    EXECUTE 'CREATE POLICY "Students can update their own submissions"
      ON homework_submissions FOR UPDATE
      USING (student_id = auth.uid())';

    EXECUTE 'CREATE POLICY "Instructors can view submissions for their courses"
      ON homework_submissions FOR SELECT
      USING (
        homework_id IN (
          SELECT h.id FROM homework h
          INNER JOIN courses c ON h.course_id = c.id
          WHERE c.instructor_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- Step 6: Update comments
-- =====================================================

COMMENT ON COLUMN enrollments.student_id IS 'User ID of the enrolled student. Each user account represents one student.';
COMMENT ON COLUMN sessions.student_id IS 'For 1-on-1 courses: the enrolled student. NULL for group courses.';

-- Only add comment if homework_submissions table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'homework_submissions') THEN
    EXECUTE 'COMMENT ON COLUMN homework_submissions.student_id IS ''User ID of the student who submitted the homework.''';
  END IF;
END $$;

-- Step 7: Verify data integrity
-- =====================================================

-- Ensure all enrollments have a student_id
UPDATE enrollments SET student_id = NULL WHERE student_id IS NULL;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 060 completed: Simplified to single student model (1 account = 1 student)';
  RAISE NOTICE 'Removed: students table, student_profile_id columns, parent-child logic';
  RAISE NOTICE 'All RLS policies have been simplified';
END $$;
