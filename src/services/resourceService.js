import { supabase } from '../lib/supabase'

/**
 * Resource Service - Backend API functions for course resource management
 * Handles file uploads, links, and resource access tracking
 */

/**
 * Create a new course resource
 * @param {string} courseId - Course ID
 * @param {Object} resourceData - Resource information
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Created resource
 */
export async function createResource(courseId, resourceData, instructorId) {
  if (!courseId || !instructorId) {
    throw new Error('Course ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('instructor_id, title')
      .eq('id', courseId)
      .single()

    if (courseError) {
      throw new Error(`Course not found: ${courseError.message}`)
    }

    if (course.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only add resources to your own courses')
    }

    // Validate required fields
    if (!resourceData.title) {
      throw new Error('Resource title is required')
    }

    if (!resourceData.resource_type || !['file', 'link'].includes(resourceData.resource_type)) {
      throw new Error('Resource type must be either "file" or "link"')
    }

    if (resourceData.resource_type === 'file' && !resourceData.file_url) {
      throw new Error('File URL is required for file resources')
    }

    if (resourceData.resource_type === 'link' && !resourceData.link_url) {
      throw new Error('Link URL is required for link resources')
    }

    // Validate URLs
    if (resourceData.link_url && !isValidUrl(resourceData.link_url)) {
      throw new Error('Invalid link URL')
    }

    // Prepare resource data
    const dbResourceData = {
      course_id: courseId,
      title: resourceData.title.trim(),
      description: resourceData.description?.trim() || '',
      resource_type: resourceData.resource_type,
      file_url: resourceData.file_url || null,
      link_url: resourceData.link_url || null,
      file_size: resourceData.file_size || null,
      file_type: resourceData.file_type || null,
      is_public: resourceData.is_public || false
    }

    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .insert([dbResourceData])
      .select()
      .single()

    if (resourceError) {
      console.error('Error creating resource:', resourceError)
      throw new Error(`Failed to create resource: ${resourceError.message}`)
    }

    return resource
  } catch (error) {
    console.error('Error in createResource:', error)
    throw error
  }
}

/**
 * Get resources for a course
 * @param {string} courseId - Course ID
 * @param {string} userId - Current user ID
 * @returns {Promise<Array>} List of course resources
 */
export async function getCourseResources(courseId, userId) {
  if (!courseId || !userId) {
    throw new Error('Course ID and user ID are required')
  }

  try {
    // Check if user has access to this course
    const hasAccess = await checkCourseAccess(courseId, userId)
    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have access to this course')
    }

    const { data: resources, error } = await supabase
      .from('resources')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching resources:', error)
      throw new Error(`Failed to fetch resources: ${error.message}`)
    }

    return resources || []
  } catch (error) {
    console.error('Error in getCourseResources:', error)
    throw error
  }
}

/**
 * Update resource information
 * @param {string} resourceId - Resource ID
 * @param {Object} updates - Fields to update
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Updated resource
 */
export async function updateResource(resourceId, updates, instructorId) {
  if (!resourceId || !instructorId) {
    throw new Error('Resource ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course for this resource
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select(`
        id,
        course_id,
        courses!inner(instructor_id)
      `)
      .eq('id', resourceId)
      .single()

    if (resourceError) {
      throw new Error(`Resource not found: ${resourceError.message}`)
    }

    if (resource.courses.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only update resources for your own courses')
    }

    // Validate URL if being updated
    if (updates.link_url && !isValidUrl(updates.link_url)) {
      throw new Error('Invalid link URL')
    }

    // Prepare update data
    const updateData = {
      ...updates
    }

    const { data: updatedResource, error: updateError } = await supabase
      .from('resources')
      .update(updateData)
      .eq('id', resourceId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating resource:', updateError)
      throw new Error(`Failed to update resource: ${updateError.message}`)
    }

    return updatedResource
  } catch (error) {
    console.error('Error in updateResource:', error)
    throw error
  }
}

/**
 * Delete a resource
 * @param {string} resourceId - Resource ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteResource(resourceId, instructorId) {
  if (!resourceId || !instructorId) {
    throw new Error('Resource ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course for this resource
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select(`
        id,
        title,
        file_url,
        course_id,
        courses!inner(instructor_id)
      `)
      .eq('id', resourceId)
      .single()

    if (resourceError) {
      throw new Error(`Resource not found: ${resourceError.message}`)
    }

    if (resource.courses.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only delete resources for your own courses')
    }

    // Delete the resource record
    const { error: deleteError } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId)

    if (deleteError) {
      console.error('Error deleting resource:', deleteError)
      throw new Error(`Failed to delete resource: ${deleteError.message}`)
    }

    // Note: File deletion from storage should be handled separately
    // if needed, but for now we'll just remove the database record

    return true
  } catch (error) {
    console.error('Error in deleteResource:', error)
    throw error
  }
}

/**
 * Track resource access by a student
 * @param {string} resourceId - Resource ID
 * @param {string} studentId - Student user ID or student profile ID
 * @param {boolean} isStudentProfile - Whether studentId is a student_profile_id
 * @returns {Promise<boolean>} Success status
 */
export async function trackResourceAccess(resourceId, studentId, isStudentProfile = false) {
  if (!resourceId || !studentId) {
    throw new Error('Resource ID and student ID are required')
  }

  try {
    // Verify resource exists and student has access
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('course_id')
      .eq('id', resourceId)
      .single()

    if (resourceError) {
      throw new Error(`Resource not found: ${resourceError.message}`)
    }

    // Check if student is enrolled in the course
    let enrollmentQuery = supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', resource.course_id)

    if (isStudentProfile) {
      enrollmentQuery = enrollmentQuery.eq('student_profile_id', studentId)
    } else {
      enrollmentQuery = enrollmentQuery.eq('student_id', studentId)
    }

    const { data: enrollment, error: enrollmentError } = await enrollmentQuery.single()

    if (enrollmentError) {
      throw new Error('You must be enrolled in this course to access resources')
    }

    // For now, we'll just log the access (could be expanded to track in a separate table)
    console.log(`Student ${studentId} (profile: ${isStudentProfile}) accessed resource ${resourceId}`)

    return true
  } catch (error) {
    console.error('Error in trackResourceAccess:', error)
    throw error
  }
}

/**
 * Upload file to Supabase storage
 * @param {File} file - File to upload
 * @param {string} courseId - Course ID for organizing files
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Upload result with file URL
 */
export async function uploadResourceFile(file, courseId, instructorId) {
  if (!file || !courseId || !instructorId) {
    throw new Error('File, course ID, and instructor ID are required')
  }

  try {
    // Verify instructor owns the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (courseError) {
      throw new Error(`Course not found: ${courseError.message}`)
    }

    if (course.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only upload files to your own courses')
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 100MB')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${courseId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-resources')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('course-resources')
      .getPublicUrl(fileName)

    return {
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_path: fileName
    }
  } catch (error) {
    console.error('Error in uploadResourceFile:', error)
    throw error
  }
}

/**
 * Get resource statistics for instructor dashboard
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Resource statistics
 */
export async function getResourceStats(instructorId) {
  if (!instructorId) {
    throw new Error('Instructor ID is required')
  }

  try {
    // Get resource counts by course
    const { data: resources, error } = await supabase
      .from('resources')
      .select(`
        id,
        resource_type,
        course_id,
        courses!inner(instructor_id, title)
      `)
      .eq('courses.instructor_id', instructorId)

    if (error) {
      console.error('Error fetching resource stats:', error)
      throw new Error(`Failed to fetch resource stats: ${error.message}`)
    }

    const stats = {
      totalResources: resources.length,
      fileResources: resources.filter(r => r.resource_type === 'file').length,
      linkResources: resources.filter(r => r.resource_type === 'link').length,
      resourcesByCourse: {}
    }

    // Group by course
    resources.forEach(resource => {
      const courseTitle = resource.courses.title
      if (!stats.resourcesByCourse[courseTitle]) {
        stats.resourcesByCourse[courseTitle] = 0
      }
      stats.resourcesByCourse[courseTitle]++
    })

    return stats
  } catch (error) {
    console.error('Error in getResourceStats:', error)
    throw error
  }
}

/**
 * Check if user has access to a course (instructor or enrolled student)
 * Supports both direct student enrollments and parent-managed student profiles
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Access status
 */
async function checkCourseAccess(courseId, userId) {
  try {
    // Check if user is the instructor
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (courseError) {
      return false
    }

    if (course.instructor_id === userId) {
      return true
    }

    // Check if user is enrolled directly (student_id)
    const { data: directEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('student_id', userId)
      .single()

    if (directEnrollment) {
      return true
    }

    // Check if user is a parent with enrolled student profiles
    const { data: parentEnrollments } = await supabase
      .from('enrollments')
      .select(`
        id,
        student_profile_id,
        students!inner(parent_id)
      `)
      .eq('course_id', courseId)
      .eq('students.parent_id', userId)
      .limit(1)

    return !!parentEnrollments && parentEnrollments.length > 0
  } catch (error) {
    console.error('Error checking course access:', error)
    return false
  }
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Valid status
 */
function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}