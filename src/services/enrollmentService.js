import { supabase } from '../lib/supabase'

/**
 * Enrollment Service - Backend API functions for course enrollment management
 * Handles student enrollments, progress tracking, and course access
 */

/**
 * Send enrollment email notification via Edge Function
 * @param {Object} emailData - Email notification data
 */
async function sendEnrollmentEmail(emailData) {
  try {
    console.log('=== Sending Enrollment Email ===')
    console.log('Email data:', emailData)
    
    const { data, error } = await supabase.functions.invoke('send-enrollment-email', {
      body: emailData
    })

    if (error) {
      console.error('=== Email Error ===')
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      console.error('Error details:', JSON.stringify(error, null, 2))
      // Don't throw - we don't want email failures to block enrollment
    } else {
      console.log('=== Email Success ===')
      console.log('Response data:', data)
    }
  } catch (error) {
    console.error('=== Email Exception ===')
    console.error('Exception:', error)
    console.error('Exception message:', error.message)
    console.error('Exception stack:', error.stack)
    // Don't throw - email is not critical for enrollment
  }
}

/**
 * Enroll a student in a course
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student user ID
 * @returns {Promise<Object>} Created enrollment
 */
export async function enrollStudent(courseId, studentId) {
  if (!courseId) {
    throw new Error('Course ID is required')
  }

  if (!studentId) {
    throw new Error('Student ID is required')
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
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single()

    if (existingEnrollment) {
      if (existingEnrollment.status === 'active') {
        throw new Error('You are already enrolled in this course')
      } else if (existingEnrollment.status === 'completed') {
        throw new Error('You have already completed this course')
      } else if (existingEnrollment.status === 'dropped') {
        // Re-activate the dropped enrollment instead of creating a new one
        const { data: reactivatedEnrollment, error: reactivateError } = await supabase
          .from('enrollments')
          .update({
            status: 'active',
            progress: 0,
            enrolled_at: new Date().toISOString()
          })
          .eq('id', existingEnrollment.id)
          .select(`
            *,
            courses!inner(id, title, instructor_id, course_type),
            profiles!student_id(id, full_name, avatar_url)
          `)
          .single()

        if (reactivateError) {
          console.error('Error reactivating enrollment:', reactivateError)
          throw new Error(`Failed to re-enroll in course: ${reactivateError.message}`)
        }

        // Send enrollment emails for re-enrollment
        try {
          const { data: studentProfile } = await supabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', studentId)
            .single()

          const { data: instructorProfile } = await supabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', course.instructor_id)
            .single()

          if (studentProfile) {
            await sendEnrollmentEmail({
              type: 'student_enrolled',
              studentEmail: studentProfile.email,
              studentName: `${studentProfile.first_name} ${studentProfile.last_name}`,
              courseTitle: course.title,
              courseId: course.id
            })
          }

          if (instructorProfile) {
            await sendEnrollmentEmail({
              type: 'instructor_notification',
              instructorEmail: instructorProfile.email,
              instructorName: `${instructorProfile.first_name} ${instructorProfile.last_name}`,
              studentName: `${studentProfile.first_name} ${studentProfile.last_name}`,
              courseTitle: course.title,
              courseId: course.id
            })
          }
        } catch (emailError) {
          console.error('Error sending re-enrollment emails:', emailError)
        }

        return reactivatedEnrollment
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
      student_id: studentId,
      status: 'active',
      progress: 0,
      enrolled_at: new Date().toISOString()
    }

    console.log('Creating enrollment with data:', enrollmentData)

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
      throw new Error(`Failed to enroll in course: ${enrollmentError.message}`)
    }

    // Send enrollment emails (student confirmation + instructor notification)
    try {
      // Get student and instructor details for emails
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', studentId)
        .single()

      const { data: instructorProfile } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', course.instructor_id)
        .single()

      console.log('Instructor profile:', instructorProfile)

      if (studentProfile) {
        // Send student enrollment confirmation
        await sendEnrollmentEmail({
          type: 'student_enrolled',
          studentEmail: studentProfile.email,
          studentName: `${studentProfile.first_name} ${studentProfile.last_name}`,
          courseTitle: course.title,
          courseId: course.id
        })
      } else {
        console.log('Student profile not found, skipping student email')
      }

      if (instructorProfile) {
        // Send instructor notification
        console.log('Sending instructor notification email to:', instructorProfile.email)
        await sendEnrollmentEmail({
          type: 'instructor_notification',
          instructorEmail: instructorProfile.email,
          instructorName: `${instructorProfile.first_name} ${instructorProfile.last_name}`,
          studentName: `${studentProfile.first_name} ${studentProfile.last_name}`,
          courseTitle: course.title,
          courseId: course.id
        })
      } else {
        console.log('Instructor profile not found, skipping instructor email')
      }
    } catch (emailError) {
      console.error('Error sending enrollment emails:', emailError)
      // Don't fail enrollment if emails fail
    }

    return enrollment
  } catch (error) {
    console.error('Error in enrollStudent:', error)
    throw error
  }
}

/**
 * Get enrollments for a student
 * @param {string} studentId - Student user ID
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<Array>} List of student enrollments
 */
export async function getStudentEnrollments(studentId, status = null) {
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
      .eq('student_id', studentId)
      .neq('status', 'dropped') // Exclude dropped enrollments
      .order('enrolled_at', { ascending: false })

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
          first_name,
          last_name,
          avatar_url,
          bio,
          neurodiversity_profile
        )
      `)
      .eq('course_id', courseId)
      .neq('status', 'dropped') // Exclude dropped enrollments
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

    if (enrollment.status === 'dropped') {
      throw new Error('You have already withdrawn from this course')
    }

    // Update enrollment status to dropped
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({
        status: 'dropped'
      })
      .eq('id', enrollment.id)

    if (updateError) {
      console.error('Error withdrawing from course:', updateError)
      throw new Error(`Failed to withdraw from course: ${updateError.message}`)
    }

    // Send unenrollment email
    try {
      console.log('=== Fetching student and course data for unenrollment email ===')
      
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', studentId)
        .single()

      console.log('Student profile:', studentProfile)

      const { data: course } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single()

      console.log('Course data:', course)

      if (studentProfile && course) {
        console.log('=== Sending unenrollment email ===')
        await sendEnrollmentEmail({
          type: 'student_unenrolled',
          studentEmail: studentProfile.email,
          studentName: `${studentProfile.first_name} ${studentProfile.last_name}`,
          courseTitle: course.title,
          courseId: courseId
        })
        console.log('=== Unenrollment email sent successfully ===')
      } else {
        console.log('=== Missing student profile or course data, skipping email ===')
      }
    } catch (emailError) {
      console.error('Error sending unenrollment email:', emailError)
      // Don't fail unenrollment if email fails
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
 * @param {string} studentId - Student user ID
 * @returns {Promise<Object|null>} Enrollment object or null if not enrolled
 */
export async function checkEnrollment(courseId, studentId) {
  if (!courseId || !studentId) {
    throw new Error('Course ID and student ID are required')
  }

  try {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .neq('status', 'dropped') // Exclude dropped enrollments
      .single()

    return enrollment || null
  } catch (error) {
    console.error('Error in checkEnrollment:', error)
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