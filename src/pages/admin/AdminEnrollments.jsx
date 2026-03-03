import { useState, useEffect } from 'react'
import { fetchCourseEnrollments, sendBulkEmailToStudents, updateEnrollmentStatus } from '../../services/adminService'
import DataTable from '../../components/admin/DataTable'
import './AdminEnrollments.css'

function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState('')

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

  // Get unique courses for filter
  const getUniqueCourses = () => {
    const courses = new Map()
    enrollments.forEach(enrollment => {
      if (enrollment.course_id && enrollment.course_title) {
        courses.set(enrollment.course_id, enrollment.course_title)
      }
    })
    return Array.from(courses.entries()).map(([id, title]) => ({
      value: title,
      label: title
    }))
  }

  // Get unique statuses for filter
  const getUniqueStatuses = () => {
    const statuses = new Set()
    enrollments.forEach(enrollment => {
      if (enrollment.status) {
        statuses.add(enrollment.status)
      }
    })
    return Array.from(statuses).sort().map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1)
    }))
  }

  const filters = [
    {
      key: 'course_title',
      label: 'Course',
      options: getUniqueCourses()
    },
    {
      key: 'status',
      label: 'Status',
      options: getUniqueStatuses()
    }
  ]

  const handleEmailAllStudents = (courseTitle) => {
    setSelectedCourse(courseTitle)
    setEmailModalOpen(true)
    setEmailSuccess('')
  }

  const sendEmailToAllStudents = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      alert('Please fill in both subject and message')
      return
    }

    setSendingEmail(true)
    setEmailSuccess('')
    
    try {
      // Get all students enrolled in the selected course
      const courseEnrollments = enrollments.filter(e => e.course_title === selectedCourse)
      const studentEmails = courseEnrollments
        .map(e => e.student_email)
        .filter(email => email && email.trim())
      
      if (studentEmails.length === 0) {
        alert('No valid email addresses found for students in this course')
        setSendingEmail(false)
        return
      }

      // Get course ID from first enrollment
      const courseId = courseEnrollments[0]?.course_id || ''

      const result = await sendBulkEmailToStudents({
        subject: emailSubject,
        message: emailMessage,
        courseTitle: selectedCourse,
        courseId: courseId,
        recipientEmails: studentEmails,
        senderName: 'UniqueBrains Admin'
      })
      
      setEmailSuccess(`Successfully sent email to ${result.emailsSent || studentEmails.length} students!`)
      setEmailSubject('')
      setEmailMessage('')
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setEmailModalOpen(false)
        setEmailSuccess('')
      }, 2000)
    } catch (err) {
      console.error('Error sending emails:', err)
      alert('Failed to send emails. Please try again.')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleStatusChange = async (enrollment) => {
    const newStatus = prompt(
      `Change status for ${enrollment.student_name}?\nCurrent: ${enrollment.status}\n\nEnter new status (active, completed, dropped, pending):`,
      enrollment.status
    )
    
    if (newStatus && ['active', 'completed', 'dropped', 'pending'].includes(newStatus.toLowerCase())) {
      try {
        await updateEnrollmentStatus(enrollment.id, newStatus.toLowerCase())
        await loadEnrollments()
      } catch (err) {
        console.error('Error updating status:', err)
        alert('Failed to update enrollment status')
      }
    } else if (newStatus) {
      alert('Invalid status. Please use: active, completed, dropped, or pending')
    }
  }

  const columns = [
    { 
      key: 'student_name', 
      label: 'Student',
      render: (value, row) => (
        <div className="student-info-cell">
          <span className="student-name">{value}</span>
          <span className="student-email">{row.student_email}</span>
        </div>
      )
    },
    { key: 'course_title', label: 'Course' },
    { key: 'instructor_name', label: 'Instructor' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge status-${value}`}>
          {value}
        </span>
      )
    },
    { 
      key: 'neurodiversity_profile', 
      label: 'Neurodiversity',
      render: (value) => (
        <div className="tags-cell">
          {value && value.length > 0 ? (
            value.slice(0, 2).map((item, index) => (
              <span key={index} className="neurodiversity-tag">
                {item}
              </span>
            ))
          ) : (
            <span className="no-data">-</span>
          )}
          {value && value.length > 2 && (
            <span className="more-tag">+{value.length - 2}</span>
          )}
        </div>
      )
    },
    { 
      key: 'interests', 
      label: 'Interests',
      render: (value) => (
        <div className="tags-cell">
          {value && value.length > 0 ? (
            value.slice(0, 2).map((item, index) => (
              <span key={index} className="interest-tag">
                {item}
              </span>
            ))
          ) : (
            <span className="no-data">-</span>
          )}
          {value && value.length > 2 && (
            <span className="more-tag">+{value.length - 2}</span>
          )}
        </div>
      )
    },
    { 
      key: 'created_at', 
      label: 'Enrolled',
      render: (value) => new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  ]

  // Get unique courses for email buttons
  const uniqueCourses = [...new Set(enrollments.map(e => e.course_title))].filter(Boolean)

  return (
    <div className="admin-enrollments">
      <div className="page-header">
        <div className="header-content">
          <h1>Course Enrollments</h1>
          <p>View students enrolled in each course and their neurodiversity needs</p>
        </div>
      </div>

      {/* Email All Students Section */}
      {uniqueCourses.length > 0 && (
        <div className="email-actions-section">
          <h3>📧 Email Students by Course</h3>
          <div className="email-buttons">
            {uniqueCourses.map(courseTitle => {
              const courseEnrollments = enrollments.filter(e => e.course_title === courseTitle)
              const studentCount = courseEnrollments.length
              return (
                <button
                  key={courseTitle}
                  className="email-course-btn"
                  onClick={() => handleEmailAllStudents(courseTitle)}
                >
                  <span className="course-name">{courseTitle}</span>
                  <span className="student-count">{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <DataTable
        columns={columns}
        data={enrollments}
        onEdit={handleStatusChange}
        loading={loading}
        filters={filters}
      />

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="modal-overlay" onClick={() => setEmailModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📧 Email All Students</h2>
              <button className="close-btn" onClick={() => setEmailModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {emailSuccess ? (
                <div className="success-message">
                  <span className="success-icon">✓</span>
                  {emailSuccess}
                </div>
              ) : (
                <>
                  <div className="modal-info">
                    <strong>Course:</strong> {selectedCourse}<br />
                    <strong>Recipients:</strong> {enrollments.filter(e => e.course_title === selectedCourse && e.student_email).length} students
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email-subject">Subject</label>
                    <input
                      id="email-subject"
                      type="text"
                      className="form-input"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject"
                      disabled={sendingEmail}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email-message">Message</label>
                    <textarea
                      id="email-message"
                      className="form-textarea"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Enter your message to students..."
                      rows="8"
                      disabled={sendingEmail}
                    />
                  </div>
                </>
              )}
            </div>
            {!emailSuccess && (
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEnrollments