import { useState, useEffect } from 'react'
import { fetchAllInstructors, updateInstructor, suspendInstructor } from '../../services/adminService'
import DataTable from '../../components/admin/DataTable'
import EditModal from '../../components/admin/EditModal'
import './AdminInstructors.css'

function AdminInstructors() {
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingInstructor, setEditingInstructor] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

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
    } catch (err) {
      console.error('Error updating instructor:', err)
      alert('Failed to update instructor')
    }
  }

  const columns = [
    { 
      key: 'first_name', 
      label: 'Name',
      render: (value, row) => `${row.first_name} ${row.last_name}`
    },
    { key: 'email', label: 'Email' },
    { key: 'courses_count', label: 'Courses' },
    { key: 'students_taught', label: 'Students Taught' }
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

      {error && <div className="error-message">{error}</div>}

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
    </div>
  )
}

export default AdminInstructors
