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
          <div className="space-y-4">
            <a
              href="https://www.gofundme.com/f/help-me-support-autism-awareness-and-families-with-genai"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              💚 Make a Donation
            </a>
            <a
              href="https://wa.me/447417364089?text=I'm%20interested%20in%20becoming%20an%20instructor"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
            >
              🎓 Volunteer as Instructor
            </a>
            <a
              href="https://wa.me/?text=Check%20out%20UniqueBrains%20-%20Free%20courses%20for%20neurodivergent%20kids!%20https://uniquebrains.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
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