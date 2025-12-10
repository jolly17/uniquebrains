# 🚀 Setup Checklist for Testing

## ✅ Prerequisites

Before we can test course creation and enrollment, we need to complete these setup steps:

### 1. Environment Variables Setup

**You need to create a `.env` file with your Supabase credentials:**

```bash
# Copy the example file
cp .env.example .env
```

**Then edit `.env` and add your Supabase credentials:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**To get these values:**
1. Go to your Supabase Dashboard
2. Navigate to **Settings > API**
3. Copy the **Project URL** and **anon/public key**

### 2. Apply Database Migrations

**In Supabase Dashboard > SQL Editor, run these two migrations:**

**Migration 007 - Update Sessions Table:**
```sql
-- Update Sessions Table for Manual Meeting Links
ALTER TABLE sessions 
  RENAME COLUMN zoom_link TO meeting_link;

ALTER TABLE sessions 
  RENAME COLUMN zoom_meeting_id TO meeting_id;

ALTER TABLE sessions 
  RENAME COLUMN zoom_password TO meeting_password;

ALTER TABLE sessions 
  ADD COLUMN meeting_platform TEXT CHECK (meeting_platform IN ('zoom', 'google_meet', 'microsoft_teams', 'other', NULL));

COMMENT ON COLUMN sessions.meeting_link IS 'URL for video conference - instructor provides their own link from any platform';
COMMENT ON COLUMN sessions.meeting_platform IS 'Platform being used: zoom, google_meet, microsoft_teams, or other';
COMMENT ON COLUMN sessions.meeting_password IS 'Optional password for the meeting';
COMMENT ON COLUMN sessions.meeting_id IS 'Optional meeting ID (if applicable for the platform)';
```

**Migration 008 - Create Storage Buckets:**
```sql
-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses',
  'courses',
  true,
  104857600,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/ogg'
  ]
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'homework',
  'homework',
  false,
  104857600,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;
```

### 3. Create Storage Policies

**In Supabase Dashboard > Storage > Policies:**

**For 'profiles' bucket:**
- **Policy Name**: "Public read access"
- **Policy**: `bucket_id = 'profiles'`
- **Operation**: SELECT

- **Policy Name**: "Users can upload own profile"  
- **Policy**: `bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]`
- **Operation**: INSERT

**For 'courses' bucket:**
- **Policy Name**: "Public read access"
- **Policy**: `bucket_id = 'courses'`
- **Operation**: SELECT

- **Policy Name**: "Instructors can upload course materials"
- **Policy**: `bucket_id = 'courses' AND auth.uid() IN (SELECT instructor_id FROM courses WHERE id::text = (storage.foldername(name))[1])`
- **Operation**: INSERT

**For 'homework' bucket:**
- **Policy Name**: "Students and instructors can access homework"
- **Policy**: `bucket_id = 'homework' AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() IN (SELECT instructor_id FROM courses WHERE id IN (SELECT course_id FROM homework WHERE id::text = (storage.foldername(name))[2])))`
- **Operations**: SELECT, INSERT

---

## 🔧 Code Updates Needed

I also need to update the CreateCourse component to actually save data to the database. Let me do that now.

---

## ✅ After Setup

Once you've completed the above steps:

1. **Restart the dev server**: `npm run dev`
2. **Test authentication**: Sign up with a test account
3. **Test course creation**: Create a sample course
4. **Test enrollment**: Create a parent account and enroll

---

## 🆘 Need Help?

If you run into issues:
1. Check the browser console for errors
2. Check the Supabase Dashboard logs
3. Verify your .env file has the correct values
4. Make sure all migrations ran successfully

Let me know when you've completed the setup steps and I'll help you test everything! 🚀