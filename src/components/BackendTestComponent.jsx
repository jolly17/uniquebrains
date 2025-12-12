import { useState } from 'react'
import { api, handleApiCall } from '../services/api'
import { useAuth } from '../context/AuthContext'

/**
 * Backend Test Component
 * Add this to your app temporarily to test the backend integration
 * Usage: <BackendTestComponent />
 */
function BackendTestComponent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  const addResult = (test, result) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toLocaleTimeString() }])
  }

  const runAllTests = async () => {
    if (!user) {
      setError('Please log in as an instructor first')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      // Test 1: Create a course
      addResult('Creating course...', 'Starting')
      const courseData = {
        title: 'Backend Test Course',
        description: 'This course tests the backend integration',
        category: 'parenting',
        courseType: 'group',
        sessionDuration: 60,
        enrollmentLimit: 10,
        isSelfPaced: false,
        startDate: '2024-02-01',
        sessionTime: '10:00',
        selectedDays: ['Monday', 'Wednesday'],
        hasEndDate: true,
        endDate: '2024-04-01'
      }

      const courseResult = await handleApiCall(api.courses.create, courseData, user)
      addResult('Course Creation', `✅ Success: ${courseResult.course.title}`)
      const courseId = courseResult.course.id

      // Test 2: Create homework
      addResult('Creating homework...', 'Starting')
      const homeworkData = {
        title: 'Test Assignment',
        description: 'This is a test assignment',
        due_date: '2024-02-08T23:59:59Z',
        points: 100,
        submission_type: 'text',
        is_published: true
      }

      const homeworkResult = await handleApiCall(api.homework.create, courseId, homeworkData, user.id)
      addResult('Homework Creation', `✅ Success: ${homeworkResult.title}`)

      // Test 3: Create resource
      addResult('Creating resource...', 'Starting')
      const resourceData = {
        title: 'Test Resource',
        description: 'This is a test resource',
        resource_type: 'link',
        link_url: 'https://example.com/test.pdf'
      }

      const resourceResult = await handleApiCall(api.resources.create, courseId, resourceData, user.id)
      addResult('Resource Creation', `✅ Success: ${resourceResult.title}`)

      // Test 4: Send message
      addResult('Sending message...', 'Starting')
      const messageData = {
        content: 'This is a test message from the backend integration test.',
        is_announcement: false
      }

      const messageResult = await handleApiCall(api.messages.send, courseId, messageData, user.id)
      addResult('Message Sending', `✅ Success: Message sent`)

      // Test 5: Get instructor courses
      addResult('Fetching courses...', 'Starting')
      const courses = await handleApiCall(api.courses.getInstructorCourses, user.id)
      addResult('Fetch Courses', `✅ Success: Found ${courses.length} courses`)

      // Test 6: Get course stats
      addResult('Getting statistics...', 'Starting')
      const stats = await handleApiCall(api.courses.getStats, user.id)
      addResult('Course Statistics', `✅ Success: ${stats.totalCourses} total courses`)

      addResult('All Tests', '🎉 All tests completed successfully!')

    } catch (error) {
      console.error('Test failed:', error)
      setError(error.message)
      addResult('Test Failed', `❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
    setError('')
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', border: '2px solid #f59e0b', borderRadius: '0.5rem', margin: '1rem' }}>
        <h3>Backend Integration Test</h3>
        <p>Please log in as an instructor to test the backend integration.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', border: '2px solid #3b82f6', borderRadius: '0.5rem', margin: '1rem' }}>
      <h3>🧪 Backend Integration Test</h3>
      <p>User: {user.email} (Role: {user.user_metadata?.role || 'Unknown'})</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={runAllTests} 
          disabled={loading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: loading ? '#9ca3af' : '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.5rem',
            marginRight: '0.5rem'
          }}
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        <button 
          onClick={clearResults}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#6b7280', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.5rem'
          }}
        >
          Clear Results
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

      {results.length > 0 && (
        <div style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '0.5rem', 
          padding: '1rem',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <h4>Test Results:</h4>
          {results.map((result, index) => (
            <div key={index} style={{ 
              padding: '0.5rem', 
              borderBottom: '1px solid #e2e8f0',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}>
              <span style={{ color: '#6b7280' }}>[{result.timestamp}]</span>{' '}
              <strong>{result.test}:</strong> {result.result}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #bae6fd', 
        borderRadius: '0.5rem',
        fontSize: '0.875rem'
      }}>
        <h4>What this test does:</h4>
        <ul>
          <li>✅ Creates a test course with sessions</li>
          <li>✅ Creates a homework assignment</li>
          <li>✅ Creates a course resource</li>
          <li>✅ Sends a test message</li>
          <li>✅ Fetches instructor courses</li>
          <li>✅ Gets course statistics</li>
        </ul>
        <p><strong>Note:</strong> This creates real data in your database. You may want to delete the test course afterward.</p>
      </div>
    </div>
  )
}

export default BackendTestComponent