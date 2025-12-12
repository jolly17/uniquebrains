/**
 * Backend Integration Test Script
 * Run this in your browser console or as a Node.js script to test the API
 */

// Test data for course creation
const testCourseData = {
  title: 'Test Course - Backend Integration',
  description: 'This is a test course to verify the backend integration is working correctly.',
  category: 'parenting',
  courseType: 'group',
  sessionDuration: 60,
  enrollmentLimit: 15,
  isSelfPaced: false,
  // Schedule data for session creation
  startDate: '2024-02-01',
  sessionTime: '10:00',
  selectedDays: ['Monday', 'Wednesday'],
  hasEndDate: true,
  endDate: '2024-04-01'
}

// Test homework data
const testHomeworkData = {
  title: 'Week 1 Assignment',
  description: 'Complete the reading and answer the reflection questions.',
  due_date: '2024-02-08T23:59:59Z',
  points: 100,
  submission_type: 'text',
  is_published: true
}

// Test resource data
const testResourceData = {
  title: 'Course Syllabus',
  description: 'Complete course outline and schedule',
  resource_type: 'link',
  link_url: 'https://example.com/syllabus.pdf'
}

// Test message data
const testMessageData = {
  content: 'Welcome to the course! Please introduce yourselves.',
  is_announcement: false
}

console.log('🧪 Backend Integration Test Data Ready')
console.log('📋 Test Course Data:', testCourseData)
console.log('📝 Test Homework Data:', testHomeworkData)
console.log('📚 Test Resource Data:', testResourceData)
console.log('💬 Test Message Data:', testMessageData)

console.log(`
🚀 To test the backend integration:

1. Open your browser console on your app
2. Make sure you're logged in as an instructor
3. Run these commands one by one:

// Import the API
import { api, handleApiCall } from './src/services/api.js'

// Test course creation
const courseResult = await handleApiCall(api.courses.create, testCourseData, user)
console.log('✅ Course created:', courseResult)

// Save the course ID for other tests
const courseId = courseResult.course.id

// Test homework creation
const homeworkResult = await handleApiCall(api.homework.create, courseId, testHomeworkData, user.id)
console.log('✅ Homework created:', homeworkResult)

// Test resource creation
const resourceResult = await handleApiCall(api.resources.create, courseId, testResourceData, user.id)
console.log('✅ Resource created:', resourceResult)

// Test message sending
const messageResult = await handleApiCall(api.messages.send, courseId, testMessageData, user.id)
console.log('✅ Message sent:', messageResult)

// Test getting instructor courses
const courses = await handleApiCall(api.courses.getInstructorCourses, user.id)
console.log('✅ Instructor courses:', courses)

// Test getting course stats
const stats = await handleApiCall(api.courses.getStats, user.id)
console.log('✅ Course statistics:', stats)

console.log('🎉 All tests completed successfully!')
`)

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testCourseData,
    testHomeworkData,
    testResourceData,
    testMessageData
  }
}