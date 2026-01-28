import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './StudentProfile.css'

function StudentProfile() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: profile?.email || user?.email || '',
    bio: profile?.bio || '',
    expertise: profile?.expertise || [],
    neurodiversityProfile: profile?.neurodiversity_profile || [],
    otherNeeds: profile?.other_needs || '',
    otherExpertise: ''
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [originalData, setOriginalData] = useState(null)

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      const data = {
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || user?.email || '',
        bio: profile.bio || '',
        expertise: profile.expertise || [],
        neurodiversityProfile: profile.neurodiversity_profile || [],
        otherNeeds: profile.other_needs || '',
        otherExpertise: ''
      }
      setFormData(data)
      setOriginalData(data)
    }
  }, [profile, user])

  // Check if form has changes
  useEffect(() => {
    if (originalData) {
      const changed = 
        formData.firstName !== originalData.firstName ||
        formData.lastName !== originalData.lastName ||
        formData.email !== originalData.email ||
        formData.bio !== originalData.bio ||
        formData.otherNeeds !== originalData.otherNeeds ||
        JSON.stringify(formData.expertise) !== JSON.stringify(originalData.expertise) ||
        JSON.stringify(formData.neurodiversityProfile) !== JSON.stringify(originalData.neurodiversityProfile)
      setHasChanges(changed)
    }
  }, [formData, originalData])

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = (e) => {
    e.preventDefault()
    // In a real app, this would update the user profile via API
    alert('Profile updated successfully!')
    setOriginalData(formData)
    setHasChanges(false)
  }

  const handleCancel = () => {
    setFormData(originalData)
    setHasChanges(false)
  }

  const isInstructor = profile?.role === 'instructor'

  return (
    <div className="student-profile">
      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p className="profile-subtitle">
            {isInstructor 
              ? 'Manage your personal information and teaching profile' 
              : 'Manage your personal information and learning preferences'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="profile-form">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {isInstructor && (
          <div className="profile-section">
            <h2>Teaching Profile</h2>
            <p className="section-description">
              Complete your teaching profile to help families find you and understand your expertise.
            </p>

            <div className="form-group">
              <label htmlFor="bio">About You</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                placeholder="Tell families about your teaching experience and approach..."
              />
            </div>

            <div className="form-group">
              <label>Your Teaching Specializations</label>
              <p className="field-hint">What neurodiversity areas do you specialize in or have experience teaching?</p>
              <div className="checkbox-grid">
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
            </div>

            {formData.expertise.includes('other') && (
              <div className="form-group">
                <label htmlFor="otherExpertise">Please specify other expertise:</label>
                <input
                  type="text"
                  id="otherExpertise"
                  name="otherExpertise"
                  value={formData.otherExpertise}
                  onChange={handleInputChange}
                  placeholder="e.g., Sensory Processing Disorder"
                />
              </div>
            )}
          </div>
        )}

        <div className="profile-section">
          <h2>{isInstructor ? 'Your Unique Mind' : 'Your Learning Style'}</h2>
          <p className="section-description">
            {isInstructor 
              ? 'Share what makes your mind unique to help students understand your teaching approach and create a more inclusive learning environment. This information is visible to enrolled students.'
              : 'Help us understand what makes your mind unique so instructors can provide the best support. This information is private and only shared with your enrolled instructors.'}
          </p>

          <div className="form-group">
            <label>What's unique about your mind? (Select all that apply)</label>
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
              <label htmlFor="otherNeeds">
                {isInstructor 
                  ? 'Please specify other information' 
                  : 'Please specify other learning needs'}
              </label>
              <textarea
                id="otherNeeds"
                name="otherNeeds"
                value={formData.otherNeeds}
                onChange={handleInputChange}
                rows="3"
                placeholder={isInstructor 
                  ? 'Describe your teaching approach or any relevant information...'
                  : 'Describe any other learning needs or accommodations...'}
              />
            </div>
          )}
        </div>

        {hasChanges && (
          <div className="profile-actions">
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        )}
      </form>

      <div className="profile-section danger-zone">
        <h2>Account Management</h2>
        <p className="section-description">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button 
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.')) {
              // TODO: Implement account deletion
              alert('Account deletion will be implemented soon.')
            }
          }}
          className="btn-danger"
        >
          Delete Account
        </button>
      </div>
    </div>
  )
}

export default StudentProfile
