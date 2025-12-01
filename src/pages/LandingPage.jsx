import { Link } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
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
            <a 
              href="https://www.gofundme.com/f/help-me-support-autism-awareness-and-families-with-genai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary-large"
            >
              Support Our Mission ❤️
            </a>
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
          <a 
            href="https://www.gofundme.com/f/help-me-support-autism-awareness-and-families-with-genai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-donate"
          >
            Donate Now
          </a>
          <p className="support-note">
            Every contribution, no matter how small, makes a difference in a child's learning journey.
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
