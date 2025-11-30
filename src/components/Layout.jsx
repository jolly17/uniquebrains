import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import './Layout.css'

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>Marketplace</Link>
            
            {user && (
              <>
                {user.role === 'student' && (
                  <Link to="/my-courses" className="nav-link" onClick={closeMobileMenu}>My Courses</Link>
                )}
                
                {user.role === 'instructor' && (
                  <>
                    <Link to="/instructor/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
                    <Link to="/instructor/create-course" className="nav-link" onClick={closeMobileMenu}>Create Course</Link>
                  </>
                )}
              </>
            )}

            <div className="mobile-header-actions">
              {user ? (
                <>
                  <div className="mobile-user-info">
                    <span className="user-name">{user.firstName} {user.lastName}</span>
                    <span className="user-role">({user.role})</span>
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
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <span className="user-role">({user.role})</span>
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
        <p>&copy; 2024 UniqueBrains. Where every brain learns differently.</p>
      </footer>
    </div>
  )
}

export default Layout
