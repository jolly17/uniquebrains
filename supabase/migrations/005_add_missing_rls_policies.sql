-- =====================================================
-- Additional RLS Policies Migration
-- Adds missing RLS policies for complete security coverage
-- Requirements: 2.3, 8.2
-- =====================================================

-- =====================================================
-- PROFILES TABLE - Add Admin Access Policy
-- =====================================================

-- Admins have full access to all profiles
CREATE POLICY "Admins have full access to profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- COURSES TABLE - Add Student Enrolled Courses Policy
-- =====================================================

-- Enrolled students can view courses they're enrolled in (even if unpublished)
CREATE POLICY "Enrolled students can view their courses"
  ON courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = courses.id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- =====================================================
-- ADDITIONAL ADMIN POLICIES FOR ALL TABLES
-- Admins should have full access to manage the platform
-- =====================================================

-- Admin access to enrollments
CREATE POLICY "Admins have full access to enrollments"
  ON enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin access to sessions
CREATE POLICY "Admins have full access to sessions"
  ON sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin access to homework
CREATE POLICY "Admins have full access to homework"
  ON homework FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin access to submissions
CREATE POLICY "Admins have full access to submissions"
  ON submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin access to resources
CREATE POLICY "Admins have full access to resources"
  ON resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin access to messages
CREATE POLICY "Admins have full access to messages"
  ON messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin access to reviews
CREATE POLICY "Admins have full access to reviews"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin access to payments
CREATE POLICY "Admins have full access to payments"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin access to notifications
CREATE POLICY "Admins have full access to notifications"
  ON notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
