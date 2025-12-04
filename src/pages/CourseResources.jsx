import { useState } from 'react'
import './CourseResources.css'

function CourseResources({ course }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [resourceType, setResourceType] = useState('file')
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    file: null,
    fileName: ''
  })
  const [formErrors, setFormErrors] = useState({
    title: '',
    url: '',
    file: ''
  })

  // Mock resources data
  const [resources, setResources] = useState([
    {
      id: 1,
      title: 'Beginner Piano Guide.pdf',
      type: 'file',
      url: '/resources/piano-guide.pdf',
      fileName: 'Beginner Piano Guide.pdf',
      fileSize: 2500000,
      addedAt: '2024-01-10',
      addedBy: course?.instructorId || '1',
      viewedBy: ['1', '2', '3', '4', '5', '6', '7']
    },
    {
      id: 2,
      title: 'Music Theory Video Tutorial',
      type: 'link',
      url: 'https://youtube.com/watch?v=example',
      fileName: null,
      fileSize: null,
      addedAt: '2024-01-12',
      addedBy: course?.instructorId || '1',
      viewedBy: ['1', '2', '3', '4', '5']
    }
  ])

  const totalStudents = course?.currentEnrollment || 8

  const getFileIcon = (fileName) => {
    if (!fileName) return '🔗'
    const ext = fileName.split('.').pop().toLowerCase()
    switch (ext) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'
      case 'mp3':
      case 'wav':
        return '🎵'
      case 'mp4':
      case 'mov':
        return '🎥'
      default:
        return '📎'
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const mb = bytes / 1024 / 1024
    return `${mb.toFixed(1)} MB`
  }

  const validateForm = () => {
    const errors = {
      title: '',
      url: '',
      file: ''
    }
    let isValid = true

    if (!formData.title.trim()) {
      errors.title = 'Please enter a title for this resource'
      isValid = false
    }

    if (resourceType === 'link') {
      if (!formData.url.trim()) {
        errors.url = 'Please enter a URL for this resource'
        isValid = false
      } else {
        // Basic URL validation
        try {
          new URL(formData.url)
        } catch {
          errors.url = 'Please enter a valid URL (e.g., https://example.com)'
          isValid = false
        }
      }
    } else {
      if (!formData.file) {
        errors.file = 'Please choose a file to upload'
        isValid = false
      }
    }

    setFormErrors(errors)
    return isValid
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'audio/mpeg',
        'audio/wav',
        'video/mp4',
        'video/quicktime'
      ]

      if (!allowedTypes.includes(file.type)) {
        setFormErrors({
          ...formErrors,
          file: 'This file type isn\'t supported. Please upload a PDF, DOC, image, audio, or video file.'
        })
        return
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        setFormErrors({
          ...formErrors,
          file: 'This file is too large. Please choose a file smaller than 10MB.'
        })
        return
      }

      setFormData({
        ...formData,
        file: file,
        fileName: file.name
      })
      setFormErrors({ ...formErrors, file: '' })
    }
  }

  const handleAddResource = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const newResource = {
      id: resources.length + 1,
      title: formData.title,
      type: resourceType,
      url: resourceType === 'link' ? formData.url : `/resources/${formData.fileName}`,
      fileName: resourceType === 'file' ? formData.fileName : null,
      fileSize: resourceType === 'file' ? formData.file.size : null,
      addedAt: new Date().toISOString().split('T')[0],
      addedBy: course?.instructorId || '1',
      viewedBy: []
    }

    setResources([...resources, newResource])

    // Trigger student notification (in real app, this would be a backend call)
    console.log(`📧 Notification sent to all students: New resource "${formData.title}" added`)

    handleCloseModal()
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setResourceType('file')
    setFormData({
      title: '',
      url: '',
      file: null,
      fileName: ''
    })
    setFormErrors({
      title: '',
      url: '',
      file: ''
    })
  }

  const handleDeleteResource = (resourceId, resourceTitle) => {
    if (window.confirm(`Are you sure you want to delete "${resourceTitle}"? This action cannot be undone.`)) {
      setResources(resources.filter(r => r.id !== resourceId))
      console.log(`🗑️ Resource "${resourceTitle}" deleted`)
    }
  }

  return (
    <div className="course-resources">
      <div className="resources-header">
        <h2>📚 Course Resources</h2>
        <div className="info-banner">
          <p>ℹ️ Upload files and links for students to access anytime</p>
        </div>
      </div>

      <button onClick={() => setShowAddModal(true)} className="btn-primary">
        + Add Resource
      </button>

      <div className="resources-list">
        {resources.length === 0 ? (
          <div className="empty-state">
            <p>No resources yet. Click "Add Resource" to upload your first file or link.</p>
          </div>
        ) : (
          resources.map(resource => (
            <div key={resource.id} className="resource-card">
              <div className="resource-info">
                <div className="resource-icon">
                  {resource.type === 'link' ? '🔗' : getFileIcon(resource.fileName)}
                </div>
                <div className="resource-details">
                  <h3>{resource.title}</h3>
                  {resource.type === 'link' ? (
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-url">
                      {resource.url}
                    </a>
                  ) : (
                    <div className="resource-meta">
                      <span>{resource.fileName}</span>
                      {resource.fileSize && <span>{formatFileSize(resource.fileSize)}</span>}
                    </div>
                  )}
                  <div className="resource-stats">
                    <span className="added-date">Added: {new Date(resource.addedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                    <span className="view-stats">
                      👁️ Viewed by {resource.viewedBy.length}/{totalStudents} students
                    </span>
                  </div>
                </div>
              </div>
              <div className="resource-actions">
                {resource.type === 'link' ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary btn-sm"
                  >
                    Open Link
                  </a>
                ) : (
                  <button className="btn-primary btn-sm">
                    Download
                  </button>
                )}
                <button
                  onClick={() => handleDeleteResource(resource.id, resource.title)}
                  className="btn-secondary btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Course Resource</h2>
            <form onSubmit={handleAddResource}>
              <div className="form-group">
                <label>Resource Type</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="file"
                      checked={resourceType === 'file'}
                      onChange={(e) => {
                        setResourceType(e.target.value)
                        setFormErrors({ title: '', url: '', file: '' })
                      }}
                    />
                    Upload File
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="link"
                      checked={resourceType === 'link'}
                      onChange={(e) => {
                        setResourceType(e.target.value)
                        setFormErrors({ title: '', url: '', file: '' })
                      }}
                    />
                    Add Web Link
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value })
                    if (formErrors.title) {
                      setFormErrors({ ...formErrors, title: '' })
                    }
                  }}
                  placeholder="e.g., Beginner Piano Guide"
                  className={formErrors.title ? 'error' : ''}
                />
                {formErrors.title && (
                  <div className="error-message">{formErrors.title}</div>
                )}
              </div>

              {resourceType === 'file' ? (
                <div className="form-group">
                  <label>File *</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className={formErrors.file ? 'error' : ''}
                  />
                  {formData.fileName && (
                    <div className="file-selected">
                      ✓ {formData.fileName}
                    </div>
                  )}
                  <div className="info-text">
                    ℹ️ Accepted: PDF, DOC, images, audio, video (max 10MB)
                  </div>
                  {formErrors.file && (
                    <div className="error-message">{formErrors.file}</div>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label>URL *</label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => {
                      setFormData({ ...formData, url: e.target.value })
                      if (formErrors.url) {
                        setFormErrors({ ...formErrors, url: '' })
                      }
                    }}
                    placeholder="https://example.com"
                    className={formErrors.url ? 'error' : ''}
                  />
                  {formErrors.url && (
                    <div className="error-message">{formErrors.url}</div>
                  )}
                </div>
              )}

              <div className="info-banner">
                <p>ℹ️ Students will see this resource immediately after you add it</p>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseResources
