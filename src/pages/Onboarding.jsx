import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Onboarding.css'

function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.userId
  const userName = location.state?.userName || 'there'

  const [formData, setFormData] = useState({
    neurodiversityProfile: [],
    otherNeeds: '',
    role: 'student' // Default role
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const neurodiversityOptions = [
    { value: 'autism', label: 'Autism Spectrum' },
    { value: 'adhd', label: 'ADHD' },
    { value: 'dyslexia', label: 'Dyslexia' },
    { value: 'dysgraphia', label: 'Dysgraphia' },
    { value: 'dyscalculia', label: 'Dyscalculia' },
    { value: 'other', label: 'Other' }
  ]

  const handleCheckboxChange = (value) => {
    const currentProfile = formData.neurodiversityProfile
    if (currentProfile.includes(value)) {
      setFormData({
        ...formData,
        neurodiversityProfile: currentProfile.filter(item => item !== value)
      })
    } else {
      setFormData({
        ...formData,
        neurodiversityProfile: [...currentProfile, value]
      })
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Update profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .update({
          role: formData.role,
          // Store as JSON in a text field or create separate columns
          bio: formData.otherNeeds
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating profile:', error)
        alert('Failed to save profile. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Redirect based on role
      if (formData.role === 'instructor') {
        navigate('/instructor/dashboard')
      } else if (formData.role === 'parent') {
        navigate('/my-courses')
      } else {
        navigate('/marketplace')
      }
    } catch (err) {
      console.error('Onboarding error:', err)
      alert('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    // Skip onboarding and go to marketplace
    navigate('/marketplace')
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1>Welcome to UniqueBrains, {userName}! 🎉</h1>
          <p className="onboarding-subtitle">
            Let's personalize your learning experience. This will only take a minute.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {/* Role Selection */}
          <div className="form-section">
            <h2>I want to use UniqueBrains as a:</h2>
            <div className="role-cards">
              <div 
                className={`role-card ${formData.role === 'student' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'student' })}
              >
                <div className="role-icon">🎓</div>
                <h3>Student</h3>
                <p>Learn new skills</p>
              </div>
              <div 
                className={`role-card ${formData.role === 'instructor' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'instructor' })}
              >
                <div className="role-icon">👨‍🏫</div>
                <h3>Instructor</h3>
                <p>Teach and inspire</p>
              </div>
              <div 
                className={`role-card ${formData.role === 'parent' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'parent' })}
              >
                <div className="role-icon">👨‍👩‍👧‍👦</div>
                <h3>Parent</h3>
                <p>Manage children's learning</p>
              </div>
            </div>
          </div>

          {/* Learning Style (for students) */}
          {formData.role === 'student' && (
            <div className="form-section">
              <h2>Your Learning Style</h2>
              <p className="section-description">
                Help us understand what makes your mind unique so instructors can provide the best support. 
                This information is private and only shared with your enrolled instructors.
              </p>

              <div className="form-group">
                <label>What's unique about your mind? (Optional - Select all that apply)</label>
                <div className="checkbox-grid">
                  {neurodiversityOptions.map(option => (
                    <label key={option.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.neurodiversityProfile.includes(option.value)}
                        onChange={() => handleCheckboxChange(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.neurodiversityProfile.includes('other') && (
                <div className="form-group">
                  <label htmlFor="otherNeeds">Please specify</label>
                  <textarea
                    id="otherNeeds"
                    name="otherNeeds"
                    value={formData.otherNeeds}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe any other learning needs or accommodations..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Teaching Style (for instructors) */}
          {formData.role === 'instructor' && (
            <div className="form-section">
              <h2>Your Teaching Approach</h2>
              <p className="section-description">
                Share what makes your teaching unique to help students understand your approach.
              </p>

              <div className="form-group">
                <label htmlFor="otherNeeds">Tell us about your teaching style (Optional)</label>
                <textarea
                  id="otherNeeds"
                  name="otherNeeds"
                  value={formData.otherNeeds}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="What makes your teaching approach unique? Any specializations or experience with neurodiverse learners?"
                />
              </div>
            </div>
          )}

          <div className="onboarding-actions">
            <button 
              type="button" 
              onClick={handleSkip} 
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Skip for now
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Onboarding
