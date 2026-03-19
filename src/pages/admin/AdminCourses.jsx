import { useState, useEffect } from 'react'
import { fetchAllCourses, updateCourse, deleteCourse } from '../../services/adminService'
import DataTable from '../../components/admin/DataTable'
import EditModal from '../../components/admin/EditModal'
import './AdminCourses.css'

function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingCourse, setEditingCourse] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await fetchAllCourses()
      setCourses(data)
      setError('')
    } catch (err) {
      console.error('Error loading courses:', err)
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Extract unique values for filters
  const getUniqueInstructors = () => {
    const instructors = new Set()
    courses.forEach(course => {
      if (course.instructor_name) {
        instructors.add(course.instructor_name)
      }
    })
    return Array.from(instructors).sort().map(name => ({
      value: name,
      label: name
    }))
  }

  const getUniqueCategories = () => {
    const categories = new Set()
    courses.forEach(course => {
      if (course.category) {
        categories.add(course.category)
      }
    })
    return Array.from(categories).sort().map(cat => ({
      value: cat,
      label: cat
    }))
  }

  const filters = [
    {
      key: 'instructor_name',
      label: 'Instructor',
      options: getUniqueInstructors()
    },
    {
      key: 'category',
      label: 'Category',
      options: getUniqueCategories()
    },
    {
      key: 'is_published',
      label: 'Status',
      options: [
        { value: 'true', label: 'Published' },
        { value: 'false', label: 'Draft' }
      ]
    }
  ]

  const handleEdit = (course) => {
    // Prepare the course data for the edit modal with a status field
    setEditingCourse({
      ...course,
      status: course.is_published ? 'published' : 'draft'
    })
    setShowEditModal(true)
  }

  const handleSave = async (formData) => {
    try {
      const isPublished = formData.status === 'published'
      await updateCourse(editingCourse.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        is_published: isPublished
      })
      await loadCourses()
      setShowEditModal(false)
      setEditingCourse(null)
      showSuccess('Course updated successfully!')
    } catch (err) {
      console.error('Error updating course:', err)
      setError('Failed to update course. Please try again.')
    }
  }

  const handleDelete = (course) => {
    setCourseToDelete(course)
    setShowDeleteConfirm(true)
    setError('') // Clear any previous errors
  }

  const confirmDelete = async () => {
    try {
      setDeleting(true)
      setError('')
      await deleteCourse(courseToDelete.id)
      await loadCourses()
      setShowDeleteConfirm(false)
      setCourseToDelete(null)
      showSuccess('Course deleted successfully!')
    } catch (err) {
      console.error('Error deleting course:', err)
      // Provide specific error message based on the error
      const errorMsg = err.message || ''
      if (errorMsg.includes('foreign key') || errorMsg.includes('violates') || errorMsg.includes('referenced')) {
        setError('Cannot delete this course because it has enrollments or sessions. Please remove those first, or unpublish the course instead.')
      } else {
        setError(`Failed to delete course: ${errorMsg || 'Unknown error. The course may have associated data (enrollments, sessions) that must be removed first.'}`)
      }
      setShowDeleteConfirm(false)
      setCourseToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'instructor_name', label: 'Instructor' },
    { key: 'category', label: 'Category' },
    { 
      key: 'is_published', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge ${value ? 'status-published' : 'status-draft'}`}>
          {value ? 'Published' : 'Draft'}
        </span>
      )
    },
    { key: 'enrollment_count', label: 'Enrollments' },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => value
        ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '-'
    }
  ]

  const editFields = [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'category', label: 'Category', type: 'text', required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select',
      required: true,
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' }
      ]
    }
  ]

  return (
    <div className="admin-courses">
      <div className="page-header">
        <h1>Courses Management</h1>
        <p>Manage all courses on the platform</p>
      </div>

      {successMessage && (
        <div className="success-banner">
          <span className="success-icon">✓</span>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button className="dismiss-btn" onClick={() => setError('')}>×</button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={courses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        filters={filters}
      />

      {showEditModal && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingCourse(null)
          }}
          onSave={handleSave}
          title="Edit Course"
          fields={editFields}
          initialData={editingCourse}
        />
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "<strong>{courseToDelete?.title}</strong>"?</p>
            {courseToDelete?.enrollment_count > 0 && (
              <p className="warning-text">
                ⚠️ This course has {courseToDelete.enrollment_count} enrollment(s). 
                Deleting may fail if there are active enrollments or sessions.
              </p>
            )}
            <p className="warning-text">This action cannot be undone.</p>
            <div className="dialog-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCourses
