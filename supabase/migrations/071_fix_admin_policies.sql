-- =====================================================
-- FIX ADMIN POLICIES FOR ADMIN DASHBOARD
-- Fixes admin access policies to work correctly with admin role
-- =====================================================

-- STEP 1: Create a helper function to check if user is admin
-- This avoids recursion issues by using SECURITY DEFINER
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_uuid 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

-- STEP 2: Update admin policies for all tables
-- =====================================================

-- COURSES TABLE
DROP POLICY IF EXISTS "courses_admin_access" ON courses;
CREATE POLICY "courses_admin_access"
  ON courses FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- PROFILES TABLE  
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
CREATE POLICY "Admins have full access to profiles"
  ON profiles FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ENROLLMENTS TABLE
DROP POLICY IF EXISTS "Admins have full access to enrollments" ON enrollments;
CREATE POLICY "Admins have full access to enrollments"
  ON enrollments FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- SESSIONS TABLE
DROP POLICY IF EXISTS "Admins have full access to sessions" ON sessions;
CREATE POLICY "Admins have full access to sessions"
  ON sessions FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- HOMEWORK TABLE
DROP POLICY IF EXISTS "Admins have full access to homework" ON homework;
CREATE POLICY "Admins have full access to homework"
  ON homework FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- SUBMISSIONS TABLE
DROP POLICY IF EXISTS "Admins have full access to submissions" ON submissions;
CREATE POLICY "Admins have full access to submissions"
  ON submissions FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- RESOURCES TABLE
DROP POLICY IF EXISTS "Admins have full access to resources" ON resources;
CREATE POLICY "Admins have full access to resources"
  ON resources FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- MESSAGES TABLE
DROP POLICY IF EXISTS "Admins have full access to messages" ON messages;
CREATE POLICY "Admins have full access to messages"
  ON messages FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- REVIEWS TABLE
DROP POLICY IF EXISTS "Admins have full access to reviews" ON reviews;
CREATE POLICY "Admins have full access to reviews"
  ON reviews FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- PAYMENTS TABLE
DROP POLICY IF EXISTS "Admins have full access to payments" ON payments;
CREATE POLICY "Admins have full access to payments"
  ON payments FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- NOTIFICATIONS TABLE
DROP POLICY IF EXISTS "Admins have full access to notifications" ON notifications;
CREATE POLICY "Admins have full access to notifications"
  ON notifications FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- STEP 3: Add admin policies for community tables
-- =====================================================

-- TOPICS TABLE
DROP POLICY IF EXISTS "Admins have full access to topics" ON topics;
CREATE POLICY "Admins have full access to topics"
  ON topics FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- QUESTIONS TABLE
DROP POLICY IF EXISTS "Admins have full access to questions" ON questions;
CREATE POLICY "Admins have full access to questions"
  ON questions FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ANSWERS TABLE
DROP POLICY IF EXISTS "Admins have full access to answers" ON answers;
CREATE POLICY "Admins have full access to answers"
  ON answers FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- STEP 4: Verification
-- =====================================================
-- You can verify the function works by running:
-- SELECT is_admin(auth.uid());
-- This should return true if you're logged in as an admin

COMMENT ON FUNCTION is_admin(UUID) IS 'Helper function to check if a user has admin role. Uses SECURITY DEFINER to avoid RLS recursion.';
