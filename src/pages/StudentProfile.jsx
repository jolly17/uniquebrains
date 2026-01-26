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
    neurodiversityProfile: profile?.neurodiversity_profile || [],
    otherNeeds: profile?.other_needs || ''
  })

  const [isEditing, setIsEditing] = useState(false)

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || user?.email || '',
        neurodiversityProfile: profile.neurodiversity_profile || [],
        otherNeeds: profile.other_needs || ''
      })
    }
  }, [profile, user])

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

  const handleSave = (e) => {
    e.preventDefault()
    // In a real app, this would update the user profile via API
    alert('Profile updated successfully!')
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      email: profile?.email || user?.email || '',
      neurodiversityProfile: profile?.neurodiversity_profile || [],
      otherNeeds: profile?.other_needs || ''
    })
    setIsEditing(false)
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
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-primary">
            Edit Profile
          </button>
        )}
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
                disabled={!isEditing}
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
                disabled={!isEditing}
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
              disabled={!isEditing}
              required
            />
          </div>
        </div>

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
                    disabled={!isEditing}
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
                disabled={!isEditing}
                rows="3"
                placeholder={isInstructor 
                  ? 'Describe your teaching approach or any relevant information...'
                  : 'Describe any other learning needs or accommodations...'}
              />
            </div>
          )}
        </div>

        {isEditing && (
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

      {profile?.role === 'parent' && (
        <div className="profile-section">
          <h2>Child Management</h2>
          <p className="section-description">
            Manage your children's profiles and learning preferences.
          </p>
          <button 
            onClick={() => navigate('/manage-students')} 
            className="btn-primary"
          >
            📚 Manage Children
          </button>
        </div>
      )}

      <div className="profile-section danger-zone">
        <h2>Account Settings</h2>
        <button className="btn-danger">Change Password</button>
      </div>
    </div>
  )
}

export default StudentProfile
