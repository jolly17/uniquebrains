import { supabase } from '../lib/supabase'

/**
 * Homework Service - Backend API functions for homework and submission management
 * Handles assignments, submissions, and feedback
 */

/**
 * Create a new homework assignment
 * @param {string} courseId - Course ID
 * @param {Object} homeworkData - Assignment information
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Created homework assignment
 */
export async function createHomework(courseId, homeworkData, instructorId) {
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
      throw new Error('Unauthorized: You can only create homework for your own courses')
    }

    // Validate required fields
    if (!homeworkData.title || !homeworkData.description) {
      throw new Error('Title and description are required')
    }

    // Prepare homework data
    const dbHomeworkData = {
      course_id: courseId,
      title: homeworkData.title.trim(),
      description: homeworkData.description.trim(),
      due_date: homeworkData.due_date ? new Date(homeworkData.due_date).toISOString() : null,
      points: homeworkData.points || 100,
      submission_type: homeworkData.submission_type || 'text', // text, file, checkmark
      is_published: homeworkData.is_published || false,
      attachments: homeworkData.attachments || null
    }

    const { data: homework, error: homeworkError } = await supabase
      .from('homework')
      .insert([dbHomeworkData])
      .select()
      .single()

    if (homeworkError) {
      console.error('Error creating homework:', homeworkError)
      throw new Error(`Failed to create homework: ${homeworkError.message}`)
    }

    return homework
  } catch (error) {
    console.error('Error in createHomework:', error)
    throw error
  }
}

/**
 * Get homework assignments for a course
 * @param {string} courseId - Course ID
 * @param {string} userId - Current user ID
 * @param {boolean} publishedOnly - Whether to return only published assignments
 * @returns {Promise<Array>} List of homework assignments
 */
export async function getCourseHomework(courseId, userId, publishedOnly = true) {
  if (!courseId || !userId) {
    throw new Error('Course ID and user ID are required')
  }

  try {
    // Check if user has access to this course
    const hasAccess = await checkCourseAccess(courseId, userId)
    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have access to this course')
    }

    // Check if user is instructor (can see unpublished homework)
    const isInstructor = await checkIsInstructor(courseId, userId)

    let query = supabase
      .from('homework')
      .select(`
        *,
        submissions(
          id,
          student_id,
          status,
          submitted_at,
          grade,
          feedback
        )
      `)
      .eq('course_id', courseId)

    // Students can only see published homework
    if (!isInstructor && publishedOnly) {
      query = query.eq('is_published', true)
    }

    query = query.order('due_date', { ascending: true, nullsLast: true })

    const { data: homework, error } = await query

    if (error) {
      console.error('Error fetching homework:', error)
      throw new Error(`Failed to fetch homework: ${error.message}`)
    }

    return homework || []
  } catch (error) {
    console.error('Error in getCourseHomework:', error)
    throw error
  }
}

/**
 * Submit homework assignment
 * @param {string} homeworkId - Homework ID
 * @param {Object} submissionData - Submission content
 * @param {string} studentId - Student user ID or student profile ID
 * @param {boolean} isStudentProfile - Whether studentId is a student_profile_id
 * @returns {Promise<Object>} Created submission
 */
export async function submitHomework(homeworkId, submissionData, studentId, isStudentProfile = false) {
  if (!homeworkId || !studentId) {
    throw new Error('Homework ID and student ID are required')
  }

  try {
    // Verify homework exists and is published
    const { data: homework, error: homeworkError } = await supabase
      .from('homework')
      .select('id, course_id, title, due_date, is_published, submission_type')
      .eq('id', homeworkId)
      .single()

    if (homeworkError) {
      throw new Error(`Homework not found: ${homeworkError.message}`)
    }

    if (!homework.is_published) {
      throw new Error('This homework assignment is not yet available for submission')
    }

    // Check if student is enrolled in the course
    let enrollmentQuery = supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', homework.course_id)

    if (isStudentProfile) {
      enrollmentQuery = enrollmentQuery.eq('student_profile_id', studentId)
    } else {
      enrollmentQuery = enrollmentQuery.eq('student_id', studentId)
    }

    const { data: enrollment, error: enrollmentError } = await enrollmentQuery.single()

    if (enrollmentError) {
      throw new Error('You must be enrolled in this course to submit homework')
    }

    // Check if submission already exists
    let existingQuery = supabase
      .from('submissions')
      .select('id')
      .eq('homework_id', homeworkId)

    if (isStudentProfile) {
      existingQuery = existingQuery.eq('student_profile_id', studentId)
    } else {
      existingQuery = existingQuery.eq('student_id', studentId)
    }

    const { data: existingSubmission } = await existingQuery.single()

    if (existingSubmission) {
      throw new Error('You have already submitted this homework. Contact your instructor to resubmit.')
    }

    // Validate submission content based on type
    if (homework.submission_type === 'text' && !submissionData.content) {
      throw new Error('Text content is required for this assignment')
    }

    if (homework.submission_type === 'file' && !submissionData.file_url) {
      throw new Error('File upload is required for this assignment')
    }

    // Prepare submission data
    const dbSubmissionData = {
      homework_id: homeworkId,
      student_id: isStudentProfile ? null : studentId,
      student_profile_id: isStudentProfile ? studentId : null,
      content: submissionData.content || '',
      file_url: submissionData.file_url || null,
      status: 'submitted'
    }

    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert([dbSubmissionData])
      .select()
      .single()

    if (submissionError) {
      console.error('Error creating submission:', submissionError)
      throw new Error(`Failed to submit homework: ${submissionError.message}`)
    }

    return submission
  } catch (error) {
    console.error('Error in submitHomework:', error)
    throw error
  }
}

/**
 * Get submissions for a homework assignment (instructor view)
 * @param {string} homeworkId - Homework ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Array>} List of submissions with student info
 */
export async function getHomeworkSubmissions(homeworkId, instructorId) {
  if (!homeworkId || !instructorId) {
    throw new Error('Homework ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course for this homework
    const { data: homework, error: homeworkError } = await supabase
      .from('homework')
      .select(`
        id,
        course_id,
        courses!inner(instructor_id)
      `)
      .eq('id', homeworkId)
      .single()

    if (homeworkError) {
      throw new Error(`Homework not found: ${homeworkError.message}`)
    }

    if (homework.courses.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only view submissions for your own courses')
    }

    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        profiles!inner(id, full_name, avatar_url)
      `)
      .eq('homework_id', homeworkId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching submissions:', error)
      throw new Error(`Failed to fetch submissions: ${error.message}`)
    }

    return submissions || []
  } catch (error) {
    console.error('Error in getHomeworkSubmissions:', error)
    throw error
  }
}

/**
 * Grade a homework submission and provide feedback
 * @param {string} submissionId - Submission ID
 * @param {Object} gradeData - Grade and feedback information
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Updated submission
 */
export async function gradeSubmission(submissionId, gradeData, instructorId) {
  if (!submissionId || !instructorId) {
    throw new Error('Submission ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course for this submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        id,
        homework_id,
        homework!inner(
          course_id,
          courses!inner(instructor_id)
        )
      `)
      .eq('id', submissionId)
      .single()

    if (submissionError) {
      throw new Error(`Submission not found: ${submissionError.message}`)
    }

    if (submission.homework.courses.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only grade submissions for your own courses')
    }

    // Prepare grade data
    const updateData = {
      grade: gradeData.grade || null,
      feedback: gradeData.feedback || '',
      status: gradeData.grade !== null ? 'graded' : 'submitted',
      graded_at: gradeData.grade !== null ? new Date().toISOString() : null
    }

    const { data: updatedSubmission, error: updateError } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select(`
        *,
        profiles!inner(id, full_name, avatar_url),
        homework!inner(title, course_id)
      `)
      .single()

    if (updateError) {
      console.error('Error grading submission:', updateError)
      throw new Error(`Failed to grade submission: ${updateError.message}`)
    }

    return updatedSubmission
  } catch (error) {
    console.error('Error in gradeSubmission:', error)
    throw error
  }
}

/**
 * Update homework assignment
 * @param {string} homeworkId - Homework ID
 * @param {Object} updates - Fields to update
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Updated homework
 */
export async function updateHomework(homeworkId, updates, instructorId) {
  if (!homeworkId || !instructorId) {
    throw new Error('Homework ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course for this homework
    const { data: homework, error: homeworkError } = await supabase
      .from('homework')
      .select(`
        id,
        course_id,
        courses!inner(instructor_id)
      `)
      .eq('id', homeworkId)
      .single()

    if (homeworkError) {
      throw new Error(`Homework not found: ${homeworkError.message}`)
    }

    if (homework.courses.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only update homework for your own courses')
    }

    // Prepare update data
    const updateData = {
      ...updates
    }

    // Convert due_date to ISO string if provided
    if (updateData.due_date) {
      updateData.due_date = new Date(updateData.due_date).toISOString()
    }

    const { data: updatedHomework, error: updateError } = await supabase
      .from('homework')
      .update(updateData)
      .eq('id', homeworkId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating homework:', updateError)
      throw new Error(`Failed to update homework: ${updateError.message}`)
    }

    return updatedHomework
  } catch (error) {
    console.error('Error in updateHomework:', error)
    throw error
  }
}

/**
 * Delete homework assignment
 * @param {string} homeworkId - Homework ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteHomework(homeworkId, instructorId) {
  if (!homeworkId || !instructorId) {
    throw new Error('Homework ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course for this homework
    const { data: homework, error: homeworkError } = await supabase
      .from('homework')
      .select(`
        id,
        title,
        course_id,
        courses!inner(instructor_id)
      `)
      .eq('id', homeworkId)
      .single()

    if (homeworkError) {
      throw new Error(`Homework not found: ${homeworkError.message}`)
    }

    if (homework.courses.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only delete homework for your own courses')
    }

    // Check if there are submissions
    const { data: submissions, error: submissionError } = await supabase
      .from('submissions')
      .select('id')
      .eq('homework_id', homeworkId)
      .limit(1)

    if (submissionError) {
      console.error('Error checking submissions:', submissionError)
    }

    if (submissions && submissions.length > 0) {
      throw new Error('Cannot delete homework with existing submissions. Please contact students first.')
    }

    const { error: deleteError } = await supabase
      .from('homework')
      .delete()
      .eq('id', homeworkId)

    if (deleteError) {
      console.error('Error deleting homework:', deleteError)
      throw new Error(`Failed to delete homework: ${deleteError.message}`)
    }

    return true
  } catch (error) {
    console.error('Error in deleteHomework:', error)
    throw error
  }
}

/**
 * Get student's submissions for a course
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student user ID
 * @returns {Promise<Array>} List of student's submissions
 */
export async function getStudentSubmissions(courseId, studentId) {
  if (!courseId || !studentId) {
    throw new Error('Course ID and student ID are required')
  }

  try {
    // Verify student is enrolled in the course
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single()

    if (enrollmentError) {
      throw new Error('You must be enrolled in this course to view submissions')
    }

    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        homework!inner(
          id,
          title,
          description,
          due_date,
          points,
          course_id
        )
      `)
      .eq('student_id', studentId)
      .eq('homework.course_id', courseId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching student submissions:', error)
      throw new Error(`Failed to fetch submissions: ${error.message}`)
    }

    return submissions || []
  } catch (error) {
    console.error('Error in getStudentSubmissions:', error)
    throw error
  }
}

/**
 * Check if user has access to a course (instructor or enrolled student)
 * Supports both direct enrollments and parent-managed student profiles
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID (can be student_id or parent_id)
 * @param {string} studentProfileId - Optional student profile ID for parent-managed enrollments
 * @returns {Promise<boolean>} Access status
 */
async function checkCourseAccess(courseId, userId, studentProfileId = null) {
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
async function checkIsInstructor(courseId, userId) {
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