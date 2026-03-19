-- =====================================================
-- FIX ADMIN DELETE POLICY FOR COURSES
-- Ensures admin users can delete courses
-- =====================================================

-- Recreate the is_admin function to ensure it exists
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

GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

-- Drop and recreate the admin policy for courses to ensure it covers ALL operations
DROP POLICY IF EXISTS "courses_admin_access" ON courses;
CREATE POLICY "courses_admin_access"
  ON courses FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Also ensure admin policies exist for dependent tables
DROP POLICY IF EXISTS "Admins have full access to enrollments" ON enrollments;
CREATE POLICY "Admins have full access to enrollments"
  ON enrollments FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins have full access to sessions" ON sessions;
CREATE POLICY "Admins have full access to sessions"
  ON sessions FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins have full access to homework" ON homework;
CREATE POLICY "Admins have full access to homework"
  ON homework FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins have full access to resources" ON resources;
CREATE POLICY "Admins have full access to resources"
  ON resources FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins have full access to messages" ON messages;
CREATE POLICY "Admins have full access to messages"
  ON messages FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins have full access to reviews" ON reviews;
CREATE POLICY "Admins have full access to reviews"
  ON reviews FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
