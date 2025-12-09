# File Upload Components Guide

## Overview

This guide explains how to use the file upload components in UniqueBrains.

## Components

### 1. FileUpload (Generic)

A reusable drag-and-drop file upload component with progress tracking.

**Features:**
- Drag and drop support
- File validation (size, type)
- Upload progress bar
- Error handling
- Success feedback

**Usage:**

```jsx
import FileUpload from './components/FileUpload'
import { uploadCourseResource } from './lib/storage'

function MyComponent() {
  const handleUpload = async (file, onProgress) => {
    return await uploadCourseResource(courseId, file, onProgress)
  }

  return (
    <FileUpload
      onUpload={handleUpload}
      accept=".pdf,.doc,.docx"
      maxSize={100 * 1024 * 1024}  // 100MB
      label="Upload Document"
      description="Drag and drop or click to browse"
    />
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUpload` | Function | Required | Upload handler function |
| `accept` | String | - | Accepted file types (e.g., "image/*", ".pdf") |
| `maxSize` | Number | 100MB | Maximum file size in bytes |
| `multiple` | Boolean | false | Allow multiple file selection |
| `label` | String | "Upload File" | Label text |
| `description` | String | "Drag and drop..." | Description text |

### 2. ProfilePictureUpload

Specialized component for uploading user profile pictures.

**Features:**
- Circular preview
- Image validation
- Automatic upload
- Loading state

**Usage:**

```jsx
import ProfilePictureUpload from './components/ProfilePictureUpload'

function UserProfile() {
  const handleUploadComplete = (url) => {
    // Update user profile in database
    console.log('New avatar URL:', url)
  }

  return (
    <ProfilePictureUpload
      currentImageUrl={user.avatar_url}
      onUploadComplete={handleUploadComplete}
    />
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentImageUrl` | String | - | Current profile picture URL |
| `onUploadComplete` | Function | - | Callback when upload completes |

## Use Cases

### Course Thumbnail Upload

```jsx
import FileUpload from './components/FileUpload'
import { uploadCourseThumbnail } from './lib/storage'

function CreateCourse() {
  const [courseId] = useState('course-uuid')
  const [thumbnailUrl, setThumbnailUrl] = useState(null)

  const handleThumbnailUpload = async (file) => {
    const { url, error } = await uploadCourseThumbnail(courseId, file)
    
    if (!error) {
      setThumbnailUrl(url)
      // Save URL to database
    }
    
    return { url, error }
  }

  return (
    <FileUpload
      onUpload={handleThumbnailUpload}
      accept="image/*"
      maxSize={10 * 1024 * 1024}  // 10MB
      label="Course Cover Image"
      description="Upload a thumbnail for your course"
    />
  )
}
```

### Course Resource Upload

```jsx
import FileUpload from './components/FileUpload'
import { uploadCourseResource } from './lib/storage'

function ManageCourseResources() {
  const [courseId] = useState('course-uuid')
  const [resources, setResources] = useState([])

  const handleResourceUpload = async (file, onProgress) => {
    const { path, error } = await uploadCourseResource(
      courseId, 
      file, 
      onProgress
    )
    
    if (!error) {
      // Save resource to database
      const newResource = {
        course_id: courseId,
        file_path: path,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
      }
      
      setResources([...resources, newResource])
    }
    
    return { path, error }
  }

  return (
    <FileUpload
      onUpload={handleResourceUpload}
      accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3"
      maxSize={100 * 1024 * 1024}  // 100MB
      label="Course Materials"
      description="Upload lecture notes, slides, videos, etc."
    />
  )
}
```

### Homework Submission Upload

```jsx
import FileUpload from './components/FileUpload'
import { uploadHomeworkSubmission } from './lib/storage'
import { supabase } from './lib/supabase'

function SubmitHomework() {
  const [homeworkId] = useState('homework-uuid')
  const [studentId] = useState('student-uuid')

  const handleSubmissionUpload = async (file, onProgress) => {
    // Upload file
    const { path, error } = await uploadHomeworkSubmission(
      homeworkId,
      studentId,
      file,
      onProgress
    )
    
    if (!error) {
      // Create submission record in database
      await supabase.from('submissions').insert({
        homework_id: homeworkId,
        student_id: studentId,
        file_path: path,
        file_name: file.name,
        file_size: file.size,
        submitted_at: new Date().toISOString()
      })
    }
    
    return { path, error }
  }

  return (
    <FileUpload
      onUpload={handleSubmissionUpload}
      accept=".pdf,.doc,.docx,.zip,.jpg,.png"
      maxSize={100 * 1024 * 1024}  // 100MB
      label="Submit Your Work"
      description="Upload your completed assignment"
    />
  )
}
```

## File Type Restrictions

### Images
```jsx
accept="image/*"
// or specific types
accept="image/jpeg,image/png,image/webp,image/gif"
```

### Documents
```jsx
accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
```

### Media
```jsx
accept="video/*,audio/*"
// or specific types
accept=".mp4,.webm,.mp3,.wav"
```

### Archives
```jsx
accept=".zip,.rar,.7z"
```

### Multiple Types
```jsx
accept=".pdf,.doc,.docx,.jpg,.png,.mp4"
```

## File Size Limits

```jsx
// 5MB for profile pictures
maxSize={5 * 1024 * 1024}

// 10MB for thumbnails
maxSize={10 * 1024 * 1024}

// 100MB for resources and submissions
maxSize={100 * 1024 * 1024}
```

## Error Handling

```jsx
const handleUpload = async (file) => {
  try {
    const { url, error } = await uploadProfilePicture(userId, file)
    
    if (error) {
      // Handle upload error
      console.error('Upload failed:', error.message)
      return { error }
    }
    
    // Success
    console.log('Upload successful:', url)
    return { url, error: null }
    
  } catch (err) {
    // Handle unexpected error
    console.error('Unexpected error:', err)
    return { error: err }
  }
}
```

## Progress Tracking

```jsx
const handleUpload = async (file, onProgress) => {
  return await uploadCourseResource(courseId, file, (progressEvent) => {
    // Update progress UI
    const percent = Math.round(
      (progressEvent.loaded / progressEvent.total) * 100
    )
    console.log(`Upload progress: ${percent}%`)
    
    // Call the component's progress callback
    if (onProgress) {
      onProgress(progressEvent)
    }
  })
}
```

## Styling

All components use CSS custom properties for theming:

```css
:root {
  --primary-color: #667eea;
  --primary-dark: #5568d3;
  --primary-light: #f0f4ff;
  --text-primary: #1a202c;
  --text-secondary: #718096;
  --border-color: #e2e8f0;
  --background-light: #f7fafc;
  --background-secondary: #edf2f7;
  --background-hover: #e6f2ff;
  --error-color: #ef4444;
  --error-light: #fee2e2;
  --success-color: #10b981;
}
```

## Best Practices

### 1. Validate Before Upload
```jsx
const handleUpload = async (file) => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { error: new Error('Only images are allowed') }
  }
  
  // Check file size
  if (file.size > 5 * 1024 * 1024) {
    return { error: new Error('File too large') }
  }
  
  // Proceed with upload
  return await uploadProfilePicture(userId, file)
}
```

### 2. Show Preview for Images
```jsx
const [preview, setPreview] = useState(null)

const handleFileSelect = (file) => {
  const reader = new FileReader()
  reader.onloadend = () => {
    setPreview(reader.result)
  }
  reader.readAsDataURL(file)
}
```

### 3. Clean Up After Upload
```jsx
const handleUpload = async (file) => {
  const result = await uploadFile(file)
  
  if (!result.error) {
    // Reset form
    setSelectedFile(null)
    setPreview(null)
    
    // Show success message
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }
  
  return result
}
```

### 4. Handle Large Files
```jsx
// For files > 50MB, show warning
if (file.size > 50 * 1024 * 1024) {
  const confirmed = window.confirm(
    'This file is large and may take a while to upload. Continue?'
  )
  if (!confirmed) return
}
```

## Troubleshooting

### Upload Fails with "Policy Violation"
- Check if user is authenticated
- Verify user has permission for the bucket
- Check file path format matches RLS policies

### Progress Not Updating
- Ensure `onProgress` callback is passed to upload function
- Check that Supabase client supports progress events

### File Not Appearing After Upload
- Verify file path is saved to database
- Check RLS policies allow reading the file
- For private files, use signed URLs

## Next Steps

1. ✅ Import components where needed
2. ✅ Customize styling to match your design
3. ✅ Add error handling and user feedback
4. ✅ Test with different file types and sizes
5. ✅ Implement file deletion functionality

---

**Task 5.2 Complete!** ✅

File upload components are ready to use throughout the application.
