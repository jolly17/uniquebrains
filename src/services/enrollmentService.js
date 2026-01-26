import { supabase } from '../lib/supabase'

/**
 * Enrollment Service - Backend API functions for course enrollment management
 * Handles student enrollments, progress tracking, and course access
 */

/**
 * Enroll a student in a course
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student user ID (for direct enrollments) - can be null if studentProfileId is provided
 * @param {string} studentProfileId - Student profile ID (for parent-managed enrollments) - can be null if studentId is provided
 * @returns {Promise<Object>} Created enrollment
 */
export async function enrollStudent(courseId, studentId = null, studentProfileId = null) {
  if (!courseId) {
    throw new Error('Course ID is required')
  }

  if (!studentId && !studentProfileId) {
    throw new Error('Either student ID or student profile ID is required')
  }

  try {
    // Verify course exists and is published
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, is_published, enrollment_limit, instructor_id')
      .eq('id', courseId)
      .single()

    if (courseError) {
      throw new Error(`Course not found: ${courseError.message}`)
    }

    if (!course.is_published) {
      throw new Error('This course is not currently available for enrollment')
    }

    // Check if student is trying to enroll in their own course
    if (studentId && course.instructor_id === studentId) {
      throw new Error('Instructors cannot enroll in their own courses')
    }

    // Check if student is already enrolled
    let existingEnrollmentQuery = supabase
      .from('enrollments')
      .select('id, status')
      .eq('course_id', courseId)

    if (studentId) {
      existingEnrollmentQuery = existingEnrollmentQuery.eq('student_id', studentId)
    } else {
      existingEnrollmentQuery = existingEnrollmentQuery.eq('student_profile_id', studentProfileId)
    }

    const { data: existingEnrollment, error: existingError } = await existingEnrollmentQuery.single()

    if (existingEnrollment) {
      if (existingEnrollment.status === 'active') {
        throw new Error('You are already enrolled in this course')
      } else if (existingEnrollment.status === 'completed') {
        throw new Error('You have already completed this course')
      }
    }

    // Check enrollment limit if set
    if (course.enrollment_limit) {
      const { data: enrollments, error: countError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('status', 'active')

      if (countError) {
        console.error('Error checking enrollment count:', countError)
      } else if (enrollments && enrollments.length >= course.enrollment_limit) {
        throw new Error('This course is full. Please check back later for availability.')
      }
    }

    // Create enrollment
    const enrollmentData = {
      course_id: courseId,
      student_id: studentId,  // Will be null for parent-managed enrollments
      student_profile_id: studentProfileId,  // Will be null for direct enrollments
      status: 'active',
      progress: 0,
      enrolled_at: new Date().toISOString()
    }

    console.log('Creating enrollment with data:', enrollmentData)
    console.log('Current user from Supabase:', (await supabase.auth.getUser()).data.user?.id)

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert([enrollmentData])
      .select(`
        *,
        courses!inner(id, title, instructor_id, course_type),
        profiles!student_id(id, full_name, avatar_url)
      `)
      .single()

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError)
      console.error('Enrollment data attempted:', enrollmentData)
      throw new Error(`Failed to enroll in course: ${enrollmentError.message}`)
    }

    return enrollment
  } catch (error) {
    console.error('Error in enrollStudent:', error)
    throw error
  }
}

/**
 * Get enrollments for a student
 * @param {string} studentId - Student user ID (for direct enrollments) OR student profile ID (for parent-managed)
 * @param {boolean} isStudentProfile - True if studentId is actually a student_profile_id
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<Array>} List of student enrollments
 */
export async function getStudentEnrollments(studentId, isStudentProfile = false, status = null) {
  if (!studentId) {
    throw new Error('Student ID is required')
  }

  try {
    let query = supabase
      .from('enrollments')
      .select(`
        *,
        courses!inner(
          id,
          title,
          description,
          category,
          course_type,
          instructor_id,
          is_published,
          profiles!instructor_id(id, full_name, avatar_url)
        )
      `)
      .order('enrolled_at', { ascending: false })

    // Query by student_id OR student_profile_id depending on the type
    if (isStudentProfile) {
      query = query.eq('student_profile_id', studentId)
    } else {
      query = query.eq('student_id', studentId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: enrollments, error } = await query

    if (error) {
      console.error('Error fetching student enrollments:', error)
      throw new Error(`Failed to fetch enrollments: ${error.message}`)
    }

    return enrollments || []
  } catch (error) {
    console.error('Error in getStudentEnrollments:', error)
    throw error
  }
}

/**
 * Get enrollments for a course (instructor view)
 * @param {string} courseId - Course ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Array>} List of course enrollments with student info
 */
export async function getCourseEnrollments(courseId, instructorId) {
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
      throw new Error('Unauthorized: You can only view enrollments for your own courses')
    }

    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        profiles!student_id(
          id,
          full_name,
          avatar_url,
          bio,
          neurodiversity_profile
        )
      `)
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false })

    if (error) {
      console.error('Error fetching course enrollments:', error)
      throw new Error(`Failed to fetch enrollments: ${error.message}`)
    }

    return enrollments || []
  } catch (error) {
    console.error('Error in getCourseEnrollments:', error)
    throw error
  }
}

/**
 * Update enrollment status or progress
 * @param {string} enrollmentId - Enrollment ID
 * @param {Object} updates - Fields to update
 * @param {string} instructorId - Instructor user ID (for authorization)
 * @returns {Promise<Object>} Updated enrollment
 */
export async function updateEnrollment(enrollmentId, updates, instructorId) {
  if (!enrollmentId || !instructorId) {
    throw new Error('Enrollment ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course for this enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        id,
        student_id,
        course_id,
        courses!inner(instructor_id)
      `)
      .eq('id', enrollmentId)
      .single()

    if (enrollmentError) {
      throw new Error(`Enrollment not found: ${enrollmentError.message}`)
    }

    if (enrollment.courses.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only update enrollments for your own courses')
    }

    // Prepare update data
    const updateData = {
      ...updates
    }

    // Set completion date if status is being changed to completed
    if (updates.status === 'completed' && !updates.completed_at) {
      updateData.completed_at = new Date().toISOString()
    }

    const { data: updatedEnrollment, error: updateError } = await supabase
      .from('enrollments')
      .update(updateData)
      .eq('id', enrollmentId)
      .select(`
        *,
        profiles!student_id(id, full_name, avatar_url),
        courses!inner(id, title)
      `)
      .single()

    if (updateError) {
      console.error('Error updating enrollment:', updateError)
      throw new Error(`Failed to update enrollment: ${updateError.message}`)
    }

    return updatedEnrollment
  } catch (error) {
    console.error('Error in updateEnrollment:', error)
    throw error
  }
}

/**
 * Withdraw/unenroll a student from a course
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student user ID
 * @returns {Promise<boolean>} Success status
 */
export async function withdrawStudent(courseId, studentId) {
  if (!courseId || !studentId) {
    throw new Error('Course ID and student ID are required')
  }

  try {
    // Find the enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single()

    if (enrollmentError) {
      throw new Error(`Enrollment not found: ${enrollmentError.message}`)
    }

    if (enrollment.status === 'withdrawn') {
      throw new Error('You have already withdrawn from this course')
    }

    // Update enrollment status to withdrawn
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({
        status: 'withdrawn',
        withdrawn_at: new Date().toISOString()
      })
      .eq('id', enrollment.id)

    if (updateError) {
      console.error('Error withdrawing from course:', updateError)
      throw new Error(`Failed to withdraw from course: ${updateError.message}`)
    }

    return true
  } catch (error) {
    console.error('Error in withdrawStudent:', error)
    throw error
  }
}

/**
 * Get enrollment statistics for instructor dashboard
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Enrollment statistics
 */
export async function getEnrollmentStats(instructorId) {
  if (!instructorId) {
    throw new Error('Instructor ID is required')
  }

  try {
    // Get enrollments for instructor's courses
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        progress,
        enrolled_at,
        completed_at,
        course_id,
        courses!inner(instructor_id, title)
      `)
      .eq('courses.instructor_id', instructorId)

    if (error) {
      console.error('Error fetching enrollment stats:', error)
      throw new Error(`Failed to fetch enrollment stats: ${error.message}`)
    }

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats = {
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter(e => e.status === 'active').length,
      completedEnrollments: enrollments.filter(e => e.status === 'completed').length,
      withdrawnEnrollments: enrollments.filter(e => e.status === 'withdrawn').length,
      enrollmentsThisMonth: enrollments.filter(e => new Date(e.enrolled_at) >= thisMonth).length,
      averageProgress: 0,
      enrollmentsByCourse: {}
    }

    // Calculate average progress for active enrollments
    const activeEnrollments = enrollments.filter(e => e.status === 'active')
    if (activeEnrollments.length > 0) {
      const totalProgress = activeEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0)
      stats.averageProgress = Math.round(totalProgress / activeEnrollments.length)
    }

    // Group by course
    enrollments.forEach(enrollment => {
      const courseTitle = enrollment.courses.title
      if (!stats.enrollmentsByCourse[courseTitle]) {
        stats.enrollmentsByCourse[courseTitle] = {
          total: 0,
          active: 0,
          completed: 0,
          withdrawn: 0
        }
      }
      stats.enrollmentsByCourse[courseTitle].total++
      stats.enrollmentsByCourse[courseTitle][enrollment.status]++
    })

    return stats
  } catch (error) {
    console.error('Error in getEnrollmentStats:', error)
    throw error
  }
}

/**
 * Check if a student is enrolled in a course
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student user ID or student profile ID
 * @returns {Promise<Object|null>} Enrollment object or null if not enrolled
 */
export async function checkEnrollment(courseId, studentId) {
  if (!courseId || !studentId) {
    throw new Error('Course ID and student ID are required')
  }

  try {
    // First check for direct enrollment (student_id)
    const { data: directEnrollment, error: directError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single()

    if (directEnrollment) {
      return directEnrollment
    }

    // If not found, check for student profile enrollment (student_profile_id)
    const { data: profileEnrollment, error: profileError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_profile_id', studentId)
      .single()

    if (profileEnrollment) {
      return profileEnrollment
    }

    // No enrollment found
    return null
  } catch (error) {
    console.error('Error in checkEnrollment:', error)
    // Return null instead of throwing to allow graceful handling
    return null
  }
}

/**
 * Get course completion rate
 * @param {string} courseId - Course ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Completion statistics
 */
export async function getCourseCompletionRate(courseId, instructorId) {
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
      throw new Error('Unauthorized: You can only view completion rates for your own courses')
    }

    // Get enrollment statistics
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('status, progress')
      .eq('course_id', courseId)

    if (error) {
      console.error('Error fetching completion rate:', error)
      throw new Error(`Failed to fetch completion rate: ${error.message}`)
    }

    const total = enrollments.length
    const completed = enrollments.filter(e => e.status === 'completed').length
    const active = enrollments.filter(e => e.status === 'active').length
    
    // Calculate average progress for active students
    const activeEnrollments = enrollments.filter(e => e.status === 'active')
    const averageProgress = activeEnrollments.length > 0
      ? Math.round(activeEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / activeEnrollments.length)
      : 0

    return {
      totalEnrollments: total,
      completedEnrollments: completed,
      activeEnrollments: active,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      averageProgress
    }
  } catch (error) {
    console.error('Error in getCourseCompletionRate:', error)
    throw error
  }
}