/**
 * Timezone Utility Functions
 * Handles conversion between instructor timezone and student local timezone
 */

/**
 * Convert 12-hour time format to 24-hour format
 * @param {string} time12h - Time in 12-hour format (e.g., "2:30 PM")
 * @returns {string|null} Time in 24-hour format (e.g., "14:30:00") or null if invalid
 */
export function convertTo24HourFormat(time12h) {
  if (!time12h) {
    return null
  }
  
  const [time, modifier] = time12h.split(' ')
  if (!time || !modifier) {
    return null
  }
  
  let [hours, minutes] = time.split(':')
  
  if (hours === '12') {
    hours = '00'
  }
  
  if (modifier.toUpperCase() === 'PM') {
    hours = parseInt(hours, 10) + 12
  }
  
  return `${String(hours).padStart(2, '0')}:${minutes}:00`
}

/**
 * Convert 12-hour time format to 24-hour format (returns hours and minutes as numbers)
 * Also handles 24-hour format input gracefully (e.g., "14:30" or "14:30:00")
 * @param {string} time12h - Time in 12-hour format (e.g., "2:30 PM") or 24-hour format (e.g., "14:30")
 * @returns {{hours: number, minutes: number}} Object with hours and minutes
 */
export function convertTo24HourParts(time12h) {
  if (!time12h) {
    return { hours: 0, minutes: 0 }
  }

  const [time, modifier] = time12h.split(' ')
  if (!time) {
    return { hours: 0, minutes: 0 }
  }

  let [hours, minutes] = time.split(':')

  // If no AM/PM modifier, assume the input is already in 24-hour format
  if (!modifier) {
    return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) }
  }
  
  if (hours === '12') {
    hours = '00'
  }
  
  if (modifier.toUpperCase() === 'PM') {
    hours = parseInt(hours, 10) + 12
  }
  
  return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) }
}

/**
 * Convert 24-hour time format to 12-hour format
 * @param {string} time24h - Time in 24-hour format (e.g., "14:30" or "14:30:00")
 * @returns {string} Time in 12-hour format (e.g., "2:30 PM")
 */
export function convertTo12HourFormat(time24h) {
  if (!time24h) {
    return ''
  }
  
  const [hours, minutes] = time24h.split(':').map(Number)
  const modifier = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  
  return `${hours12}:${String(minutes).padStart(2, '0')} ${modifier}`
}

/**
 * Convert a time from instructor's timezone to user's local timezone
 * @param {string} time - Time in HH:MM format (e.g., "14:30")
 * @param {string} instructorTimezone - IANA timezone (e.g., "America/New_York" or "Asia/Kolkata")
 * @returns {string} Time in user's local timezone in HH:MM format
 */
export function convertToLocalTime(time, instructorTimezone) {
  if (!time || !instructorTimezone) return time

  try {
    const [hours, minutes] = time.split(':').map(Number)
    
    // Use today's date as reference (to handle DST correctly)
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    
    // Create an ISO string representing the time in the instructor's timezone
    // Format: YYYY-MM-DDTHH:MM:SS
    const isoString = `${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
    
    // Parse this string as if it's in the instructor's timezone
    // We use toLocaleString to interpret the time in the instructor's timezone
    const dateInInstructorTZ = new Date(isoString + 'Z') // Add Z to treat as UTC first
    
    // Get what this UTC time looks like in the instructor's timezone
    const instructorTimeStr = dateInInstructorTZ.toLocaleString('en-US', {
      timeZone: instructorTimezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // Calculate the offset needed
    const [instrHours, instrMinutes] = instructorTimeStr.split(':').map(Number)
    const offsetMinutes = (hours * 60 + minutes) - (instrHours * 60 + instrMinutes)
    
    // Apply offset to get the correct UTC time
    const correctUTC = new Date(dateInInstructorTZ.getTime() + offsetMinutes * 60 * 1000)
    
    // Now convert to user's local timezone (browser does this automatically)
    const localHours = correctUTC.getHours().toString().padStart(2, '0')
    const localMinutes = correctUTC.getMinutes().toString().padStart(2, '0')
    
    return `${localHours}:${localMinutes}`
  } catch (error) {
    console.error('Error converting time from', instructorTimezone, ':', error)
    return time
  }
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
