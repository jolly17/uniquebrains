import { supabase } from '../lib/supabase'

/**
 * Session Service - Backend API functions for session management
 * Handles all session-related database operations
 */

/**
 * Get sessions for a course
 * @param {string} courseId - Course ID
 * @param {string} userId - Current user ID (for authorization)
 * @returns {Promise<Array>} List of course sessions
 */
export async function getCourseSessions(courseId, userId) {
  if (!courseId || !userId) {
    throw new Error('Course ID and user ID are required')
  }

  try {
    // Check if user has access to this course (instructor or enrolled student)
    const hasAccess = await checkCourseAccess(courseId, userId)
    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have access to this course')
    }

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('course_id', courseId)
      .order('session_date', { ascending: true })

    if (error) {
      console.error('Error fetching sessions:', error)
      throw new Error(`Failed to fetch sessions: ${error.message}`)
    }

    return sessions || []
  } catch (error) {
    console.error('Error in getCourseSessions:', error)
    throw error
  }
}

/**
 * Update session meeting information
 * @param {string} sessionId - Session ID
 * @param {Object} meetingData - Meeting link and platform info
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Updated session
 */
export async function updateSessionMeeting(sessionId, meetingData, instructorId) {
  if (!sessionId || !instructorId) {
    throw new Error('Session ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course for this session
    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select(`
        id,
        course_id,
        courses!inner(instructor_id)
      `)
      .eq('id', sessionId)
      .single()

    if (fetchError) {
      throw new Error(`Session not found: ${fetchError.message}`)
    }

    if (session.courses.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only update sessions for your own courses')
    }

    // Validate meeting link if provided
    if (meetingData.meeting_link && !isValidUrl(meetingData.meeting_link)) {
      throw new Error('Invalid meeting link URL')
    }

    // Update session
    const updateData = {
      meeting_link: meetingData.meeting_link || '',
      meeting_password: meetingData.meeting_password || '',
      meeting_platform: meetingData.meeting_platform || null
    }

    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating session:', updateError)
      throw new Error(`Failed to update session: ${updateError.message}`)
    }

    return updatedSession
  } catch (error) {
    console.error('Error in updateSessionMeeting:', error)
    throw error
  }
}

/**
 * Create a new session for a course
 * @param {string} courseId - Course ID
 * @param {Object} sessionData - Session information
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Created session
 */
export async function createSession(courseId, sessionData, instructorId) {
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
      throw new Error('Unauthorized: You can only create sessions for your own courses')
    }

    // Validate required fields
    if (!sessionData.title || !sessionData.session_date) {
      throw new Error('Session title and date are required')
    }

    // Prepare session data
    const dbSessionData = {
      course_id: courseId,
      title: sessionData.title.trim(),
      description: sessionData.description?.trim() || '',
      session_date: new Date(sessionData.session_date).toISOString(),
      duration_minutes: sessionData.duration_minutes || sessionData.duration || 60,
      meeting_link: sessionData.meeting_link || '',
      meeting_password: sessionData.meeting_password || '',
      meeting_platform: sessionData.meeting_platform || null,
      student_id: sessionData.student_id || null, // For 1-on-1 courses
      status: 'scheduled'
    }

    // Validate meeting link if provided
    if (dbSessionData.meeting_link && !isValidUrl(dbSessionData.meeting_link)) {
      throw new Error('Invalid meeting link URL')
    }

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert([dbSessionData])
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      throw new Error(`Failed to create session: ${sessionError.message}`)
    }

    return session
  } catch (error) {
    console.error('Error in createSession:', error)
    throw error
  }
}

/**
 * Update session information
 * @param {string} sessionId - Session ID
 * @param {Object} updates - Fields to update
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Updated session
 */
export async function updateSession(sessionId, updates, instructorId) {
  if (!sessionId || !instructorId) {
    throw new Error('Session ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course for this session
    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select(`
        id,
        course_id,
        courses!inner(instructor_id)
      `)
      .eq('id', sessionId)
      .single()

    if (fetchError) {
      throw new Error(`Session not found: ${fetchError.message}`)
    }

    if (session.courses.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only update sessions for your own courses')
    }

    // Validate meeting link if being updated
    if (updates.meeting_link && !isValidUrl(updates.meeting_link)) {
      throw new Error('Invalid meeting link URL')
    }

    // Prepare update data
    const updateData = {
      ...updates
    }

    // Convert session_date to ISO string if provided
    if (updateData.session_date) {
      updateData.session_date = new Date(updateData.session_date).toISOString()
    }

    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating session:', updateError)
      throw new Error(`Failed to update session: ${updateError.message}`)
    }

    return updatedSession
  } catch (error) {
    console.error('Error in updateSession:', error)
    throw error
  }
}

/**
 * Delete a session
 * @param {string} sessionId - Session ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteSession(sessionId, instructorId) {
  if (!sessionId || !instructorId) {
    throw new Error('Session ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course for this session and get full details
    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select(`
        id,
        course_id,
        title,
        session_date,
        courses!inner(
          instructor_id,
          title,
          profiles!instructor_id(full_name)
        )
      `)
      .eq('id', sessionId)
      .single()

    if (fetchError) {
      throw new Error(`Session not found: ${fetchError.message}`)
    }

    if (session.courses.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only delete sessions for your own courses')
    }

    // Get all enrolled students' emails before deleting
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        student_id,
        profiles!student_id(email)
      `)
      .eq('course_id', session.course_id)
      .eq('status', 'active')

    const studentEmails = enrollments
      ?.map(e => e.profiles?.email)
      .filter(email => email) || []

    // Delete the session
    const { error: deleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (deleteError) {
      console.error('Error deleting session:', deleteError)
      throw new Error(`Failed to delete session: ${deleteError.message}`)
    }

    // Send notification emails to students (don't wait for it)
    if (studentEmails.length > 0) {
      sendSessionDeletedEmails({
        sessionTitle: session.title,
        sessionDate: session.session_date,
        courseTitle: session.courses.title,
        courseId: session.course_id,
        instructorName: session.courses.profiles.full_name,
        studentEmails
      }).catch(error => {
        console.error('Failed to send session deletion emails:', error)
        // Don't throw - session is already deleted
      })
    }

    return true
  } catch (error) {
    console.error('Error in deleteSession:', error)
    throw error
  }
}

/**
 * Send session deletion notification emails
 * @param {Object} data - Session deletion data
 * @returns {Promise<void>}
 */
async function sendSessionDeletedEmails(data) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-session-deleted-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(data)
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Email function error: ${JSON.stringify(error)}`)
    }

    console.log('Session deletion emails sent successfully')
  } catch (error) {
    console.error('Error sending session deletion emails:', error)
    throw error
  }
}

/**
 * Get upcoming sessions for an instructor
 * @param {string} instructorId - Instructor user ID
 * @param {number} limit - Number of sessions to return (default: 5)
 * @returns {Promise<Array>} List of upcoming sessions
 */
export async function getUpcomingSessions(instructorId, limit = 5) {
  if (!instructorId) {
    throw new Error('Instructor ID is required')
  }

  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select(`
        *,
        courses!inner(title, instructor_id)
      `)
      .eq('courses.instructor_id', instructorId)
      .gte('session_date', new Date().toISOString())
      .order('session_date', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching upcoming sessions:', error)
      throw new Error(`Failed to fetch upcoming sessions: ${error.message}`)
    }

    return sessions || []
  } catch (error) {
    console.error('Error in getUpcomingSessions:', error)
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
    const { data: course, error: courseError} = await supabase
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

    // No access found
    return false
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