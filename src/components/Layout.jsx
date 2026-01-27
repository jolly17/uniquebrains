import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import PortalSwitcher from './PortalSwitcher'
import './Layout.css'

function Layout() {
  const { user, profile, students, activeStudent, activePortal, availablePortals, switchStudent, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showStudentSwitcher, setShowStudentSwitcher] = useState(false)

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            <Logo size="medium" />
          </Link>
          
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
            <Link to="/marketplace" className="nav-link" onClick={closeMobileMenu}>Marketplace</Link>
            
            {user && (
              <>
                {/* Show portal-specific navigation based on active portal */}
                {activePortal === 'teach' && (
                  <>
                    <Link to="/teach/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
                  </>
                )}
                
                {activePortal === 'learn' && (
                  <>
                    <Link to="/learn/dashboard" className="nav-link" onClick={closeMobileMenu}>My Courses</Link>
                  </>
                )}
                
                {/* Fallback for users not in a portal yet */}
                {!activePortal && profile?.role === 'student' && (
                  <>
                    <Link to="/learn/dashboard" className="nav-link" onClick={closeMobileMenu}>My Courses</Link>
                  </>
                )}
                
                {!activePortal && profile?.role === 'instructor' && (
                  <>
                    <Link to="/teach/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
                    <Link to="/teach/create-course" className="nav-link" onClick={closeMobileMenu}>Create Course</Link>
                  </>
                )}
              </>
            )}

            <div className="mobile-header-actions">
              {user ? (
                <>
                  <div className="mobile-user-info">
                    <span className="user-name">{profile?.first_name} {profile?.last_name}</span>
                    <span className="user-role">({profile?.role})</span>
                  </div>
                  <Link to="/profile" className="btn-secondary" onClick={closeMobileMenu}>Profile</Link>
                  <button onClick={handleLogout} className="btn-secondary">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary" onClick={closeMobileMenu}>Login</Link>
                  <Link to="/register" className="btn-primary" onClick={closeMobileMenu}>Sign Up</Link>
                </>
              )}
            </div>
          </nav>

          <div className="desktop-header-actions">
            {user ? (
              <div className="user-menu">
                <span className="user-name">{profile?.first_name} {profile?.last_name}</span>
                <Link to="/profile" className="btn-secondary">Profile</Link>
                <button onClick={handleLogout} className="btn-secondary">Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-content">
          {/* Portal Switcher - only show if user has multiple portals */}
          {user && availablePortals && availablePortals.length > 1 && (
            <div className="footer-portal-switcher">
              <PortalSwitcher 
                currentPortal={activePortal} 
                availablePortals={availablePortals} 
                compact={true} 
              />
            </div>
          )}
          
          <p>&copy; 2025 UniqueBrains. Where every brain learns differently.</p>
          <div className="footer-links">
            <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
            <span className="footer-separator">•</span>
            <Link to="/terms-of-service" className="footer-link">Terms of Service</Link>
            <span className="footer-separator">•</span>
            <a href="mailto:hello@uniquebrains.org" className="footer-link">Contact Us</a>
          </div>
          <div className="footer-social">
            <a 
              href="https://www.instagram.com/ouruniquebrains" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link instagram-link"
              aria-label="Follow us on Instagram"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                className="instagram-icon"
              >
                <defs>
                  <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#FED373', stopOpacity: 1 }} />
                    <stop offset="15%" style={{ stopColor: '#F15245', stopOpacity: 1 }} />
                    <stop offset="35%" style={{ stopColor: '#D92E7F', stopOpacity: 1 }} />
                    <stop offset="65%" style={{ stopColor: '#9B36B7', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#515ECF', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path 
                  fill="url(#instagram-gradient)"
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
              Follow us on Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
