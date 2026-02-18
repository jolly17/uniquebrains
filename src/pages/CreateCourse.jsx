import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import { supabase } from '../lib/supabase'
import TimeInput from '../components/TimeInput'
import './Auth.css'
import './CreateCourse.css'

function CreateCourse() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'performing-arts',
    ageGroup: 'All ages',
    courseType: 'group', // Always group - instructors can set enrollmentLimit to 1 for 1:1
    price: '',
    sessionDuration: '',
    sessionTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Auto-detect instructor's timezone
    enrollmentLimit: '',
    // Recurrence fields
    startDate: '',
    frequency: 'weekly', // weekly, monthly, or never
    selectedDays: [],
    endDate: ''
  })

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }



  const toggleDay = (day) => {
    const currentDays = formData.selectedDays
    if (currentDays.includes(day)) {
      setFormData({
        ...formData,
        selectedDays: currentDays.filter(d => d !== day)
      })
    } else {
      setFormData({
        ...formData,
        selectedDays: [...currentDays, day]
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to create a course')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Generate meeting link from instructor ID with UB- prefix
      const instructorPrefix = user.id.split('-')[0]
      const meetingLink = `https://meet.jit.si/UB-${instructorPrefix}`

      // Debug: Log the session time value
      console.log('Session Time from form:', formData.sessionTime)

      // Prepare course data for the API
      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        ageGroup: formData.ageGroup,
        courseType: formData.courseType,
        sessionDuration: formData.sessionDuration,
        enrollmentLimit: formData.enrollmentLimit,
        meetingLink: meetingLink, // Auto-generated meeting link with UB- prefix
        timezone: formData.timezone, // Store instructor's timezone
        frequency: formData.frequency, // weekly, biweekly, or never
        // Schedule data for session creation
        startDate: formData.startDate,
        sessionTime: formData.sessionTime,
        selectedDays: formData.selectedDays,
        endDate: formData.endDate || null // Optional end date
      }

      console.log('Course data being sent:', courseData)

      // Use the new API service to create the course
      const result = await handleApiCall(api.courses.create, courseData, user)
      
      console.log('Course created successfully:', result.course)
      
      // Check if instructor profile is complete (has expertise)
      if (!profile?.expertise || profile.expertise.length === 0) {
        setShowProfilePrompt(true)
      } else {
        alert(result.message)
        navigate('/teach/dashboard')
      }
      
    } catch (error) {
      console.error('Error creating course:', error)
      setError(error.message || 'Failed to create course. Please try again.')
      // Don't navigate away - keep user on form to fix the error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-course">
      <div className="create-course-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Create New Course</h1>
        <p className="course-subtitle">Set up your course details and schedule</p>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-card">
          <h2>Course Information</h2>
          
          <div className="form-content">
            <div className="form-section">
              <label htmlFor="title">Course Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Introduction to Positive Parenting"
                className="form-input"
              />
            </div>
            
            <div className="form-section">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe what students will learn..."
                className="form-input"
              />
            </div>
            
            <div className="form-row">
              <div className="form-section">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="performing-arts">Performing Arts 🎭</option>
                  <option value="visual-arts">Visual Arts 🎨</option>
                  <option value="parenting">Parenting 👨‍👩‍👧‍👦</option>
                  <option value="academics">Academics 📚</option>
                  <option value="language">Language 🌍</option>
                  <option value="spirituality">Spirituality 🧘</option>
                  <option value="lifeskills">Life Skills 🐷</option>
                  <option value="hobbies">Hobbies & Fun 🎮</option>
                </select>
              </div>

              <div className="form-section">
                <label htmlFor="ageGroup">Age Group *</label>
                <select
                  id="ageGroup"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="All ages">👥 All ages</option>
                  <option value="5-8 years">🧒 5-8 years</option>
                  <option value="9-12 years">👦 9-12 years</option>
                  <option value="13-18 years">🧑 13-18 years</option>
                  <option value="Adults">👨 Adults</option>
                </select>
              </div>

              <div className="form-section">
                <label htmlFor="enrollmentLimit">Max Students</label>
                <input
                  id="enrollmentLimit"
                  name="enrollmentLimit"
                  type="number"
                  value={formData.enrollmentLimit}
                  onChange={handleChange}
                  min="1"
                  placeholder="Unlimited"
                  className="form-input"
                />
                <p className="form-hint">💡 Set to 1 for one-on-one classes</p>
              </div>

              <div className="form-section">
                <label htmlFor="price">Price ($)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value="0.00"
                  disabled
                  className="form-input"
                  style={{ 
                    backgroundColor: '#f3f4f6', 
                    cursor: 'not-allowed',
                    color: '#6b7280'
                  }}
                  placeholder="0.00"
                />
                <p className="form-hint" style={{ color: '#10b981' }}>✨ Free for all</p>
              </div>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2>Schedule</h2>
          
          <div className="form-content">
            <div className="form-row">
              <div className="form-section">
                <label htmlFor="sessionTime">Session Time *</label>
                <TimeInput
                  id="sessionTime"
                  name="sessionTime"
                  value={formData.sessionTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-section">
                <label htmlFor="sessionDuration">Duration (minutes) *</label>
                <select
                  id="sessionDuration"
                  name="sessionDuration"
                  value={formData.sessionDuration}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Select duration</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>

              <div className="form-section">
                <label htmlFor="timezone">Timezone *</label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Anchorage">Alaska Time (AKT)</option>
                  <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Paris">Paris (CET/CEST)</option>
                  <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                  <option value="Asia/Dubai">Dubai (GST)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                </select>
                <p className="form-hint">Students will see times in their local timezone</p>
              </div>
            </div>

            <div className="form-section">
              <label>Days *</label>
              <div className="days-selector">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`day-button ${formData.selectedDays.includes(day) ? 'active' : ''}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label htmlFor="frequency">Repeat Every *</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                <option value="never">Never (One-time event)</option>
              </select>
              {formData.frequency === 'never' ? (
                <p className="form-hint">💡 One session will be created for each selected day above</p>
              ) : (
                <p className="form-hint">💡 Choose "Never" for single-session workshops</p>
              )}
            </div>

            <div className="form-row">
              <div className="form-section">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-section">
                <label htmlFor="endDate">End Date (Optional)</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  className="form-input"
                />
                <p className="form-hint">💡 Leave empty for ongoing course</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>

      {/* Instructor Profile Completion Prompt */}
      {showProfilePrompt && (
        <div className="modal-overlay" onClick={() => setShowProfilePrompt(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2>🎉 Course Created Successfully!</h2>
            <p style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              Help students learn more about you by completing your instructor profile with your teaching specializations.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowProfilePrompt(false)
                  navigate('/teach/dashboard')
                }} 
                className="btn-secondary"
              >
                Later
              </button>
              <button 
                onClick={() => {
                  setShowProfilePrompt(false)
                  navigate('/profile?section=instructor')
                }} 
                className="btn-primary"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateCourse
