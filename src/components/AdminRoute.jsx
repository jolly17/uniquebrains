import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * AdminRoute - Protected route component that requires admin role
 * Redirects non-admin users to home page with unauthorized message
 */
function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Check if user has admin role
  const isAdmin = profile?.role === 'admin'

  // Redirect to home if not admin
  if (!isAdmin) {
    // Store unauthorized message in sessionStorage to display on home page
    sessionStorage.setItem('unauthorized_message', 'You do not have permission to access the admin dashboard.')
    return <Navigate to="/" replace />
  }

  // Render children if user is admin
  return children
}

export default AdminRoute
