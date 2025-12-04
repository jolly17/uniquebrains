import { useState } from 'react'
import './HomeworkSubmissionModal.css'

function HomeworkSubmissionModal({ homework, onClose, onSubmit }) {
  const [textResponse, setTextResponse] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async () => {
    // Validate submission based on type
    if (homework.submissionType === 'text' && !textResponse.trim()) {
      alert('Please enter your response before submitting')
      return
    }

    if (homework.submissionType === 'file' && !selectedFile) {
      alert('Please select a file to upload')
      return
    }

    setIsSubmitting(true)

    // Simulate submission delay
    setTimeout(() => {
      const submission = {
        homeworkId: homework.id,
        submittedAt: new Date().toISOString(),
        content: homework.submissionType === 'text' ? textResponse : selectedFile?.name || 'Completed',
        feedback: null,
        feedbackAt: null
      }

      onSubmit(submission)
      setIsSubmitting(false)
      setShowConfirmation(true)

      // Close modal after showing confirmation
      setTimeout(() => {
        onClose()
      }, 1500)
    }, 500)
  }

  if (showConfirmation) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content confirmation" onClick={(e) => e.stopPropagation()}>
          <div className="confirmation-icon">✓</div>
          <h2>Homework Submitted!</h2>
          <p>Your instructor will review it soon.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Submit Homework</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <h3>{homework.title}</h3>
          <p className="homework-description">{homework.description}</p>
          
          <div className="submission-info">
            <span>📅 Due: {new Date(homework.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>📎 Type: {homework.submissionType === 'text' ? 'Text Response' : homework.submissionType === 'file' ? 'File Upload' : 'Checkmark Only'}</span>
          </div>

          <div className="submission-area">
            {homework.submissionType === 'text' && (
              <div className="form-group">
                <label htmlFor="text-response">Your Response *</label>
                <textarea
                  id="text-response"
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Type your response here..."
                  rows="8"
                  className="text-input"
                />
              </div>
            )}

            {homework.submissionType === 'file' && (
              <div className="form-group">
                <label htmlFor="file-upload">Upload File *</label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {selectedFile && (
                  <p className="file-selected">Selected: {selectedFile.name}</p>
                )}
              </div>
            )}

            {homework.submissionType === 'checkmark' && (
              <div className="checkmark-info">
                <p>✓ Click submit to mark this assignment as complete</p>
              </div>
            )}
          </div>

          <div className="info-banner">
            <span className="info-icon">ℹ️</span>
            <p>Your instructor will be notified when you submit this homework</p>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Homework'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeworkSubmissionModal
