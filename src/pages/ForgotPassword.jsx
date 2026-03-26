import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '../lib/auth'
import Logo from '../components/Logo'
import './Auth.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Store recovery intent so the callback knows to redirect to reset password page
      localStorage.setItem('password_recovery_pending', 'true')
      
      const { error: resetError } = await resetPassword(email)

      if (resetError) {
        localStorage.removeItem('password_recovery_pending')
        setError(resetError.message || 'Failed to send reset email. Please try again.')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo size="medium" />
        </div>

        {success ? (
          <div className="success-message-container">
            <div className="success-icon">📧</div>
            <h2>Check Your Email</h2>
            <p className="success-message">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="success-instructions">
              Click the link in the email to reset your password. The link will expire in 1 hour.
              If you don't see the email, check your spam folder.
            </p>
            <div className="success-actions">
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="btn-secondary btn-full"
              >
                Send Another Link
              </button>
            </div>
            <p className="auth-footer">
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          </div>
        ) : (
          <>
            <h2>Forgot Password?</h2>
            <p className="auth-subtitle">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-footer">
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
