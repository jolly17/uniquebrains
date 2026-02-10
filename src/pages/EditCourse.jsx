import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import './Auth.css'

function EditCourse() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  async function loadCourseData() {
    if (!user) {
      setError('You must be logged in to edit courses')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      // Fetch course by ID
      const course = await handleApiCall(api.courses.getById, courseId)

      // Verify user is the course instructor
      if (course.instructor_id !== user.id) {
        setError('You do not have permission to edit this course')
        setLoading(false)
        return
      }

      // Transform course data to match form structure
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || 'performing-arts',
        ageGroup: course.age_group || 'All ages',
        courseType: course.course_type || 'group',
        price: course.price || '',
        sessionDuration: course.session_duration || '',
        sessionTime: course.session_time || '',
        timezone: course.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        enrollmentLimit: course.enrollment_limit || '',
        meetingLink: course.meeting_link || '',
        startDate: course.start_date || '',
        repeatEvery: 1,
        repeatUnit: 'week',
        selectedDays: course.selected_days || [],
        endDate: course.end_date || '',
        hasEndDate: course.has_end_date || false
      })

      setLoading(false)
    } catch (err) {
      console.error('Error loading course:', err)
      setError(err.message || 'Failed to load course data')
      setLoading(false)
    }
  }

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
      setError('You must be logged in to update a course')
      return
    }

    setSaving(true)
    setError('')

    try {
      // Prepare course data for the API
      const updates = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        age_group: formData.ageGroup,
        course_type: formData.courseType,
        session_duration: formData.sessionDuration,
        enrollment_limit: formData.enrollmentLimit,
        meeting_link: formData.meetingLink,
        timezone: formData.timezone,
        start_date: formData.startDate,
        session_time: formData.sessionTime,
        selected_days: formData.selectedDays,
        has_end_date: formData.hasEndDate,
        end_date: formData.endDate
      }

      // Use the API service to update the course
      await handleApiCall(api.courses.update, courseId, updates, user.id)
      
      alert('Course updated successfully!')
      navigate(`/courses/${courseId}`)
      
    } catch (error) {
      console.error('Error updating course:', error)
      setError(error.message || 'Failed to update course. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="create-course" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading course data...</p>
        </div>
      </div>
    )
  }

  if (error && !formData) {
    return (
      <div className="create-course" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="error-message" style={{ 
          background: '#fee2e2', 
          border: '1px solid #fecaca', 
          color: '#dc2626', 
          padding: '0.75rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Go Back
        </button>
      </div>
    )
  }

  if (!formData) {
    return null
  }

  return (
    <div className="create-course" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '1.75rem' }}>Edit Course</h1>
      
      {error && (
        <div className="error-message" style={{ 
          background: '#fee2e2', 
          border: '1px solid #fecaca', 
          color: '#dc2626', 
          padding: '0.75rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '100%' }}>
        {/* Two-column grid layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
          
          {/* Left Column */}
          <div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="title" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Course Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Introduction to Positive Parenting"
                style={{ padding: '0.5rem' }}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="description" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Describe what students will learn..."
                style={{ padding: '0.5rem' }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label htmlFor="category" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{ padding: '0.5rem' }}
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

              <div className="form-group">
                <label htmlFor="ageGroup" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Age Group *</label>
                <select
                  id="ageGroup"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  required
                  style={{ padding: '0.5rem' }}
                >
                  <option value="All ages">👥 All ages</option>
                  <option value="5-8 years">🧒 5-8 years</option>
                  <option value="9-12 years">👦 9-12 years</option>
                  <option value="13-18 years">🧑 13-18 years</option>
                  <option value="Adults">👨 Adults</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label htmlFor="courseType" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Course Type *</label>
                <select
                  id="courseType"
                  name="courseType"
                  value={formData.courseType}
                  onChange={handleChange}
                  required
                  style={{ padding: '0.5rem' }}
                >
                  <option value="group">Group Class 👥</option>
                  <option value="one-on-one">One-on-One 👤</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label htmlFor="price" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Price ($)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value="0.00"
                  disabled
                  style={{ 
                    backgroundColor: '#f3f4f6', 
                    cursor: 'not-allowed',
                    color: '#6b7280',
                    padding: '0.5rem'
                  }}
                  placeholder="0.00"
                />
                <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>
                  ✨ Free for all
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="enrollmentLimit" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  Max Students
                </label>
                <input
                  id="enrollmentLimit"
                  name="enrollmentLimit"
                  type="number"
                  value={formData.enrollmentLimit}
                  onChange={handleChange}
                  min="1"
                  placeholder="Unlimited"
                  style={{ padding: '0.5rem' }}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Schedule Section */}
          <div>
            {formData.courseType === 'one-on-one' && (
              <div style={{ 
                background: '#dbeafe', 
                borderLeft: '4px solid #3b82f6', 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                <p style={{ margin: 0, color: '#1e40af' }}>
                  ℹ️ Schedule individual sessions with each student after enrollment.
                </p>
              </div>
            )}

            {formData.courseType === 'group' && (
              <>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#374151' }}>Schedule</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="sessionDuration" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Duration (min) *</label>
                    <input
                      id="sessionDuration"
                      name="sessionDuration"
                      type="number"
                      value={formData.sessionDuration}
                      onChange={handleChange}
                      required
                      min="15"
                      step="15"
                      placeholder="60"
                      style={{ padding: '0.5rem' }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sessionTime" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Time *</label>
                    <input
                      id="sessionTime"
                      name="sessionTime"
                      type="time"
                      value={formData.sessionTime}
                      onChange={handleChange}
                      required
                      style={{ padding: '0.5rem' }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="timezone" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Timezone *</label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      required
                      style={{ padding: '0.5rem' }}
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
                    <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                      Students will see times in their local timezone
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="startDate" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Start Date *</label>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      style={{ padding: '0.5rem' }}
                    />
                  </div>

                  {formData.hasEndDate && (
                    <div className="form-group">
                      <label htmlFor="endDate" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>End Date *</label>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        min={formData.startDate}
                        required={formData.hasEndDate}
                        style={{ padding: '0.5rem' }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Repeat Every *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      name="repeatEvery"
                      value={formData.repeatEvery}
                      onChange={handleChange}
                      min="1"
                      max="52"
                      required
                      style={{ width: '80px', padding: '0.5rem' }}
                    />
                    <select
                      name="repeatUnit"
                      value={formData.repeatUnit}
                      onChange={handleChange}
                      required
                      style={{ flex: 1, padding: '0.5rem' }}
                    >
                      <option value="day">Day(s)</option>
                      <option value="week">Week(s)</option>
                      <option value="month">Month(s)</option>
                    </select>
                  </div>
                </div>

                {formData.repeatUnit === 'week' && (
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>On These Days *</label>
                    <div className="days-selector">
                      {[
                        { short: 'M', full: 'Monday' },
                        { short: 'T', full: 'Tuesday' },
                        { short: 'W', full: 'Wednesday' },
                        { short: 'T', full: 'Thursday' },
                        { short: 'F', full: 'Friday' },
                        { short: 'S', full: 'Saturday' },
                        { short: 'S', full: 'Sunday' }
                      ].map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`day-button ${formData.selectedDays.includes(day.full) ? 'active' : ''}`}
                          onClick={() => toggleDay(day.full)}
                          style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                        >
                          {day.short}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      name="hasEndDate"
                      checked={formData.hasEndDate}
                      onChange={handleChange}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Set an end date
                  </label>
                </div>
              </>
            )}

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="meetingLink" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Meeting Link (Optional)
              </label>
              <input
                id="meetingLink"
                name="meetingLink"
                type="url"
                value={formData.meetingLink}
                onChange={handleChange}
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                style={{ padding: '0.5rem' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                💡 This link will be used for all sessions. You can add or update it later.
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary" style={{ minWidth: '120px' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving} style={{ minWidth: '120px' }}>
            {saving ? 'Updating...' : 'Update Course'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditCourse
