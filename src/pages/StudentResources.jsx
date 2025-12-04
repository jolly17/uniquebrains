import { useState, useEffect } from 'react'
import './StudentResources.css'

function StudentResources({ courseId, userId }) {
  const [resources, setResources] = useState([])

  useEffect(() => {
    loadResources()
  }, [courseId])

  const loadResources = () => {
    const storedResources = JSON.parse(localStorage.getItem(`resources_${courseId}`) || '[]')
    setResources(storedResources)
  }

  const handleResourceAccess = (resource) => {
    // Track that the student viewed this resource
    const viewedResources = JSON.parse(localStorage.getItem(`viewed_resources_${courseId}_${userId}`) || '[]')
    if (!viewedResources.includes(resource.id)) {
      viewedResources.push(resource.id)
      localStorage.setItem(`viewed_resources_${courseId}_${userId}`, JSON.stringify(viewedResources))
    }

    // Update the resource's viewedBy list
    const updatedResources = resources.map(r => {
      if (r.id === resource.id && !r.viewedBy.includes(userId)) {
        return { ...r, viewedBy: [...r.viewedBy, userId] }
      }
      return r
    })
    localStorage.setItem(`resources_${courseId}`, JSON.stringify(updatedResources))
    setResources(updatedResources)

    // Open the resource
    if (resource.type === 'link') {
      window.open(resource.url, '_blank')
    } else if (resource.type === 'file') {
      // In a real app, this would download the file
      alert(`Downloading: ${resource.title}`)
    }
  }

  const handlePreview = (resource) => {
    // Track view
    handleResourceAccess(resource)
    // In a real app, this would open a preview modal
    alert(`Preview: ${resource.title}`)
  }

  const getFileIcon = (resource) => {
    if (resource.type === 'link') return '🔗'
    
    const fileName = resource.fileName || resource.title
    if (fileName.endsWith('.pdf')) return '📄'
    if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) return '🖼️'
    if (fileName.match(/\.(doc|docx)$/i)) return '📝'
    if (fileName.match(/\.(xls|xlsx)$/i)) return '📊'
    if (fileName.match(/\.(mp3|wav)$/i)) return '🎵'
    if (fileName.match(/\.(mp4|mov|avi)$/i)) return '🎥'
    return '📎'
  }

  const canPreview = (resource) => {
    if (resource.type === 'link') return false
    const fileName = resource.fileName || resource.title
    return fileName.match(/\.(pdf|jpg|jpeg|png|gif)$/i)
  }

  return (
    <div className="student-resources">
      <h2>📚 Course Materials</h2>
      <div className="info-banner">
        <span className="info-icon">ℹ️</span>
        <p>Download files and access links shared by your instructor</p>
      </div>

      {resources.length > 0 ? (
        <div className="resources-list">
          {resources.map(resource => (
            <div key={resource.id} className="resource-card">
              <div className="resource-icon">
                {getFileIcon(resource)}
              </div>
              <div className="resource-info">
                <h3>{resource.title}</h3>
                <div className="resource-meta">
                  <span>{resource.type === 'link' ? 'Web Link' : 'File'}</span>
                  {resource.fileSize && <span>• {resource.fileSize}</span>}
                  <span>• Added {new Date(resource.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <div className="resource-actions">
                {resource.type === 'link' ? (
                  <button 
                    className="btn-primary"
                    onClick={() => handleResourceAccess(resource)}
                  >
                    Open Link
                  </button>
                ) : (
                  <>
                    {canPreview(resource) && (
                      <button 
                        className="btn-secondary"
                        onClick={() => handlePreview(resource)}
                      >
                        Preview
                      </button>
                    )}
                    <button 
                      className="btn-primary"
                      onClick={() => handleResourceAccess(resource)}
                    >
                      Download
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No resources available yet</p>
      )}
    </div>
  )
}

export default StudentResources
