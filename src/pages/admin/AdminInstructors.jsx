import { useState, useEffect } from 'react'
import { fetchAllInstructors, updateInstructor, suspendInstructor } from '../../services/adminService'
import DataTable from '../../components/admin/DataTable'
import EditModal from '../../components/admin/EditModal'
import './AdminInstructors.css'

function AdminInstructors() {
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingInstructor, setEditingInstructor] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false)
  const [instructorToSuspend, setInstructorToSuspend] = useState(null)
  const [suspending, setSuspending] = useState(false)

  useEffect(() => {
    loadInstructors()
  }, [])

  const loadInstructors = async () => {
    try {
      setLoading(true)
      const data = await fetchAllInstructors()
      setInstructors(data)
      setError('')
    } catch (err) {
      console.error('Error loading instructors:', err)
      setError('Failed to load instructors')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setError('')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleEdit = (instructor) => {
    setEditingInstructor(instructor)
    setShowEditModal(true)
  }

  const handleSave = async (formData) => {
    try {
      await updateInstructor(editingInstructor.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        bio: formData.bio,
        expertise: formData.expertise
      })
      await loadInstructors()
      setShowEditModal(false)
      setEditingInstructor(null)
      showSuccess('Instructor profile updated successfully!')
    } catch (err) {
      console.error('Error updating instructor:', err)
      setError('Failed to update instructor. Please try again.')
    }
  }

  const handleSuspendClick = (instructor) => {
    setInstructorToSuspend(instructor)
    setShowSuspendConfirm(true)
    setError('')
  }

  const confirmSuspend = async () => {
    if (!instructorToSuspend) return

    try {
      setSuspending(true)
      setError('')
      await suspendInstructor(instructorToSuspend.id)
      await loadInstructors()
      setShowSuspendConfirm(false)
      setInstructorToSuspend(null)
      showSuccess(`Instructor "${instructorToSuspend.first_name} ${instructorToSuspend.last_name}" has been suspended. All their courses have been unpublished.`)
    } catch (err) {
      console.error('Error suspending instructor:', err)
      setError('Failed to suspend instructor. Please try again.')
      setShowSuspendConfirm(false)
      setInstructorToSuspend(null)
    } finally {
      setSuspending(false)
    }
  }

  const columns = [
    { 
      key: 'first_name', 
      label: 'Name',
      render: (value, row) => (
        <div className="instructor-name-cell">
          <span className="instructor-name">{row.first_name} {row.last_name}</span>
          {row.is_suspended && (
            <span className="suspended-badge">Suspended</span>
          )}
        </div>
      )
    },
    { key: 'email', label: 'Email' },
    { key: 'courses_count', label: 'Courses' },
    { key: 'students_taught', label: 'Students Taught' },
    {
      key: 'created_at',
      label: 'Joined',
      render: (value) => value
        ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '-'
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value, row) => (
        <div className="custom-actions">
          {!row.is_suspended ? (
            <button
              className="btn-suspend"
              onClick={(e) => {
                e.stopPropagation()
                handleSuspendClick(row)
              }}
              title="Suspend instructor and unpublish all courses"
            >
              ⛔ Suspend
            </button>
          ) : (
            <span className="suspended-label">Suspended</span>
          )}
        </div>
      )
    }
  ]

  const editFields = [
    { key: 'first_name', label: 'First Name', type: 'text', required: true },
    { key: 'last_name', label: 'Last Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true, disabled: true },
    { key: 'bio', label: 'Bio', type: 'textarea' },
    { key: 'expertise', label: 'Expertise', type: 'text' }
  ]

  return (
    <div className="admin-instructors">
      <div className="page-header">
        <h1>Instructors Management</h1>
        <p>Manage instructor accounts and profiles</p>
      </div>

      {successMessage && (
        <div className="success-banner">
          <span className="success-icon-badge">✓</span>
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
        data={instructors}
        onEdit={handleEdit}
        loading={loading}
      />

      {showEditModal && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingInstructor(null)
          }}
          onSave={handleSave}
          title="Edit Instructor"
          fields={editFields}
          initialData={editingInstructor}
        />
      )}

      {/* Suspend Confirmation Modal */}
      {showSuspendConfirm && instructorToSuspend && (
        <div className="modal-overlay" onClick={() => !suspending && setShowSuspendConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Suspend Instructor</h3>
            <p>
              Are you sure you want to suspend <strong>{instructorToSuspend.first_name} {instructorToSuspend.last_name}</strong>?
            </p>
            <div className="suspend-warning">
              <p>This action will:</p>
              <ul>
                <li>Unpublish all of their courses ({instructorToSuspend.courses_count || 0} courses)</li>
                <li>Mark their account as suspended</li>
                <li>Students will no longer see their courses</li>
              </ul>
            </div>
            <div className="dialog-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowSuspendConfirm(false)}
                disabled={suspending}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={confirmSuspend}
                disabled={suspending}
              >
                {suspending ? 'Suspending...' : 'Suspend Instructor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminInstructors
