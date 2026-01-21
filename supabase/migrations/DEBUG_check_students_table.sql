-- Debug query to check if students table exists and has data
-- Run this in Supabase SQL Editor

-- Check if students table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'students'
) as students_table_exists;

-- Check if student_profile_id column exists in enrollments
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_name = 'enrollments' 
  AND column_name = 'student_profile_id'
) as student_profile_id_column_exists;

-- Check students table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- Check if there are any student records
SELECT COUNT(*) as student_count FROM students;

-- Check sample student records (if any)
SELECT id, parent_id, first_name, last_name, age
FROM students
LIMIT 5;
