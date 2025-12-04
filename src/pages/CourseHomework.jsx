import { useState } from 'react'
import './CourseHomework.css'

function CourseHomework({ course }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewingSubmissions, setViewingSubmissions] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    submissionType: 'text'
  })
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    dueDate: ''
  })

  // Mock homework assignments
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Practice Scales',
      dueDate: '2024-01-20',
      submissionType: 'file',
      submitted: 6,
      total: 8,
      pendingReviews: 2
    },
    {
      id: 2,
      title: 'Music Theory Quiz',
      dueDate: '2024-01-25',
      submissionType: 'text',
      submitted: 3,
      total: 8,
      pendingReviews: 0
    }
  ])

  // Mock submissions
  const mockSubmissions = {
    1: [
      {
        id: 1,
        studentId: '1',
        studentName: 'Emma Thompson',
        submittedAt: '2024-01-18 3:45 PM',
        content: 'scales-practice.mp3',
        contentType: 'file',
        feedback: ''
      },
      {
        id: 2,
        studentId: '2',
        studentName: 'Liam Chen',
        submittedAt: null,
        content: null,
        contentType: 'file',
        feedback: ''
      }
    ]
  }

  const [submissions, setSubmissions] = useState(mockSubmissions)
  const [feedbackInputs, setFeedbackInputs] = useState({})
  const [savingFeedback, setSavingFeedback] = useState(null)
  const [feedbackSaved, setFeedbackSaved] = useState(null)

  const validateForm = () => {
    const errors = {
      title: '',
      description: '',
      dueDate: ''
    }
    let isValid = true

    if (!formData.title.trim()) {
      errors.title = 'Please enter a title for this assignment'
      isValid = false
    }

    if (!formData.description.trim()) {
      errors.description = 'Please enter a description for this assignment'
      isValid = false
    }

    if (!formData.dueDate) {
      errors.dueDate = 'Please select a due date for this assignment'
      isValid = false
    } else {
      // Check if due date is in the past
      const selectedDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        errors.dueDate = 'Due date cannot be in the past'
        isValid = false
      }
    }

    setFormErrors(errors)
    return isValid
  }

  const handleCreateAssignment = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const newAssignment = {
      id: assignments.length + 1,
      ...formData,
      submitted: 0,
      total: 8,
      pendingReviews: 0
    }
    setAssignments([...assignments, newAssignment])
    
    // Trigger student notification (in real app, this would be a backend call)
    console.log(`📧 Notification sent to all students: New homework assignment "${formData.title}" created`)
    
    setShowCreateModal(false)
    setFormData({ title: '', description: '', dueDate: '', submissionType: 'text' })
    setFormErrors({ title: '', description: '', dueDate: '' })
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setFormData({ title: '', description: '', dueDate: '', submissionType: 'text' })
    setFormErrors({ title: '', description: '', dueDate: '' })
  }

  const handleSaveFeedback = async (submissionId, studentName) => {
    const feedback = feedbackInputs[submissionId] || ''
    
    if (!feedback.trim()) {
      alert('Please enter feedback before saving.')
      return
    }

    setSavingFeedback(submissionId)
    
    // Simulate API call
    setTimeout(() => {
      // Update the submission with the feedback
      setSubmissions(prevSubmissions => {
        const updatedSubmissions = { ...prevSubmissions }
        const assignmentSubmissions = updatedSubmissions[viewingSubmissions]
        if (assignmentSubmissions) {
          const submissionIndex = assignmentSubmissions.findIndex(s => s.id === submissionId)
          if (submissionIndex !== -1) {
            assignmentSubmissions[submissionIndex] = {
              ...assignmentSubmissions[submissionIndex],
              feedback: feedback,
              feedbackAt: new Date().toISOString()
            }
          }
        }
        return updatedSubmissions
      })

      // Clear the input and show confirmation
      setFeedbackInputs({ ...feedbackInputs, [submissionId]: '' })
      setSavingFeedback(null)
      setFeedbackSaved(submissionId)
      
      // Trigger student notification (in real app, this would be a backend call)
      console.log(`📧 Notification sent to ${studentName}: New feedback on homework submission`)
      
      // Hide confirmation after 3 seconds
      setTimeout(() => {
        setFeedbackSaved(null)
      }, 3000)
    }, 500)
  }

  const handleDeleteAssignment = (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(a => a.id !== assignmentId))
    }
  }

  if (viewingSubmissions) {
    const assignment = assignments.find(a => a.id === viewingSubmissions)
    const assignmentSubmissions = submissions[viewingSubmissions] || []

    return (
      <div className="course-homework">
        <button onClick={() => setViewingSubmissions(null)} className="back-button">
          ← Back to Homework
        </button>

        <div className="submissions-header">
          <h2>{assignment.title} - Submissions</h2>
          <p className="due-date">Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}</p>
        </div>

        <div className="submissions-list">
          {assignmentSubmissions.map(submission => (
            <div key={submission.id} className="submission-card">
              <div className="submission-header">
                <div className="student-name">👤 {submission.studentName}</div>
                {submission.submittedAt ? (
                  <div className="submitted-date">
                    Submitted: {submission.submittedAt}
                  </div>
                ) : (
                  <div className="not-submitted">⚠️ Not submitted yet</div>
                )}
              </div>

              {submission.submittedAt ? (
                <>
                  <div className="submission-content">
                    {submission.contentType === 'file' ? (
                      <div className="file-submission">
                        🎵 {submission.content}
                        <button className="btn-secondary btn-sm">Download</button>
                      </div>
                    ) : (
                      <div className="text-submission">{submission.content}</div>
                    )}
                  </div>

                  <div className="feedback-section">
                    <label>Your Feedback:</label>
                    <textarea
                      value={feedbackInputs[submission.id] !== undefined 
                        ? feedbackInputs[submission.id] 
                        : submission.feedback}
                      onChange={(e) => setFeedbackInputs({
                        ...feedbackInputs,
                        [submission.id]: e.target.value
                      })}
                      placeholder="Write your feedback here..."
                      rows="3"
                      disabled={savingFeedback === submission.id}
                    />
                    <div className="feedback-actions">
                      <button 
                        onClick={() => handleSaveFeedback(submission.id, submission.studentName)}
                        className="btn-primary btn-sm"
                        disabled={savingFeedback === submission.id}
                      >
                        {savingFeedback === submission.id ? 'Saving...' : 'Save Feedback'}
                      </button>
                      {feedbackSaved === submission.id && (
                        <div className="feedback-confirmation">
                          ✅ Feedback saved! Student has been notified.
                        </div>
                      )}
                    </div>
                    {submission.feedback && submission.feedbackAt && (
                      <div className="feedback-info">
                        <small>Last updated: {new Date(submission.feedbackAt).toLocaleString()}</small>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button className="btn-secondary btn-sm">Send Reminder</button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="course-homework">
      <div className="homework-header">
        <h2>📝 Homework Assignments</h2>
        <div className="info-banner">
          <p>ℹ️ Create assignments and review student submissions</p>
        </div>
      </div>

      <button onClick={() => setShowCreateModal(true)} className="btn-primary">
        + Create New Assignment
      </button>

      <div className="assignments-list">
        {assignments.map(assignment => (
          <div key={assignment.id} className="assignment-card">
            <div className="assignment-info">
              <h3>{assignment.title}</h3>
              <div className="assignment-meta">
                <span>Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
                <span>Type: {assignment.submissionType === 'file' ? 'File Upload' : 
                       assignment.submissionType === 'text' ? 'Text Response' : 'Checkmark'}</span>
              </div>
              <div className="assignment-stats">
                <span className="stat">📊 {assignment.submitted}/{assignment.total} students submitted</span>
                {assignment.pendingReviews > 0 ? (
                  <span className="stat pending">⚠️ {assignment.pendingReviews} pending reviews</span>
                ) : (
                  <span className="stat complete">✅ All reviewed</span>
                )}
              </div>
            </div>
            <div className="assignment-actions">
              <button 
                onClick={() => setViewingSubmissions(assignment.id)}
                className="btn-primary btn-sm"
              >
                View Submissions
              </button>
              <button className="btn-secondary btn-sm">Edit</button>
              <button 
                onClick={() => handleDeleteAssignment(assignment.id)}
                className="btn-secondary btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Homework Assignment</h2>
            <form onSubmit={handleCreateAssignment}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value })
                    if (formErrors.title) {
                      setFormErrors({ ...formErrors, title: '' })
                    }
                  }}
                  placeholder="e.g., Practice Scales"
                  className={formErrors.title ? 'error' : ''}
                />
                {formErrors.title && (
                  <div className="error-message">{formErrors.title}</div>
                )}
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value })
                    if (formErrors.description) {
                      setFormErrors({ ...formErrors, description: '' })
                    }
                  }}
                  rows="3"
                  placeholder="Describe what students need to do..."
                  className={formErrors.description ? 'error' : ''}
                />
                {formErrors.description && (
                  <div className="error-message">{formErrors.description}</div>
                )}
              </div>

              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => {
                    setFormData({ ...formData, dueDate: e.target.value })
                    if (formErrors.dueDate) {
                      setFormErrors({ ...formErrors, dueDate: '' })
                    }
                  }}
                  className={formErrors.dueDate ? 'error' : ''}
                />
                {formErrors.dueDate && (
                  <div className="error-message">{formErrors.dueDate}</div>
                )}
              </div>

              <div className="form-group">
                <label>Submission Type *</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="text"
                      checked={formData.submissionType === 'text'}
                      onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
                    />
                    Text Response
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="file"
                      checked={formData.submissionType === 'file'}
                      onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
                    />
                    File Upload
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="checkmark"
                      checked={formData.submissionType === 'checkmark'}
                      onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
                    />
                    Checkmark Only
                  </label>
                </div>
              </div>

              <div className="info-banner">
                <p>ℹ️ Students will be notified when you create this assignment</p>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseHomework
