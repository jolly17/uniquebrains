-- Find enrollments with NULL student_id
SELECT 
  id,
  course_id,
  student_id,
  status,
  enrolled_at,
  created_at
FROM enrollments
WHERE student_id IS NULL;

-- If these are test/invalid enrollments, delete them:
-- DELETE FROM enrollments WHERE student_id IS NULL;

-- Or if you want to keep them for investigation:
-- Just run the SELECT above to see what they are
