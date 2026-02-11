import './FeedbackButton.css'

function FeedbackButton() {
  const handleFeedbackClick = () => {
    window.open('https://forms.gle/jm5Ud8fjJgoFuC4r5', '_blank', 'noopener,noreferrer')
  }

  return (
    <button 
      className="feedback-button"
      onClick={handleFeedbackClick}
      aria-label="Share your feedback"
      title="We'd love to hear from you!"
    >
      <span className="feedback-icon">💬</span>
      <span className="feedback-text">Feedback</span>
    </button>
  )
}

export default FeedbackButton
