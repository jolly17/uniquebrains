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

  const handleCreateAssignment = (e) => {
    e.preventDefault()
    const newAssignment = {
      id: assignments.length + 1,
      ...formData,
      submitted: 0,
      total: 8,
      pendingReviews: 0
    }
    setAssignments([...assignments, newAssignment])
    setShowCreateModal(false)
    setFormData({ title: '', description: '', dueDate: '', submissionType: 'text' })
  }

  const handleSaveFeedback = (submissionId) => {
    const feedback = feedbackInputs[submissionId] || ''
    // In real app, save to backend
    alert(`Feedback saved: "${feedback}"\n\nStudent will be notified.`)
    setFeedbackInputs({ ...feedbackInputs, [submissionId]: '' })
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
                      value={feedbackInputs[submission.id] || submission.feedback}
                      onChange={(e) => setFeedbackInputs({
                        ...feedbackInputs,
                        [submission.id]: e.target.value
                      })}
                      placeholder="Write your feedback here..."
                      rows="3"
                    />
                    <button 
                      onClick={() => handleSaveFeedback(submission.id)}
                      className="btn-primary btn-sm"
                    >
                      Save Feedback
                    </button>
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
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Homework Assignment</h2>
            <form onSubmit={handleCreateAssignment}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Practice Scales"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="3"
                  placeholder="Describe what students need to do..."
                />
              </div>

              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
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
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
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
