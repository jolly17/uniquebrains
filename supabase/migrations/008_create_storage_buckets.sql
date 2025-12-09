-- =====================================================
-- Create Storage Buckets and Policies
-- Sets up file storage for profiles, courses, and homework
-- Requirements: 4.1, 4.2
-- =====================================================

-- =====================================================
-- PROFILE PICTURES BUCKET
-- Public read, authenticated users can upload their own
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,  -- Public read access
  5242880,  -- 5MB limit for profile pictures
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

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
-- COURSE MATERIALS BUCKET
-- Public read for thumbnails, authenticated for resources
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses',
  'courses',
  true,  -- Public read for course thumbnails
  104857600,  -- 100MB limit
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',  -- Images
    'application/pdf',  -- PDFs
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  -- Word
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  -- Excel
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',  -- PowerPoint
    'text/plain', 'text/csv',  -- Text files
    'video/mp4', 'video/webm',  -- Videos
    'audio/mpeg', 'audio/wav', 'audio/ogg'  -- Audio
  ]
)
ON CONFLICT (id) DO NOTHING;

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
-- HOMEWORK SUBMISSIONS BUCKET
-- Private - only student and instructor can access
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'homework',
  'homework',
  false,  -- Private bucket
  104857600,  -- 100MB limit
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',  -- Images
    'application/pdf',  -- PDFs
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  -- Word
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  -- Excel
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',  -- PowerPoint
    'text/plain', 'text/csv',  -- Text files
    'application/zip', 'application/x-zip-compressed'  -- Zip files
  ]
)
ON CONFLICT (id) DO NOTHING;

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

-- Policy: Students can update their own submissions (before deadline)
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

-- =====================================================
-- HELPER COMMENTS
-- =====================================================

COMMENT ON POLICY "Public profile pictures are viewable by everyone" ON storage.objects IS 
'Allows anyone to view profile pictures. Path format: profiles/{user_id}/avatar.jpg';

COMMENT ON POLICY "Public course thumbnails are viewable by everyone" ON storage.objects IS 
'Allows anyone to view course thumbnails. Path format: courses/{course_id}/thumbnail/image.jpg';

COMMENT ON POLICY "Enrolled students can view course resources" ON storage.objects IS 
'Allows enrolled students and instructors to view course resources. Path format: courses/{course_id}/resources/{file_name}';

COMMENT ON POLICY "Students can view their own homework submissions" ON storage.objects IS 
'Allows students to view their own submissions. Path format: homework/{homework_id}/{student_id}/{file_name}';

COMMENT ON POLICY "Instructors can view homework submissions for their courses" ON storage.objects IS 
'Allows instructors to view all submissions for their course homework. Path format: homework/{homework_id}/{student_id}/{file_name}';
