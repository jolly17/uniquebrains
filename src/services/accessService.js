import { supabase } from '../lib/supabase'

/**
 * Access Service - Shared access control and validation utilities
 * Consolidates duplicate functions used across multiple services
 */

/**
 * Check if user has access to a course (instructor or enrolled student)
 * Supports both direct student enrollments and parent-managed student profiles
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID (can be student_id or parent_id)
 * @param {string} studentProfileId - Optional student profile ID for parent-managed enrollments
 * @returns {Promise<boolean>} Access status
 */
export async function checkCourseAccess(courseId, userId, studentProfileId = null) {
  try {
    // Check if user is the instructor
    const isInstructor = await checkIsInstructor(courseId, userId)
    if (isInstructor) return true

    // Check if user is enrolled directly as a student (student_id = userId)
    // This covers: direct student accounts AND parents enrolling themselves
    const { data: directEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('student_id', userId)
      .single()

    if (directEnrollment) return true

    // Check if a specific student profile is enrolled (parent-managed)
    if (studentProfileId) {
      const { data: profileEnrollment } = await supabase
        .from('enrollments')
        .select(`
          id,
          students!inner(parent_id)
        `)
        .eq('course_id', courseId)
        .eq('student_profile_id', studentProfileId)
        .eq('students.parent_id', userId)
        .single()

      if (profileEnrollment) return true
    }

    // Check if user is a parent with ANY enrolled student profiles
    // This allows parents to access courses their children are enrolled in
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
 * Check if user is instructor for a course
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Instructor status
 */
export async function checkIsInstructor(courseId, userId) {
  try {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    return !courseError && course.instructor_id === userId
  } catch (error) {
    console.error('Error checking instructor status:', error)
    return false
  }
}

/**
 * Verify instructor owns a course and return course data
 * @param {string} courseId - Course ID
 * @param {string} instructorId - Instructor user ID
 * @param {string} selectFields - Fields to select (default: 'instructor_id')
 * @returns {Promise<Object>} Course data
 * @throws {Error} If course not found or user is not the instructor
 */
export async function verifyInstructorOwnership(courseId, instructorId, selectFields = 'instructor_id') {
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(selectFields)
    .eq('id', courseId)
    .single()

  if (courseError) {
    throw new Error(`Course not found: ${courseError.message}`)
  }

  if (course.instructor_id !== instructorId) {
    throw new Error('Unauthorized: You can only perform this action on your own courses')
  }

  return course
}

/**
 * Check if student is enrolled in a course
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student user ID or student profile ID
 * @param {boolean} isStudentProfile - Whether studentId is a student_profile_id
 * @returns {Promise<Object|null>} Enrollment data or null if not enrolled
 */
export async function checkEnrollment(courseId, studentId, isStudentProfile = false) {
  try {
    let query = supabase
      .from('enrollments')
      .select('id, status')
      .eq('course_id', courseId)

    if (isStudentProfile) {
      query = query.eq('student_profile_id', studentId)
    } else {
      query = query.eq('student_id', studentId)
    }

    const { data: enrollment, error } = await query.single()

    if (error) {
      return null
    }

    return enrollment
  } catch (error) {
    console.error('Error checking enrollment:', error)
    return null
  }
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Valid status
 */
export function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Valid status
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate date format and ensure it's in the future
 * @param {string} dateString - Date string to validate
 * @returns {boolean} Valid status
 */
export function isValidFutureDate(dateString) {
  try {
    const date = new Date(dateString)
    return date > new Date()
  } catch {
    return false
  }
}

/**
 * Validate required fields in an object
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - Array of required field names
 * @throws {Error} If validation fails
 */
export function validateRequiredFields(data, requiredFields) {
  const missing = requiredFields.filter(field => !data[field])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}