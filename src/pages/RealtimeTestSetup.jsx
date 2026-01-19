import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

/**
 * Helper page to set up test data for realtime testing
 */
function RealtimeTestSetup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      // Load user's enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id)

      if (enrollmentsError) throw enrollmentsError
      setEnrollments(enrollmentsData?.map(e => e.course_id) || [])

    } catch (error) {
      console.error('Error loading data:', error)
      setMessage('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const createTestCourse = async () => {
    try {
      setCreating(true)
      setMessage('')

      const testCourse = {
        instructor_id: user.id,
        title: 'Realtime Test Course',
        description: 'A test course for testing realtime features',
        category: 'test',
        course_type: 'group',
        price: 0,
        is_published: true,
        max_students: 10,
        difficulty_level: 'beginner'
      }

      const { data, error } = await supabase
        .from('courses')
        .insert([testCourse])
        .select()
        .single()

      if (error) throw error

      setMessage(`✅ Test course created! ID: ${data.id}`)
      await loadData()
      
      // Auto-navigate to test page after 2 seconds
      setTimeout(() => {
        navigate(`/realtime-test?courseId=${data.id}`)
      }, 2000)

    } catch (error) {
      console.error('Error creating course:', error)
      setMessage('❌ Error: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const enrollInCourse = async (courseId) => {
    try {
      setEnrolling(true)
      setMessage('')

      console.log('Attempting to enroll:', { courseId, userId: user.id })

      // Check if already enrolled
      const { data: existing, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('student_id', user.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking enrollment:', checkError)
      }

      if (existing) {
        setMessage('✅ Already enrolled! You can test now.')
        await loadData()
        return
      }

      // Try to enroll - use 'status' not 'enrollment_status'
      const { data, error } = await supabase
        .from('enrollments')
        .insert([{
          course_id: courseId,
          student_id: user.id,
          status: 'active'
        }])
        .select()

      console.log('Enrollment result:', { data, error })

      if (error) {
        // Provide more helpful error messages
        if (error.code === '23505') {
          setMessage('✅ Already enrolled! You can test now.')
        } else if (error.code === '42501') {
          setMessage('❌ Permission denied. Check RLS policies on enrollments table.')
        } else if (error.code === '23503') {
          setMessage('❌ Course not found or invalid user ID.')
        } else {
          throw error
        }
      } else {
        setMessage(`✅ Enrolled successfully! You can now test with ID: ${courseId}`)
      }

      await loadData()

    } catch (error) {
      console.error('Error enrolling:', error)
      setMessage(`❌ Error: ${error.message}\n\nCheck browser console for details.`)
    } finally {
      setEnrolling(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setMessage(`✅ Copied to clipboard: ${text}`)
    setTimeout(() => setMessage(''), 3000)
  }

  const goToTest = (courseId) => {
    navigate(`/realtime-test?courseId=${courseId}`)
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>🔒 Please sign in</h1>
        <p>You need to be signed in to set up test data.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>🧪 Realtime Test Setup</h1>
      <p>Set up test data to test realtime features</p>

      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: message.includes('❌') ? '#fee' : '#efe',
          border: `2px solid ${message.includes('❌') ? '#fcc' : '#cfc'}`,
          borderRadius: '8px'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h2>Current User</h2>
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Option 1: Create Test Course</h2>
        <p>Create a new test course that you'll automatically have access to.</p>
        <button
          onClick={createTestCourse}
          disabled={creating}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: creating ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {creating ? 'Creating...' : '✨ Create Test Course'}
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Option 2: Use Existing Course</h2>
        <p>Select a course from the list below:</p>

        {courses.length === 0 ? (
          <p>No courses found. Create a test course above!</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {courses.map(course => {
              const isInstructor = course.instructor_id === user.id
              const isEnrolled = enrollments.includes(course.id)
              const hasAccess = isInstructor || isEnrolled

              return (
                <div
                  key={course.id}
                  style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{course.title}</h3>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                      {course.description?.substring(0, 100)}...
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'monospace', color: '#999' }}>
                      ID: {course.id}
                    </p>
                    <div style={{ marginTop: '0.5rem' }}>
                      {isInstructor && (
                        <span style={{
                          background: '#667eea',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          marginRight: '0.5rem'
                        }}>
                          👨‍🏫 You're the instructor
                        </span>
                      )}
                      {isEnrolled && (
                        <span style={{
                          background: '#28a745',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          marginRight: '0.5rem'
                        }}>
                          ✅ Enrolled
                        </span>
                      )}
                      {!hasAccess && (
                        <span style={{
                          background: '#ffc107',
                          color: '#333',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem'
                        }}>
                          ⚠️ No access
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    {hasAccess ? (
                      <>
                        <button
                          onClick={() => goToTest(course.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          🚀 Test Now
                        </button>
                        <button
                          onClick={() => copyToClipboard(course.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          📋 Copy ID
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => enrollInCourse(course.id)}
                        disabled={enrolling}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: enrolling ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        {enrolling ? 'Enrolling...' : '📝 Enroll'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>💡 Quick Tips</h3>
        <ul>
          <li>You need to be either the instructor OR enrolled in a course to send messages</li>
          <li>Create a test course if you don't have any courses yet</li>
          <li>Enroll in an existing course to test as a student</li>
          <li>Open the test page in two windows with different users for best results</li>
        </ul>
      </div>
    </div>
  )
}

export default RealtimeTestSetup
