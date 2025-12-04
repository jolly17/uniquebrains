import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
        await register(updatedFormData)
        navigate('/instructor/dashboard')
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
      await register(formData)
      
      // Add first student
      addStudent(studentData)
      
      navigate('/marketplace')
    } catch (err) {
      setError('Registration failed')
    }
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
          </div>
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
