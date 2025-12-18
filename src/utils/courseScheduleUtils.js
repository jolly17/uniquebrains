/**
 * Course Schedule Utilities
 * Functions to calculate sessions, timelines, and display course schedule information
 */

/**
 * Calculate the total number of sessions for a course
 * @param {Object} course - Course object with schedule data
 * @returns {number} Total number of sessions
 */
export function calculateTotalSessions(course) {
  if (!course || course.is_self_paced) {
    return 0 // Self-paced courses don't have scheduled sessions
  }

  if (!course.start_date || !course.selected_days?.length) {
    return 0 // No schedule information
  }

  const startDate = new Date(course.start_date)
  const endDate = course.has_end_date && course.end_date 
    ? new Date(course.end_date)
    : new Date(startDate.getTime() + (12 * 7 * 24 * 60 * 60 * 1000)) // 12 weeks default

  const frequencyMultiplier = getFrequencyMultiplier(course.frequency)
  let sessionCount = 0
  let currentDate = new Date(startDate)

  while (currentDate <= endDate && sessionCount < 100) { // Safety limit
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
    
    if (course.selected_days.includes(dayName)) {
      sessionCount++
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + frequencyMultiplier)
  }

  return sessionCount
}

/**
 * Get frequency multiplier for date calculations
 * @param {string} frequency - Frequency type
 * @returns {number} Days to add for each iteration
 */
function getFrequencyMultiplier(frequency) {
  switch (frequency) {
    case 'weekly': return 1
    case 'biweekly': return 7
    case 'monthly': return 30
    default: return 1
  }
}

/**
 * Calculate course duration in weeks
 * @param {Object} course - Course object with schedule data
 * @returns {number} Duration in weeks
 */
export function calculateCourseDuration(course) {
  if (!course || course.is_self_paced) {
    return 0
  }

  if (!course.start_date) {
    return 0
  }

  const startDate = new Date(course.start_date)
  const endDate = course.has_end_date && course.end_date 
    ? new Date(course.end_date)
    : new Date(startDate.getTime() + (12 * 7 * 24 * 60 * 60 * 1000)) // 12 weeks default

  const diffTime = Math.abs(endDate - startDate)
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
  
  return diffWeeks
}

/**
 * Generate course timeline for display to students
 * @param {Object} course - Course object with schedule data
 * @returns {Object} Timeline information
 */
export function generateCourseTimeline(course) {
  if (!course) {
    return null
  }

  if (course.is_self_paced) {
    return {
      type: 'self-paced',
      message: 'Learn at your own pace',
      totalSessions: 0,
      duration: 'Flexible',
      schedule: 'No fixed schedule'
    }
  }

  if (!course.start_date || !course.selected_days?.length) {
    return {
      type: 'no-schedule',
      message: 'Schedule to be announced',
      totalSessions: 0,
      duration: 'TBD',
      schedule: 'Schedule pending'
    }
  }

  const totalSessions = calculateTotalSessions(course)
  const duration = calculateCourseDuration(course)
  const startDate = new Date(course.start_date)
  const endDate = course.has_end_date && course.end_date 
    ? new Date(course.end_date)
    : null

  // Format schedule display
  const daysText = course.selected_days.join(', ')
  const timeText = course.session_time 
    ? formatTime(course.session_time)
    : 'Time TBD'
  
  const frequencyText = course.frequency === 'weekly' ? '' : ` (${course.frequency})`
  
  return {
    type: 'scheduled',
    totalSessions,
    duration: `${duration} weeks`,
    startDate: formatDate(startDate),
    endDate: endDate ? formatDate(endDate) : 'Open-ended',
    schedule: `${daysText} at ${timeText}${frequencyText}`,
    sessionDuration: course.session_duration ? `${course.session_duration} minutes` : 'Duration TBD',
    daysOfWeek: course.selected_days,
    sessionTime: course.session_time,
    frequency: course.frequency
  }
}

/**
 * Get next upcoming session date for a course
 * @param {Object} course - Course object with schedule data
 * @returns {Date|null} Next session date or null
 */
export function getNextSessionDate(course) {
  if (!course || course.is_self_paced || !course.start_date || !course.selected_days?.length) {
    return null
  }

  const now = new Date()
  const startDate = new Date(course.start_date)
  const endDate = course.has_end_date && course.end_date 
    ? new Date(course.end_date)
    : new Date(startDate.getTime() + (12 * 7 * 24 * 60 * 60 * 1000))

  // If course hasn't started yet, return first session
  if (now < startDate) {
    return findFirstSessionDate(course)
  }

  // If course has ended, return null
  if (now > endDate) {
    return null
  }

  // Find next session from today
  const frequencyMultiplier = getFrequencyMultiplier(course.frequency)
  let currentDate = new Date(now)
  
  for (let i = 0; i < 14; i++) { // Check next 2 weeks
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
    
    if (course.selected_days.includes(dayName) && currentDate >= now) {
      return currentDate
    }
    
    currentDate.setDate(currentDate.getDate() + frequencyMultiplier)
  }

  return null
}

/**
 * Find the first session date for a course
 * @param {Object} course - Course object with schedule data
 * @returns {Date|null} First session date
 */
function findFirstSessionDate(course) {
  if (!course.start_date || !course.selected_days?.length) {
    return null
  }

  const startDate = new Date(course.start_date)
  let currentDate = new Date(startDate)
  
  for (let i = 0; i < 7; i++) { // Check first week
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
    
    if (course.selected_days.includes(dayName)) {
      return currentDate
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return startDate // Fallback to start date
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format time for display
 * @param {string} time - Time string (HH:MM format)
 * @returns {string} Formatted time string
 */
function formatTime(time) {
  if (!time) return 'Time TBD'
  
  try {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return time // Return original if parsing fails
  }
}

/**
 * Check if a course is currently active (between start and end dates)
 * @param {Object} course - Course object with schedule data
 * @returns {boolean} Whether course is currently active
 */
export function isCourseActive(course) {
  if (!course || course.is_self_paced) {
    return true // Self-paced courses are always "active"
  }

  if (!course.start_date) {
    return false // No start date means not active
  }

  const now = new Date()
  const startDate = new Date(course.start_date)
  const endDate = course.has_end_date && course.end_date 
    ? new Date(course.end_date)
    : new Date(startDate.getTime() + (12 * 7 * 24 * 60 * 60 * 1000))

  return now >= startDate && now <= endDate
}

/**
 * Get course status text for display
 * @param {Object} course - Course object with schedule data
 * @returns {string} Status text
 */
export function getCourseStatusText(course) {
  if (!course) return 'Unknown'
  
  if (course.is_self_paced) {
    return 'Self-paced'
  }

  if (!course.start_date) {
    return 'Schedule pending'
  }

  const now = new Date()
  const startDate = new Date(course.start_date)
  const endDate = course.has_end_date && course.end_date 
    ? new Date(course.end_date)
    : null

  if (now < startDate) {
    return `Starts ${formatDate(startDate)}`
  }

  if (endDate && now > endDate) {
    return 'Completed'
  }

  return 'In progress'
}