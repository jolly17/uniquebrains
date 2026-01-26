import { useState, useEffect } from 'react'
import './StudentHomework.css'

function StudentHomework({ courseId, userId }) {
  const [homework, setHomework] = useState([])
  const [submissions, setSubmissions] = useState({})

  useEffect(() => {
    loadHomework()
    loadSubmissions()
  }, [courseId, userId])

  const loadHomework = () => {
    const storedHomework = JSON.parse(localStorage.getItem(`homework_${courseId}`) || '[]')
    setHomework(storedHomework)
  }

  const loadSubmissions = () => {
    const storedSubmissions = JSON.parse(localStorage.getItem(`submissions_${courseId}_${userId}`) || '{}')
    setSubmissions(storedSubmissions)
  }

  const getSubmission = (homeworkId) => {
    return submissions[homeworkId]
  }

  const getDaysRemaining = (dueDate) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const todoHomework = homework.filter(hw => !getSubmission(hw.id))
  const completedHomework = homework.filter(hw => getSubmission(hw.id))

  return (
    <div className="student-homework">
      <h2>📝 Your Homework</h2>
      <div className="info-banner">
        <span className="info-icon">ℹ️</span>
        <p>Complete assignments and submit them before the due date</p>
      </div>

      {/* To Do Section */}
      <div className="homework-section">
        <h3 className="section-title">⚠️ To Do ({todoHomework.length})</h3>
        {todoHomework.length > 0 ? (
          <div className="homework-list">
            {todoHomework.map(hw => {
              const daysRemaining = getDaysRemaining(hw.dueDate)
              const isOverdue = daysRemaining < 0
              const isDueSoon = daysRemaining >= 0 && daysRemaining <= 2

              return (
                <div key={hw.id} className={`homework-card ${isOverdue ? 'overdue' : ''}`}>
                  <div className="homework-header">
                    <h4>{hw.title}</h4>
                    <span className={`due-badge ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}`}>
                      {isOverdue 
                        ? `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''}`
                        : `Due: ${new Date(hw.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left)`
                      }
                    </span>
                  </div>
                  <p className="homework-description">{hw.description}</p>
                  <div className="homework-meta">
                    <span>📎 Type: {hw.submissionType === 'text' ? 'Text Response' : hw.submissionType === 'file' ? 'File Upload' : 'Checkmark Only'}</span>
                  </div>
                  <button 
                    className="btn-primary submit-btn"
                    onClick={() => {
                      // This will be handled by parent component
                      const event = new CustomEvent('openSubmissionModal', { 
                        detail: { homework: hw } 
                      })
                      window.dispatchEvent(event)
                    }}
                  >
                    Submit Homework
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="empty-state">No pending homework assignments</p>
        )}
      </div>

      {/* Completed Section */}
      <div className="homework-section">
        <h3 className="section-title">✅ Completed ({completedHomework.length})</h3>
        {completedHomework.length > 0 ? (
          <div className="homework-list">
            {completedHomework.map(hw => {
              const submission = getSubmission(hw.id)
              
              return (
                <div key={hw.id} className="homework-card completed">
                  <div className="homework-header">
                    <h4>✓ {hw.title}</h4>
                    <span className="submitted-badge">
                      Submitted: {new Date(submission.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {submission.feedback && (
                    <div className="feedback-section">
                      <p className="feedback-label">Instructor Feedback:</p>
                      <p className="feedback-text">{submission.feedback}</p>
                    </div>
                  )}
                  {!submission.feedback && (
                    <p className="pending-feedback">Waiting for instructor feedback...</p>
                  )}
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      const event = new CustomEvent('viewSubmissionDetails', { 
                        detail: { homework: hw, submission } 
                      })
                      window.dispatchEvent(event)
                    }}
                  >
                    View Details
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="empty-state">No completed homework yet</p>
        )}
      </div>
    </div>
  )
}

export default StudentHomework
