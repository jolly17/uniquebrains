/**
 * Main API Service - Unified interface for all backend operations
 * Exports all service functions in organized modules
 */

// Import all service modules
import * as courseService from './courseService'
import * as sessionService from './sessionService'
import * as homeworkService from './homeworkService'
import * as resourceService from './resourceService'
import * as messageService from './messageService'
import * as enrollmentService from './enrollmentService'
import * as ratingService from './ratingService'
import * as profileService from './profileService'

/**
 * Course Management API
 * Functions for creating, updating, and managing courses
 */
export const courses = {
  // Course CRUD operations
  create: courseService.createCourse,
  getAll: courseService.getAllPublishedCourses,
  getById: courseService.getCourseById,
  getInstructorCourses: courseService.getInstructorCourses,
  update: courseService.updateCourse,
  delete: courseService.deleteCourse,
  
  // Course publishing
  publish: courseService.publishCourse,
  unpublish: courseService.unpublishCourse,
  
  // Statistics
  getStats: courseService.getCourseStats
}

/**
 * Session Management API
 * Functions for managing course sessions and meeting links
 */
export const sessions = {
  // Session CRUD operations
  create: sessionService.createSession,
  getCourse: sessionService.getCourseSessions,
  update: sessionService.updateSession,
  delete: sessionService.deleteSession,
  
  // Meeting management
  updateMeeting: sessionService.updateSessionMeeting,
  
  // Instructor utilities
  getUpcoming: sessionService.getUpcomingSessions
}

/**
 * Homework Management API
 * Functions for assignments, submissions, and grading
 */
export const homework = {
  // Homework CRUD operations
  create: homeworkService.createHomework,
  getCourse: homeworkService.getCourseHomework,
  update: homeworkService.updateHomework,
  delete: homeworkService.deleteHomework,
  
  // Submission management
  submit: homeworkService.submitHomework,
  getSubmissions: homeworkService.getHomeworkSubmissions,
  grade: homeworkService.gradeSubmission,
  
  // Student utilities
  getStudentSubmissions: homeworkService.getStudentSubmissions
}

/**
 * Resource Management API
 * Functions for course materials and file management
 */
export const resources = {
  // Resource CRUD operations
  create: resourceService.createResource,
  getCourse: resourceService.getCourseResources,
  update: resourceService.updateResource,
  delete: resourceService.deleteResource,
  
  // File management
  uploadFile: resourceService.uploadResourceFile,
  trackAccess: resourceService.trackResourceAccess,
  
  // Statistics
  getStats: resourceService.getResourceStats
}

/**
 * Messaging API
 * Functions for course chat and communication
 */
export const messages = {
  // Message operations
  send: messageService.sendMessage,
  getCourse: messageService.getCourseMessages,
  getConversation: messageService.getConversation,
  delete: messageService.deleteMessage,
  
  // One-on-one messaging
  getThreads: messageService.getConversationThreads,
  markAsRead: messageService.markMessagesAsRead,
  
  // Statistics
  getStats: messageService.getMessageStats
}

/**
 * Enrollment Management API
 * Functions for student enrollments and progress tracking
 */
export const enrollments = {
  // Enrollment operations
  enroll: enrollmentService.enrollStudent,
  withdraw: enrollmentService.withdrawStudent,
  update: enrollmentService.updateEnrollment,
  check: enrollmentService.checkEnrollment,
  
  // Data retrieval
  getStudent: enrollmentService.getStudentEnrollments,
  getCourse: enrollmentService.getCourseEnrollments,
  
  // Statistics
  getStats: enrollmentService.getEnrollmentStats,
  getCompletionRate: enrollmentService.getCourseCompletionRate
}

/**
 * Rating Management API
 * Functions for course ratings
 */
export const ratings = {
  // Rating operations
  submit: ratingService.submitRating,
  getStudent: ratingService.getStudentRating,
  getCourse: ratingService.getCourseRating
}

/**
 * Profile Management API
 * Functions for user profiles
 */
export const profiles = {
  // Profile operations
  getById: profileService.getProfileById,
  getInstructors: profileService.getAllInstructors,
  update: profileService.updateProfile
}

/**
 * Unified API object for easy importing
 * Usage: import { api } from './services/api'
 * Then: api.courses.create(courseData, user)
 */
export const api = {
  courses,
  sessions,
  homework,
  resources,
  messages,
  enrollments,
  ratings
}

/**
 * Error handling utilities
 */
export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', details = null) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
  }
}

/**
 * Common error handler for API calls
 * @param {Function} apiCall - The API function to call
 * @param {...any} args - Arguments to pass to the API function
 * @returns {Promise} - The API call result or throws formatted error
 */
export async function handleApiCall(apiCall, ...args) {
  try {
    return await apiCall(...args)
  } catch (error) {
    console.error('API call failed:', error)
    
    // Re-throw as ApiError with consistent format
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError(
      error.message || 'An unexpected error occurred',
      error.code || 'UNKNOWN_ERROR',
      error
    )
  }
}

/**
 * Validation utilities
 */
export const validators = {
  /**
   * Validate required fields in an object
   * @param {Object} data - Data to validate
   * @param {Array} requiredFields - Array of required field names
   * @throws {ApiError} If validation fails
   */
  requireFields(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field])
    if (missing.length > 0) {
      throw new ApiError(
        `Missing required fields: ${missing.join(', ')}`,
        'VALIDATION_ERROR',
        { missingFields: missing }
      )
    }
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Valid status
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} - Valid status
   */
  isValidUrl(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  /**
   * Validate date format and ensure it's in the future
   * @param {string} dateString - Date string to validate
   * @returns {boolean} - Valid status
   */
  isValidFutureDate(dateString) {
    try {
      const date = new Date(dateString)
      return date > new Date()
    } catch {
      return false
    }
  }
}

/**
 * Default export for convenience
 */
export default api