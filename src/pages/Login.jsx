import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import { OAuthButton } from '../components/OAuthButton'
import './Auth.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('parent')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const result = await login(email, password, selectedRole)
      if (result.error) {
        // Check if it's an email confirmation error
        if (result.error.message && result.error.message.includes('Email not confirmed')) {
          setError('Please verify your email address. Check your inbox for the confirmation link.')
        } else {
          setError(result.error.message || 'Invalid credentials')
        }
      } else {
        navigate('/')
      }
    } catch (err) {
      if (err.message && err.message.includes('Email not confirmed')) {
        setError('Please verify your email address. Check your inbox for the confirmation link.')
      } else {
        setError('Invalid credentials')
      }
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo size="medium" />
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue your learning journey</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="role-selection">
          <p className="role-label">I want to sign in as:</p>
          <div className="role-cards">
            <div 
              className={`role-card ${selectedRole === 'parent' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('parent')}
            >
              <div className="role-icon">👨‍👩‍👧‍👦</div>
              <h3>Parent</h3>
              <p>Manage my children's learning</p>
            </div>
            <div 
              className={`role-card ${selectedRole === 'instructor' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('instructor')}
            >
              <div className="role-icon">👨‍🏫</div>
              <h3>Instructor</h3>
              <p>Teach and inspire</p>
            </div>
          </div>
        </div>
        
        <div className="oauth-section">
          <OAuthButton provider="google">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </OAuthButton>
        </div>

        <div className="divider">
          <span>or</span>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn-primary btn-full">
            Sign In as {selectedRole === 'parent' ? 'Parent' : 'Instructor'}
          </button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
        
        <div className="demo-accounts">
          <p className="demo-title">Demo Accounts:</p>
          <p>Parent: parent@demo.com / Password: any</p>
          <p>Instructor: instructor@demo.com / Password: any</p>
        </div>
      </div>
    </div>
  )
}

export default Login
