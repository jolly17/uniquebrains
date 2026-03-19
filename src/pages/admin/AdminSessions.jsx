import { useState, useEffect } from 'react'
import { fetchAllSessions, updateSession, deleteSession } from '../../services/adminService'
import DataTable from '../../components/admin/DataTable'
import EditModal from '../../components/admin/EditModal'
import './AdminSessions.css'

function AdminSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingSession, setEditingSession] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const data = await fetchAllSessions()
      setSessions(data)
      setError('')
    } catch (err) {
      console.error('Error loading sessions:', err)
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Extract unique values for filters
  const getUniqueCourses = () => {
    const courses = new Set()
    sessions.forEach(session => {
      if (session.course_title) {
        courses.add(session.course_title)
      }
    })
    return Array.from(courses).sort().map(title => ({
      value: title,
      label: title
    }))
  }

  const getUniqueStatuses = () => {
    const statuses = new Set()
    sessions.forEach(session => {
      if (session.status) {
        statuses.add(session.status)
      }
    })
    return Array.from(statuses).sort().map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1)
    }))
  }

  const filters = [
    {
      key: 'course_title',
      label: 'Course',
      options: getUniqueCourses()
    },
    {
      key: 'status',
      label: 'Status',
      options: getUniqueStatuses()
    }
  ]

  const handleEdit = (session) => {
    setEditingSession(session)
    setShowEditModal(true)
  }

  const handleSave = async (formData) => {
    try {
      await updateSession(editingSession.id, {
        title: formData.title,
        description: formData.description,
        session_date: formData.session_date,
        meeting_link: formData.meeting_link,
        status: formData.status
      })
      await loadSessions()
      setShowEditModal(false)
      setEditingSession(null)
      showSuccess('Session updated successfully!')
    } catch (err) {
      console.error('Error updating session:', err)
      setError('Failed to update session. Please try again.')
    }
  }

  const handleDelete = (session) => {
    setSessionToDelete(session)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteSession(sessionToDelete.id)
      await loadSessions()
      setShowDeleteConfirm(false)
      setSessionToDelete(null)
      showSuccess('Session deleted successfully!')
    } catch (err) {
      console.error('Error deleting session:', err)
      setError('Failed to delete session. Please try again.')
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'course_title', label: 'Course' },
    {
      key: 'session_date',
      label: 'Date',
      render: (value) => value
        ? new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`status-badge status-${value || 'scheduled'}`}>
          {value || 'scheduled'}
        </span>
      )
    },
    {
      key: 'meeting_link',
      label: 'Meeting Link',
      render: (value) => value
        ? <a href={value} target="_blank" rel="noopener noreferrer" className="meeting-link">Join →</a>
        : <span className="no-link">No link</span>
    }
  ]

  const editFields = [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'session_date', label: 'Date & Time', type: 'datetime-local', required: true },
    { key: 'meeting_link', label: 'Meeting Link', type: 'url' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    }
  ]

  return (
    <div className="admin-sessions">
      <div className="page-header">
        <h1>Sessions Management</h1>
        <p>View and manage all course sessions</p>
      </div>

      {successMessage && (
        <div className="success-banner">
          <span className="success-icon">✓</span>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
          <button className="dismiss-btn" onClick={() => setError('')}>×</button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={sessions}
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
            setEditingSession(null)
          }}
          onSave={handleSave}
          title="Edit Session"
          fields={editFields}
          initialData={editingSession}
        />
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the session "{sessionToDelete?.title}"?</p>
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

export default AdminSessions
