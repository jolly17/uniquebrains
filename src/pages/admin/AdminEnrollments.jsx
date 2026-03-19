import { useState, useEffect } from 'react'
import { fetchCourseEnrollments, sendBulkEmailToStudents, updateEnrollmentStatus } from '../../services/adminService'
import DataTable from '../../components/admin/DataTable'
import './AdminEnrollments.css'

function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  
  // Status change modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

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

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
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
    setError('')
  }

  const sendEmailToAllStudents = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      setError('Please fill in both subject and message')
      return
    }

    setSendingEmail(true)
    setError('')
    
    try {
      // Get all students enrolled in the selected course
      const courseEnrollments = enrollments.filter(e => e.course_title === selectedCourse)
      const studentEmails = courseEnrollments
        .map(e => e.student_email)
        .filter(email => email && email.trim())
      
      if (studentEmails.length === 0) {
        setError('No valid email addresses found for students in this course')
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
      
      showSuccess(`Successfully sent email to ${result.emailsSent || studentEmails.length} students!`)
      setEmailSubject('')
      setEmailMessage('')
      
      // Close modal after brief delay
      setTimeout(() => {
        setEmailModalOpen(false)
      }, 1500)
    } catch (err) {
      console.error('Error sending emails:', err)
      setError('Failed to send emails. Please try again.')
    } finally {
      setSendingEmail(false)
    }
  }

  // Open status change modal
  const handleStatusChange = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setNewStatus(enrollment.status || 'active')
    setStatusModalOpen(true)
    setError('')
  }

  // Confirm status change
  const confirmStatusChange = async () => {
    if (!selectedEnrollment || !newStatus) return
    
    // Don't update if status hasn't changed
    if (newStatus === selectedEnrollment.status) {
      setStatusModalOpen(false)
      setSelectedEnrollment(null)
      return
    }

    try {
      setUpdatingStatus(true)
      setError('')
      await updateEnrollmentStatus(selectedEnrollment.id, newStatus)
      await loadEnrollments()
      setStatusModalOpen(false)
      setSelectedEnrollment(null)
      showSuccess(`Enrollment status updated to "${newStatus}" successfully!`)
    } catch (err) {
      console.error('Error updating status:', err)
      setError('Failed to update enrollment status. Please try again.')
    } finally {
      setUpdatingStatus(false)
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

      {successMessage && (
        <div className="success-banner">
          <span className="success-icon-badge">✓</span>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button className="dismiss-btn" onClick={() => setError('')}>×</button>
        </div>
      )}

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

      <DataTable
        columns={columns}
        data={enrollments}
        onEdit={handleStatusChange}
        loading={loading}
        filters={filters}
      />

      {/* Status Change Modal */}
      {statusModalOpen && selectedEnrollment && (
        <div className="modal-overlay" onClick={() => !updatingStatus && setStatusModalOpen(false)}>
          <div className="modal-content status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Enrollment Status</h2>
              <button 
                className="close-btn" 
                onClick={() => setStatusModalOpen(false)}
                disabled={updatingStatus}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <strong>Student:</strong> {selectedEnrollment.student_name}<br />
                <strong>Course:</strong> {selectedEnrollment.course_title}<br />
                <strong>Current Status:</strong>{' '}
                <span className={`status-badge status-${selectedEnrollment.status}`}>
                  {selectedEnrollment.status}
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="enrollment-status">New Status</label>
                <div className="status-options">
                  {['active', 'completed', 'dropped', 'pending'].map(status => (
                    <label 
                      key={status} 
                      className={`status-option ${newStatus === status ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="enrollment-status"
                        value={status}
                        checked={newStatus === status}
                        onChange={(e) => setNewStatus(e.target.value)}
                        disabled={updatingStatus}
                      />
                      <span className={`status-badge status-${status}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span className="status-description">
                        {status === 'active' && 'Student is actively enrolled'}
                        {status === 'completed' && 'Student has completed the course'}
                        {status === 'dropped' && 'Student has dropped the course'}
                        {status === 'pending' && 'Enrollment is pending approval'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setStatusModalOpen(false)}
                disabled={updatingStatus}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={confirmStatusChange}
                disabled={updatingStatus || newStatus === selectedEnrollment.status}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="modal-overlay" onClick={() => !sendingEmail && setEmailModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📧 Email All Students</h2>
              <button 
                className="close-btn" 
                onClick={() => setEmailModalOpen(false)}
                disabled={sendingEmail}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
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
                disabled={sendingEmail || !emailSubject.trim() || !emailMessage.trim()}
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
