# Supabase Storage Setup Guide

## Overview

This guide explains how to set up and use Supabase Storage for file uploads in UniqueBrains.

## Storage Buckets

We have 3 storage buckets configured:

### 1. **profiles** (Public)
- **Purpose**: User profile pictures
- **Access**: Public read, authenticated write (own profile only)
- **Size Limit**: 5MB per file
- **Allowed Types**: JPEG, PNG, WebP, GIF
- **Path Format**: `profiles/{user_id}/avatar.jpg`

### 2. **courses** (Public)
- **Purpose**: Course thumbnails and resources
- **Access**: 
  - Thumbnails: Public read
  - Resources: Enrolled students and instructor only
- **Size Limit**: 100MB per file
- **Allowed Types**: Images, PDFs, Office docs, Videos, Audio
- **Path Format**: 
  - Thumbnails: `courses/{course_id}/thumbnail/image.jpg`
  - Resources: `courses/{course_id}/resources/file.pdf`

### 3. **homework** (Private)
- **Purpose**: Student homework submissions
- **Access**: Student (own submissions) and instructor only
- **Size Limit**: 100MB per file
- **Allowed Types**: Images, PDFs, Office docs, Text, ZIP files
- **Path Format**: `homework/{homework_id}/{student_id}/submission.pdf`

## Setup Instructions

### Step 1: Apply Migration

Run the storage migration in your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually in Supabase Dashboard
# SQL Editor → New Query → Paste migration 008 → Run
```

### Step 2: Verify Buckets

1. Go to Supabase Dashboard
2. Navigate to **Storage** section
3. You should see 3 buckets: `profiles`, `courses`, `homework`

### Step 3: Test Upload (Optional)

Test file upload using Supabase Dashboard:

1. Go to **Storage** → Select a bucket
2. Click **Upload file**
3. Try uploading a test file
4. Verify policies work correctly

## Usage in Code

### Upload Profile Picture

```javascript
import { supabase } from './lib/supabase'

async function uploadProfilePicture(userId, file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('profiles')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true  // Replace existing file
    })
  
  if (error) {
    console.error('Upload error:', error)
    return { error }
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profiles')
    .getPublicUrl(fileName)
  
  return { url: publicUrl }
}
```

### Upload Course Thumbnail

```javascript
async function uploadCourseThumbnail(courseId, file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${courseId}/thumbnail/cover.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('courses')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })
  
  if (error) return { error }
  
  const { data: { publicUrl } } = supabase.storage
    .from('courses')
    .getPublicUrl(fileName)
  
  return { url: publicUrl }
}
```

### Upload Course Resource

```javascript
async function uploadCourseResource(courseId, file) {
  const fileName = `${courseId}/resources/${Date.now()}_${file.name}`
  
  const { data, error } = await supabase.storage
    .from('courses')
    .upload(fileName, file, {
      cacheControl: '3600'
    })
  
  if (error) return { error }
  
  // Get signed URL (private access)
  const { data: { signedUrl }, error: urlError } = await supabase.storage
    .from('courses')
    .createSignedUrl(fileName, 3600)  // 1 hour expiry
  
  return { url: signedUrl }
}
```

### Upload Homework Submission

```javascript
async function uploadHomeworkSubmission(homeworkId, studentId, file) {
  const fileName = `${homeworkId}/${studentId}/${Date.now()}_${file.name}`
  
  const { data, error } = await supabase.storage
    .from('homework')
    .upload(fileName, file, {
      cacheControl: '3600'
    })
  
  if (error) return { error }
  
  // Store file path in submissions table
  const { error: dbError } = await supabase
    .from('submissions')
    .insert({
      homework_id: homeworkId,
      student_id: studentId,
      file_path: fileName,
      file_name: file.name,
      file_size: file.size
    })
  
  return { success: !dbError }
}
```

### Download File

```javascript
async function downloadFile(bucket, filePath) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(filePath)
  
  if (error) return { error }
  
  // Create download link
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = filePath.split('/').pop()
  a.click()
  
  return { success: true }
}
```

### Delete File

```javascript
async function deleteFile(bucket, filePath) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])
  
  return { error }
}
```

## File Path Conventions

### Profiles
```
profiles/
  {user_id}/
    avatar.jpg
```

### Courses
```
courses/
  {course_id}/
    thumbnail/
      cover.jpg
    resources/
      1234567890_lecture-notes.pdf
      1234567891_slides.pptx
```

### Homework
```
homework/
  {homework_id}/
    {student_id}/
      1234567890_assignment.pdf
      1234567891_code.zip
```

## Security Policies

### Profile Pictures
- ✅ Anyone can view
- ✅ Users can upload/update/delete their own
- ❌ Users cannot modify others' pictures

### Course Thumbnails
- ✅ Anyone can view
- ✅ Instructors can upload/update/delete for their courses
- ❌ Students cannot upload thumbnails

### Course Resources
- ✅ Enrolled students can view
- ✅ Instructors can view/upload/update/delete
- ❌ Non-enrolled users cannot access

### Homework Submissions
- ✅ Students can view/upload/update/delete their own
- ✅ Instructors can view all submissions for their courses
- ❌ Students cannot view others' submissions

## File Size Limits

| Bucket | Limit | Reason |
|--------|-------|--------|
| profiles | 5MB | Profile pictures should be small |
| courses | 100MB | Support large videos and documents |
| homework | 100MB | Support project files and videos |

## Allowed File Types

### Images
- JPEG, PNG, WebP, GIF

### Documents
- PDF
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- PowerPoint (.ppt, .pptx)
- Text (.txt, .csv)

### Media
- Video (.mp4, .webm)
- Audio (.mp3, .wav, .ogg)

### Archives
- ZIP files (homework only)

## Error Handling

```javascript
async function uploadWithErrorHandling(bucket, path, file) {
  try {
    // Check file size
    if (file.size > 100 * 1024 * 1024) {  // 100MB
      return { error: 'File too large. Maximum size is 100MB.' }
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return { error: 'File type not allowed.' }
    }
    
    // Upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) {
      if (error.message.includes('already exists')) {
        return { error: 'File already exists. Use upsert option to replace.' }
      }
      return { error: error.message }
    }
    
    return { data }
  } catch (err) {
    return { error: 'Upload failed. Please try again.' }
  }
}
```

## Best Practices

### 1. File Naming
- Use timestamps to avoid conflicts: `${Date.now()}_${filename}`
- Sanitize filenames: Remove special characters
- Use lowercase extensions

### 2. Progress Tracking
```javascript
const { data, error } = await supabase.storage
  .from('courses')
  .upload(fileName, file, {
    cacheControl: '3600',
    onUploadProgress: (progress) => {
      const percent = (progress.loaded / progress.total) * 100
      console.log(`Upload progress: ${percent}%`)
    }
  })
```

### 3. Image Optimization
- Resize images before upload
- Use WebP format for better compression
- Generate thumbnails on client side

### 4. Cleanup
- Delete old files when updating
- Remove files when deleting related database records
- Implement file retention policies

## Troubleshooting

### Issue: "Policy violation" error
**Solution**: Check if user is authenticated and has permission for the operation

### Issue: "File too large" error
**Solution**: Check file size limits in bucket configuration

### Issue: "Invalid file type" error
**Solution**: Verify file MIME type is in allowed list

### Issue: Cannot view uploaded file
**Solution**: 
- For public buckets: Use `getPublicUrl()`
- For private buckets: Use `createSignedUrl()`

## Monitoring

### Check Storage Usage
1. Go to Supabase Dashboard
2. Navigate to **Settings** → **Usage**
3. View storage metrics

### Free Tier Limits
- **Storage**: 1GB
- **Bandwidth**: 2GB/month
- **File uploads**: Unlimited

### Upgrade When Needed
- Supabase Pro: 100GB storage, 200GB bandwidth ($25/month)

## Next Steps

1. ✅ Apply migration 008
2. ✅ Verify buckets in dashboard
3. ✅ Implement file upload UI components
4. ✅ Test upload/download functionality
5. ✅ Add progress indicators
6. ✅ Implement error handling

---

**Task 5.1 Complete!** ✅

Storage buckets are configured and ready to use. Proceed to Task 5.2 to implement file upload functions in the frontend.
