import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
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
        age: profile.age || '',
        gradeLevel: profile.grade_level || '',
        expertise: profile.expertise || [],
        neurodiversityProfile: profile.neurodiversity_profile || [],
        interests: profile.interests || [],
        otherExpertise: '',
        otherInterest: ''
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
        formData.age !== originalData.age ||
        formData.gradeLevel !== originalData.gradeLevel ||
        JSON.stringify(formData.expertise) !== JSON.stringify(originalData.expertise) ||
        JSON.stringify(formData.neurodiversityProfile) !== JSON.stringify(originalData.neurodiversityProfile) ||
        JSON.stringify(formData.interests) !== JSON.stringify(originalData.interests)
      setHasChanges(changed)
    }
  }, [formData, originalData])

  const neurodiversityOptions = [
    { value: 'none', label: 'None / Neurotypical' },
    { value: 'autism', label: 'Autism Spectrum' },
    { value: 'adhd', label: 'ADHD' },
    { value: 'dyslexia', label: 'Dyslexia' },
    { value: 'dysgraphia', label: 'Dysgraphia' },
    { value: 'dyscalculia', label: 'Dyscalculia' },
    { value: 'other', label: 'Other' }
  ]

  const interestOptions = [
    { value: 'art', label: 'Art & Drawing' },
    { value: 'music', label: 'Music' },
    { value: 'science', label: 'Science' },
    { value: 'math', label: 'Mathematics' },
    { value: 'reading', label: 'Reading & Literature' },
    { value: 'coding', label: 'Coding & Technology' },
    { value: 'sports', label: 'Sports & Physical Activity' },
    { value: 'nature', label: 'Nature & Animals' },
    { value: 'history', label: 'History' },
    { value: 'languages', label: 'Languages' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'cooking', label: 'Cooking & Baking' },
    { value: 'other', label: 'Other' }
  ]

  const gradeLevelOptions = [
    'Pre-K',
    'Kindergarten',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
    'Grade 10',
    'Grade 11',
    'Grade 12',
    'College/University',
    'Adult Learner'
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

  const handleInterestChange = (value) => {
    const currentInterests = formData.interests || []
    if (currentInterests.includes(value)) {
      setFormData({
        ...formData,
        interests: currentInterests.filter(item => item !== value)
      })
    } else {
      setFormData({
        ...formData,
        interests: [...currentInterests, value]
      })
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('You must be logged in to update your profile')
      return
    }

    try {
      // Prepare expertise array (handle "other" option)
      let expertise = [...formData.expertise]
      if (expertise.includes('other') && formData.otherExpertise.trim()) {
        expertise = expertise.filter(item => item !== 'other')
        expertise.push(formData.otherExpertise.trim())
      }

      // Prepare interests array (handle "other" option)
      let interests = [...formData.interests]
      if (interests.includes('other') && formData.otherInterest.trim()) {
        interests = interests.filter(item => item !== 'other')
        interests.push(formData.otherInterest.trim())
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          bio: formData.bio,
          age: formData.age ? parseInt(formData.age) : null,
          grade_level: formData.gradeLevel || null,
          expertise: expertise,
          neurodiversity_profile: formData.neurodiversityProfile,
          interests: interests
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        alert('Failed to update profile. Please try again.')
        return
      }

      alert('Profile updated successfully!')
      setOriginalData(formData)
      setHasChanges(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setHasChanges(false)
  }

  const isInstructor = profile?.role === 'instructor'
  const roleLabel = isInstructor ? "Instructor's" : "Student's"

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
        <button
          type="button"
          onClick={() => navigate('/courses/my-courses')}
          className="btn-primary"
          style={{ whiteSpace: 'nowrap' }}
        >
          📚 My Courses
        </button>
      </div>

      <form onSubmit={handleSave} className="profile-form">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">{roleLabel} First Name</label>
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
              <label htmlFor="lastName">{roleLabel} Last Name</label>
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

          {!isInstructor && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">{roleLabel} Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="3"
                    max="100"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter age"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gradeLevel">{roleLabel} Grade Level</label>
                  <select
                    id="gradeLevel"
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleInputChange}
                  >
                    <option value="">Select grade level</option>
                    {gradeLevelOptions.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {isInstructor && (
          <div className="profile-section">
            <h2>About You</h2>
            <p className="section-description">
              Tell families about your teaching experience, approach, and any additional information that helps them understand your expertise.
            </p>

            <div className="form-group">
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="6"
                placeholder="e.g., I'm a certified special education teacher with 10 years of experience working with neurodivergent children. I specialize in creating inclusive learning environments and adapting teaching methods to each student's unique needs..."
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

        {!isInstructor && (
          <div className="profile-section">
            <h2>About the Student</h2>
            <p className="section-description">
              Tell us about the student, their learning goals, and any additional information that helps instructors support them better.
            </p>

            <div className="form-group">
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                placeholder="e.g., I love art and music, and I'm excited to learn new things. I learn best with visual aids and hands-on activities..."
              />
            </div>

            <div className="form-group">
              <label>{roleLabel} Interests</label>
              <p className="field-hint">What topics or activities does the student enjoy?</p>
              <div className="checkbox-grid">
                {interestOptions.map(option => (
                  <label key={option.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(option.value)}
                      onChange={() => handleInterestChange(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.interests.includes('other') && (
              <div className="form-group">
                <label htmlFor="otherInterest">Please specify other interest:</label>
                <input
                  type="text"
                  id="otherInterest"
                  name="otherInterest"
                  value={formData.otherInterest}
                  onChange={handleInputChange}
                  placeholder="e.g., Robotics, Photography"
                />
              </div>
            )}
          </div>
        )}

        <div className="profile-section">
          <h2>{isInstructor ? "Instructor's Unique Mind" : "Student's Learning Style"}</h2>
          <p className="section-description">
            {isInstructor 
              ? 'Share what makes your mind unique to help students understand your teaching approach and create a more inclusive learning environment. This information is visible to enrolled students.'
              : 'Help us understand what makes the student\'s mind unique so instructors can provide the best support. This information is private and only shared with enrolled instructors.'}
          </p>

          <div className="form-group">
            <label>What's unique about the {isInstructor ? "instructor's" : "student's"} mind? (Select all that apply)</label>
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
