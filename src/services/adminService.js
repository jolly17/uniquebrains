import { supabase } from '../lib/supabase'

/**
 * Admin Service - Backend API functions for admin dashboard
 * Handles all admin-related database operations with proper error handling
 */

/**
 * Fetch all courses with instructor information
 * @returns {Promise<Array>} List of all courses
 */
export async function fetchAllCourses() {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles!instructor_id(id, first_name, last_name, email),
        enrollments(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
      throw new Error(`Failed to fetch courses: ${error.message}`)
    }

    // Transform data to include instructor name and enrollment count
    const transformedCourses = (courses || []).map(course => ({
      ...course,
      instructor_name: course.profiles 
        ? `${course.profiles.first_name} ${course.profiles.last_name}`.trim()
        : 'Unknown',
      instructor_email: course.profiles?.email || '',
      enrollment_count: course.enrollments?.[0]?.count || 0
    }))

    return transformedCourses
  } catch (error) {
    console.error('Error in fetchAllCourses:', error)
    throw error
  }
}

/**
 * Fetch all instructors with statistics
 * @returns {Promise<Array>} List of all instructors
 */
export async function fetchAllInstructors() {
  try {
    const { data: instructors, error } = await supabase
      .from('profiles')
      .select(`
        *,
        courses(count),
        courses!inner(enrollments(count))
      `)
      .eq('role', 'instructor')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching instructors:', error)
      throw new Error(`Failed to fetch instructors: ${error.message}`)
    }

    // Calculate statistics for each instructor
    const transformedInstructors = (instructors || []).map(instructor => {
      const coursesCount = instructor.courses?.[0]?.count || 0
      
      // Calculate total students taught (sum of enrollments across all courses)
      let totalStudents = 0
      if (instructor.courses && Array.isArray(instructor.courses)) {
        instructor.courses.forEach(course => {
          if (course.enrollments && course.enrollments[0]) {
            totalStudents += course.enrollments[0].count || 0
          }
        })
      }

      return {
        ...instructor,
        courses_count: coursesCount,
        students_taught: totalStudents
      }
    })

    return transformedInstructors
  } catch (error) {
    console.error('Error in fetchAllInstructors:', error)
    throw error
  }
}

/**
 * Fetch all students with enrollment information
 * @returns {Promise<Array>} List of all students
 */
export async function fetchAllStudents() {
  try {
    const { data: students, error } = await supabase
      .from('profiles')
      .select(`
        *,
        enrollments(count)
      `)
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching students:', error)
      throw new Error(`Failed to fetch students: ${error.message}`)
    }

    // Transform data to include enrollment count
    const transformedStudents = (students || []).map(student => ({
      ...student,
      enrollments_count: student.enrollments?.[0]?.count || 0
    }))

    return transformedStudents
  } catch (error) {
    console.error('Error in fetchAllStudents:', error)
    throw error
  }
}

/**
 * Fetch all enrollments with student and course information
 * @returns {Promise<Array>} List of all enrollments
 */
export async function fetchAllEnrollments() {
  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        profiles!student_id(id, first_name, last_name, email),
        courses(id, title, instructor_id)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching enrollments:', error)
      throw new Error(`Failed to fetch enrollments: ${error.message}`)
    }

    // Transform data to include student and course names
    const transformedEnrollments = (enrollments || []).map(enrollment => ({
      ...enrollment,
      student_name: enrollment.profiles 
        ? `${enrollment.profiles.first_name} ${enrollment.profiles.last_name}`.trim()
        : 'Unknown',
      student_email: enrollment.profiles?.email || '',
      course_title: enrollment.courses?.title || 'Unknown Course'
    }))

    return transformedEnrollments
  } catch (error) {
    console.error('Error in fetchAllEnrollments:', error)
    throw error
  }
}

/**
 * Fetch all sessions with course information
 * @returns {Promise<Array>} List of all sessions
 */
export async function fetchAllSessions() {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select(`
        *,
        courses(id, title, instructor_id)
      `)
      .order('session_date', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      throw new Error(`Failed to fetch sessions: ${error.message}`)
    }

    // Transform data to include course title
    const transformedSessions = (sessions || []).map(session => ({
      ...session,
      course_title: session.courses?.title || 'Unknown Course'
    }))

    return transformedSessions
  } catch (error) {
    console.error('Error in fetchAllSessions:', error)
    throw error
  }
}

/**
 * Update a course
 * @param {string} courseId - Course ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated course
 */
export async function updateCourse(courseId, updates) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single()

    if (error) {
      console.error('Error updating course:', error)
      throw new Error(`Failed to update course: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in updateCourse:', error)
    throw error
  }
}

/**
 * Delete a course
 * @param {string} courseId - Course ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCourse(courseId) {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) {
      console.error('Error deleting course:', error)
      throw new Error(`Failed to delete course: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Error in deleteCourse:', error)
    throw error
  }
}

/**
 * Update an instructor profile
 * @param {string} instructorId - Instructor ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated instructor
 */
export async function updateInstructor(instructorId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', instructorId)
      .select()
      .single()

    if (error) {
      console.error('Error updating instructor:', error)
      throw new Error(`Failed to update instructor: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in updateInstructor:', error)
    throw error
  }
}

/**
 * Suspend an instructor (unpublish all courses and disable account)
 * @param {string} instructorId - Instructor ID
 * @returns {Promise<boolean>} Success status
 */
export async function suspendInstructor(instructorId) {
  try {
    // Unpublish all instructor's courses
    const { error: coursesError } = await supabase
      .from('courses')
      .update({ 
        is_published: false,
        status: 'suspended'
      })
      .eq('instructor_id', instructorId)

    if (coursesError) {
      console.error('Error unpublishing courses:', coursesError)
      throw new Error(`Failed to unpublish courses: ${coursesError.message}`)
    }

    // Update instructor status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        is_suspended: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', instructorId)

    if (profileError) {
      console.error('Error suspending instructor:', profileError)
      throw new Error(`Failed to suspend instructor: ${profileError.message}`)
    }

    return true
  } catch (error) {
    console.error('Error in suspendInstructor:', error)
    throw error
  }
}

/**
 * Update a student profile
 * @param {string} studentId - Student ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated student
 */
export async function updateStudent(studentId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating student:', error)
      throw new Error(`Failed to update student: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in updateStudent:', error)
    throw error
  }
}

/**
 * Update enrollment status
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} status - New status (active, completed, dropped, pending)
 * @returns {Promise<Object>} Updated enrollment
 */
export async function updateEnrollmentStatus(enrollmentId, status) {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating enrollment:', error)
      throw new Error(`Failed to update enrollment: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in updateEnrollmentStatus:', error)
    throw error
  }
}

/**
 * Update a session
 * @param {string} sessionId - Session ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated session
 */
export async function updateSession(sessionId, updates) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating session:', error)
      throw new Error(`Failed to update session: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in updateSession:', error)
    throw error
  }
}

/**
 * Delete a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteSession(sessionId) {
  try {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      console.error('Error deleting session:', error)
      throw new Error(`Failed to delete session: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Error in deleteSession:', error)
    throw error
  }
}

/**
 * Fetch course enrollments with student neurodiversity information
 * @returns {Promise<Array>} List of enrollments with student details
 */
export async function fetchCourseEnrollments() {
  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        profiles!student_id(
          id,
          first_name,
          last_name,
          email,
          age,
          grade_level,
          neurodiversity_profile,
          other_needs,
          interests
        ),
        courses(
          id,
          title,
          profiles!instructor_id(first_name, last_name)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching course enrollments:', error)
      throw new Error(`Failed to fetch enrollments: ${error.message}`)
    }

    // Transform data to flatten structure
    const transformedEnrollments = (enrollments || []).map(enrollment => ({
      id: enrollment.id,
      course_id: enrollment.course_id,
      student_id: enrollment.student_id,
      status: enrollment.status,
      created_at: enrollment.created_at,
      course_title: enrollment.courses?.title || 'Unknown Course',
      instructor_name: enrollment.courses?.profiles 
        ? `${enrollment.courses.profiles.first_name} ${enrollment.courses.profiles.last_name}`.trim()
        : 'Unknown',
      student_name: enrollment.profiles 
        ? `${enrollment.profiles.first_name} ${enrollment.profiles.last_name}`.trim()
        : 'Unknown',
      student_email: enrollment.profiles?.email || '',
      age: enrollment.profiles?.age,
      grade_level: enrollment.profiles?.grade_level,
      neurodiversity_profile: enrollment.profiles?.neurodiversity_profile || [],
      other_needs: enrollment.profiles?.other_needs,
      interests: enrollment.profiles?.interests || []
    }))

    return transformedEnrollments
  } catch (error) {
    console.error('Error in fetchCourseEnrollments:', error)
    throw error
  }
}

/**
 * Fetch dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics
 */
export async function fetchDashboardStats() {
  try {
    // Fetch counts for all entities
    const [coursesResult, instructorsResult, studentsResult, enrollmentsResult] = await Promise.all([
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'instructor'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('enrollments').select('id', { count: 'exact', head: true })
    ])

    return {
      total_courses: coursesResult.count || 0,
      total_instructors: instructorsResult.count || 0,
      total_students: studentsResult.count || 0,
      total_enrollments: enrollmentsResult.count || 0
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

/**
 * Fetch recent platform activities
 * Aggregates recent events from multiple tables to create an activity feed
 * @returns {Promise<Array>} List of 20 most recent activities
 */
export async function fetchRecentActivities() {
  try {
    // Fetch recent courses
    const { data: recentCourses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, created_at, profiles!instructor_id(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(10)

    if (coursesError) {
      console.error('Error fetching recent courses:', coursesError)
    }

    // Fetch recent enrollments
    const { data: recentEnrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('id, created_at, profiles!student_id(first_name, last_name), courses(title)')
      .order('created_at', { ascending: false })
      .limit(10)

    if (enrollmentsError) {
      console.error('Error fetching recent enrollments:', enrollmentsError)
    }

    // Fetch recent sessions
    const { data: recentSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, title, created_at, courses(title, profiles!instructor_id(first_name, last_name))')
      .order('created_at', { ascending: false })
      .limit(10)

    if (sessionsError) {
      console.error('Error fetching recent sessions:', sessionsError)
    }

    // Fetch recent user registrations
    const { data: recentUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (usersError) {
      console.error('Error fetching recent users:', usersError)
    }

    // Transform and combine all activities
    const activities = []

    // Add course creation activities
    if (recentCourses) {
      recentCourses.forEach(course => {
        const instructorName = course.profiles 
          ? `${course.profiles.first_name} ${course.profiles.last_name}`.trim()
          : 'Unknown'
        
        activities.push({
          id: `course-${course.id}`,
          type: 'course_created',
          description: `New course created: "${course.title}"`,
          user_name: instructorName,
          timestamp: course.created_at
        })
      })
    }

    // Add enrollment activities
    if (recentEnrollments) {
      recentEnrollments.forEach(enrollment => {
        const studentName = enrollment.profiles 
          ? `${enrollment.profiles.first_name} ${enrollment.profiles.last_name}`.trim()
          : 'Unknown'
        const courseTitle = enrollment.courses?.title || 'Unknown Course'
        
        activities.push({
          id: `enrollment-${enrollment.id}`,
          type: 'enrollment',
          description: `Student enrolled in "${courseTitle}"`,
          user_name: studentName,
          timestamp: enrollment.created_at
        })
      })
    }

    // Add session scheduling activities
    if (recentSessions) {
      recentSessions.forEach(session => {
        const instructorName = session.courses?.profiles 
          ? `${session.courses.profiles.first_name} ${session.courses.profiles.last_name}`.trim()
          : 'Unknown'
        const courseTitle = session.courses?.title || 'Unknown Course'
        
        activities.push({
          id: `session-${session.id}`,
          type: 'session_scheduled',
          description: `Session scheduled: "${session.title}" for ${courseTitle}`,
          user_name: instructorName,
          timestamp: session.created_at
        })
      })
    }

    // Add user registration activities
    if (recentUsers) {
      recentUsers.forEach(user => {
        const userName = `${user.first_name} ${user.last_name}`.trim()
        const roleLabel = user.role === 'instructor' ? 'Instructor' : user.role === 'student' ? 'Student' : 'User'
        
        activities.push({
          id: `user-${user.id}`,
          type: 'user_registered',
          description: `${roleLabel} registered`,
          user_name: userName,
          timestamp: user.created_at
        })
      })
    }

    // Sort all activities by timestamp (most recent first) and take top 20
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    return activities.slice(0, 20)
  } catch (error) {
    console.error('Error in fetchRecentActivities:', error)
    throw error
  }
}
