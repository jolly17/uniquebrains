/**
 * Supabase Storage Helper Functions
 * 
 * Provides utilities for file uploads, downloads, and management
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { supabase } from './supabase'

/**
 * Upload profile picture
 * 
 * @param {string} userId - User ID
 * @param {File} file - Image file
 * @returns {Promise<{url: string, error: null} | {url: null, error: Error}>}
 */
export async function uploadProfilePicture(userId, file) {
  try {
    // Validate file
    const validation = validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    })
    
    if (!validation.valid) {
      return { url: null, error: new Error(validation.error) }
    }
    
    // Generate file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`
    
    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true  // Replace existing file
      })
    
    if (uploadError) {
      return { url: null, error: uploadError }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName)
    
    return { url: publicUrl, error: null }
  } catch (error) {
    return { url: null, error }
  }
}

/**
 * Upload course thumbnail
 * 
 * @param {string} courseId - Course ID
 * @param {File} file - Image file
 * @returns {Promise<{url: string, error: null} | {url: null, error: Error}>}
 */
export async function uploadCourseThumbnail(courseId, file) {
  try {
    const validation = validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    })
    
    if (!validation.valid) {
      return { url: null, error: new Error(validation.error) }
    }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${courseId}/thumbnail/cover.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('courses')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadError) {
      return { url: null, error: uploadError }
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('courses')
      .getPublicUrl(fileName)
    
    return { url: publicUrl, error: null }
  } catch (error) {
    return { url: null, error }
  }
}

/**
 * Upload course resource
 * 
 * @param {string} courseId - Course ID
 * @param {File} file - Resource file
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<{path: string, url: string, error: null} | {path: null, url: null, error: Error}>}
 */
export async function uploadCourseResource(courseId, file, onProgress) {
  try {
    const validation = validateFile(file, {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv',
        'video/mp4', 'video/webm',
        'audio/mpeg', 'audio/wav', 'audio/ogg'
      ]
    })
    
    if (!validation.valid) {
      return { path: null, url: null, error: new Error(validation.error) }
    }
    
    const sanitizedName = sanitizeFileName(file.name)
    const fileName = `${courseId}/resources/${Date.now()}_${sanitizedName}`
    
    const uploadOptions = {
      cacheControl: '3600'
    }
    
    if (onProgress) {
      uploadOptions.onUploadProgress = onProgress
    }
    
    const { error: uploadError } = await supabase.storage
      .from('courses')
      .upload(fileName, file, uploadOptions)
    
    if (uploadError) {
      return { path: null, url: null, error: uploadError }
    }
    
    // For course resources, we might want signed URLs for enrolled students
    // For now, return the path and let the component decide
    return { path: fileName, url: null, error: null }
  } catch (error) {
    return { path: null, url: null, error }
  }
}

/**
 * Upload homework submission
 * 
 * @param {string} homeworkId - Homework ID
 * @param {string} studentId - Student ID
 * @param {File} file - Submission file
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<{path: string, error: null} | {path: null, error: Error}>}
 */
export async function uploadHomeworkSubmission(homeworkId, studentId, file, onProgress) {
  try {
    const validation = validateFile(file, {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv',
        'application/zip', 'application/x-zip-compressed'
      ]
    })
    
    if (!validation.valid) {
      return { path: null, error: new Error(validation.error) }
    }
    
    const sanitizedName = sanitizeFileName(file.name)
    const fileName = `${homeworkId}/${studentId}/${Date.now()}_${sanitizedName}`
    
    const uploadOptions = {
      cacheControl: '3600'
    }
    
    if (onProgress) {
      uploadOptions.onUploadProgress = onProgress
    }
    
    const { error: uploadError } = await supabase.storage
      .from('homework')
      .upload(fileName, file, uploadOptions)
    
    if (uploadError) {
      return { path: null, error: uploadError }
    }
    
    return { path: fileName, error: null }
  } catch (error) {
    return { path: null, error }
  }
}

/**
 * Get signed URL for private file
 * 
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @param {number} expiresIn - Expiry time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<{url: string, error: null} | {url: null, error: Error}>}
 */
export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)
    
    if (error) {
      return { url: null, error }
    }
    
    return { url: data.signedUrl, error: null }
  } catch (error) {
    return { url: null, error }
  }
}

/**
 * Download file
 * 
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @returns {Promise<{data: Blob, error: null} | {data: null, error: Error}>}
 */
export async function downloadFile(bucket, path) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)
    
    if (error) {
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Delete file
 * 
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @returns {Promise<{error: null} | {error: Error}>}
 */
export async function deleteFile(bucket, path) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) {
      return { error }
    }
    
    return { error: null }
  } catch (error) {
    return { error }
  }
}

/**
 * List files in a folder
 * 
 * @param {string} bucket - Bucket name
 * @param {string} folder - Folder path
 * @returns {Promise<{files: Array, error: null} | {files: null, error: Error}>}
 */
export async function listFiles(bucket, folder) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder)
    
    if (error) {
      return { files: null, error }
    }
    
    return { files: data, error: null }
  } catch (error) {
    return { files: null, error }
  }
}

/**
 * Validate file before upload
 * 
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes
 * @param {Array<string>} options.allowedTypes - Allowed MIME types
 * @returns {{valid: boolean, error: string | null}}
 */
function validateFile(file, options) {
  const { maxSize, allowedTypes } = options
  
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` }
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' }
  }
  
  return { valid: true, error: null }
}

/**
 * Sanitize file name
 * 
 * @param {string} fileName - Original file name
 * @returns {string} Sanitized file name
 */
function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')  // Replace special chars with underscore
    .replace(/_{2,}/g, '_')  // Replace multiple underscores with single
}

/**
 * Format file size for display
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file extension from file name
 * 
 * @param {string} fileName - File name
 * @returns {string} File extension
 */
export function getFileExtension(fileName) {
  return fileName.split('.').pop().toLowerCase()
}

/**
 * Check if file is an image
 * 
 * @param {string} mimeType - File MIME type
 * @returns {boolean}
 */
export function isImage(mimeType) {
  return mimeType.startsWith('image/')
}

/**
 * Check if file is a video
 * 
 * @param {string} mimeType - File MIME type
 * @returns {boolean}
 */
export function isVideo(mimeType) {
  return mimeType.startsWith('video/')
}

/**
 * Check if file is a document
 * 
 * @param {string} mimeType - File MIME type
 * @returns {boolean}
 */
export function isDocument(mimeType) {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ]
  
  return documentTypes.includes(mimeType)
}
