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
          <h2>Support Our Mission 🚀</h2>
          <p>
            Help us bring free, quality education to families. Your support makes a difference!
          </p>
          <div className="support-buttons">
            <a
              href="https://www.gofundme.com/f/help-me-support-autism-awareness-and-families-with-genai"
              target="_blank"
              rel="noopener noreferrer"
              className="support-btn donation-btn"
            >
              💚 Make a Donation
            </a>
            <a
              href="https://wa.me/447417364089?text=I'm%20interested%20in%20becoming%20an%20instructor"
              target="_blank"
              rel="noopener noreferrer"
              className="support-btn volunteer-btn"
            >
              🎓 Volunteer as Instructor
            </a>
            <a
              href="https://wa.me/?text=Check%20out%20UniqueBrains%20-%20Free%20courses%20for%20neurodivergent%20kids!%20https://uniquebrains.org"
              target="_blank"
              rel="noopener noreferrer"
              className="support-btn spread-btn"
            >
              📢 Spread the Word
            </a>
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