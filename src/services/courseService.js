import { supabase } from '../lib/supabase'

/**
 * Course Service - Backend API functions for course management
 * Handles all course-related database operations with proper error handling
 */

/**
 * Create a new course with sessions (if applicable)
 * @param {Object} courseData - Course information
 * @param {Object} user - Current authenticated user
 * @returns {Promise<Object>} Created course with sessions
 */
export async function createCourse(courseData, user) {
  if (!user) {
    throw new Error('Authentication required to create a course')
  }

  // Validate required fields
  const requiredFields = ['title', 'description', 'category', 'courseType']
  for (const field of requiredFields) {
    if (!courseData[field]) {
      throw new Error(`${field} is required`)
    }
  }

  try {
    // Prepare course data for database
    const dbCourseData = {
      title: courseData.title.trim(),
      description: courseData.description.trim(),
      category: courseData.category,
      course_type: courseData.courseType,
      price: 0, // Free for now
      session_duration: courseData.sessionDuration ? parseInt(courseData.sessionDuration) : null,
      enrollment_limit: courseData.enrollmentLimit ? parseInt(courseData.enrollmentLimit) : null,
      is_self_paced: courseData.isSelfPaced || false,
      instructor_id: user.id,
      status: 'published', // Auto-publish new courses
      is_published: true,
      timezone: courseData.timezone || 'America/New_York', // Store instructor's timezone
      meeting_link: courseData.meetingLink || null, // Store course-level meeting link
      // Add missing date and schedule fields
      start_date: courseData.startDate || null,
      end_date: courseData.endDate || null,
      has_end_date: courseData.hasEndDate || false,
      session_time: courseData.sessionTime || null,
      selected_days: courseData.selectedDays || null,
      frequency: courseData.frequency || 'weekly'
    }

    // Create the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert([dbCourseData])
      .select()
      .single()

    if (courseError) {
      console.error('Course creation error:', courseError)
      throw new Error(`Failed to create course: ${courseError.message}`)
    }

    // Create sessions for group courses with schedules
    let sessions = []
    if (courseData.courseType === 'group' && 
        !courseData.isSelfPaced && 
        courseData.startDate && 
        courseData.selectedDays?.length > 0) {
      
      sessions = await createCourseSessions(course.id, courseData)
    }

    return {
      course,
      sessions,
      message: 'Course created and published successfully! Students can now enroll.'
    }

  } catch (error) {
    console.error('Error in createCourse:', error)
    throw error
  }
}

/**
 * Create sessions for a group course
 * @param {string} courseId - Course ID
 * @param {Object} scheduleData - Schedule information
 * @returns {Promise<Array>} Created sessions
 */
async function createCourseSessions(courseId, scheduleData) {
  const sessions = []
  const startDate = new Date(scheduleData.startDate)
  
  // For courses without end date, generate 5 sessions
  // For courses with end date, generate all sessions until end date
  const hasEndDate = scheduleData.hasEndDate && scheduleData.endDate
  const endDate = hasEndDate
    ? new Date(scheduleData.endDate)
    : null
  
  const maxSessions = hasEndDate ? 1000 : 5 // Limit to 5 for open-ended courses

  let currentDate = new Date(startDate)
  let sessionNumber = 1
  let sessionsCreated = 0

  while (sessionsCreated < maxSessions && (!endDate || currentDate <= endDate)) {
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
    
    if (scheduleData.selectedDays.includes(dayName)) {
      const sessionDateTime = new Date(currentDate)
      const [hours, minutes] = scheduleData.sessionTime.split(':')
      sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      sessions.push({
        course_id: courseId,
        title: `Topic ${sessionNumber}`,
        description: '',
        session_date: sessionDateTime.toISOString(),
        duration_minutes: parseInt(scheduleData.sessionDuration),
        meeting_link: scheduleData.meetingLink || '',
        status: 'scheduled'
      })
      
      sessionNumber++
      sessionsCreated++
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Insert sessions if any were created
  if (sessions.length > 0) {
    const { data: createdSessions, error: sessionsError } = await supabase
      .from('sessions')
      .insert(sessions)
      .select()

    if (sessionsError) {
      console.error('Error creating sessions:', sessionsError)
      // Don't fail the whole process, just log the error
      return []
    }

    console.log(`Created ${createdSessions.length} sessions for course ${courseId}`)
    return createdSessions
  }

  return []
}

/**
 * Get courses for an instructor
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Array>} List of instructor's courses with timeline info
 */
export async function getInstructorCourses(instructorId) {
  if (!instructorId) {
    throw new Error('Instructor ID is required')
  }

  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        enrollments(count),
        sessions(count)
      `)
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching instructor courses:', error)
      throw new Error(`Failed to fetch courses: ${error.message}`)
    }

    return courses || []
  } catch (error) {
    console.error('Error in getInstructorCourses:', error)
    throw error
  }
}

/**
 * Get all published courses (for marketplace)
 * @returns {Promise<Array>} List of published courses
 */
export async function getAllPublishedCourses() {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles!instructor_id(id, first_name, last_name, avatar_url),
        enrollments(count),
        sessions(count)
      `)
      .eq('status', 'published')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching published courses:', error)
      throw new Error(`Failed to fetch courses: ${error.message}`)
    }

    // Transform the data to match expected format
    const transformedCourses = (courses || []).map(course => ({
      ...course,
      instructorName: course.profiles 
        ? `${course.profiles.first_name} ${course.profiles.last_name}`.trim()
        : 'Unknown Instructor',
      currentEnrollment: course.enrollments?.[0]?.count || 0,
      totalSessions: course.sessions?.[0]?.count || 0,
      averageRating: course.average_rating || 0,
      totalRatings: course.total_ratings || 0,
      sessionFrequency: course.frequency || 'weekly' // Add default frequency
    }))

    return transformedCourses
  } catch (error) {
    console.error('Error in getAllPublishedCourses:', error)
    throw error
  }
}

/**
 * Get a single course by ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Course details
 */
export async function getCourseById(courseId) {
  if (!courseId) {
    throw new Error('Course ID is required')
  }

  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles!instructor_id(id, first_name, last_name, avatar_url, bio, expertise),
        enrollments(count),
        sessions(*)
      `)
      .eq('id', courseId)
      .single()

    if (error) {
      console.error('Error fetching course:', error)
      throw new Error(`Failed to fetch course: ${error.message}`)
    }

    // Transform the data to match expected format
    const transformedCourse = {
      ...course,
      instructorName: course.profiles 
        ? `${course.profiles.first_name} ${course.profiles.last_name}`.trim()
        : 'Unknown Instructor',
      instructorBio: course.profiles?.bio || '',
      instructorExpertise: course.profiles?.expertise || [],
      currentEnrollment: course.enrollments?.[0]?.count || 0,
      totalSessions: course.sessions?.length || 0,
      averageRating: course.average_rating || 0,
      totalRatings: course.total_ratings || 0,
      sessionFrequency: course.frequency || 'weekly',
      selectedDays: course.selected_days || [],
      dayTimes: course.session_time ? [course.session_time] : [],
      isSelfPaced: course.is_self_paced || false,
      sessionDuration: course.session_duration || 60,
      enrollmentLimit: course.enrollment_limit || null,
      price: course.price || 0
    }

    return transformedCourse
  } catch (error) {
    console.error('Error in getCourseById:', error)
    throw error
  }
}

/**
 * Update course information
 * @param {string} courseId - Course ID
 * @param {Object} updates - Fields to update
 * @param {string} instructorId - Instructor user ID (for authorization)
 * @returns {Promise<Object>} Updated course
 */
export async function updateCourse(courseId, updates, instructorId) {
  if (!courseId || !instructorId) {
    throw new Error('Course ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (fetchError) {
      throw new Error(`Course not found: ${fetchError.message}`)
    }

    if (course.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only update your own courses')
    }

    // Prepare update data
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    // Update the course
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating course:', updateError)
      throw new Error(`Failed to update course: ${updateError.message}`)
    }

    return updatedCourse
  } catch (error) {
    console.error('Error in updateCourse:', error)
    throw error
  }
}

/**
 * Publish a course (make it visible to students)
 * @param {string} courseId - Course ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Updated course
 */
export async function publishCourse(courseId, instructorId) {
  return updateCourse(courseId, { 
    is_published: true, 
    status: 'published' 
  }, instructorId)
}

/**
 * Unpublish a course (hide from students)
 * @param {string} courseId - Course ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Updated course
 */
export async function unpublishCourse(courseId, instructorId) {
  return updateCourse(courseId, { 
    is_published: false, 
    status: 'draft' 
  }, instructorId)
}

/**
 * Delete a course and all related data
 * @param {string} courseId - Course ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCourse(courseId, instructorId) {
  if (!courseId || !instructorId) {
    throw new Error('Course ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('instructor_id, title')
      .eq('id', courseId)
      .single()

    if (fetchError) {
      throw new Error(`Course not found: ${fetchError.message}`)
    }

    if (course.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only delete your own courses')
    }

    // Check if course has active enrollments (exclude dropped)
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .neq('status', 'dropped') // Exclude dropped enrollments
      .limit(1)

    if (enrollmentError) {
      console.error('Error checking enrollments:', enrollmentError)
    }

    if (enrollments && enrollments.length > 0) {
      throw new Error('Cannot delete course with active enrollments. Please contact students first.')
    }

    // Delete the course (CASCADE will handle related data)
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (deleteError) {
      console.error('Error deleting course:', deleteError)
      throw new Error(`Failed to delete course: ${deleteError.message}`)
    }

    return true
  } catch (error) {
    console.error('Error in deleteCourse:', error)
    throw error
  }
}

/**
 * Get course statistics for instructor dashboard
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Course statistics
 */
export async function getCourseStats(instructorId) {
  if (!instructorId) {
    throw new Error('Instructor ID is required')
  }

  try {
    // Get course counts
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, status, is_published')
      .eq('instructor_id', instructorId)

    if (coursesError) {
      throw new Error(`Failed to fetch course stats: ${coursesError.message}`)
    }

    // Get enrollment counts
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('course_id')
      .in('course_id', courses.map(c => c.id))

    if (enrollmentsError) {
      console.error('Error fetching enrollment stats:', enrollmentsError)
    }

    const stats = {
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.is_published).length,
      draftCourses: courses.filter(c => !c.is_published).length,
      totalEnrollments: enrollments ? enrollments.length : 0
    }

    return stats
  } catch (error) {
    console.error('Error in getCourseStats:', error)
    throw error
  }
}