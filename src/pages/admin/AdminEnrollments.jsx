import { useState, useEffect } from 'react'
import { fetchCourseEnrollments } from '../../services/adminService'
import './AdminEnrollments.css'

function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedCourses, setExpandedCourses] = useState({})
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

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

  const handleEmailAllStudents = (courseId) => {
    setSelectedCourse(courseId)
    setEmailModalOpen(true)
  }

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }))
  }

  const sendEmailToAllStudents = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      alert('Please fill in both subject and message')
      return
    }

    setSendingEmail(true)
    try {
      const courseData = groupedByCourse[selectedCourse]
      const studentEmails = courseData.students.map(s => s.student_email).filter(Boolean)
      
      // Here you would call your email service
      // For now, we'll just log it
      console.log('Sending email to:', studentEmails)
      console.log('Subject:', emailSubject)
      console.log('Message:', emailMessage)
      
      alert(`Email would be sent to ${studentEmails.length} students`)
      
      setEmailModalOpen(false)
      setEmailSubject('')
      setEmailMessage('')
    } catch (err) {
      console.error('Error sending emails:', err)
      alert('Failed to send emails')
    } finally {
      setSendingEmail(false)
    }
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
            <div key={courseId} className="course-section">
              <div 
                className="course-header"
                onClick={() => toggleCourse(courseId)}
              >
                <div className="course-info">
                  <h2>{courseData.course_title}</h2>
                  <p className="instructor-name">Instructor: {courseData.instructor_name}</p>
                  <p className="enrollment-count">
                    {courseData.students.length} student{courseData.students.length !== 1 ? 's' : ''} enrolled
                  </p>
                </div>
                <div className="course-actions">
                  <button 
                    className="email-all-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEmailAllStudents(courseId)
                    }}
                  >
                    📧 Email All Students
                  </button>
                  <button className="toggle-btn">
                    {expandedCourses[courseId] ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {expandedCourses[courseId] && (
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Age</th>
                        <th>Grade</th>
                        <th>Neurodiversity Profile</th>
                        <th>Interests</th>
                        <th>Enrolled Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseData.students.map((enrollment) => (
                        <tr key={enrollment.id}>
                          <td className="student-name">{enrollment.student_name}</td>
                          <td className="student-email">{enrollment.student_email}</td>
                          <td>
                            <span className={`status-badge status-${enrollment.status}`}>
                              {enrollment.status}
                            </span>
                          </td>
                          <td>{enrollment.age || '-'}</td>
                          <td>{enrollment.grade_level || '-'}</td>
                          <td>
                            <div className="neurodiversity-cell">
                              {enrollment.neurodiversity_profile && enrollment.neurodiversity_profile.length > 0 ? (
                                enrollment.neurodiversity_profile.map((item, index) => (
                                  <span key={index} className="neurodiversity-tag-small">
                                    {item}
                                  </span>
                                ))
                              ) : (
                                <span className="no-data">-</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="interests-cell">
                              {enrollment.interests && enrollment.interests.length > 0 ? (
                                enrollment.interests.slice(0, 2).map((interest, index) => (
                                  <span key={index} className="interest-tag-small">
                                    {interest}
                                  </span>
                                ))
                              ) : (
                                <span className="no-data">-</span>
                              )}
                              {enrollment.interests && enrollment.interests.length > 2 && (
                                <span className="more-tag">+{enrollment.interests.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="enrollment-date">
                            {new Date(enrollment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="modal-overlay" onClick={() => setEmailModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Email All Students</h2>
              <button className="close-btn" onClick={() => setEmailModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-info">
                Sending to {groupedByCourse[selectedCourse]?.students.length} students in{' '}
                <strong>{groupedByCourse[selectedCourse]?.course_title}</strong>
              </p>
              
              <div className="form-group">
                <label htmlFor="email-subject">Subject</label>
                <input
                  id="email-subject"
                  type="text"
                  className="form-input"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email-message">Message</label>
                <textarea
                  id="email-message"
                  className="form-textarea"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter your message to students"
                  rows="8"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setEmailModalOpen(false)}
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={sendEmailToAllStudents}
                disabled={sendingEmail}
              >
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEnrollments
