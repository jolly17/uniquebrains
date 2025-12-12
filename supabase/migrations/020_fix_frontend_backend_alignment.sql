-- =====================================================
-- Frontend-Backend Alignment Migration
-- Fixes schema mismatches between database and frontend
-- Note: This migration is safe to run multiple times
-- =====================================================

-- =====================================================
-- UPDATE COURSES TABLE
-- Add missing columns that frontend expects
-- =====================================================

-- Add course_type column (group vs one-on-one)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'course_type') THEN
    ALTER TABLE courses ADD COLUMN course_type TEXT;
  END IF;
END $$;

-- Add session_duration column (for group courses)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'session_duration') THEN
    ALTER TABLE courses ADD COLUMN session_duration INTEGER;
  END IF;
END $$;

-- Add enrollment_limit column (replaces max_students for consistency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'enrollment_limit') THEN
    ALTER TABLE courses ADD COLUMN enrollment_limit INTEGER;
  END IF;
END $$;

-- Add is_self_paced column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_self_paced') THEN
    ALTER TABLE courses ADD COLUMN is_self_paced BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add status column for course lifecycle
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
    ALTER TABLE courses ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
  END IF;
END $$;

-- Update existing courses to have default values
UPDATE courses 
SET 
  course_type = COALESCE(course_type, 'group'),
  is_self_paced = COALESCE(is_self_paced, false),
  status = COALESCE(status, CASE WHEN is_published THEN 'published' ELSE 'draft' END)
WHERE course_type IS NULL OR status IS NULL;

-- Add constraints after data is populated
DO $$
BEGIN
  -- Add course_type constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'courses_course_type_check') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_course_type_check CHECK (course_type IN ('group', 'one-on-one'));
  END IF;
  
  -- Add session_duration constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'courses_session_duration_check') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_session_duration_check CHECK (session_duration > 0);
  END IF;
  
  -- Add enrollment_limit constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'courses_enrollment_limit_check') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_enrollment_limit_check CHECK (enrollment_limit > 0);
  END IF;
  
  -- Add status constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'courses_status_check') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_status_check CHECK (status IN ('draft', 'published', 'archived'));
  END IF;
END $$;

-- Make course_type NOT NULL after setting defaults
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'course_type' AND is_nullable = 'YES') THEN
    ALTER TABLE courses ALTER COLUMN course_type SET NOT NULL;
  END IF;
END $$;

-- =====================================================
-- UPDATE SESSIONS TABLE
-- Add duration column and ensure meeting fields exist
-- =====================================================

-- Add duration column (for consistency with frontend)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'duration') THEN
    ALTER TABLE sessions ADD COLUMN duration INTEGER;
  END IF;
END $$;

-- Copy data from duration_minutes to duration (if duration_minutes exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'duration_minutes') THEN
    UPDATE sessions 
    SET duration = duration_minutes 
    WHERE duration IS NULL AND duration_minutes IS NOT NULL;
  END IF;
END $$;

-- Ensure meeting fields exist (they should from migration 007, but let's be safe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'meeting_link') THEN
    ALTER TABLE sessions ADD COLUMN meeting_link TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'meeting_password') THEN
    ALTER TABLE sessions ADD COLUMN meeting_password TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'meeting_platform') THEN
    ALTER TABLE sessions ADD COLUMN meeting_platform TEXT;
  END IF;
END $$;

-- Add constraints after columns exist
DO $$
BEGIN
  -- Add duration constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'sessions_duration_check') THEN
    ALTER TABLE sessions ADD CONSTRAINT sessions_duration_check CHECK (duration > 0);
  END IF;
  
  -- Update meeting_platform constraint to match frontend expectations
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'meeting_platform') THEN
    -- Drop existing constraint if it exists
    ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_meeting_platform_check;
    
    -- Add updated constraint with frontend-compatible values
    ALTER TABLE sessions 
    ADD CONSTRAINT sessions_meeting_platform_check 
    CHECK (meeting_platform IN ('zoom', 'google-meet', 'microsoft-teams', 'other'));
  END IF;
END $$;

-- =====================================================
-- UPDATE PROFILES TABLE
-- Add full_name computed column for easier queries
-- =====================================================

-- Add full_name column for easier frontend usage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE profiles 
    ADD COLUMN full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;
  END IF;
END $$;

-- =====================================================
-- ADD MISSING INDEXES
-- Add indexes for new columns (only if columns exist)
-- =====================================================

-- Index for course_type filtering
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'course_type') THEN
    CREATE INDEX IF NOT EXISTS idx_courses_course_type ON courses(course_type);
  END IF;
END $$;

-- Index for course status filtering
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
  END IF;
END $$;

-- Index for self-paced courses
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_self_paced') THEN
    CREATE INDEX IF NOT EXISTS idx_courses_is_self_paced ON courses(is_self_paced);
  END IF;
END $$;

-- Index for enrollment limit queries
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'enrollment_limit') THEN
    CREATE INDEX IF NOT EXISTS idx_courses_enrollment_limit ON courses(enrollment_limit) WHERE enrollment_limit IS NOT NULL;
  END IF;
END $$;

-- Index for session duration queries
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'duration') THEN
    CREATE INDEX IF NOT EXISTS idx_sessions_duration ON sessions(duration) WHERE duration IS NOT NULL;
  END IF;
END $$;

-- Index for meeting platform filtering
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'meeting_platform') THEN
    CREATE INDEX IF NOT EXISTS idx_sessions_meeting_platform ON sessions(meeting_platform) WHERE meeting_platform IS NOT NULL;
  END IF;
END $$;

-- =====================================================
-- CREATE HELPER VIEWS
-- Views to make frontend queries easier
-- =====================================================

-- View for course statistics with enrollment counts
CREATE OR REPLACE VIEW course_stats AS
SELECT 
  c.*,
  COUNT(e.id) as enrollment_count,
  COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active_enrollments,
  COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_enrollments,
  ROUND(AVG(CASE WHEN e.status = 'active' THEN e.progress END), 0) as avg_progress
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id;

-- View for upcoming sessions with course info
CREATE OR REPLACE VIEW upcoming_sessions AS
SELECT 
  s.*,
  c.title as course_title,
  c.instructor_id,
  c.course_type,
  COUNT(e.id) as enrolled_students
FROM sessions s
JOIN courses c ON s.course_id = c.id
LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
WHERE s.session_date > NOW()
  AND s.status = 'scheduled'
GROUP BY s.id, c.id
ORDER BY s.session_date ASC;

-- =====================================================
-- ADD HELPFUL FUNCTIONS
-- Functions to support frontend operations
-- =====================================================

-- Function to get course enrollment count
CREATE OR REPLACE FUNCTION get_course_enrollment_count(course_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM enrollments
    WHERE course_id = course_uuid
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if course is full
CREATE OR REPLACE FUNCTION is_course_full(course_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  course_limit INTEGER;
  current_count INTEGER;
BEGIN
  SELECT enrollment_limit INTO course_limit
  FROM courses
  WHERE id = course_uuid;
  
  -- If no limit set, course is never full
  IF course_limit IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT get_course_enrollment_count(course_uuid) INTO current_count;
  
  RETURN current_count >= course_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN courses.course_type IS 'Type of course: group (shared sessions) or one-on-one (individual sessions)';
COMMENT ON COLUMN courses.session_duration IS 'Default session duration in minutes for group courses';
COMMENT ON COLUMN courses.enrollment_limit IS 'Maximum number of students that can enroll (NULL = unlimited)';
COMMENT ON COLUMN courses.is_self_paced IS 'Whether the course is self-paced (no fixed schedule)';
COMMENT ON COLUMN courses.status IS 'Course lifecycle status: draft, published, or archived';

COMMENT ON COLUMN sessions.meeting_link IS 'Generic meeting link (Zoom, Google Meet, Teams, etc.)';
COMMENT ON COLUMN sessions.meeting_password IS 'Meeting password if required';
COMMENT ON COLUMN sessions.meeting_platform IS 'Meeting platform type for UI customization';
COMMENT ON COLUMN sessions.duration IS 'Session duration in minutes';

COMMENT ON VIEW course_stats IS 'Course statistics including enrollment counts and progress';
COMMENT ON VIEW upcoming_sessions IS 'Upcoming sessions with course and enrollment information';