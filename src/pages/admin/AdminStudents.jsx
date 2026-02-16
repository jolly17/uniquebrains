import { useState, useEffect } from 'react'
import { fetchAllStudents, updateStudent } from '../../services/adminService'
import DataTable from '../../components/admin/DataTable'
import EditModal from '../../components/admin/EditModal'
import './AdminStudents.css'

function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
    } catch (err) {
      console.error('Error updating student:', err)
      alert('Failed to update student')
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
      render: (value) => new Date(value).toLocaleDateString('en-US')
    }
  ]

  const editFields = [
    { key: 'first_name', label: 'First Name', type: 'text', required: true },
    { key: 'last_name', label: 'Last Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true }
  ]

  return (
    <div className="admin-students">
      <div className="page-header">
        <h1>Students Management</h1>
        <p>Manage student accounts and profiles</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <DataTable
        columns={columns}
        data={students}
        onEdit={handleEdit}
        loading={loading}
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
