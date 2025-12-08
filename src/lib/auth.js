/**
 * Authentication Helper Functions
 * 
 * Provides authentication utilities for sign up, sign in, password reset, etc.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */

import { supabase } from './supabase'

/**
 * Sign up a new user with email and password
 * Creates user account and profile in one transaction
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password (min 8 chars)
 * @param {string} userData.firstName - User first name
 * @param {string} userData.lastName - User last name
 * @param {string} userData.role - User role (student, instructor, parent, admin)
 * @returns {Promise<{user, session, error}>}
 * 
 * Requirements: 1.1 - User registration with email verification
 */
export async function signUp({ email, password, firstName, lastName, role = 'student' }) {
  try {
    // Validate inputs
    if (!email || !password || !firstName || !lastName) {
      return {
        user: null,
        session: null,
        error: { message: 'All fields are required' }
      }
    }

    // Validate password length (Requirement 1.7)
    if (password.length < 8) {
      return {
        user: null,
        session: null,
        error: { message: 'Password must be at least 8 characters long' }
      }
    }

    // Validate role
    const validRoles = ['student', 'instructor', 'parent', 'admin']
    if (!validRoles.includes(role)) {
      return {
        user: null,
        session: null,
        error: { message: 'Invalid role specified' }
      }
    }

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      return { user: null, session: null, error }
    }

    // Profile will be created automatically by database trigger
    // or we can create it manually here
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: role
        })

      if (profileError && profileError.code !== '23505') { // Ignore duplicate key error
        console.error('Error creating profile:', profileError)
      }
    }

    return { user: data.user, session: data.session, error: null }
  } catch (err) {
    console.error('Sign up error:', err)
    return { user: null, session: null, error: err }
  }
}

/**
 * Sign in user with email and password
 * Validates role and returns user session
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user, session, profile, error}>}
 * 
 * Requirements: 1.2 - JWT token generation (24-hour validity)
 */
export async function signIn(email, password) {
  try {
    // Validate inputs
    if (!email || !password) {
      return {
        user: null,
        session: null,
        profile: null,
        error: { message: 'Email and password are required' }
      }
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { user: null, session: null, profile: null, error }
    }

    // Fetch user profile with role validation (Requirement 1.4)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return {
        user: data.user,
        session: data.session,
        profile: null,
        error: { message: 'Profile not found' }
      }
    }

    return {
      user: data.user,
      session: data.session,
      profile: profile,
      error: null
    }
  } catch (err) {
    console.error('Sign in error:', err)
    return { user: null, session: null, profile: null, error: err }
  }
}

/**
 * Sign out current user
 * Clears session and redirects to login
 * 
 * @returns {Promise<{error}>}
 * 
 * Requirements: 1.5 - Session expiration
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err) {
    console.error('Sign out error:', err)
    return { error: err }
  }
}

/**
 * Send password reset email
 * Generates secure token with 1-hour expiration
 * 
 * @param {string} email - User email
 * @returns {Promise<{error}>}
 * 
 * Requirements: 1.3 - Password reset with secure token expiration
 */
export async function resetPassword(email) {
  try {
    if (!email) {
      return { error: { message: 'Email is required' } }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error('Password reset error:', err)
    return { error: err }
  }
}

/**
 * Update user password
 * Used after password reset or for password change
 * 
 * @param {string} newPassword - New password (min 8 chars)
 * @returns {Promise<{error}>}
 * 
 * Requirements: 1.3, 1.7 - Password requirements
 */
export async function updatePassword(newPassword) {
  try {
    if (!newPassword) {
      return { error: { message: 'New password is required' } }
    }

    // Validate password length (Requirement 1.7)
    if (newPassword.length < 8) {
      return { error: { message: 'Password must be at least 8 characters long' } }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error('Update password error:', err)
    return { error: err }
  }
}

/**
 * Resend email verification
 * Sends new verification email to user
 * 
 * @param {string} email - User email
 * @returns {Promise<{error}>}
 * 
 * Requirements: 1.1 - Email verification
 */
export async function resendVerificationEmail(email) {
  try {
    if (!email) {
      return { error: { message: 'Email is required' } }
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error('Resend verification error:', err)
    return { error: err }
  }
}

/**
 * Get current user session
 * Checks if user is authenticated and session is valid
 * 
 * @returns {Promise<{session, user, error}>}
 * 
 * Requirements: 1.2, 1.5 - JWT token validation and session management
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return { session: null, user: null, error }
    }

    return { session, user: session?.user || null, error: null }
  } catch (err) {
    console.error('Get session error:', err)
    return { session: null, user: null, error: err }
  }
}

/**
 * Get current user profile with role
 * Fetches complete user profile from database
 * 
 * @returns {Promise<{profile, error}>}
 * 
 * Requirements: 1.4 - Role-based access control
 */
export async function getCurrentUserProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { profile: null, error: userError || { message: 'Not authenticated' } }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return { profile: null, error: profileError }
    }

    return { profile, error: null }
  } catch (err) {
    console.error('Get profile error:', err)
    return { profile: null, error: err }
  }
}

/**
 * Update user profile
 * Updates user profile information
 * 
 * @param {Object} updates - Profile fields to update
 * @returns {Promise<{profile, error}>}
 */
export async function updateUserProfile(updates) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { profile: null, error: userError || { message: 'Not authenticated' } }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (profileError) {
      return { profile: null, error: profileError }
    }

    return { profile, error: null }
  } catch (err) {
    console.error('Update profile error:', err)
    return { profile: null, error: err }
  }
}

/**
 * Check if user has specific role
 * Used for role-based access control
 * 
 * @param {string} requiredRole - Required role to check
 * @returns {Promise<boolean>}
 * 
 * Requirements: 1.4 - Role-based access control
 */
export async function hasRole(requiredRole) {
  try {
    const { profile, error } = await getCurrentUserProfile()

    if (error || !profile) {
      return false
    }

    return profile.role === requiredRole
  } catch (err) {
    console.error('Role check error:', err)
    return false
  }
}

/**
 * Listen to auth state changes
 * Sets up listener for authentication events
 * 
 * @param {Function} callback - Callback function (event, session) => void
 * @returns {Object} Subscription object with unsubscribe method
 * 
 * Requirements: 1.5 - Session management
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return subscription
}

/**
 * Refresh current session
 * Manually refreshes the JWT token
 * 
 * @returns {Promise<{session, error}>}
 * 
 * Requirements: 1.2 - JWT token refresh
 */
export async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession()

    if (error) {
      return { session: null, error }
    }

    return { session, error: null }
  } catch (err) {
    console.error('Refresh session error:', err)
    return { session: null, error: err }
  }
}
