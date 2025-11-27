import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    neurodiversityProfile: []
  })
  const [otherNeeds, setOtherNeeds] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const neurodiversityOptions = [
    { value: 'autism', label: 'Autism Spectrum' },
    { value: 'adhd', label: 'ADHD' },
    { value: 'dyslexia', label: 'Dyslexia' },
    { value: 'multiple', label: 'Multiple Conditions' },
    { value: 'other', label: 'Other' }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleNeurodiversityChange = (value) => {
    const currentProfile = formData.neurodiversityProfile
    if (currentProfile.includes(value)) {
      setFormData({
        ...formData,
        neurodiversityProfile: currentProfile.filter(v => v !== value)
      })
    } else {
      setFormData({
        ...formData,
        neurodiversityProfile: [...currentProfile, value]
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    try {
      const registrationData = {
        ...formData,
        otherNeeds: formData.neurodiversityProfile.includes('other') ? otherNeeds : null
      }
      await register(registrationData)
      navigate('/')
    } catch (err) {
      setError('Registration failed')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Join NEST</h2>
        <p className="auth-subtitle">Create your account to start learning</p>
        
        {error && <div className="error-message">{error}</div>}
        
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

          <div className="form-group">
            <label>What's unique about your mind? (Optional)</label>
            <p className="field-description">
              Help us understand your learning style. Select all that apply:
            </p>
            <div className="checkbox-group">
              {neurodiversityOptions.map(option => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.neurodiversityProfile.includes(option.value)}
                    onChange={() => handleNeurodiversityChange(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            
            {formData.neurodiversityProfile.includes('other') && (
              <div className="nested-field">
                <input
                  type="text"
                  placeholder="Please describe your specific needs..."
                  value={otherNeeds}
                  onChange={(e) => setOtherNeeds(e.target.value)}
                />
              </div>
            )}
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
