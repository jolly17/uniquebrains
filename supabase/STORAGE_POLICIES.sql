-- =====================================================
-- Storage Bucket Policies
-- Run this in Supabase Dashboard → SQL Editor
-- After running migration 008
-- =====================================================

-- =====================================================
-- PROFILES BUCKET POLICIES
-- =====================================================

-- Policy: Anyone can view profile pictures
CREATE POLICY "Public profile pictures are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- Policy: Users can upload their own profile picture
CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own profile picture
CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own profile picture
CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- COURSES BUCKET POLICIES
-- =====================================================

-- Policy: Anyone can view course thumbnails (public folder)
CREATE POLICY "Public course thumbnails are viewable by everyone"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'courses' 
  AND (storage.foldername(name))[2] = 'thumbnail'
);

-- Policy: Enrolled students can view course resources
CREATE POLICY "Enrolled students can view course resources"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'courses'
  AND (storage.foldername(name))[2] = 'resources'
  AND (
    -- Check if user is enrolled in the course
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id::text = (storage.foldername(name))[1]
      AND enrollments.student_id = auth.uid()
    )
    OR
    -- Or if user is the instructor
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id::text = (storage.foldername(name))[1]
      AND courses.instructor_id = auth.uid()
    )
  )
);

-- Policy: Instructors can upload course materials
CREATE POLICY "Instructors can upload course materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'courses'
  AND EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id::text = (storage.foldername(name))[1]
    AND courses.instructor_id = auth.uid()
  )
);

-- Policy: Instructors can update their course materials
CREATE POLICY "Instructors can update their course materials"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'courses'
  AND EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id::text = (storage.foldername(name))[1]
    AND courses.instructor_id = auth.uid()
  )
);

-- Policy: Instructors can delete their course materials
CREATE POLICY "Instructors can delete their course materials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'courses'
  AND EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id::text = (storage.foldername(name))[1]
    AND courses.instructor_id = auth.uid()
  )
);

-- =====================================================
-- HOMEWORK BUCKET POLICIES
-- =====================================================

-- Policy: Students can view their own submissions
CREATE POLICY "Students can view their own homework submissions"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'homework'
  AND auth.uid()::text = (storage.foldername(name))[2]  -- student_id in path
);

-- Policy: Instructors can view submissions for their courses
CREATE POLICY "Instructors can view homework submissions for their courses"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'homework'
  AND EXISTS (
    SELECT 1 FROM homework h
    JOIN courses c ON h.course_id = c.id
    WHERE h.id::text = (storage.foldername(name))[1]
    AND c.instructor_id = auth.uid()
  )
);

-- Policy: Students can upload their own homework submissions
CREATE POLICY "Students can upload their own homework submissions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'homework'
  AND auth.uid()::text = (storage.foldername(name))[2]  -- student_id in path
  AND EXISTS (
    SELECT 1 FROM homework h
    JOIN enrollments e ON h.course_id = e.course_id
    WHERE h.id::text = (storage.foldername(name))[1]
    AND e.student_id = auth.uid()
  )
);

-- Policy: Students can update their own submissions
CREATE POLICY "Students can update their own homework submissions"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'homework'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy: Students can delete their own submissions
CREATE POLICY "Students can delete their own homework submissions"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'homework'
  AND auth.uid()::text = (storage.foldername(name))[2]
);
