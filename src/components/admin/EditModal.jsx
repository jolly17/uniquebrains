import { useState, useEffect } from 'react'
import './EditModal.css'

function EditModal({ isOpen, onClose, onSave, title, fields, initialData }) {
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      await onSave(formData)
      // Note: parent component handles closing the modal on success
    } catch (error) {
      console.error('Error saving:', error)
      setSaveError(error.message || 'Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {saveError && (
            <div className="modal-error">
              <span>{saveError}</span>
              <button type="button" className="modal-error-dismiss" onClick={() => setSaveError('')}>×</button>
            </div>
          )}
          {fields.map(field => (
            <div key={field.key} className="form-field">
              <label htmlFor={field.key}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.key}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  rows={4}
                  className="form-input"
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.key}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  className="form-input"
                >
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.key}
                  type={field.type || 'text'}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  disabled={field.disabled}
                  className="form-input"
                />
              )}
            </div>
          ))}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditModal
