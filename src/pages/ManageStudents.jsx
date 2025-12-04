import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './ManageStudents.css'

function ManageStudents() {
  const { students, addStudent, updateStudent, deleteStudent, activeStudent, switchStudent } = useAuth()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    age: '',
    neurodiversityProfile: [],
    otherNeeds: ''
  })

  const neurodiversityOptions = [
    { value: 'autism', label: 'Autism Spectrum' },
    { value: 'adhd', label: 'ADHD' },
    { value: 'dyslexia', label: 'Dyslexia' },
    { value: 'multiple', label: 'Multiple Conditions' },
    { value: 'other', label: 'Other' }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleNeurodiversityChange = (value) => {
    const currentProfile = formData.neurodiversityProfile
    if (currentProfile.includes(value)) {
      setFormData({
        ...formData,
        neurodiversityProfile: currentProfile.filter(v => v !== value)
      })
    } else {
      setFormData({
        ...formData,
        neurodiversityProfile: [...currentProfile, value]
      })
    }
  }

  const handleAdd = () => {
    setFormData({
      firstName: '',
      age: '',
      neurodiversityProfile: [],
      otherNeeds: ''
    })
    setEditingStudent(null)
    setShowAddModal(true)
  }

  const handleEdit = (student) => {
    setFormData({
      firstName: student.firstName,
      age: student.age,
      neurodiversityProfile: student.neurodiversityProfile || [],
      otherNeeds: student.otherNeeds || ''
    })
    setEditingStudent(student)
    setShowAddModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingStudent) {
      updateStudent(editingStudent.id, formData)
    } else {
      addStudent(formData)
    }
    
    setShowAddModal(false)
    setFormData({
      firstName: '',
      age: '',
      neurodiversityProfile: [],
      otherNeeds: ''
    })
  }

  const handleDelete = (studentId) => {
    if (students.length === 1) {
      alert('You must have at least one student profile')
      return
    }
    
    if (window.confirm('Are you sure you want to delete this student profile? This will remove all their enrollments.')) {
      deleteStudent(studentId)
    }
  }

  return (
    <div className="manage-students">
      <div className="students-header">
        <h1>Manage Student Profiles</h1>
        <button onClick={handleAdd} className="btn-primary">
          + Add Student
        </button>
      </div>

      <div className="students-grid">
        {students.map(student => (
          <div 
            key={student.id} 
            className={`student-card ${activeStudent?.id === student.id ? 'active' : ''}`}
          >
            <div className="student-info">
              <div className="student-avatar">
                {student.firstName.charAt(0).toUpperCase()}
              </div>
              <div className="student-details">
                <h3>{student.firstName}</h3>
                <p className="student-age">Age: {student.age}</p>
                {student.neurodiversityProfile && student.neurodiversityProfile.length > 0 && (
                  <div className="student-profile">
                    {student.neurodiversityProfile.map(profile => (
                      <span key={profile} className="profile-badge">
                        {neurodiversityOptions.find(o => o.value === profile)?.label || profile}
                      </span>
                    ))}
                  </div>
                )}
                <p className="student-courses">
                  {student.enrolledCourses?.length || 0} courses enrolled
                </p>
              </div>
            </div>
            
            <div className="student-actions">
              {activeStudent?.id !== student.id && (
                <button 
                  onClick={() => switchStudent(student.id)}
                  className="btn-secondary btn-sm"
                >
                  Switch To
                </button>
              )}
              {activeStudent?.id === student.id && (
                <span className="active-badge">Active</span>
              )}
              <button 
                onClick={() => handleEdit(student)}
                className="btn-secondary btn-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(student.id)}
                className="btn-secondary btn-sm btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="3"
                  max="18"
                />
              </div>

              <div className="form-group">
                <label>Learning Profile (Optional)</label>
                <div className="checkbox-group">
                  {neurodiversityOptions.map(option => (
                    <label key={option.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.neurodiversityProfile.includes(option.value)}
                        onChange={() => handleNeurodiversityChange(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                
                {formData.neurodiversityProfile.includes('other') && (
                  <div className="nested-field">
                    <input
                      type="text"
                      name="otherNeeds"
                      placeholder="Please describe specific needs..."
                      value={formData.otherNeeds}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageStudents
