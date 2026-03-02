/**
 * Shared Constants
 * Consolidates duplicate constant definitions used across the application
 */

/**
 * Course Categories
 * Used in: Courses.jsx, CreateCourse.jsx, EditCourse.jsx
 */
export const COURSE_CATEGORIES = [
  { value: 'all', label: 'All', icon: '🌟' },
  { value: 'performing-arts', label: 'Performing Arts', icon: '🎭' },
  { value: 'visual-arts', label: 'Visual Arts', icon: '🎨' },
  { value: 'parenting', label: 'Parenting', icon: '👨‍👩‍👧‍👦' },
  { value: 'academics', label: 'Academics', icon: '📚' },
  { value: 'language', label: 'Language', icon: '🌍' },
  { value: 'spirituality', label: 'Spirituality', icon: '🧘' },
  { value: 'lifeskills', label: 'Life Skills', icon: '🐷' },
  { value: 'hobbies', label: 'Hobbies & Fun', icon: '🎮' }
]

/**
 * Course categories without 'all' option (for forms)
 */
export const COURSE_CATEGORY_OPTIONS = COURSE_CATEGORIES.filter(c => c.value !== 'all')

/**
 * Age Groups
 * Used in: CreateCourse.jsx, EditCourse.jsx, course filters
 */
export const AGE_GROUPS = [
  { value: 'All ages', label: 'All ages', icon: '👥' },
  { value: '5-8 years', label: '5-8 years', icon: '🧒' },
  { value: '9-12 years', label: '9-12 years', icon: '👦' },
  { value: '13-18 years', label: '13-18 years', icon: '🧑' },
  { value: 'Adults', label: 'Adults', icon: '👨' }
]

/**
 * Timezones
 * Used in: CreateCourse.jsx, EditCourse.jsx, ManageSessions.jsx
 */
export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' }
]

/**
 * Session Durations (in minutes)
 * Used in: CreateCourse.jsx, EditCourse.jsx
 */
export const SESSION_DURATIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' }
]

/**
 * Course Frequencies
 * Used in: CreateCourse.jsx, EditCourse.jsx
 */
export const COURSE_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly (Every 2 weeks)' },
  { value: 'never', label: 'Never (One-time event)' }
]

/**
 * Days of the Week
 * Used in: CreateCourse.jsx, EditCourse.jsx, schedule components
 */
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

/**
 * Neurodiversity Profiles
 * Used in: Onboarding.jsx, StudentProfile.jsx, filters
 */
export const NEURODIVERSITY_PROFILES = [
  { value: 'autism', label: 'Autism Spectrum', icon: '🧩' },
  { value: 'adhd', label: 'ADHD', icon: '⚡' },
  { value: 'dyslexia', label: 'Dyslexia', icon: '📖' },
  { value: 'dyspraxia', label: 'Dyspraxia', icon: '🎯' },
  { value: 'dyscalculia', label: 'Dyscalculia', icon: '🔢' },
  { value: 'tourette', label: "Tourette's Syndrome", icon: '💫' },
  { value: 'ocd', label: 'OCD', icon: '🔄' },
  { value: 'anxiety', label: 'Anxiety', icon: '💭' },
  { value: 'sensory', label: 'Sensory Processing', icon: '👂' },
  { value: 'other', label: 'Other', icon: '✨' }
]

/**
 * User Roles
 * Used in: AuthContext, admin pages, role-based access
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
  PARENT: 'parent'
}

/**
 * Enrollment Statuses
 * Used in: enrollmentService, admin pages
 */
export const ENROLLMENT_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  PENDING: 'pending'
}

/**
 * Course Types
 * Used in: CreateCourse.jsx, course filters
 */
export const COURSE_TYPES = {
  GROUP: 'group',
  ONE_ON_ONE: 'one-on-one'
}

/**
 * Submission Types for Homework
 * Used in: homeworkService, homework components
 */
export const SUBMISSION_TYPES = {
  TEXT: 'text',
  FILE: 'file',
  CHECKMARK: 'checkmark'
}

/**
 * Resource Types
 * Used in: resourceService, resource components
 */
export const RESOURCE_TYPES = {
  FILE: 'file',
  LINK: 'link'
}

/**
 * Maximum file size for uploads (in bytes)
 * 100MB = 100 * 1024 * 1024
 */
export const MAX_FILE_SIZE = 100 * 1024 * 1024

/**
 * Maximum message length for chat
 */
export const MAX_MESSAGE_LENGTH = 2000

/**
 * Default pagination limits
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MESSAGES_LIMIT: 50,
  COURSES_LIMIT: 12
}