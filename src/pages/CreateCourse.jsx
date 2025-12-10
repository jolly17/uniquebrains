import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function CreateCourse() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'parenting',
    courseType: 'group', // 'group' or 'one-on-one'
    price: '',
    sessionDuration: '',
    sessionTime: '',
    isSelfPaced: false,
    enrollmentLimit: '',
    // Recurrence fields
    startDate: '',
    repeatEvery: 1,
    repeatUnit: 'week',
    selectedDays: [],
    endDate: '',
    hasEndDate: false
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
      // Create the course record
      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        course_type: formData.courseType,
        price: 0, // Free for now
        session_duration: formData.sessionDuration ? parseInt(formData.sessionDuration) : null,
        enrollment_limit: formData.enrollmentLimit ? parseInt(formData.enrollmentLimit) : null,
        is_self_paced: formData.isSelfPaced,
        instructor_id: user.id,
        status: 'draft', // Start as draft
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single()

      if (courseError) {
        throw courseError
      }

      // If it's a group course with a schedule, create sessions
      if (formData.courseType === 'group' && !formData.isSelfPaced && formData.startDate) {
        const sessions = []
        const startDate = new Date(formData.startDate)
        
        // Generate sessions based on recurrence
        if (formData.repeatUnit === 'week' && formData.selectedDays.length > 0) {
          const endDate = formData.hasEndDate && formData.endDate 
            ? new Date(formData.endDate) 
            : new Date(startDate.getTime() + (12 * 7 * 24 * 60 * 60 * 1000)) // 12 weeks default

          let currentDate = new Date(startDate)
          let sessionNumber = 1

          while (currentDate <= endDate && sessionNumber <= 50) { // Max 50 sessions
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
            
            if (formData.selectedDays.includes(dayName)) {
              const sessionDateTime = new Date(currentDate)
              const [hours, minutes] = formData.sessionTime.split(':')
              sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

              sessions.push({
                course_id: course.id,
                title: `Session ${sessionNumber}`,
                description: `${formData.title} - Session ${sessionNumber}`,
                session_date: sessionDateTime.toISOString(),
                duration: parseInt(formData.sessionDuration),
                meeting_link: '', // Will be added later
                meeting_platform: null,
                status: 'scheduled',
                created_at: new Date().toISOString()
              })
              
              sessionNumber++
            }
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1)
          }
        }

        // Insert sessions if any were created
        if (sessions.length > 0) {
          const { error: sessionsError } = await supabase
            .from('sessions')
            .insert(sessions)

          if (sessionsError) {
            console.error('Error creating sessions:', sessionsError)
            // Don't fail the whole process, just log the error
          }
        }
      }

      console.log('Course created successfully:', course)
      alert('Course created successfully! You can now add meeting links and publish it.')
      navigate('/instructor/dashboard')
      
    } catch (error) {
      console.error('Error creating course:', error)
      setError(error.message || 'Failed to create course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-course">
      <h1>Create New Course</h1>
      
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
      
      <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label htmlFor="title">Course Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Introduction to Positive Parenting"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describe what students will learn..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="parenting">Parenting 👨‍👩‍👧‍👦</option>
            <option value="music">Music 🎵</option>
            <option value="dance">Dance 💃</option>
            <option value="drama">Drama 🎭</option>
            <option value="art">Art 🎨</option>
            <option value="language">Language 🌍</option>
          </select>
          <p className="field-description">
            Each category has a unique icon and color theme for your course
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="courseType">Course Type</label>
          <select
            id="courseType"
            name="courseType"
            value={formData.courseType}
            onChange={handleChange}
            required
          >
            <option value="group">Group Class 👥</option>
            <option value="one-on-one">One-on-One 👤</option>
          </select>
          <p className="field-description">
            Group classes have shared sessions for all students. One-on-one courses have individual sessions per student.
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price ($)</label>
          <input
            id="price"
            name="price"
            type="number"
            value="0.00"
            disabled
            style={{ 
              backgroundColor: '#f3f4f6', 
              cursor: 'not-allowed',
              color: '#6b7280'
            }}
            placeholder="0.00"
          />
          <p className="field-description" style={{ 
            color: '#10b981', 
            fontWeight: '500',
            marginTop: '0.5rem'
          }}>
            ✨ Currently all courses are offered free! Payments or donations can be managed outside the platform.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="enrollmentLimit">
            {formData.courseType === 'group' ? 'Maximum Students (Optional)' : 'Maximum Individual Students (Optional)'}
          </label>
          <input
            id="enrollmentLimit"
            name="enrollmentLimit"
            type="number"
            value={formData.enrollmentLimit}
            onChange={handleChange}
            min="1"
            placeholder="Leave empty for unlimited"
          />
          <p className="field-description">
            {formData.courseType === 'group' 
              ? 'Set a maximum class size for your group sessions'
              : 'Set how many individual students you can manage with separate schedules'
            }
          </p>
        </div>

        {formData.courseType === 'one-on-one' && (
          <div className="sessions-info-banner" style={{ 
            background: '#dbeafe', 
            borderLeft: '4px solid #3b82f6', 
            padding: '1rem 1.25rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem' 
          }}>
            <p style={{ margin: 0, color: '#1e40af', fontSize: '0.95rem', lineHeight: '1.6' }}>
              ℹ️ For one-on-one courses, you'll schedule individual sessions with each student after they enroll. 
              No need to set a fixed schedule now.
            </p>
          </div>
        )}

        {formData.courseType === 'group' && (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isSelfPaced"
                checked={formData.isSelfPaced}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              This is a self-paced course (no fixed schedule)
            </label>
          </div>
        )}

        {formData.courseType === 'group' && !formData.isSelfPaced && (
          <>
            <div className="form-group">
              <label htmlFor="sessionDuration">Session Duration (minutes)</label>
              <input
                id="sessionDuration"
                name="sessionDuration"
                type="number"
                value={formData.sessionDuration}
                onChange={handleChange}
                required={!formData.isSelfPaced}
                min="15"
                step="15"
                placeholder="60"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sessionTime">Session Time</label>
              <input
                id="sessionTime"
                name="sessionTime"
                type="time"
                value={formData.sessionTime}
                onChange={handleChange}
                required={!formData.isSelfPaced}
              />
            </div>

            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required={!formData.isSelfPaced}
              />
            </div>

            <div className="form-group">
              <label>Repeat Every</label>
              <div className="repeat-row">
                <input
                  type="number"
                  name="repeatEvery"
                  value={formData.repeatEvery}
                  onChange={handleChange}
                  min="1"
                  max="52"
                  required={!formData.isSelfPaced}
                  className="repeat-number"
                />
                <select
                  name="repeatUnit"
                  value={formData.repeatUnit}
                  onChange={handleChange}
                  required={!formData.isSelfPaced}
                  className="repeat-unit"
                >
                  <option value="day">Day(s)</option>
                  <option value="week">Week(s)</option>
                  <option value="month">Month(s)</option>
                </select>
              </div>
            </div>

            {formData.repeatUnit === 'week' && (
              <div className="form-group">
                <label>On These Days</label>
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
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
                {formData.selectedDays.length > 0 ? (
                  <p className="recurrence-summary">
                    Occurs every {formData.selectedDays.join(', ')} {formData.hasEndDate && formData.endDate ? `until ${new Date(formData.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}
                  </p>
                ) : (
                  <p className="field-description">
                    Select the days of the week when classes will occur
                  </p>
                )}
              </div>
            )}

            <div className="form-group">
              <label>
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

            {formData.hasEndDate && (
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  required={formData.hasEndDate}
                />
                <p className="field-description">
                  Leave unchecked for ongoing classes
                </p>
              </div>
            )}
          </>
        )}
        
        <div className="form-row" style={{ marginTop: '2rem' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn-full">
            Cancel
          </button>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Course...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCourse
