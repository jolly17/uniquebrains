import { useState, useEffect } from 'react'
import { fetchAllCourses, updateCourse, deleteCourse } from '../../services/adminService'
import DataTable from '../../components/admin/DataTable'
import EditModal from '../../components/admin/EditModal'
import './AdminCourses.css'

function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingCourse, setEditingCourse] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)

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
      key: 'status',
      label: 'Status',
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' }
      ]
    }
  ]

  const handleEdit = (course) => {
    setEditingCourse(course)
    setShowEditModal(true)
  }

  const handleSave = async (formData) => {
    try {
      await updateCourse(editingCourse.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        is_published: formData.status === 'published'
      })
      await loadCourses()
      setShowEditModal(false)
      setEditingCourse(null)
    } catch (err) {
      console.error('Error updating course:', err)
      alert('Failed to update course')
    }
  }

  const handleDelete = (course) => {
    setCourseToDelete(course)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteCourse(courseToDelete.id)
      await loadCourses()
      setShowDeleteConfirm(false)
      setCourseToDelete(null)
    } catch (err) {
      console.error('Error deleting course:', err)
      alert('Failed to delete course. It may have enrollments or sessions.')
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'instructor_name', label: 'Instructor' },
    { key: 'category', label: 'Category' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge status-${value}`}>
          {value}
        </span>
      )
    },
    { key: 'enrollment_count', label: 'Enrollments' }
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

      {error && <div className="error-message">{error}</div>}

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
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "{courseToDelete?.title}"?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="dialog-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCourses
