import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './LandingPage.css'

function LandingPage() {
  const { user } = useAuth()
  const [donationLink, setDonationLink] = useState('https://www.gofundme.com/f/help-me-support-autism-awareness-and-families-with-genai')

  useEffect(() => {
    // Detect user's country based on timezone or use a geolocation API
    const detectCountry = async () => {
      try {
        // Try to detect India based on timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const isIndia = timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')
        
        if (isIndia) {
          setDonationLink('https://milaap.org/fundraisers/support-autistic-kids-1')
        } else {
          // Optionally, use a geolocation API for more accurate detection
          try {
            const response = await fetch('https://ipapi.co/json/')
            const data = await response.json()
            if (data.country_code === 'IN') {
              setDonationLink('https://milaap.org/fundraisers/support-autistic-kids-1')
            }
          } catch (error) {
            // If API fails, keep default GoFundMe link
            console.log('Geolocation detection failed, using default link')
          }
        }
      } catch (error) {
        console.log('Country detection failed, using default link')
      }
    }

    detectCountry()
  }, [])

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">UniqueBrains</span>
          </h1>
          <p className="hero-tagline">Where every brain learns differently</p>
          <p className="hero-description">
            A free learning marketplace connecting neurodivergent children with specialized instructors 
            who understand and celebrate their unique learning styles.
          </p>
          <div className="hero-actions">
            <Link to="/marketplace" className="btn-primary-large">
              Explore Courses
            </Link>
            <Link 
              to={user ? "/teach/create-course" : "/register?role=instructor"} 
              className="btn-primary-large"
            >
              Start Teaching
            </Link>
          </div>
        </div>
      </section>

      <section className="mission">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            UniqueBrains is a <strong>100% free platform</strong> dedicated to making quality education 
            accessible to neurodivergent children. We believe that every child deserves to learn in a way 
            that honors their unique brain, without financial barriers.
          </p>
        </div>
      </section>

      <section className="features">
        <h2>What Makes Us Different</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧩</div>
            <h3>Neurodiversity-First Design</h3>
            <p>
              Built from the ground up with neurodivergent learners in mind. Clear interfaces, 
              consistent patterns, and supportive guidance at every step.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3>Specialized Instructors</h3>
            <p>
              Connect with educators trained in neurodiversity-affirming practices who understand 
              ADHD, Autism, Dyslexia, and other learning differences.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Diverse Learning Paths</h3>
            <p>
              From music and art to coding and science, explore courses designed for different 
              learning styles and interests.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💝</div>
            <h3>Always Free</h3>
            <p>
              No subscriptions, no hidden fees. Quality education for neurodivergent children 
              should never be behind a paywall.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Flexible Scheduling</h3>
            <p>
              Choose between group classes or one-on-one sessions. Learn at your own pace, 
              on your own schedule.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>Celebrate Differences</h3>
            <p>
              We don't try to "fix" anyone. We celebrate neurodiversity and help every child 
              discover their unique strengths.
            </p>
          </div>
        </div>
      </section>

      <section className="support-section">
        <div className="support-content">
          <h2>Help Us Keep UniqueBrains Free</h2>
          <p>
            Running a platform takes resources—servers, development, and support. Your donation helps us:
          </p>
          <ul className="support-list">
            <li>✅ Keep the platform 100% free for all families</li>
            <li>✅ Add new features and courses</li>
            <li>✅ Support instructors who volunteer their time</li>
            <li>✅ Maintain and improve our technology</li>
            <li>✅ Reach more neurodivergent children worldwide</li>
          </ul>
          <div className="support-actions">
            <a 
              href={donationLink}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-donate"
            >
              Donate Now ❤️
            </a>
            <Link 
              to="/register?role=instructor" 
              className="btn-volunteer"
            >
              Volunteer as Instructor
            </Link>
          </div>
          <p className="support-note">
            Every contribution, no matter how small, makes a difference in a child's learning journey.
          </p>
          <p className="volunteer-note">
            <strong>Are you an instructor?</strong> Share your expertise and make a difference! 
            We're looking for passionate educators to volunteer their time teaching neurodivergent children.
          </p>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Learning?</h2>
          <p>Join our community of unique learners and supportive instructors today.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn-primary-large">
              Sign Up Free
            </Link>
            <Link to="/marketplace" className="btn-secondary-large">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
