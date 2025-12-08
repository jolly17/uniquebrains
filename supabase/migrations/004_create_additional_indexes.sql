-- =====================================================
-- Additional Indexes Migration
-- Creates composite indexes for common queries
-- Requirements: 2.2, 9.1
-- =====================================================

-- =====================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

-- Courses: Find published courses by category (marketplace filtering)
CREATE INDEX idx_courses_published_category ON courses(is_published, category) WHERE is_published = true;

-- Courses: Find instructor's published courses
CREATE INDEX idx_courses_instructor_published ON courses(instructor_id, is_published);

-- Enrollments: Find active enrollments for a student
CREATE INDEX idx_enrollments_student_status ON enrollments(student_id, status) WHERE status = 'active';

-- Enrollments: Find active enrollments for a course
CREATE INDEX idx_enrollments_course_status ON enrollments(course_id, status) WHERE status = 'active';

-- Sessions: Find upcoming sessions for a course
CREATE INDEX idx_sessions_course_date_status ON sessions(course_id, session_date, status) WHERE status IN ('scheduled', 'in_progress');

-- Homework: Find published homework for a course ordered by due date
CREATE INDEX idx_homework_course_published_due ON homework(course_id, is_published, due_date) WHERE is_published = true;

-- Submissions: Find submissions by homework and status
CREATE INDEX idx_submissions_homework_status ON submissions(homework_id, status);

-- Submissions: Find student's submissions by status
CREATE INDEX idx_submissions_student_status ON submissions(student_id, status);

-- Messages: Find recent messages for a course
CREATE INDEX idx_messages_course_created ON messages(course_id, created_at DESC);

-- Reviews: Calculate average rating for a course
CREATE INDEX idx_reviews_course_published_rating ON reviews(course_id, rating) WHERE is_published = true;

-- Payments: Find successful payments for a student
CREATE INDEX idx_payments_student_status ON payments(student_id, status) WHERE status = 'succeeded';

-- Payments: Find successful payments for a course
CREATE INDEX idx_payments_course_status ON payments(course_id, status) WHERE status = 'succeeded';

-- Notifications: Find unread notifications for a user
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;

-- =====================================================
-- FULL-TEXT SEARCH INDEXES
-- For course search functionality
-- =====================================================

-- Add text search vector column to courses
ALTER TABLE courses ADD COLUMN search_vector tsvector;

-- Create index on search vector
CREATE INDEX idx_courses_search_vector ON courses USING gin(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION courses_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER courses_search_vector_trigger
  BEFORE INSERT OR UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION courses_search_vector_update();

-- =====================================================
-- PERFORMANCE STATISTICS
-- Enable statistics collection for query optimization
-- =====================================================

-- Analyze tables to update statistics
ANALYZE profiles;
ANALYZE courses;
ANALYZE enrollments;
ANALYZE sessions;
ANALYZE homework;
ANALYZE submissions;
ANALYZE resources;
ANALYZE messages;
ANALYZE reviews;
ANALYZE payments;
ANALYZE notifications;
