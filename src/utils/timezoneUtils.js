/**
 * Timezone Utility Functions
 * Handles conversion between instructor timezone and student local timezone
 */

/**
 * Convert a time from instructor's timezone to user's local timezone
 * @param {string} time - Time in HH:MM format (e.g., "14:30")
 * @param {string} instructorTimezone - IANA timezone (e.g., "America/New_York")
 * @param {Date} referenceDate - Reference date for the time (to handle DST correctly)
 * @returns {string} Time in user's local timezone in HH:MM format
 */
export function convertToLocalTime(time, instructorTimezone, referenceDate = new Date()) {
  if (!time || !instructorTimezone) return time

  try {
    const [hours, minutes] = time.split(':').map(Number)
    
    // Create a date object in the instructor's timezone
    const dateStr = referenceDate.toISOString().split('T')[0]
    const instructorDateTime = new Date(`${dateStr}T${time}:00`)
    
    // Format the time string with timezone
    const instructorTimeStr = instructorDateTime.toLocaleString('en-US', {
      timeZone: instructorTimezone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // Parse back to create a proper date in instructor's timezone
    const [datePart, timePart] = instructorTimeStr.split(', ')
    const [month, day, year] = datePart.split('/')
    const [hour, minute] = timePart.split(':')
    
    // Create UTC date from instructor's local time
    const utcDate = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    ))
    
    // Get offset for instructor timezone
    const instructorOffset = getTimezoneOffset(instructorTimezone, utcDate)
    
    // Adjust for instructor timezone offset
    const adjustedDate = new Date(utcDate.getTime() - instructorOffset * 60000)
    
    // Convert to user's local timezone
    const localHours = adjustedDate.getHours().toString().padStart(2, '0')
    const localMinutes = adjustedDate.getMinutes().toString().padStart(2, '0')
    
    return `${localHours}:${localMinutes}`
  } catch (error) {
    console.error('Error converting time:', error)
    return time
  }
}

/**
 * Get timezone offset in minutes
 * @param {string} timezone - IANA timezone
 * @param {Date} date - Reference date
 * @returns {number} Offset in minutes
 */
function getTimezoneOffset(timezone, date) {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  return (tzDate.getTime() - utcDate.getTime()) / 60000
}

/**
 * Format time with timezone abbreviation
 * @param {string} time - Time in HH:MM format
 * @param {string} timezone - IANA timezone (optional, defaults to user's local)
 * @returns {string} Formatted time with timezone (e.g., "2:30 PM EST")
 */
export function formatTimeWithTimezone(time, timezone = null) {
  if (!time) return ''
  
  try {
    const [hours, minutes] = time.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    
    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    }
    
    if (timezone) {
      options.timeZone = timezone
    }
    
    return date.toLocaleString('en-US', options)
  } catch (error) {
    console.error('Error formatting time:', error)
    return time
  }
}

/**
 * Get user's local timezone
 * @returns {string} IANA timezone identifier
 */
export function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Check if two timezones are the same
 * @param {string} tz1 - First timezone
 * @param {string} tz2 - Second timezone
 * @returns {boolean} True if timezones are the same
 */
export function isSameTimezone(tz1, tz2) {
  return tz1 === tz2
}
