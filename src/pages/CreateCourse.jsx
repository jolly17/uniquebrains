import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

function CreateCourse() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'parenting',
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

  const handleDayToggle = (day) => {
    const currentDays = formData.selectedDays
    if (currentDays.includes(day)) {
      setFormData({
        ...formData,
        selectedDays: currentDays.filter(d => d !== day)
      })
      // Clear time when day is unchecked
      setDayTimes({
        ...dayTimes,
        [day]: ''
      })
    } else {
      setFormData({
        ...formData,
        selectedDays: [...currentDays, day]
      })
    }
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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    console.log('Course created with category:', formData.category)
    alert('Course created successfully!')
    navigate('/instructor/dashboard')
  }

  return (
    <div className="create-course">
      <h1>Create New Course</h1>
      
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
          <label htmlFor="price">Price ($)</label>
          <input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="enrollmentLimit">Maximum Students (Optional)</label>
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
            Set a maximum number of students to maintain appropriate class size
          </p>
        </div>

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

        {!formData.isSelfPaced && (
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
          <button type="submit" className="btn-primary btn-full">
            Create Course
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCourse
