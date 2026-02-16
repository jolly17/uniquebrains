import { useState, useEffect } from 'react'
import { fetchCourseEnrollments } from '../../services/adminService'
import './AdminEnrollments.css'

function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [expandedStudent, setExpandedStudent] = useState(null)

  useEffect(() => {
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      setLoading(true)
      const data = await fetchCourseEnrollments()
      setEnrollments(data)
      setError('')
    } catch (err) {
      console.error('Error loading enrollments:', err)
      setError('Failed to load enrollments')
    } finally {
      setLoading(false)
    }
  }

  const groupedByCourse = enrollments.reduce((acc, enrollment) => {
    const courseId = enrollment.course_id
    if (!acc[courseId]) {
      acc[courseId] = {
        course_title: enrollment.course_title,
        instructor_name: enrollment.instructor_name,
        students: []
      }
    }
    acc[courseId].students.push(enrollment)
    return acc
  }, {})

  const toggleStudentDetails = (studentId) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId)
  }

  if (loading) {
    return (
      <div className="admin-enrollments">
        <div className="page-header">
          <h1>Course Enrollments</h1>
          <p>View students enrolled in each course and their neurodiversity needs</p>
        </div>
        <div className="loading-state">Loading enrollments...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-enrollments">
        <div className="page-header">
          <h1>Course Enrollments</h1>
          <p>View students enrolled in each course and their neurodiversity needs</p>
        </div>
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="admin-enrollments">
      <div className="page-header">
        <h1>Course Enrollments</h1>
        <p>View students enrolled in each course and their neurodiversity needs</p>
      </div>

      {Object.keys(groupedByCourse).length === 0 ? (
        <div className="empty-state">
          <p>No enrollments found</p>
        </div>
      ) : (
        <div className="courses-list">
          {Object.entries(groupedByCourse).map(([courseId, courseData]) => (
            <div key={courseId} className="course-card">
              <div 
                className="course-header"
                onClick={() => setSelectedCourse(selectedCourse === courseId ? null : courseId)}
              >
                <div className="course-info">
                  <h2>{courseData.course_title}</h2>
                  <p className="instructor-name">Instructor: {courseData.instructor_name}</p>
                  <p className="enrollment-count">
                    {courseData.students.length} student{courseData.students.length !== 1 ? 's' : ''} enrolled
                  </p>
                </div>
                <button className="toggle-btn">
                  {selectedCourse === courseId ? '▼' : '▶'}
                </button>
              </div>

              {selectedCourse === courseId && (
                <div className="students-list">
                  {courseData.students.map((enrollment) => (
                    <div key={enrollment.id} className="student-card">
                      <div 
                        className="student-header"
                        onClick={() => toggleStudentDetails(enrollment.student_id)}
                      >
                        <div className="student-basic-info">
                          <h3>{enrollment.student_name}</h3>
                          <p className="student-email">{enrollment.student_email}</p>
                          <div className="student-meta">
                            <span className={`status-badge status-${enrollment.status}`}>
                              {enrollment.status}
                            </span>
                            <span className="enrollment-date">
                              Enrolled: {new Date(enrollment.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <button className="details-toggle">
                          {expandedStudent === enrollment.student_id ? 'Hide Details' : 'Show Details'}
                        </button>
                      </div>

                      {expandedStudent === enrollment.student_id && (
                        <div className="student-details">
                          <div className="detail-section">
                            <h4>Neurodiversity Profile</h4>
                            <div className="neurodiversity-tags">
                              {enrollment.neurodiversity_profile && enrollment.neurodiversity_profile.length > 0 ? (
                                enrollment.neurodiversity_profile.map((item, index) => (
                                  <span key={index} className="neurodiversity-tag">
                                    {item}
                                  </span>
                                ))
                              ) : (
                                <p className="no-data">None specified</p>
                              )}
                            </div>
                          </div>

                          {enrollment.other_needs && (
                            <div className="detail-section">
                              <h4>Additional Needs & Accommodations</h4>
                              <p className="other-needs">{enrollment.other_needs}</p>
                            </div>
                          )}

                          {enrollment.interests && enrollment.interests.length > 0 && (
                            <div className="detail-section">
                              <h4>Interests</h4>
                              <div className="interests-tags">
                                {enrollment.interests.map((interest, index) => (
                                  <span key={index} className="interest-tag">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="detail-section">
                            <h4>Student Information</h4>
                            <div className="info-grid">
                              {enrollment.age && (
                                <div className="info-item">
                                  <span className="info-label">Age:</span>
                                  <span className="info-value">{enrollment.age}</span>
                                </div>
                              )}
                              {enrollment.grade_level && (
                                <div className="info-item">
                                  <span className="info-label">Grade Level:</span>
                                  <span className="info-value">{enrollment.grade_level}</span>
                                </div>
                              )}
                              <div className="info-item">
                                <span className="info-label">Enrolled:</span>
                                <span className="info-value">
                                  {new Date(enrollment.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminEnrollments
