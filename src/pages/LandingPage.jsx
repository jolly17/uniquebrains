import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'
import './LandingPage.css'

function LandingPage() {
  const { user } = useAuth()
  const [donationLink, setDonationLink] = useState('https://www.gofundme.com/f/help-me-support-autism-awareness-and-families-with-genai')
  const [unauthorizedMessage, setUnauthorizedMessage] = useState('')

  useEffect(() => {
    // Check for unauthorized message
    const message = sessionStorage.getItem('unauthorized_message')
    if (message) {
      setUnauthorizedMessage(message)
      sessionStorage.removeItem('unauthorized_message')
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setUnauthorizedMessage('')
      }, 5000)
    }
  }, [])

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
    <>
      <SEO />
      <div className="landing-page">
      {unauthorizedMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#fee2e2',
          border: '2px solid #ef4444',
          borderRadius: '0.5rem',
          padding: '1rem 1.5rem',
          zIndex: 1000,
          maxWidth: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: 0, color: '#991b1b', fontWeight: 500 }}>
            ⚠️ {unauthorizedMessage}
          </p>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">UniqueBrains</span>
          </h1>
          <p className="hero-tagline">Where the neurodiverse community connects and thrives</p>
          <p className="hero-description">
            A platform built for neurodivergent individuals and their families. 
            Learn, connect, share, and find the care you need—all in one place.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="products-container">
          
          {/* Learning Platform */}
          <div className="product-card product-learning">
            <div className="product-icon">📚</div>
            <h2>Learning Platform</h2>
            <p className="product-description">
              Anyone can teach, anyone can learn. Share your expertise or discover something new with instructors 
              who celebrate unique learning styles. Free courses, genuine support, and a community that gets it.
            </p>
            <div className="product-actions">
              <Link to="/courses" className="btn-product-primary">
                Explore Courses
              </Link>
              <Link 
                to={user ? "/courses/my-courses" : "/register?role=instructor"} 
                className="btn-product-secondary"
              >
                Start Teaching
              </Link>
            </div>
          </div>

          {/* Community */}
          <div className="product-card product-community">
            <div className="product-icon">💬</div>
            <h2>Community</h2>
            <p className="product-description">
              You're not alone in this journey. Connect with parents who've been there, share what works 
              (and what doesn't), and find your people. Real talk, real support, zero judgment.
            </p>
            <div className="product-actions">
              <Link to="/community" className="btn-product-primary">
                Ask a Question
              </Link>
              <Link to="/community" className="btn-product-secondary">
                Share a Tip
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="product-card product-content">
            <div className="product-icon">📖</div>
            <h2>Content</h2>
            <p className="product-description">
              Tired of explaining neurodiversity to family, teachers, and friends who just don't get it? 
              Share our curated articles and resources—so they can finally understand your world without you having to repeat yourself.
            </p>
            <div className="product-actions">
              <Link to="/content" className="btn-product-primary">
                Browse Content
              </Link>
            </div>
          </div>

          {/* Care */}
          <div className="product-card product-care">
            <div className="product-icon">🏥</div>
            <h2>Care</h2>
            <p className="product-description">
              From diagnosis to college and beyond—find therapists, schools, and services that actually 
              work. Navigate your care journey with our interactive roadmap.
            </p>
            <div className="product-actions">
              <Link to="/care" className="btn-product-primary">
                Explore Care Roadmap
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Support Section */}
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
            <a 
              href="mailto:hello@uniquebrains.org?subject=I would like to volunteer"
              className="btn-volunteer"
            >
              Volunteer Your Time
            </a>
          </div>
          <p className="support-note">
            Every contribution, no matter how small, makes a difference in a child's learning journey.
          </p>
        </div>
      </section>

      {/* Why UniqueBrains Section */}
      <section className="why-section">
        <div className="why-content">
          <h2>Why UniqueBrains?</h2>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">🧩</div>
              <h3>Built for Neurodiversity</h3>
              <p>
                Every feature designed with neurodivergent individuals in mind. 
                Clear interfaces, consistent patterns, and supportive guidance.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon">💝</div>
              <h3>Community-Driven</h3>
              <p>
                Built by and for the neurodiverse community. Real experiences, 
                real support, real connections.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon">🌟</div>
              <h3>Celebrate Differences</h3>
              <p>
                We don't try to "fix" anyone. We celebrate neurodiversity and 
                help everyone discover their unique strengths.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Join Our Community?</h2>
          <p>Connect, learn, and thrive with UniqueBrains today.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn-cta-primary">
              Sign Up Free
            </Link>
            <a 
              href="mailto:hello@uniquebrains.org?subject=I would like to volunteer"
              className="btn-cta-secondary"
            >
              Volunteer Your Time
            </a>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}

export default LandingPage
