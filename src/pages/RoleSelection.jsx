import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function RoleSelection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedRole, setSelectedRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleUpdate = async () => {
    if (!user) {
      setError('You must be logged in to update your role')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Redirect based on selected role
      if (selectedRole === 'instructor') {
        navigate('/instructor/dashboard', { replace: true })
      } else if (selectedRole === 'student') {
        navigate('/onboarding', { replace: true })
      }
    } catch (error) {
      console.error('Error updating role:', error)
      setError('Failed to update role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Select Your Role</h2>
        <p className="auth-subtitle">
          We need to know your role to set up your account properly
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="role-selection">
          <div className="role-cards">
            <div 
              className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('student')}
            >
              <div className="role-icon">🎓</div>
              <h3>Student</h3>
              <p>Enroll in courses and learn</p>
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

        <button 
          onClick={handleRoleUpdate}
          disabled={loading}
          className="btn-primary btn-full"
        >
          {loading ? 'Updating...' : `Continue as ${selectedRole === 'instructor' ? 'Instructor' : 'Student'}`}
        </button>
      </div>
    </div>
  )
}

export default RoleSelection