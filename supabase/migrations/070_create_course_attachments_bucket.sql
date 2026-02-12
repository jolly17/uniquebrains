-- =====================================================
-- Create Course Attachments Storage Bucket
-- For chat attachments (images, documents, etc.)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-attachments',
  'course-attachments',
  true,  -- Public read access for chat attachments
  10485760,  -- 10MB limit
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',  -- Images
    'application/pdf',  -- PDFs
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  -- Word
    'text/plain'  -- Text files
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Storage Policies for Course Attachments
-- =====================================================

-- Allow authenticated users to upload attachments to courses they have access to
CREATE POLICY "Users can upload attachments to their courses"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-attachments' AND
  (storage.foldername(name))[1] = 'course-chat' AND
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE course_id::text = (storage.foldername(name))[2]
    AND student_id = auth.uid()
    AND status = 'active'
    UNION
    SELECT 1 FROM courses
    WHERE id::text = (storage.foldername(name))[2]
    AND instructor_id = auth.uid()
  )
);

-- Allow anyone to view attachments (public bucket)
CREATE POLICY "Anyone can view course attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-attachments');

-- Allow users to delete their own attachments
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-attachments' AND
  owner = auth.uid()
);
