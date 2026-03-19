import { useState, useEffect, useCallback } from 'react'
import { fetchAllCourses, updateCourse, deleteCourse, updateCourseOrder } from '../../services/adminService'
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
  
  // Reorder mode state
  const [reorderMode, setReorderMode] = useState(false)
  const [reorderedCourses, setReorderedCourses] = useState([])
  const [savingOrder, setSavingOrder] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)

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
    setError('')
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

  // Reorder mode handlers
  const enterReorderMode = () => {
    setReorderedCourses([...courses])
    setReorderMode(true)
  }

  const cancelReorder = () => {
    setReorderMode(false)
    setReorderedCourses([])
    setDraggedIndex(null)
  }

  const moveItem = useCallback((fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= reorderedCourses.length) return
    setReorderedCourses(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
  }, [reorderedCourses.length])

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    // Add a slight delay to show the drag visual
    setTimeout(() => {
      e.target.closest('.reorder-row')?.classList.add('dragging')
    }, 0)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e, index) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      moveItem(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleDragEnd = (e) => {
    e.target.closest('.reorder-row')?.classList.remove('dragging')
    setDraggedIndex(null)
  }

  const saveOrder = async () => {
    try {
      setSavingOrder(true)
      setError('')
      
      const courseOrders = reorderedCourses.map((course, index) => ({
        id: course.id,
        display_order: index + 1
      }))
      
      await updateCourseOrder(courseOrders)
      
      // Update local state with new order
      const updatedCourses = reorderedCourses.map((course, index) => ({
        ...course,
        display_order: index + 1
      }))
      setCourses(updatedCourses)
      setReorderMode(false)
      setReorderedCourses([])
      showSuccess('Course order saved successfully! This order will be reflected on the public courses page.')
    } catch (err) {
      console.error('Error saving course order:', err)
      setError('Failed to save course order. Please try again.')
    } finally {
      setSavingOrder(false)
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
        <div className="page-header-content">
          <div>
            <h1>Courses Management</h1>
            <p>Manage all courses on the platform</p>
          </div>
          {!reorderMode && !loading && courses.length > 1 && (
            <button className="btn-reorder" onClick={enterReorderMode}>
              ↕ Reorder Courses
            </button>
          )}
        </div>
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

      {reorderMode ? (
        <div className="reorder-container">
          <div className="reorder-header">
            <div className="reorder-info">
              <h2>↕ Reorder Courses</h2>
              <p>Drag and drop courses or use the arrow buttons to rearrange their display order. This order will be used on the public courses page.</p>
            </div>
            <div className="reorder-actions">
              <button 
                className="btn-secondary" 
                onClick={cancelReorder}
                disabled={savingOrder}
              >
                Cancel
              </button>
              <button 
                className="btn-save-order" 
                onClick={saveOrder}
                disabled={savingOrder}
              >
                {savingOrder ? 'Saving...' : '✓ Save Order'}
              </button>
            </div>
          </div>

          <div className="reorder-list">
            {reorderedCourses.map((course, index) => (
              <div
                key={course.id}
                className={`reorder-row ${draggedIndex === index ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="reorder-drag-handle" title="Drag to reorder">
                  <span className="drag-icon">⠿</span>
                </div>
                <div className="reorder-position">{index + 1}</div>
                <div className="reorder-course-info">
                  <div className="reorder-course-title">{course.title}</div>
                  <div className="reorder-course-meta">
                    <span>{course.instructor_name}</span>
                    <span className="meta-separator">•</span>
                    <span>{course.category}</span>
                    <span className="meta-separator">•</span>
                    <span className={`status-badge-sm ${course.is_published ? 'status-published' : 'status-draft'}`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="reorder-buttons">
                  <button
                    className="btn-move"
                    onClick={() => moveItem(index, index - 1)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    className="btn-move"
                    onClick={() => moveItem(index, index + 1)}
                    disabled={index === reorderedCourses.length - 1}
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={courses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          filters={filters}
          exportFilename="courses"
        />
      )}

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
