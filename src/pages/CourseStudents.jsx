import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import './CourseStudents.css'

function CourseStudents({ course }) {
  const { courseId } = useParams()
  const { user } = useAuth()
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isGroupCourse = course?.course_type === 'group'

  useEffect(() => {
    if (courseId && user) {
      fetchEnrolledStudents()
    }
  }, [courseId, user])

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch enrolled students
      const enrollmentsData = await handleApiCall(api.enrollments.getCourse, courseId, user.id)
      
      // Extract student profiles from enrollments
      // Handle both direct enrollments (profiles) and parent-managed enrollments (students)
      const students = enrollmentsData.map(enrollment => {
        let studentData = {}
        
        if (enrollment.student_profile_id && enrollment.students) {
          // Parent-managed enrollment - use student profile data from students table
          studentData = {
            id: enrollment.students.id,
            first_name: enrollment.students.first_name,
            last_name: enrollment.students.last_name,
            neurodiversity_profile: enrollment.students.neurodiversity_profile || [],
            date_of_birth: enrollment.students.date_of_birth
          }
        } else if (enrollment.student_id && enrollment.profiles) {
          // Direct enrollment - use profile data
          studentData = {
            id: enrollment.profiles.id,
            first_name: enrollment.profiles.first_name,
            last_name: enrollment.profiles.last_name,
            full_name: enrollment.profiles.full_name,
            neurodiversity_profile: enrollment.profiles.neurodiversity_profile || [],
            avatar_url: enrollment.profiles.avatar_url
          }
        }
        
        // Add enrollment info
        return {
          ...studentData,
          enrollmentId: enrollment.id,
          enrolledAt: enrollment.enrolled_at,
          status: enrollment.status
        }
      }).filter(student => student.id) // Filter out any null/undefined students

      setEnrolledStudents(students)
    } catch (err) {
      console.error('Error fetching enrolled students:', err)
      setError('Failed to load enrolled students')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveStudent = async (student) => {
    const studentName = `${student.first_name} ${student.last_name}`
    
    if (!confirm(`Are you sure you want to remove ${studentName} from this course? This action cannot be undone.`)) {
      return
    }

    try {
      // Use the withdraw API to update enrollment status
      await handleApiCall(api.enrollments.withdraw, courseId, student.id)
      
      // Remove from local state
      setEnrolledStudents(enrolledStudents.filter(s => s.id !== student.id))
      
      alert(`${studentName} has been removed from the course.`)
    } catch (err) {
      console.error('Error removing student:', err)
      alert('Failed to remove student. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="course-students">
        <div className="loading-state" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading students...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="course-students">
        <div className="error-state" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>{error}</p>
          <button onClick={fetchEnrolledStudents} className="btn-primary" style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const enrolledCount = enrolledStudents.length
  const maxCapacity = course?.enrollment_limit || 0
  const spotsRemaining = maxCapacity > 0 ? Math.max(0, maxCapacity - enrolledCount) : '∞'

  return (
    <div className="course-students">
      {isGroupCourse && (
        <div className="course-stats-grid">
          <div className="stat-card">
            <div className="stat-value">{enrolledCount}</div>
            <div className="stat-label">Enrolled Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{spotsRemaining}</div>
            <div className="stat-label">Spots Remaining</div>
          </div>
        </div>
      )}

      <div className="students-section">
        <div className="students-header">
          <h2>{isGroupCourse ? '👥 Enrolled Students' : '👤 Individual Students'}</h2>
          <div className="info-banner">
            <p>ℹ️ {isGroupCourse 
              ? 'All students attend the same group sessions together'
              : 'Each student has their own schedule and individual sessions'
            }</p>
          </div>
        </div>

        {enrolledStudents.length > 0 ? (
          <div className="students-list">
            {enrolledStudents.map(student => (
              <div key={student.id} className="student-card">
                <div className="student-info">
                  <div className="student-name">
                    👤 {student.first_name} {student.last_name}
                  </div>
                  
                  {student.neurodiversity_profile && student.neurodiversity_profile.length > 0 && (
                    <div className="student-profile">
                      {student.neurodiversity_profile.map((need, idx) => (
                        <span key={idx} className="profile-badge">🧩 {need}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="student-meta">
                    <span className="enrolled-date">
                      Enrolled: {new Date(student.enrolledAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="student-actions">
                  <button 
                    onClick={() => handleRemoveStudent(student)}
                    className="btn-secondary btn-sm remove-btn"
                  >
                    Remove from Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No students enrolled yet. Share your course link to get students!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseStudents
