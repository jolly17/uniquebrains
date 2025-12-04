import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
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
      await login(email, password, selectedRole)
      navigate('/')
    } catch (err) {
      setError('Invalid credentials')
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
