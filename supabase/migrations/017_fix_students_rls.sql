-- =====================================================
-- Fix Students RLS Policies
-- Ensure parents can properly access their students
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Parents can view their own students" ON students;
DROP POLICY IF EXISTS "Parents can insert students" ON students;
DROP POLICY IF EXISTS "Parents can update their own students" ON students;
DROP POLICY IF EXISTS "Parents can delete their own students" ON students;

-- Create new policies with better debugging
CREATE POLICY "Parents can view their own students"
  ON students FOR SELECT
  USING (
    parent_id = auth.uid() OR
    parent_id::text = auth.uid()::text
  );

CREATE POLICY "Parents can insert students"
  ON students FOR INSERT
  WITH CHECK (
    parent_id = auth.uid() OR
    parent_id::text = auth.uid()::text
  );

CREATE POLICY "Parents can update their own students"
  ON students FOR UPDATE
  USING (
    parent_id = auth.uid() OR
    parent_id::text = auth.uid()::text
  );

CREATE POLICY "Parents can delete their own students"
  ON students FOR DELETE
  USING (
    parent_id = auth.uid() OR
    parent_id::text = auth.uid()::text
  );

-- Test function to debug RLS
CREATE OR REPLACE FUNCTION debug_student_access(parent_uuid UUID)
RETURNS TABLE (
  current_user_id UUID,
  provided_parent_id UUID,
  students_count BIGINT,
  auth_uid UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as current_user_id,
    parent_uuid as provided_parent_id,
    (SELECT COUNT(*) FROM students WHERE parent_id = parent_uuid) as students_count,
    auth.uid() as auth_uid;
END;
$$;