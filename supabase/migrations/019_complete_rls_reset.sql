-- =====================================================
-- Complete RLS Reset for Students Table
-- Disable RLS, drop all policies, recreate cleanly
-- =====================================================

-- Disable RLS temporarily
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies (including any we might have missed)
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'students' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON students', policy_record.policyname);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create only the essential parent policy first
CREATE POLICY "parents_can_manage_students"
  ON students FOR ALL
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Test if this works before adding instructor policy
-- (We'll add instructor policy later if needed)