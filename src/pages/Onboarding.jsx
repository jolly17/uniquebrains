import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Onboarding.css'

function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const userId = location.state?.userId || user?.id
  const userName = location.state?.userName || user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  const [formData, setFormData] = useState({
    neurodiversityProfile: [],
    bio: '',
    role: 'parent' // Default to parent instead of student
  })



  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch current profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return
        }

        if (data) {
          setFormData({
            neurodiversityProfile: data.neurodiversity_profile || [],
            bio: data.bio || '',
            role: data.role || 'parent'
          })
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
      }
    }

    fetchProfile()
  }, [userId])

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
      // Prepare profile data
      const profileData = {
        role: formData.role,
        bio: formData.bio,
        neurodiversity_profile: formData.neurodiversityProfile
      }

      // Update profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
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
                className={`role-card ${formData.role === 'parent' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'parent' })}
              >
                <div className="role-icon">👨‍👩‍👧‍👦</div>
                <h3>Parent</h3>
                <p>Manage my children's learning</p>
              </div>
              <div 
                className={`role-card ${formData.role === 'instructor' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'instructor' })}
              >
                <div className="role-icon">👨‍🏫</div>
                <h3>Instructor</h3>
                <p>Teach and inspire</p>
              </div>
            </div>
            <p className="role-note">
              <small>Note: Student profiles are created by parents during setup</small>
            </p>
          </div>

          {/* Bio Section (for all users) */}
          <div className="form-section">
            <h2>Tell us about yourself</h2>
            <div className="form-group">
              <label htmlFor="bio">
                {formData.role === 'instructor' ? 'Teaching Experience & Approach' : 'About You'}
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder={
                  formData.role === 'instructor' 
                    ? "Share your teaching experience, approach, and what makes you passionate about education..."
                    : "Tell us a bit about yourself and your family..."
                }
                rows="4"
              />
            </div>
          </div>

          {/* Neurodiversity Profile (optional for all) */}
          {(formData.role === 'parent' || formData.role === 'instructor') && (
            <div className="form-section">
              <h2>
                {formData.role === 'instructor' ? 'Your Teaching Specializations' : 'Family Neurodiversity Profile'}
              </h2>
              <p className="section-description">
                {formData.role === 'instructor' 
                  ? "What neurodiversity areas do you specialize in or have experience teaching? This helps parents find the right match."
                  : "Help us understand your family's unique needs. This information helps match you with the right instructors and is kept private."
                }
              </p>

              <div className="form-group">
                <label>
                  {formData.role === 'instructor' 
                    ? 'Neurodiversity areas you specialize in (Optional - Select all that apply)'
                    : 'Family neurodiversity profile (Optional - Select all that apply)'
                  }
                </label>
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
                  <label htmlFor="bio">Please specify</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
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
              <h2>Your Teaching Profile</h2>
              <p className="section-description">
                Help parents find the right instructor for their children by sharing your background and expertise.
              </p>

              <div className="form-group">
                <label>Your neurodiversity profile (Optional - helps parents find instructors who understand their children)</label>
                <p className="field-description">
                  Many of our best instructors are neurodiverse themselves and bring unique understanding to their teaching.
                </p>
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

              <div className="form-group">
                <label htmlFor="bio">About your teaching approach (Optional)</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="What makes your teaching approach unique? Experience with neurodiverse learners? Special techniques or accommodations you use?"
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
