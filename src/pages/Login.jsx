import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import { OAuthButton } from '../components/OAuthButton'
import './Auth.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Store redirect URL in sessionStorage for OAuth to access
  useEffect(() => {
    const redirectTo = location.state?.from
    if (redirectTo) {
      sessionStorage.setItem('redirectAfterLogin', redirectTo)
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const result = await login(email, password)
      if (result.error) {
        // Check if it's an email confirmation error
        if (result.error.message && result.error.message.includes('Email not confirmed')) {
          setError('Please verify your email address. Check your inbox for the confirmation link.')
        } else {
          setError(result.error.message || 'Invalid credentials')
        }
      } else if (result.profile) {
        // Check if there's a redirect URL in the location state
        const redirectTo = location.state?.from || null
        
        console.log('Login: Redirect URL from location.state:', redirectTo)
        
        // Clear the sessionStorage
        sessionStorage.removeItem('redirectAfterLogin')
        
        if (redirectTo) {
          // Redirect to the page they were trying to access
          console.log('Login: Redirecting to:', redirectTo)
          navigate(redirectTo)
        } else {
          // Navigate to unified dashboard
          console.log('Login: No redirect URL, going to my-courses')
          navigate('/courses/my-courses')
        }
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
        
        <div className="oauth-section">
          <OAuthButton provider="google">
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
            Sign In
          </button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
