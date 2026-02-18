import { supabase } from '../lib/supabase'

/**
 * Analytics Service - Backend API functions for analytics data
 * Handles fetching and aggregating platform metrics over time
 */

/**
 * Calculate the start date based on time range
 * @param {string} timeRange - Time range (7d, 30d, 90d, 1y, all)
 * @returns {Date|null} Start date or null for 'all'
 */
function getStartDate(timeRange) {
  const now = new Date()
  
  switch (timeRange) {
    case '7d':
      return new Date(now.setDate(now.getDate() - 7))
    case '30d':
      return new Date(now.setDate(now.getDate() - 30))
    case '90d':
      return new Date(now.setDate(now.getDate() - 90))
    case '1y':
      return new Date(now.setFullYear(now.getFullYear() - 1))
    case 'all':
      return null
    default:
      return new Date(now.setDate(now.getDate() - 30)) // Default to 30 days
  }
}

/**
 * Aggregate data by day
 * @param {Array} data - Array of records with created_at timestamps
 * @returns {Array<{date: string, value: number}>} Aggregated data points
 */
export function aggregateByDay(data) {
  const aggregated = {}
  
  data.forEach(record => {
    const date = new Date(record.created_at).toISOString().split('T')[0]
    aggregated[date] = (aggregated[date] || 0) + 1
  })
  
  return Object.entries(aggregated)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * Aggregate data by week
 * @param {Array} data - Array of records with created_at timestamps
 * @returns {Array<{date: string, value: number}>} Aggregated data points
 */
export function aggregateByWeek(data) {
  const aggregated = {}
  
  data.forEach(record => {
    const date = new Date(record.created_at)
    // Get the Monday of the week
    const dayOfWeek = date.getDay()
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(date.setDate(diff))
    const weekStart = monday.toISOString().split('T')[0]
    
    aggregated[weekStart] = (aggregated[weekStart] || 0) + 1
  })
  
  return Object.entries(aggregated)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * Calculate percentage change between current and previous period
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @returns {number} Percentage change
 */
export function calculatePercentageChange(current, previous) {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return ((current - previous) / previous) * 100
}

/**
 * Fetch user signups over time
 * @param {string} timeRange - Time range (7d, 30d, 90d, 1y, all)
 * @returns {Promise<Array<{date: string, value: number}>>} User signup data points
 */
export async function fetchUserSignups(timeRange) {
  try {
    const startDate = getStartDate(timeRange)
    
    let query = supabase
      .from('profiles')
      .select('id, created_at')
      .order('created_at', { ascending: true })
    
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching user signups:', error)
      throw new Error(`Failed to fetch user signups: ${error.message}`)
    }
    
    // Aggregate by day or week based on time range
    if (timeRange === '1y' || timeRange === 'all') {
      return aggregateByWeek(data || [])
    } else {
      return aggregateByDay(data || [])
    }
  } catch (error) {
    console.error('Error in fetchUserSignups:', error)
    throw error
  }
}

/**
 * Fetch courses created over time
 * @param {string} timeRange - Time range (7d, 30d, 90d, 1y, all)
 * @returns {Promise<Array<{date: string, value: number}>>} Courses created data points
 */
export async function fetchCoursesCreated(timeRange) {
  try {
    const startDate = getStartDate(timeRange)
    
    let query = supabase
      .from('courses')
      .select('id, created_at')
      .order('created_at', { ascending: true })
    
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching courses created:', error)
      throw new Error(`Failed to fetch courses created: ${error.message}`)
    }
    
    // Aggregate by day or week based on time range
    if (timeRange === '1y' || timeRange === 'all') {
      return aggregateByWeek(data || [])
    } else {
      return aggregateByDay(data || [])
    }
  } catch (error) {
    console.error('Error in fetchCoursesCreated:', error)
    throw error
  }
}

/**
 * Fetch active students over time
 * Active students are those who have at least one active enrollment
 * @param {string} timeRange - Time range (7d, 30d, 90d, 1y, all)
 * @returns {Promise<Array<{date: string, value: number}>>} Active students data points
 */
export async function fetchActiveStudents(timeRange) {
  try {
    const startDate = getStartDate(timeRange)
    
    let query = supabase
      .from('enrollments')
      .select('student_id, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: true })
    
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching active students:', error)
      throw new Error(`Failed to fetch active students: ${error.message}`)
    }
    
    // Aggregate by day or week based on time range
    if (timeRange === '1y' || timeRange === 'all') {
      return aggregateByWeek(data || [])
    } else {
      return aggregateByDay(data || [])
    }
  } catch (error) {
    console.error('Error in fetchActiveStudents:', error)
    throw error
  }
}

/**
 * Fetch community questions posted over time
 * @param {string} timeRange - Time range (7d, 30d, 90d, 1y, all)
 * @returns {Promise<Array<{date: string, value: number}>>} Community questions data points
 */
export async function fetchCommunityQuestions(timeRange) {
  try {
    const startDate = getStartDate(timeRange)
    
    let query = supabase
      .from('questions')
      .select('id, created_at')
      .order('created_at', { ascending: true })
    
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching community questions:', error)
      throw new Error(`Failed to fetch community questions: ${error.message}`)
    }
    
    // Aggregate by day or week based on time range
    if (timeRange === '1y' || timeRange === 'all') {
      return aggregateByWeek(data || [])
    } else {
      return aggregateByDay(data || [])
    }
  } catch (error) {
    console.error('Error in fetchCommunityQuestions:', error)
    throw error
  }
}

/**
 * Fetch community answers posted over time
 * @param {string} timeRange - Time range (7d, 30d, 90d, 1y, all)
 * @returns {Promise<Array<{date: string, value: number}>>} Community answers data points
 */
export async function fetchCommunityAnswers(timeRange) {
  try {
    const startDate = getStartDate(timeRange)
    
    let query = supabase
      .from('answers')
      .select('id, created_at')
      .order('created_at', { ascending: true })
    
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching community answers:', error)
      throw new Error(`Failed to fetch community answers: ${error.message}`)
    }
    
    // Aggregate by day or week based on time range
    if (timeRange === '1y' || timeRange === 'all') {
      return aggregateByWeek(data || [])
    } else {
      return aggregateByDay(data || [])
    }
  } catch (error) {
    console.error('Error in fetchCommunityAnswers:', error)
    throw error
  }
}
