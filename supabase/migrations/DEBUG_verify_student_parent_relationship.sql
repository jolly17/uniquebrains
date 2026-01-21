-- Debug query to verify student-parent relationship
-- Replace the UUIDs below with actual values from your console logs

-- First, check what auth.uid() returns (run this while logged in as parent)
SELECT auth.uid() as current_user_id;

-- Check if the student belongs to the current user
-- Replace 'YOUR_STUDENT_ID' with the actual student ID from console logs
SELECT 
  s.id as student_id,
  s.parent_id,
  s.first_name,
  s.last_name,
  auth.uid() as current_user_id,
  CASE 
    WHEN s.parent_id = auth.uid() THEN 'MATCH - Should work'
    ELSE 'NO MATCH - Will fail RLS'
  END as relationship_check
FROM students s
WHERE s.id = 'YOUR_STUDENT_ID';  -- Replace with actual student ID

-- Check all students for current user
SELECT 
  id as student_id,
  parent_id,
  first_name,
  last_name
FROM students
WHERE parent_id = auth.uid();

-- Test the exact RLS policy condition
SELECT 
  id,
  first_name,
  CASE 
    WHEN id IN (SELECT id FROM students WHERE parent_id = auth.uid()) THEN 'PASS'
    ELSE 'FAIL'
  END as rls_check
FROM students
WHERE id = 'YOUR_STUDENT_ID';  -- Replace with actual student ID
