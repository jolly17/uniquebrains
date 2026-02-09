import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { OAuthButton } from '../components/OAuthButton'
import './Auth.css'

function Register() {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' // Always default to student
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }



  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    try {
      const result = await register(formData)
      if (result.error) {
        setError('Registration failed: ' + result.error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Registration failed')
    }
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-message-container">
            <div className="success-icon">✅</div>
            <h2>Check Your Email!</h2>
            <p className="success-message">
              We've sent a confirmation email to <strong>{formData.email}</strong>
            </p>
            <p className="success-instructions">
              Please click the link in the email to verify your account. 
              Once verified, you can log in and complete your profile setup!
            </p>
            <div className="success-actions">
              <Link to="/login" className="btn-primary">
                Go to Login
              </Link>
            </div>
            <p className="success-note">
              Didn't receive the email? Check your spam folder or{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setSuccess(false); }}>
                try again
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Your Account</h2>
        <p className="auth-subtitle">
          Join UniqueBrains and start your journey
        </p>
        
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-full">
            Create Account
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
