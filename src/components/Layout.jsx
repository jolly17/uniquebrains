import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import './Layout.css'

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <Logo size="medium" />
          </Link>
          
          <nav className="nav">
            <Link to="/" className="nav-link">Marketplace</Link>
            
            {user && (
              <>
                {user.role === 'student' && (
                  <Link to="/my-courses" className="nav-link">My Courses</Link>
                )}
                
                {user.role === 'instructor' && (
                  <>
                    <Link to="/instructor/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/instructor/create-course" className="nav-link">Create Course</Link>
                  </>
                )}
              </>
            )}
          </nav>

          <div className="header-actions">
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
