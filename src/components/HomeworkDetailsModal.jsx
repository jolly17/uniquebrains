import './HomeworkDetailsModal.css'

function HomeworkDetailsModal({ homework, submission, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Homework Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <h3>{homework.title}</h3>
          <p className="homework-description">{homework.description}</p>

          <div className="details-section">
            <h4>Submission Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Due Date:</span>
                <span className="info-value">
                  {new Date(homework.dueDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Submitted:</span>
                <span className="info-value">
                  {new Date(submission.submittedAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">
                  {homework.submissionType === 'text' 
                    ? 'Text Response' 
                    : homework.submissionType === 'file' 
                      ? 'File Upload' 
                      : 'Checkmark Only'}
                </span>
              </div>
            </div>
          </div>

          {homework.submissionType === 'text' && submission.content && (
            <div className="details-section">
              <h4>Your Response</h4>
              <div className="response-content">
                {submission.content}
              </div>
            </div>
          )}

          {homework.submissionType === 'file' && submission.content && (
            <div className="details-section">
              <h4>Submitted File</h4>
              <div className="file-info">
                <span className="file-icon">📎</span>
                <span className="file-name">{submission.content}</span>
              </div>
            </div>
          )}

          {submission.feedback ? (
            <div className="details-section feedback-section">
              <h4>Instructor Feedback</h4>
              <div className="feedback-content">
                <p>{submission.feedback}</p>
                {submission.feedbackAt && (
                  <p className="feedback-date">
                    Received: {new Date(submission.feedbackAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="details-section">
              <div className="pending-feedback-box">
                <span className="pending-icon">⏳</span>
                <p>Waiting for instructor feedback...</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeworkDetailsModal
