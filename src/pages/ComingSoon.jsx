import { Link } from 'react-router-dom'
import './ComingSoon.css'

function ComingSoon() {
  return (
    <div className="coming-soon">
      <div className="coming-soon-content">
        <div className="coming-soon-icon">🚀</div>
        <h1>Coming Soon!</h1>
        <p className="coming-soon-subtitle">
          We're working hard to bring you an amazing learning marketplace for neurodivergent children.
        </p>
        
        <div className="progress-section">
          <h2>What We're Building</h2>
          <div className="features-list">
            <div className="feature-item">
              <span className="check">✅</span>
              <span>Beautiful, accessible platform design</span>
            </div>
            <div className="feature-item">
              <span className="check">✅</span>
              <span>Neurodiversity-first user experience</span>
            </div>
            <div className="feature-item">
              <span className="progress-icon">🔨</span>
              <span>Course marketplace with specialized instructors</span>
            </div>
            <div className="feature-item">
              <span className="progress-icon">🔨</span>
              <span>Student and instructor dashboards</span>
            </div>
            <div className="feature-item">
              <span className="progress-icon">🔨</span>
              <span>Interactive learning tools and resources</span>
            </div>
            <div className="feature-item">
              <span className="progress-icon">🔨</span>
              <span>Communication features for students and teachers</span>
            </div>
          </div>
        </div>

        <div className="support-box">
          <h2>Help Us Launch Faster! 🚀</h2>
          <p>
            Your donation helps us accelerate development and bring this free platform to 
            neurodivergent children sooner. Every contribution makes a difference!
          </p>
          <a 
            href="https://www.gofundme.com/f/help-me-support-autism-awareness-and-families-with-genai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-donate-large"
          >
            Support Development ❤️
          </a>
        </div>

        <div className="notify-section">
          <h3>Want to be notified when we launch?</h3>
          <p>Follow our progress and be the first to know when UniqueBrains goes live!</p>
          <div className="notify-actions">
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>

        <div className="timeline">
          <p className="timeline-text">
            <strong>Estimated Launch:</strong> We're aiming to launch in early 2025. 
            With your support, we can make it happen even sooner!
          </p>
        </div>
      </div>
    </div>
  )
}

export default ComingSoon
