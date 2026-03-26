import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { updatePassword } from '../lib/auth'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import './Auth.css'

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase automatically handles the token exchange from the URL hash
    // when detectSessionInUrl is true (which it is in our config).
    // We just need to wait for the session to be established.
    const checkSession = async () => {
      // Listen for the PASSWORD_RECOVERY event
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            setSessionReady(true)
          } else if (event === 'SIGNED_IN' && session) {
            // Also handle SIGNED_IN as some flows trigger this instead
            setSessionReady(true)
          }
        }
      )

      // Also check if there's already a session (in case the event already fired)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionReady(true)
      } else {
        // Give it a moment for the URL hash to be processed
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (retrySession) {
            setSessionReady(true)
          } else {
            setSessionError(true)
          }
        }, 2000)
      }

      return () => {
        subscription?.unsubscribe()
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // Validate password length
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await updatePassword(newPassword)

      if (updateError) {
        setError(updateError.message || 'Failed to update password. Please try again.')
      } else {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show error if session couldn't be established (invalid/expired link)
  if (sessionError) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <Logo size="medium" />
          </div>
          <div className="success-message-container">
            <div className="success-icon">⚠️</div>
            <h2>Invalid or Expired Link</h2>
            <p className="success-message">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="success-actions">
              <Link to="/forgot-password" className="btn-primary btn-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.875rem' }}>
                Request New Link
              </Link>
            </div>
            <p className="auth-footer">
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while waiting for session
  if (!sessionReady && !sessionError) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <Logo size="medium" />
          </div>
          <div className="success-message-container">
            <div className="success-icon">⏳</div>
            <h2>Verifying Link...</h2>
            <p className="success-message">
              Please wait while we verify your password reset link.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo size="medium" />
        </div>

        {success ? (
          <div className="success-message-container">
            <div className="success-icon">✅</div>
            <h2>Password Updated!</h2>
            <p className="success-message">
              Your password has been successfully reset. You'll be redirected to the login page shortly.
            </p>
            <div className="success-actions">
              <Link to="/login" className="btn-primary btn-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.875rem' }}>
                Sign In Now
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2>Reset Your Password</h2>
            <p className="auth-subtitle">
              Enter your new password below. Make sure it's at least 8 characters long.
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={8}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Reset Password'}
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

export default ResetPassword
