import { supabase } from '../lib/supabase'

/**
 * Rating Service - Backend API functions for course ratings
 * Handles student ratings for courses
 */

/**
 * Submit or update a course rating
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student user ID
 * @param {number} rating - Rating value (1-5)
 * @returns {Promise<Object>} Created/updated rating
 */
export async function submitRating(courseId, studentId, rating) {
  if (!courseId || !studentId) {
    throw new Error('Course ID and student ID are required')
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  try {
    // Check if student has already rated this course
    const { data: existingRating } = await supabase
      .from('reviews')
      .select('id')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single()

    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating: rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating rating:', error)
        throw new Error(`Failed to update rating: ${error.message}`)
      }

      return data
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          course_id: courseId,
          student_id: studentId,
          rating: rating,
          is_published: true
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating rating:', error)
        throw new Error(`Failed to submit rating: ${error.message}`)
      }

      return data
    }
  } catch (error) {
    console.error('Error in submitRating:', error)
    throw error
  }
}

/**
 * Get student's rating for a course
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student user ID
 * @returns {Promise<Object|null>} Rating object or null
 */
export async function getStudentRating(courseId, studentId) {
  if (!courseId || !studentId) {
    throw new Error('Course ID and student ID are required')
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching rating:', error)
      throw new Error(`Failed to fetch rating: ${error.message}`)
    }

    return data || null
  } catch (error) {
    console.error('Error in getStudentRating:', error)
    return null
  }
}

/**
 * Get course average rating and count
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Average rating and count
 */
export async function getCourseRating(courseId) {
  if (!courseId) {
    throw new Error('Course ID is required')
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('course_id', courseId)
      .eq('is_published', true)

    if (error) {
      console.error('Error fetching course ratings:', error)
      throw new Error(`Failed to fetch course ratings: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0
      }
    }

    const totalRatings = data.length
    const sumRatings = data.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = sumRatings / totalRatings

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings
    }
  } catch (error) {
    console.error('Error in getCourseRating:', error)
    return {
      averageRating: 0,
      totalRatings: 0
    }
  }
}
