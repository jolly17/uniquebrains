import { 
  calculateTotalSessions, 
  generateCourseTimeline, 
  getNextSessionDate,
  getCourseStatusText,
  isCourseActive 
} from '../utils/courseScheduleUtils'

/**
 * Course Timeline Service
 * Provides timeline and schedule information for courses
 */

/**
 * Enhance courses with timeline information
 * @param {Array} courses - Array of course objects
 * @returns {Array} Courses with timeline data added
 */
export function enhanceCoursesWithTimeline(courses) {
  if (!Array.isArray(courses)) {
    return []
  }

  return courses.map(course => ({
    ...course,
    calculated_sessions: calculateTotalSessions(course),
    timeline: generateCourseTimeline(course),
    next_session: getNextSessionDate(course),
    status_text: getCourseStatusText(course),
    is_active: isCourseActive(course)
  }))
}

/**
 * Get timeline information for a single course
 * @param {Object} course - Course object
 * @returns {Object} Enhanced course with timeline data
 */
export function getCourseWithTimeline(course) {
  if (!course) {
    return null
  }

  return {
    ...course,
    calculated_sessions: calculateTotalSessions(course),
    timeline: generateCourseTimeline(course),
    next_session: getNextSessionDate(course),
    status_text: getCourseStatusText(course),
    is_active: isCourseActive(course)
  }
}

/**
 * Get course statistics for display
 * @param {Object} course - Course object
 * @returns {Object} Course statistics
 */
export function getCourseStats(course) {
  if (!course) {
    return null
  }

  const timeline = generateCourseTimeline(course)
  const totalSessions = calculateTotalSessions(course)
  const nextSession = getNextSessionDate(course)
  const isActive = isCourseActive(course)

  return {
    totalSessions,
    timeline,
    nextSession,
    isActive,
    statusText: getCourseStatusText(course),
    enrollmentCount: course.enrollments?.length || 0,
    sessionCount: course.sessions?.length || 0
  }
}

/**
 * Format course schedule for display
 * @param {Object} course - Course object
 * @returns {string} Formatted schedule text
 */
export function formatCourseSchedule(course) {
  if (!course) {
    return 'Schedule not available'
  }

  if (course.is_self_paced) {
    return 'Self-paced learning'
  }

  if (!course.selected_days?.length || !course.session_time) {
    return 'Schedule to be announced'
  }

  const days = course.selected_days.join(', ')
  const time = new Date(`2000-01-01T${course.session_time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const frequency = course.frequency === 'weekly' ? '' : ` (${course.frequency})`
  
  return `${days} at ${time}${frequency}`
}

/**
 * Check if course enrollment is still open
 * @param {Object} course - Course object
 * @returns {boolean} Whether enrollment is open
 */
export function isEnrollmentOpen(course) {
  if (!course) {
    return false
  }

  // Check if course is published
  if (!course.is_published) {
    return false
  }

  // Check enrollment limit
  if (course.enrollment_limit) {
    const currentEnrollments = course.enrollments?.length || 0
    if (currentEnrollments >= course.enrollment_limit) {
      return false
    }
  }

  // Check if course has started (allow enrollment up to start date)
  if (course.start_date) {
    const startDate = new Date(course.start_date)
    const now = new Date()
    
    // Close enrollment after course starts (you can adjust this logic)
    if (now > startDate) {
      return false
    }
  }

  return true
}

/**
 * Get enrollment status text
 * @param {Object} course - Course object
 * @returns {string} Enrollment status text
 */
export function getEnrollmentStatusText(course) {
  if (!course) {
    return 'Not available'
  }

  if (!course.is_published) {
    return 'Not published'
  }

  if (!isEnrollmentOpen(course)) {
    if (course.enrollment_limit) {
      const currentEnrollments = course.enrollments?.length || 0
      if (currentEnrollments >= course.enrollment_limit) {
        return 'Full'
      }
    }
    
    if (course.start_date && new Date() > new Date(course.start_date)) {
      return 'Started'
    }
    
    return 'Closed'
  }

  return 'Open'
}