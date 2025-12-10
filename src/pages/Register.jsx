import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { OAuthButton } from '../components/OAuthButton'
import './Auth.css'

function Register() {
  const [step, setStep] = useState(1) // 1: Account info, 2: First student (parent only)
  const [selectedRole, setSelectedRole] = useState('parent')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'parent'
  })
  const [studentData, setStudentData] = useState({
    firstName: '',
    age: '',
    neurodiversityProfile: [],
    otherNeeds: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { register, addStudent } = useAuth()
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

  const handleStudentChange = (e) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value
    })
  }

  const handleNeurodiversityChange = (value) => {
    const currentProfile = studentData.neurodiversityProfile
    if (currentProfile.includes(value)) {
      setStudentData({
        ...studentData,
        neurodiversityProfile: currentProfile.filter(v => v !== value)
      })
    } else {
      setStudentData({
        ...studentData,
        neurodiversityProfile: [...currentProfile, value]
      })
    }
  }

  const handleAccountSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    // Update role in formData
    const updatedFormData = { ...formData, role: selectedRole }
    setFormData(updatedFormData)
    
    // If instructor, complete registration immediately
    if (selectedRole === 'instructor') {
      try {
        const result = await register(updatedFormData)
        if (result.error) {
          setError('Registration failed: ' + result.error.message)
        } else {
          setSuccess(true)
        }
      } catch (err) {
        setError('Registration failed')
      }
    } else {
      // If parent, move to student info step
      setStep(2)
    }
  }

  const handleStudentSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      // Register parent account
      const result = await register(formData)
      
      if (result.error) {
        setError('Registration failed: ' + result.error.message)
        return
      }
      
      // Add first student
      addStudent(studentData)
      
      setSuccess(true)
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
              Once verified, you can log in and start your journey with UniqueBrains!
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
        <h2>{step === 1 ? 'Create Your Account' : 'Add Your First Student'}</h2>
        <p className="auth-subtitle">
          {step === 1 ? 'Join UniqueBrains and start your journey' : 'Tell us about your child'}
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        {step === 1 && (
          <div className="role-selection">
            <p className="role-label">I want to sign up as:</p>
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
            <p className="role-note">
              <small>Note: Student profiles are created by parents during onboarding</small>
            </p>
          </div>
        )}
        
        {step === 1 && (
          <>
            <div className="oauth-section">
              <button 
                type="button"
                className="oauth-button oauth-button-google"
                onClick={() => {
                  // Store role preference before OAuth
                  console.log('🔍 Storing OAuth role preference:', selectedRole)
                  localStorage.setItem('oauth_role_preference', selectedRole)
                  // Then trigger OAuth
                  document.querySelector('.oauth-button-google-hidden').click()
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                  <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                </svg>
                Sign up with Google as {selectedRole === 'instructor' ? 'Instructor' : 'Parent'}
              </button>
              
              {/* Hidden OAuth button for actual functionality */}
              <div style={{ display: 'none' }}>
                <OAuthButton provider="google" className="oauth-button-google-hidden">
                  Hidden
                </OAuthButton>
              </div>
            </div>

            <div className="divider">
              <span>or</span>
            </div>
          </>
        )}
        
        {step === 1 ? (
        <form onSubmit={handleAccountSubmit} className="auth-form">
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
            {selectedRole === 'parent' ? 'Continue to Student Info' : 'Create Instructor Account'}
          </button>
        </form>
        ) : (
        <form onSubmit={handleStudentSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="studentFirstName">Student's First Name</label>
            <input
              id="studentFirstName"
              name="firstName"
              type="text"
              value={studentData.firstName}
              onChange={handleStudentChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              name="age"
              type="number"
              value={studentData.age}
              onChange={handleStudentChange}
              required
              min="3"
              max="18"
            />
          </div>

          <div className="form-group">
            <label>Learning Profile (Optional)</label>
            <p className="field-description">
              Help us understand your child's learning style. Select all that apply:
            </p>
            <div className="checkbox-group">
              {neurodiversityOptions.map(option => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={studentData.neurodiversityProfile.includes(option.value)}
                    onChange={() => handleNeurodiversityChange(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            
            {studentData.neurodiversityProfile.includes('other') && (
              <div className="nested-field">
                <input
                  type="text"
                  name="otherNeeds"
                  placeholder="Please describe specific needs..."
                  value={studentData.otherNeeds}
                  onChange={handleStudentChange}
                />
              </div>
            )}
          </div>

          <div className="form-row">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary btn-full">
              Back
            </button>
            <button type="submit" className="btn-primary btn-full">
              Complete Registration
            </button>
          </div>
        </form>
        )}
        
        {step === 1 && (
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default Register
