/**
 * File Upload Examples
 * 
 * Demonstrates how to use the file upload components
 * This file is for reference only - not used in production
 */

import FileUpload from './FileUpload'
import ProfilePictureUpload from './ProfilePictureUpload'
import { 
  uploadCourseThumbnail, 
  uploadCourseResource, 
  uploadHomeworkSubmission 
} from '../lib/storage'

// Example 1: Course Thumbnail Upload
function CourseThumbnailExample({ courseId }) {
  const handleUpload = async (file, onProgress) => {
    return await uploadCourseThumbnail(courseId, file)
  }

  return (
    <FileUpload
      onUpload={handleUpload}
      accept="image/*"
      maxSize={10 * 1024 * 1024} // 10MB
      label="Course Thumbnail"
      description="Upload a cover image for your course"
    />
  )
}

// Example 2: Course Resource Upload
function CourseResourceExample({ courseId }) {
  const handleUpload = async (file, onProgress) => {
    return await uploadCourseResource(courseId, file, onProgress)
  }

  return (
    <FileUpload
      onUpload={handleUpload}
      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3"
      maxSize={100 * 1024 * 1024} // 100MB
      label="Course Materials"
      description="Upload PDFs, documents, videos, or audio files"
    />
  )
}

// Example 3: Homework Submission Upload
function HomeworkSubmissionExample({ homeworkId, studentId }) {
  const handleUpload = async (file, onProgress) => {
    return await uploadHomeworkSubmission(homeworkId, studentId, file, onProgress)
  }

  return (
    <FileUpload
      onUpload={handleUpload}
      accept=".pdf,.doc,.docx,.zip,.jpg,.png"
      maxSize={100 * 1024 * 1024} // 100MB
      label="Submit Homework"
      description="Upload your completed assignment"
    />
  )
}

// Example 4: Profile Picture Upload
function ProfilePictureExample({ currentImageUrl, userId }) {
  const handleUploadComplete = (url) => {
    console.log('New profile picture URL:', url)
    // Update user profile in database
  }

  return (
    <ProfilePictureUpload
      currentImageUrl={currentImageUrl}
      onUploadComplete={handleUploadComplete}
    />
  )
}

export {
  CourseThumbnailExample,
  CourseResourceExample,
  HomeworkSubmissionExample,
  ProfilePictureExample
}
