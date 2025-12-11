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
    role: 'parent' // Default to parent instead of student
  })

  const [students, setStudents] = useState([])
  const [currentStudent, setCurrentStudent] = useState({
    firstName: '',
    age: '',
    neurodiversityProfile: [],
    otherNeeds: ''
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

  const handleRoleChange = (newRole) => {
    // If switching from parent to instructor, clear students
    if (formData.role === 'parent' && newRole === 'instructor') {
      setStudents([])
      setCurrentStudent({
        firstName: '',
        age: '',
        neurodiversityProfile: [],
        otherNeeds: ''
      })
    }
    
    setFormData({
      ...formData,
      role: newRole
    })
  }

  const handleStudentChange = (e) => {
    setCurrentStudent({
      ...currentStudent,
      [e.target.name]: e.target.value
    })
  }

  const handleStudentNeurodiversityChange = (value) => {
    const currentProfile = currentStudent.neurodiversityProfile
    if (currentProfile.includes(value)) {
      setCurrentStudent({
        ...currentStudent,
        neurodiversityProfile: currentProfile.filter(item => item !== value)
      })
    } else {
      setCurrentStudent({
        ...currentStudent,
        neurodiversityProfile: [...currentProfile, value]
      })
    }
  }

  const addStudent = () => {
    if (!currentStudent.firstName || !currentStudent.age) {
      alert('Please fill in student name and age')
      return
    }

    const newStudent = {
      ...currentStudent,
      id: Date.now() // Temporary ID
    }

    setStudents([...students, newStudent])
    setCurrentStudent({
      firstName: '',
      age: '',
      neurodiversityProfile: [],
      otherNeeds: ''
    })
  }

  const removeStudent = (studentId) => {
    setStudents(students.filter(s => s.id !== studentId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!userId) {
      alert('User not authenticated. Please log in again.')
      navigate('/login')
      return
    }
    
    // Validate instructor has provided bio
    if (formData.role === 'instructor' && (!formData.bio || formData.bio.trim().length === 0)) {
      alert('Please provide information about your teaching approach.')
      setIsSubmitting(false)
      return
    }

    // Validate parent has added at least one student
    if (formData.role === 'parent' && students.length === 0) {
      alert('Please add at least one student to continue.')
      setIsSubmitting(false)
      return
    }

    // Validate instructor doesn't have students (in case of role switching)
    if (formData.role === 'instructor' && students.length > 0) {
      alert('Instructors cannot have student profiles. Please change your role to Parent or remove the students.')
      setIsSubmitting(false)
      return
    }
    
    setIsSubmitting(true)

    try {


      // Prepare profile data
      const profileData = {
        role: formData.role,
        bio: formData.bio,
        neurodiversity_profile: formData.neurodiversityProfile,
        expertise: formData.expertise || []
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

      // Create student profiles if parent
      if (formData.role === 'parent' && students.length > 0) {

        
        const studentProfiles = students.map(student => ({
          parent_id: userId,
          first_name: student.firstName,
          last_name: student.lastName || '',
          age: student.age ? parseInt(student.age) : null,
          neurodiversity_profile: student.neurodiversityProfile || [],
          other_needs: student.otherNeeds || '',
          bio: `Student managed by parent`
        }))

        const { error: studentsError } = await supabase
          .from('students')
          .insert(studentProfiles)

        if (studentsError) {
          console.error('Error creating student profiles:', studentsError)
          alert('Profile saved but failed to create student profiles. You can add them later.')
        } else {

        }
      }



      // Redirect based on role with small delay to ensure DB operations complete
      setTimeout(() => {
        console.log('Redirecting user with role:', formData.role)
        if (formData.role === 'instructor') {
          navigate('/instructor/create-course')
        } else if (formData.role === 'parent') {
          navigate('/marketplace')
        } else {
          navigate('/marketplace')
        }
      }, 500) // 500ms delay
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

  // Show loading if user not loaded yet
  if (!user) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="onboarding-header">
            <h1>Loading...</h1>
            <p>Please wait while we set up your account.</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error if no user ID
  if (!userId) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="onboarding-header">
            <h1>Authentication Error</h1>
            <p>Please log in again to continue.</p>
            <button onClick={() => navigate('/login')} className="btn-primary">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
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
                onClick={() => handleRoleChange('parent')}
              >
                <div className="role-icon">👨‍👩‍👧‍👦</div>
                <h3>Parent</h3>
                <p>Manage my children's learning</p>
              </div>
              <div 
                className={`role-card ${formData.role === 'instructor' ? 'selected' : ''}`}
                onClick={() => handleRoleChange('instructor')}
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

          {/* Teaching Specializations (for instructors only) */}
          {formData.role === 'instructor' && (
            <div className="form-section">
              <h2>Your Teaching Specializations</h2>
              <p className="section-description">
                What neurodiversity areas do you specialize in or have experience teaching? This helps parents find the right match.
              </p>

              <div className="form-group">
                <label>
                  Neurodiversity areas you specialize in (Optional - Select all that apply)
                </label>
                <div className="checkbox-grid">
                  {neurodiversityOptions.map(option => (
                    <label key={option.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.expertise?.includes(option.value) || false}
                        onChange={() => handleExpertiseChange(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.expertise?.includes('other') && (
                <div className="form-group">
                  <label htmlFor="otherExpertise">Please specify your other specializations</label>
                  <textarea
                    id="otherExpertise"
                    name="otherExpertise"
                    value={formData.otherExpertise}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe any other neurodiversity areas you specialize in..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Personal Neurodiversity Profile (optional for all) */}
          {(formData.role === 'parent' || formData.role === 'instructor') && (
            <div className="form-section">
              <h2>Your Neurodiversity Profile</h2>
              <p className="section-description">
                {formData.role === 'instructor' 
                  ? "Help parents find instructors who understand their children by sharing your own neurodiversity profile. Many of our best instructors are neurodiverse themselves."
                  : "Help us understand your own neurodiversity profile. This information helps match you with instructors who understand your perspective and is kept private."
                }
              </p>

              <div className="form-group">
                <label>
                  Your personal neurodiversity profile (Optional - Select all that apply)
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
                  <label htmlFor="otherNeurodiversity">Please specify</label>
                  <textarea
                    id="otherNeurodiversity"
                    name="otherNeurodiversity"
                    value={formData.otherNeurodiversity}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe any other aspects of your neurodiversity..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Student Creation (for parents) */}
          {formData.role === 'parent' && (
            <div className="form-section">
              <h2>Add Your Children</h2>
              <p className="section-description">
                Create profiles for your children so you can enroll them in courses and track their progress.
              </p>

              {/* Current Student Form */}
              <div className="student-form">
                <h3>Add a Student</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="studentFirstName">Student's First Name</label>
                    <input
                      id="studentFirstName"
                      name="firstName"
                      type="text"
                      value={currentStudent.firstName}
                      onChange={handleStudentChange}
                      placeholder="Enter student's name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="studentAge">Age</label>
                    <input
                      id="studentAge"
                      name="age"
                      type="number"
                      value={currentStudent.age}
                      onChange={handleStudentChange}
                      min="3"
                      max="18"
                      placeholder="Age"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Student's Learning Profile (Optional)</label>
                  <p className="field-description">
                    Help instructors understand your child's unique learning style and needs.
                  </p>
                  <div className="checkbox-grid">
                    {neurodiversityOptions.map(option => (
                      <label key={option.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={currentStudent.neurodiversityProfile.includes(option.value)}
                          onChange={() => handleStudentNeurodiversityChange(option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {currentStudent.neurodiversityProfile.includes('other') && (
                  <div className="form-group">
                    <label htmlFor="otherNeeds">Please specify other needs</label>
                    <textarea
                      id="otherNeeds"
                      name="otherNeeds"
                      value={currentStudent.otherNeeds}
                      onChange={handleStudentChange}
                      rows="3"
                      placeholder="Describe any specific learning needs, accommodations, or other important information..."
                    />
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={addStudent}
                  className="btn-secondary"
                  disabled={!currentStudent.firstName || !currentStudent.age}
                >
                  Add Student
                </button>
              </div>

              {/* Added Students List */}
              {students.length > 0 && (
                <div className="students-list">
                  <h3>Added Students ({students.length})</h3>
                  {students.map(student => (
                    <div key={student.id} className="student-card">
                      <div className="student-info">
                        <h4>{student.firstName}</h4>
                        <p>Age: {student.age}</p>
                        {student.neurodiversityProfile.length > 0 && (
                          <div className="student-badges">
                            {student.neurodiversityProfile.map(profile => (
                              <span key={profile} className="profile-badge">
                                {neurodiversityOptions.find(opt => opt.value === profile)?.label || profile}
                              </span>
                            ))}
                          </div>
                        )}
                        {student.otherNeeds && (
                          <p className="student-notes">{student.otherNeeds}</p>
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeStudent(student.id)}
                        className="btn-danger-small"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {students.length === 0 && (
                <div className="empty-students">
                  <p>No students added yet. Please add at least one student to continue.</p>
                </div>
              )}
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
