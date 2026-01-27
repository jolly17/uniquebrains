import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Onboarding.css'

function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const userId = user?.id || location.state?.userId
  const userName = location.state?.userName || user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  const [formData, setFormData] = useState({
    neurodiversityProfile: [],
    expertise: [], // Teaching specializations for instructors
    bio: '',
    otherNeurodiversity: '', // Separate field for "other" neurodiversity description
    otherExpertise: '', // Separate field for "other" expertise description
    role: 'student' // Default to student
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch current profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        console.error('No user ID available for onboarding')
        return
      }
      
      console.log('Fetching profile for user ID:', userId)

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
            expertise: data.expertise || [],
            bio: data.bio || '',
            otherNeurodiversity: '',
            otherExpertise: '',
            role: data.role || 'student'
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

  const handleExpertiseChange = (value) => {
    const currentExpertise = formData.expertise || []
    if (currentExpertise.includes(value)) {
      setFormData({
        ...formData,
        expertise: currentExpertise.filter(item => item !== value)
      })
    } else {
      setFormData({
        ...formData,
        expertise: [...currentExpertise, value]
      })
    }
  }

  const handleRoleChange = (newRole) => {
    setFormData({
      ...formData,
      role: newRole
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!userId) {
      alert('User ID not found. Please try logging in again.')
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare neurodiversity profile
      let neurodiversityProfile = [...formData.neurodiversityProfile]
      if (neurodiversityProfile.includes('other') && formData.otherNeurodiversity.trim()) {
        neurodiversityProfile = neurodiversityProfile.filter(item => item !== 'other')
        neurodiversityProfile.push(formData.otherNeurodiversity.trim())
      }

      // Prepare expertise (for instructors)
      let expertise = [...(formData.expertise || [])]
      if (expertise.includes('other') && formData.otherExpertise.trim()) {
        expertise = expertise.filter(item => item !== 'other')
        expertise.push(formData.otherExpertise.trim())
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: formData.role,
          neurodiversity_profile: neurodiversityProfile,
          expertise: formData.role === 'instructor' ? expertise : [],
          bio: formData.bio.trim() || null,
          onboarding_completed: true
        })
        .eq('id', userId)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        alert('Failed to save profile. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Navigate based on role
      if (formData.role === 'instructor') {
        navigate('/teach/dashboard')
      } else {
        navigate('/learn/dashboard')
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      alert('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <div className="onboarding-header">
          <h1>Welcome to UniqueBrains, {userName}! 🎉</h1>
          <p>Let's set up your profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {/* Role Selection */}
          <div className="form-section">
            <h2>I am a...</h2>
            <div className="role-cards">
              <div 
                className={`role-card ${formData.role === 'student' ? 'selected' : ''}`}
                onClick={() => handleRoleChange('student')}
              >
                <div className="role-icon">🎓</div>
                <h3>Student</h3>
                <p>Enroll in courses and learn</p>
              </div>

              <div 
                className={`role-card ${formData.role === 'instructor' ? 'selected' : ''}`}
                onClick={() => handleRoleChange('instructor')}
              >
                <div className="role-icon">👨‍🏫</div>
                <h3>Instructor</h3>
                <p>Create and teach courses</p>
              </div>
            </div>
          </div>

          {/* Teaching Specializations (for instructors) */}
          {formData.role === 'instructor' && (
            <div className="form-section">
              <h2>Your Teaching Specializations</h2>
              <p className="section-description">
                What neurodiversity areas do you specialize in or have experience teaching?
              </p>

              <div className="checkbox-group">
                {neurodiversityOptions.map(option => (
                  <label key={option.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.expertise.includes(option.value)}
                      onChange={() => handleExpertiseChange(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              {formData.expertise.includes('other') && (
                <div className="form-group">
                  <label htmlFor="otherExpertise">Please specify:</label>
                  <input
                    type="text"
                    id="otherExpertise"
                    value={formData.otherExpertise}
                    onChange={(e) => setFormData({ ...formData, otherExpertise: e.target.value })}
                    placeholder="e.g., Sensory Processing Disorder"
                  />
                </div>
              )}
            </div>
          )}

          {/* Neurodiversity Profile (for all users) */}
          <div className="form-section">
            <h2>Your Neurodiversity Profile (Optional)</h2>
            <p className="section-description">
              {formData.role === 'instructor' 
                ? 'Share your own neurodiversity profile if you\'d like. This helps build trust with families.'
                : 'Help us personalize your learning experience by sharing your neurodiversity profile.'
              }
            </p>

            <div className="checkbox-group">
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

            {formData.neurodiversityProfile.includes('other') && (
              <div className="form-group">
                <label htmlFor="otherNeurodiversity">Please specify:</label>
                <input
                  type="text"
                  id="otherNeurodiversity"
                  value={formData.otherNeurodiversity}
                  onChange={(e) => setFormData({ ...formData, otherNeurodiversity: e.target.value })}
                  placeholder="e.g., Sensory Processing Disorder"
                />
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="form-section">
            <h2>About You</h2>
            <p className="section-description">
              {formData.role === 'instructor'
                ? 'Tell families about your teaching experience and approach.'
                : 'Tell us a bit about yourself and your learning goals.'
              }
            </p>

            <div className="form-group">
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={formData.role === 'instructor' 
                  ? "e.g., I'm a certified special education teacher with 10 years of experience..."
                  : "e.g., I love art and music, and I'm excited to learn new things..."
                }
                rows="4"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary btn-full"
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
