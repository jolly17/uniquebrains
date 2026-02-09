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
    bio: '',
    otherNeurodiversity: '' // Separate field for "other" neurodiversity description
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
            bio: data.bio || '',
            otherNeurodiversity: ''
          })
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
      }
    }

    fetchProfile()
  }, [userId])

  const neurodiversityOptions = [
    { value: 'none', label: 'None / Neurotypical' },
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

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          neurodiversity_profile: neurodiversityProfile,
          bio: formData.bio.trim() || null
        })
        .eq('id', userId)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        alert('Failed to save profile. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Navigate to unified dashboard
      navigate('/courses/my-courses')
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
          {/* Neurodiversity Profile */}
          <div className="form-section">
            <h2>Your Neurodiversity Profile (Optional)</h2>
            <p className="section-description">
              Help us personalize your experience by sharing your neurodiversity profile. This is completely optional.
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
              Tell us a bit about yourself, your interests, and what you'd like to learn or teach.
            </p>

            <div className="form-group">
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="e.g., I love art and music, and I'm excited to explore new learning opportunities..."
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
