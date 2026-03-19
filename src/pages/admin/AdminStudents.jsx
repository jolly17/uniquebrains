import { useState, useEffect } from 'react'
import { fetchAllStudents, updateStudent } from '../../services/adminService'
import DataTable from '../../components/admin/DataTable'
import EditModal from '../../components/admin/EditModal'
import './AdminStudents.css'

function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingStudent, setEditingStudent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const data = await fetchAllStudents()
      setStudents(data)
      setError('')
    } catch (err) {
      console.error('Error loading students:', err)
      setError('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setError('')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setShowEditModal(true)
  }

  const handleSave = async (formData) => {
    try {
      await updateStudent(editingStudent.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email
      })
      await loadStudents()
      setShowEditModal(false)
      setEditingStudent(null)
      showSuccess('Student profile updated successfully!')
    } catch (err) {
      console.error('Error updating student:', err)
      setError('Failed to update student. Please try again.')
    }
  }

  const columns = [
    { 
      key: 'first_name', 
      label: 'Name',
      render: (value, row) => `${row.first_name} ${row.last_name}`
    },
    { key: 'email', label: 'Email' },
    { key: 'enrollments_count', label: 'Enrollments' },
    { 
      key: 'created_at', 
      label: 'Joined',
      render: (value) => value
        ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '-'
    }
  ]

  const editFields = [
    { key: 'first_name', label: 'First Name', type: 'text', required: true },
    { key: 'last_name', label: 'Last Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true, disabled: true }
  ]

  return (
    <div className="admin-students">
      <div className="page-header">
        <h1>Students Management</h1>
        <p>Manage student accounts and profiles</p>
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
        data={students}
        onEdit={handleEdit}
        loading={loading}
        exportFilename="students"
      />

      {showEditModal && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingStudent(null)
          }}
          onSave={handleSave}
          title="Edit Student"
          fields={editFields}
          initialData={editingStudent}
        />
      )}
    </div>
  )
}

export default AdminStudents
