/**
 * Authentication Helper Functions - Usage Examples
 * 
 * This file demonstrates how to use the auth helper functions
 * DO NOT import this file in production code - it's for reference only
 */

import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  resendVerificationEmail,
  getCurrentSession,
  getCurrentUserProfile,
  hasRole,
  onAuthStateChange,
  refreshSession,
  updateUserProfile
} from './auth'

// ============================================================================
// EXAMPLE 1: User Registration (Sign Up)
// ============================================================================
async function exampleSignUp() {
  const result = await signUp({
    email: 'student@example.com',
    password: 'SecurePassword123!',
    firstName: 'John',
    lastName: 'Doe',
    role: 'student' // or 'instructor', 'parent', 'admin'
  })

  if (result.error) {
    console.error('Sign up failed:', result.error.message)
    // Show error to user
  } else {
    console.log('Sign up successful! Check email for verification.')
    console.log('User:', result.user)
    // Redirect to email verification page
  }
}

// ============================================================================
// EXAMPLE 2: User Sign In
// ============================================================================
async function exampleSignIn() {
  const result = await signIn('student@example.com', 'SecurePassword123!')

  if (result.error) {
    console.error('Sign in failed:', result.error.message)
    // Show error to user
  } else {
    console.log('Sign in successful!')
    console.log('User:', result.user)
    console.log('Profile:', result.profile)
    console.log('Role:', result.profile.role)
    
    // Redirect based on role
    if (result.profile.role === 'instructor') {
      // Redirect to instructor dashboard
    } else if (result.profile.role === 'parent') {
      // Redirect to parent dashboard
    } else {
      // Redirect to student marketplace
    }
  }
}

// ============================================================================
// EXAMPLE 3: User Sign Out
// ============================================================================
async function exampleSignOut() {
  const result = await signOut()

  if (result.error) {
    console.error('Sign out failed:', result.error.message)
  } else {
    console.log('Sign out successful!')
    // Redirect to login page
  }
}

// ============================================================================
// EXAMPLE 4: Password Reset Request
// ============================================================================
async function exampleResetPassword() {
  const result = await resetPassword('student@example.com')

  if (result.error) {
    console.error('Password reset failed:', result.error.message)
  } else {
    console.log('Password reset email sent! Check your inbox.')
    // Show success message to user
  }
}

// ============================================================================
// EXAMPLE 5: Update Password (After Reset)
// ============================================================================
async function exampleUpdatePassword() {
  const result = await updatePassword('NewSecurePassword123!')

  if (result.error) {
    console.error('Password update failed:', result.error.message)
  } else {
    console.log('Password updated successfully!')
    // Redirect to login or dashboard
  }
}

// ============================================================================
// EXAMPLE 6: Resend Verification Email
// ============================================================================
async function exampleResendVerification() {
  const result = await resendVerificationEmail('student@example.com')

  if (result.error) {
    console.error('Resend failed:', result.error.message)
  } else {
    console.log('Verification email sent! Check your inbox.')
  }
}

// ============================================================================
// EXAMPLE 7: Get Current Session
// ============================================================================
async function exampleGetSession() {
  const result = await getCurrentSession()

  if (result.error || !result.session) {
    console.log('No active session - user is not logged in')
    // Redirect to login
  } else {
    console.log('Active session found!')
    console.log('Session expires at:', new Date(result.session.expires_at * 1000))
    console.log('User:', result.user)
  }
}

// ============================================================================
// EXAMPLE 8: Get Current User Profile
// ============================================================================
async function exampleGetProfile() {
  const result = await getCurrentUserProfile()

  if (result.error || !result.profile) {
    console.log('No profile found - user may not be logged in')
  } else {
    console.log('User profile:', result.profile)
    console.log('Name:', `${result.profile.first_name} ${result.profile.last_name}`)
    console.log('Role:', result.profile.role)
    console.log('Email:', result.profile.email)
  }
}

// ============================================================================
// EXAMPLE 9: Update User Profile
// ============================================================================
async function exampleUpdateProfile() {
  const result = await updateUserProfile({
    first_name: 'Jane',
    last_name: 'Smith',
    bio: 'Passionate about learning!',
    avatar_url: 'https://example.com/avatar.jpg'
  })

  if (result.error) {
    console.error('Profile update failed:', result.error.message)
  } else {
    console.log('Profile updated successfully!')
    console.log('Updated profile:', result.profile)
  }
}

// ============================================================================
// EXAMPLE 10: Check User Role
// ============================================================================
async function exampleCheckRole() {
  const isInstructor = await hasRole('instructor')

  if (isInstructor) {
    console.log('User is an instructor')
    // Show instructor-only features
  } else {
    console.log('User is not an instructor')
    // Hide instructor features
  }
}

// ============================================================================
// EXAMPLE 11: Listen to Auth State Changes
// ============================================================================
function exampleAuthStateListener() {
  const subscription = onAuthStateChange((event, session) => {
    console.log('Auth event:', event)
    
    switch (event) {
      case 'SIGNED_IN':
        console.log('User signed in:', session.user)
        // Update UI, redirect, etc.
        break
      
      case 'SIGNED_OUT':
        console.log('User signed out')
        // Clear state, redirect to login
        break
      
      case 'TOKEN_REFRESHED':
        console.log('Token refreshed')
        // Session is still valid
        break
      
      case 'USER_UPDATED':
        console.log('User updated')
        // Refresh user data
        break
      
      default:
        console.log('Other auth event:', event)
    }
  })

  // Clean up listener when component unmounts
  return () => {
    subscription.unsubscribe()
  }
}

// ============================================================================
// EXAMPLE 12: Manually Refresh Session
// ============================================================================
async function exampleRefreshSession() {
  const result = await refreshSession()

  if (result.error) {
    console.error('Session refresh failed:', result.error.message)
    // Session expired - redirect to login
  } else {
    console.log('Session refreshed successfully!')
    console.log('New expiry:', new Date(result.session.expires_at * 1000))
  }
}

// ============================================================================
// EXAMPLE 13: Complete Login Flow in React Component
// ============================================================================
/*
import { useState } from 'react'
import { signIn } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn(email, password)

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    } else {
      // Redirect based on role
      const role = result.profile.role
      if (role === 'instructor') {
        navigate('/instructor/dashboard')
      } else if (role === 'parent') {
        navigate('/my-courses')
      } else {
        navigate('/marketplace')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
*/

// ============================================================================
// EXAMPLE 14: Protected Route Component
// ============================================================================
/*
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentSession, hasRole } from '../lib/auth'

function ProtectedRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { session } = await getCurrentSession()
      
      if (!session) {
        setAuthorized(false)
        setLoading(false)
        return
      }

      if (requiredRole) {
        const hasRequiredRole = await hasRole(requiredRole)
        setAuthorized(hasRequiredRole)
      } else {
        setAuthorized(true)
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [requiredRole])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!authorized) {
    return <Navigate to="/login" />
  }

  return children
}
*/

export {
  exampleSignUp,
  exampleSignIn,
  exampleSignOut,
  exampleResetPassword,
  exampleUpdatePassword,
  exampleResendVerification,
  exampleGetSession,
  exampleGetProfile,
  exampleUpdateProfile,
  exampleCheckRole,
  exampleAuthStateListener,
  exampleRefreshSession
}
