import { useState } from 'react'
import { api, handleApiCall } from '../services/api'
import { useAuth } from '../context/AuthContext'

/**
 * Backend Integration Example Component
 * Demonstrates how to use the new backend API services
 * This is for reference and testing - not part of the main UI
 */
function BackendIntegrationExample() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Example: Create a course
  const handleCreateCourse = async () => {
    if (!user) {
      setError('Please log in first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const courseData = {
        title: 'Test Course',
        description: 'This is a test course created via the API',
        category: 'parenting',
        courseType: 'group',
        sessionDuration: 60,
        enrollmentLimit: 10,
        isSelfPaced: false,
        startDate: '2024-01-15',
        sessionTime: '10:00',
        selectedDays: ['Monday', 'Wednesday'],
        hasEndDate: true,
        endDate: '2024-03-15'
      }

      const result = await handleApiCall(api.courses.create, courseData, user)
      setResult({ type: 'Course Created', data: result })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Example: Create homework assignment
  const handleCreateHomework = async () => {
    if (!user) {
      setError('Please log in first')
      return
    }

    // You would get courseId from props or state in a real component
    const courseId = 'your-course-id-here'
    
    setLoading(true)
    setError('')

    try {
      const homeworkData = {
        title: 'Week 1 Assignment',
        description: 'Complete the reading and answer the questions',
        due_date: '2024-01-22T23:59:59Z',
        points: 100,
        submission_type: 'text',
        is_published: true
      }

      const result = await handleApiCall(api.homework.create, courseId, homeworkData, user.id)
      setResult({ type: 'Homework Created', data: result })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Example: Send a message
  const handleSendMessage = async () => {
    if (!user) {
      setError('Please log in first')
      return
    }

    // You would get courseId from props or state in a real component
    const courseId = 'your-course-id-here'
    
    setLoading(true)
    setError('')

    try {
      const messageData = {
        content: 'Hello everyone! Welcome to the course.',
        is_announcement: false
      }

      const result = await handleApiCall(api.messages.send, courseId, messageData, user.id)
      setResult({ type: 'Message Sent', data: result })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Example: Upload a resource
  const handleUploadResource = async () => {
    if (!user) {
      setError('Please log in first')
      return
    }

    // You would get courseId from props or state in a real component
    const courseId = 'your-course-id-here'
    
    setLoading(true)
    setError('')

    try {
      // Create a mock file for demonstration
      const resourceData = {
        title: 'Course Syllabus',
        description: 'Complete course syllabus and schedule',
        resource_type: 'link',
        link_url: 'https://example.com/syllabus.pdf'
      }

      const result = await handleApiCall(api.resources.create, courseId, resourceData, user.id)
      setResult({ type: 'Resource Created', data: result })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Example: Get course statistics
  const handleGetStats = async () => {
    if (!user) {
      setError('Please log in first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const stats = await handleApiCall(api.courses.getStats, user.id)
      setResult({ type: 'Course Statistics', data: stats })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Backend Integration Examples</h2>
      <p>This component demonstrates how to use the new backend API services.</p>
      
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={handleCreateCourse} 
          disabled={loading}
          style={{ padding: '0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem' }}
        >
          {loading ? 'Creating...' : 'Create Test Course'}
        </button>
        
        <button 
          onClick={handleCreateHomework} 
          disabled={loading}
          style={{ padding: '0.75rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem' }}
        >
          {loading ? 'Creating...' : 'Create Test Homework'}
        </button>
        
        <button 
          onClick={handleSendMessage} 
          disabled={loading}
          style={{ padding: '0.75rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem' }}
        >
          {loading ? 'Sending...' : 'Send Test Message'}
        </button>
        
        <button 
          onClick={handleUploadResource} 
          disabled={loading}
          style={{ padding: '0.75rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem' }}
        >
          {loading ? 'Creating...' : 'Create Test Resource'}
        </button>
        
        <button 
          onClick={handleGetStats} 
          disabled={loading}
          style={{ padding: '0.75rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem' }}
        >
          {loading ? 'Loading...' : 'Get Course Statistics'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee2e2', 
          border: '1px solid #fecaca', 
          borderRadius: '0.5rem', 
          color: '#dc2626',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#0369a1' }}>{result.type}</h3>
          <pre style={{ 
            backgroundColor: '#f8fafc', 
            padding: '1rem', 
            borderRadius: '0.25rem', 
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f9fafb', 
        border: '1px solid #e5e7eb', 
        borderRadius: '0.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>API Usage Examples</h3>
        <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
          <p><strong>Course Management:</strong></p>
          <code>api.courses.create(courseData, user)</code><br/>
          <code>api.courses.getInstructorCourses(instructorId)</code><br/>
          <code>api.courses.publish(courseId, instructorId)</code><br/>
          
          <p style={{ marginTop: '1rem' }}><strong>Homework Management:</strong></p>
          <code>api.homework.create(courseId, homeworkData, instructorId)</code><br/>
          <code>api.homework.submit(homeworkId, submissionData, studentId)</code><br/>
          <code>api.homework.grade(submissionId, gradeData, instructorId)</code><br/>
          
          <p style={{ marginTop: '1rem' }}><strong>Resource Management:</strong></p>
          <code>api.resources.create(courseId, resourceData, instructorId)</code><br/>
          <code>api.resources.uploadFile(file, courseId, instructorId)</code><br/>
          
          <p style={{ marginTop: '1rem' }}><strong>Messaging:</strong></p>
          <code>api.messages.send(courseId, messageData, senderId)</code><br/>
          <code>api.messages.getCourse(courseId, userId)</code><br/>
          
          <p style={{ marginTop: '1rem' }}><strong>Enrollments:</strong></p>
          <code>api.enrollments.enroll(courseId, studentId)</code><br/>
          <code>api.enrollments.getCourse(courseId, instructorId)</code><br/>
        </div>
      </div>
    </div>
  )
}

export default BackendIntegrationExample