-- =====================================================
-- Create Storage Buckets and Policies
-- Sets up file storage for profiles, courses, and homework
-- Requirements: 4.1, 4.2
-- =====================================================

-- Note: Storage policies must be created in the Supabase Dashboard
-- This migration only creates the buckets
-- See STORAGE_SETUP.md for policy creation instructions

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

-- =====================================================
-- POLICIES MUST BE CREATED IN SUPABASE DASHBOARD
-- =====================================================
-- Storage policies cannot be created via SQL migrations due to permissions
-- Please create the policies manually in the Supabase Dashboard
-- See STORAGE_SETUP.md for detailed policy creation instructions
