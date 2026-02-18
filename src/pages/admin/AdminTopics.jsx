import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './AdminTopics.css'

function AdminTopics() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingTopic, setEditingTopic] = useState(null)
  const [editMode, setEditMode] = useState('image') // 'image' | 'details'
  const [imageUrl, setImageUrl] = useState('')
  const [topicName, setTopicName] = useState('')
  const [topicDescription, setTopicDescription] = useState('')
  const [updating, setUpdating] = useState(false)
  const [deletingTopic, setDeletingTopic] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTopics(data || [])
    } catch (err) {
      console.error('Error fetching topics:', err)
      setError('Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  const handleEditImageClick = (topic) => {
    setEditingTopic(topic)
    setEditMode('image')
    setImageUrl(topic.cover_image_url || '')
  }

  const handleEditDetailsClick = (topic) => {
    setEditingTopic(topic)
    setEditMode('details')
    setTopicName(topic.name || '')
    setTopicDescription(topic.description || '')
  }

  const handleCancelEdit = () => {
    setEditingTopic(null)
    setEditMode('image')
    setImageUrl('')
    setTopicName('')
    setTopicDescription('')
  }

  const handleUpdateImage = async () => {
    if (!editingTopic || !imageUrl.trim()) {
      alert('Please enter a valid image URL')
      return
    }

    try {
      setUpdating(true)
      const { error } = await supabase
        .from('topics')
        .update({ cover_image_url: imageUrl.trim() })
        .eq('id', editingTopic.id)

      if (error) throw error

      // Update local state
      setTopics(topics.map(t => 
        t.id === editingTopic.id 
          ? { ...t, cover_image_url: imageUrl.trim() }
          : t
      ))

      alert('Topic image updated successfully!')
      handleCancelEdit()
    } catch (err) {
      console.error('Error updating topic:', err)
      alert('Failed to update topic image')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateDetails = async () => {
    if (!editingTopic || !topicName.trim() || !topicDescription.trim()) {
      alert('Please fill in all fields')
      return
    }

    try {
      setUpdating(true)
      
      // Generate new slug from name
      const newSlug = topicName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      const { error } = await supabase
        .from('topics')
        .update({ 
          name: topicName.trim(),
          slug: newSlug,
          description: topicDescription.trim()
        })
        .eq('id', editingTopic.id)

      if (error) throw error

      // Update local state
      setTopics(topics.map(t => 
        t.id === editingTopic.id 
          ? { ...t, name: topicName.trim(), slug: newSlug, description: topicDescription.trim() }
          : t
      ))

      alert('Topic details updated successfully!')
      handleCancelEdit()
    } catch (err) {
      console.error('Error updating topic:', err)
      alert('Failed to update topic details. The topic name might already exist.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteClick = (topic) => {
    setDeletingTopic(topic)
  }

  const handleCancelDelete = () => {
    setDeletingTopic(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingTopic) return

    try {
      setDeleting(true)
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', deletingTopic.id)

      if (error) throw error

      // Update local state
      setTopics(topics.filter(t => t.id !== deletingTopic.id))

      alert('Topic deleted successfully!')
      handleCancelDelete()
    } catch (err) {
      console.error('Error deleting topic:', err)
      alert('Failed to delete topic. It may have associated questions.')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleFeatured = async (topicId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ is_featured: !currentStatus })
        .eq('id', topicId)

      if (error) throw error

      // Update local state
      setTopics(topics.map(t => 
        t.id === topicId 
          ? { ...t, is_featured: !currentStatus }
          : t
      ))
    } catch (err) {
      console.error('Error toggling featured status:', err)
      alert('Failed to update featured status')
    }
  }

  if (loading) {
    return (
      <div className="admin-topics">
        <div className="loading">Loading topics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-topics">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="admin-topics">
      <div className="page-header">
        <h1>Manage Community Topics</h1>
        <p className="page-subtitle">Update topic cover images and featured status</p>
      </div>

      <div className="topics-list">
        {topics.map((topic) => (
          <div key={topic.id} className="topic-item">
            <div className="topic-image">
              <img 
                src={topic.cover_image_url} 
                alt={topic.name}
                onError={(e) => {
                  e.target.src = 'https://uniquebrains.org/uniquebrains-logo.png.png'
                }}
              />
            </div>
            <div className="topic-info">
              <h3>{topic.name}</h3>
              <p className="topic-description">{topic.description}</p>
              <div className="topic-meta">
                <span className="topic-slug">Slug: {topic.slug}</span>
                <span className={`topic-featured ${topic.is_featured ? 'active' : ''}`}>
                  {topic.is_featured ? '⭐ Featured' : 'Not Featured'}
                </span>
              </div>
            </div>
            <div className="topic-actions">
              <button 
                onClick={() => handleEditDetailsClick(topic)}
                className="btn-edit"
              >
                Edit Details
              </button>
              <button 
                onClick={() => handleEditImageClick(topic)}
                className="btn-edit"
              >
                Change Image
              </button>
              <button 
                onClick={() => handleToggleFeatured(topic.id, topic.is_featured)}
                className={`btn-toggle ${topic.is_featured ? 'featured' : ''}`}
              >
                {topic.is_featured ? 'Unfeature' : 'Feature'}
              </button>
              <button 
                onClick={() => handleDeleteClick(topic)}
                className="btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTopic && editMode === 'image' && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Update Cover Image</h2>
            <p className="modal-subtitle">Topic: {editingTopic.name}</p>

            <div className="form-group">
              <label htmlFor="imageUrl">Cover Image URL</label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="image-url-input"
              />
              <span className="field-hint">
                Recommended size: 800x400px. Use high-quality images from Unsplash or similar.
              </span>
            </div>

            {imageUrl && (
              <div className="image-preview">
                <label>Preview:</label>
                <img 
                  src={imageUrl} 
                  alt="Preview"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                  onLoad={(e) => {
                    e.target.style.display = 'block'
                  }}
                />
              </div>
            )}

            <div className="modal-actions">
              <button 
                onClick={handleCancelEdit}
                className="btn-cancel"
                disabled={updating}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateImage}
                className="btn-save"
                disabled={updating || !imageUrl.trim()}
              >
                {updating ? 'Updating...' : 'Update Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingTopic && editMode === 'details' && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Topic Details</h2>
            <p className="modal-subtitle">Update topic name and description</p>

            <div className="form-group">
              <label htmlFor="topicName">Topic Name *</label>
              <input
                type="text"
                id="topicName"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g., Food & Recipe Ideas"
                className="text-input"
                maxLength={100}
              />
              <span className="field-hint">
                {topicName.length}/100 characters
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="topicDescription">Description *</label>
              <textarea
                id="topicDescription"
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                placeholder="Describe what this topic is about..."
                className="textarea-input"
                rows={5}
              />
            </div>

            <div className="modal-actions">
              <button 
                onClick={handleCancelEdit}
                className="btn-cancel"
                disabled={updating}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateDetails}
                className="btn-save"
                disabled={updating || !topicName.trim() || !topicDescription.trim()}
              >
                {updating ? 'Updating...' : 'Update Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTopic && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Topic</h2>
            <p className="modal-subtitle warning">
              Are you sure you want to delete "{deletingTopic.name}"?
            </p>
            <p className="warning-text">
              This will permanently delete the topic and all associated questions and answers. This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button 
                onClick={handleCancelDelete}
                className="btn-cancel"
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="btn-delete-confirm"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Topic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTopics
